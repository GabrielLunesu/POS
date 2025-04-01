using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Controllers
{
    /// <summary>
    /// Controller responsible for managing sales transactions in the POS system.
    /// This controller handles creating new sales, retrieving sales history, and voiding transactions.
    /// All endpoints require basic authentication, with some operations restricted to higher roles.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Requires the user to be authenticated for all endpoints
    public class SalesController : ControllerBase
    {
        private readonly ApplicationDbContext _context; // Database access

        /// <summary>
        /// Constructor that initializes the controller with database context via dependency injection.
        /// </summary>
        /// <param name="context">Database context for accessing sales data</param>
        public SalesController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all sales records with their associated items and products.
        /// This endpoint is used to display sales history in the POS interface.
        /// </summary>
        /// <returns>List of sales with detailed information</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SaleResponseDto>>> GetSales()
        {
            // Query sales with related data using eager loading
            // Includes user who made the sale and all items with their product details
            var sales = await _context.Sales
                .Include(s => s.User)                    // Include user who created the sale
                .Include(s => s.SaleItems)               // Include all items in the sale
                    .ThenInclude(si => si.Product)       // Include product details for each item
                .OrderByDescending(s => s.SaleDate)      // Most recent sales first
                .Select(s => new SaleResponseDto         // Transform to DTO for API response
                {
                    Id = s.Id,
                    SaleDate = s.SaleDate,
                    Total = s.Total,                    // Subtotal before tax and discounts
                    Tax = s.Tax,                        // Tax amount
                    Discount = s.Discount,              // Overall sale discount
                    GrandTotal = s.GrandTotal,          // Final amount (total + tax - discount)
                    PaymentMethod = s.PaymentMethod,    // How the customer paid
                    PaymentReference = s.PaymentReference, // Reference/receipt number
                    UserId = s.UserId,                  // Employee who processed the sale
                    UserName = s.User != null ? s.User.Username : null,
                    Status = s.Status,                  // Sale status (Completed/Voided)
                    Notes = s.Notes,                    // Any special notes for this sale
                    Items = s.SaleItems.Select(si => new SaleItemResponseDto
                    {
                        Id = si.Id,
                        ProductId = si.ProductId,
                        ProductName = si.Product.Name,
                        Quantity = si.Quantity,
                        UnitPrice = si.UnitPrice,      // Price at time of sale (may differ from current price)
                        Discount = si.Discount,        // Item-specific discount amount
                        Total = si.Total               // Item subtotal (price * quantity - discount)
                    }).ToList()
                })
                .ToListAsync();

            return Ok(sales);
        }

        /// <summary>
        /// Retrieves a specific sale record by its ID with all associated items.
        /// Used for viewing detailed sale information or receipt printing.
        /// </summary>
        /// <param name="id">The unique identifier of the sale to retrieve</param>
        /// <returns>Detailed sale information if found, 404 NotFound if sale doesn't exist</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<SaleResponseDto>> GetSale(int id)
        {
            // Find the specific sale with all related data
            var sale = await _context.Sales
                .Include(s => s.User)                 // Include user who created the sale
                .Include(s => s.SaleItems)            // Include all items in the sale
                    .ThenInclude(si => si.Product)    // Include product details for each item
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sale == null)
            {
                return NotFound();
            }

            // Convert to DTO for API response
            var saleDto = new SaleResponseDto
            {
                Id = sale.Id,
                SaleDate = sale.SaleDate,
                Total = sale.Total,
                Tax = sale.Tax,
                Discount = sale.Discount,
                GrandTotal = sale.GrandTotal,
                PaymentMethod = sale.PaymentMethod,
                PaymentReference = sale.PaymentReference,
                UserId = sale.UserId,
                UserName = sale.User?.Username,
                Status = sale.Status,
                Notes = sale.Notes,
                Items = sale.SaleItems.Select(si => new SaleItemResponseDto
                {
                    Id = si.Id,
                    ProductId = si.ProductId,
                    ProductName = si.Product.Name,
                    Quantity = si.Quantity,
                    UnitPrice = si.UnitPrice,
                    Discount = si.Discount,
                    Total = si.Total
                }).ToList()
            };

            return Ok(saleDto);
        }

        /// <summary>
        /// Creates a new sale transaction with the provided items.
        /// This is the core functionality of the POS system - processing a customer purchase.
        /// The method handles stock validation, inventory updates, and calculation of totals.
        /// </summary>
        /// <param name="saleDto">Sale information including items, payment method, and discounts</param>
        /// <returns>Created sale details with 201 Created status if successful</returns>
        [HttpPost]
        public async Task<ActionResult<SaleResponseDto>> CreateSale(SaleCreateDto saleDto)
        {
            // Get current user ID from the JWT token claims
            // This identifies which employee is processing the sale
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID not found in token");
            }

            // Begin database transaction to ensure data consistency
            // If any part of the sale process fails, all changes will be rolled back
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Step 1: Validate products and calculate totals
                decimal total = 0;
                var saleItems = new List<SaleItem>();

                foreach (var item in saleDto.Items)
                {
                    // Check if product exists in inventory
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                    {
                        return BadRequest($"Product with ID {item.ProductId} not found");
                    }

                    // Verify sufficient stock is available
                    if (product.Quantity < item.Quantity)
                    {
                        return BadRequest($"Insufficient stock for product {product.Name}. Available: {product.Quantity}");
                    }

                    // Calculate item total with discount
                    decimal itemTotal = product.Price * item.Quantity - item.Discount;
                    total += itemTotal;

                    // Create sale item record
                    saleItems.Add(new SaleItem
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price,     // Store current price at time of sale
                        Discount = item.Discount,
                        Total = itemTotal
                    });

                    // Update product inventory (reduce quantity)
                    product.Quantity -= item.Quantity;
                    _context.Entry(product).State = EntityState.Modified;
                }

                // Step 2: Calculate tax and grand total
                // 10% tax rate is applied to the subtotal
                decimal taxRate = 0.1m;
                decimal tax = total * taxRate;
                decimal grandTotal = total + tax - saleDto.Discount;

                // Step 3: Create the sale record
                var sale = new Sale
                {
                    SaleDate = DateTime.UtcNow,
                    Total = total,                     // Subtotal before tax and discount
                    Tax = tax,                         // Tax amount
                    Discount = saleDto.Discount,       // Overall sale discount
                    GrandTotal = grandTotal,           // Final amount
                    PaymentMethod = saleDto.PaymentMethod,
                    PaymentReference = saleDto.PaymentReference,
                    UserId = int.Parse(userId),        // Employee who processed the sale
                    Notes = saleDto.Notes,
                    Status = "Completed"               // Default status for new sales
                };

                // Save sale to generate ID
                _context.Sales.Add(sale);
                await _context.SaveChangesAsync();

                // Step 4: Link sale items to the sale
                foreach (var item in saleItems)
                {
                    item.SaleId = sale.Id;
                    _context.SaleItems.Add(item);
                }

                // Save all changes and commit transaction
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Step 5: Load related data for the response
                // This ensures we return complete sale information
                await _context.Entry(sale)
                    .Reference(s => s.User)
                    .LoadAsync();

                await _context.Entry(sale)
                    .Collection(s => s.SaleItems)
                    .LoadAsync();

                foreach (var item in sale.SaleItems)
                {
                    await _context.Entry(item)
                        .Reference(si => si.Product)
                        .LoadAsync();
                }

                // Step 6: Create response DTO with complete sale information
                var saleResponseDto = new SaleResponseDto
                {
                    Id = sale.Id,
                    SaleDate = sale.SaleDate,
                    Total = sale.Total,
                    Tax = sale.Tax,
                    Discount = sale.Discount,
                    GrandTotal = sale.GrandTotal,
                    PaymentMethod = sale.PaymentMethod,
                    PaymentReference = sale.PaymentReference,
                    UserId = sale.UserId,
                    UserName = sale.User?.Username,
                    Status = sale.Status,
                    Notes = sale.Notes,
                    Items = sale.SaleItems.Select(si => new SaleItemResponseDto
                    {
                        Id = si.Id,
                        ProductId = si.ProductId,
                        ProductName = si.Product.Name,
                        Quantity = si.Quantity,
                        UnitPrice = si.UnitPrice,
                        Discount = si.Discount,
                        Total = si.Total
                    }).ToList()
                };

                // Return 201 Created with sale information
                return CreatedAtAction(nameof(GetSale), new { id = sale.Id }, saleResponseDto);
            }
            catch (Exception ex)
            {
                // If any error occurs, rollback all changes to maintain database consistency
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred while processing the sale: {ex.Message}");
            }
        }

        /// <summary>
        /// Voids (cancels) an existing sale, restoring inventory quantities.
        /// This operation is restricted to Admin and Manager roles only.
        /// Rather than deleting the sale, it's marked as "Voided" to maintain records.
        /// </summary>
        /// <param name="id">The unique identifier of the sale to void</param>
        /// <returns>204 NoContent if successful, 404 NotFound if sale doesn't exist</returns>
        [HttpPut("{id}/void")]
        [Authorize(Roles = "Admin,Manager")] // Only administrators and managers can void sales
        public async Task<IActionResult> VoidSale(int id)
        {
            // Find the sale with its items and related products
            var sale = await _context.Sales
                .Include(s => s.SaleItems)
                .ThenInclude(si => si.Product)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sale == null)
            {
                return NotFound();
            }

            // Verify sale is in a valid state to be voided
            // Only completed sales can be voided
            if (sale.Status != "Completed")
            {
                return BadRequest($"Cannot void a sale with status: {sale.Status}");
            }

            // Begin transaction to ensure data consistency
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Step 1: Restore product quantities in inventory
                // This reverses the inventory changes made during the sale
                foreach (var item in sale.SaleItems)
                {
                    item.Product.Quantity += item.Quantity;
                    _context.Entry(item.Product).State = EntityState.Modified;
                }

                // Step 2: Update sale status to "Voided"
                // We don't delete the sale to maintain financial records
                sale.Status = "Voided";
                _context.Entry(sale).State = EntityState.Modified;

                // Save changes and commit transaction
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Return 204 No Content to indicate successful operation
                return NoContent();
            }
            catch (Exception ex)
            {
                // If any error occurs, rollback all changes
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred while voiding the sale: {ex.Message}");
            }
        }
    }
}