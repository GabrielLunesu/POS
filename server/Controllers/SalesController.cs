using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SalesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SalesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Sales
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SaleResponseDto>>> GetSales()
        {
            var sales = await _context.Sales
                .Include(s => s.User)
                .Include(s => s.SaleItems)
                    .ThenInclude(si => si.Product)
                .OrderByDescending(s => s.SaleDate)
                .Select(s => new SaleResponseDto
                {
                    Id = s.Id,
                    SaleDate = s.SaleDate,
                    Total = s.Total,
                    Tax = s.Tax,
                    Discount = s.Discount,
                    GrandTotal = s.GrandTotal,
                    PaymentMethod = s.PaymentMethod,
                    PaymentReference = s.PaymentReference,
                    UserId = s.UserId,
                    UserName = s.User != null ? s.User.Username : null,
                    Status = s.Status,
                    Notes = s.Notes,
                    Items = s.SaleItems.Select(si => new SaleItemResponseDto
                    {
                        Id = si.Id,
                        ProductId = si.ProductId,
                        ProductName = si.Product.Name,
                        Quantity = si.Quantity,
                        UnitPrice = si.UnitPrice,
                        Discount = si.Discount,
                        Total = si.Total
                    }).ToList()
                })
                .ToListAsync();

            return Ok(sales);
        }

        // GET: api/Sales/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SaleResponseDto>> GetSale(int id)
        {
            var sale = await _context.Sales
                .Include(s => s.User)
                .Include(s => s.SaleItems)
                    .ThenInclude(si => si.Product)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sale == null)
            {
                return NotFound();
            }

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

        // POST: api/Sales
        [HttpPost]
        public async Task<ActionResult<SaleResponseDto>> CreateSale(SaleCreateDto saleDto)
        {
            // Get current user ID from claims
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID not found in token");
            }

            // Begin transaction
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validate products and calculate totals
                decimal total = 0;
                var saleItems = new List<SaleItem>();

                foreach (var item in saleDto.Items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                    {
                        return BadRequest($"Product with ID {item.ProductId} not found");
                    }

                    if (product.Quantity < item.Quantity)
                    {
                        return BadRequest($"Insufficient stock for product {product.Name}. Available: {product.Quantity}");
                    }

                    decimal itemTotal = product.Price * item.Quantity - item.Discount;
                    total += itemTotal;

                    saleItems.Add(new SaleItem
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price,
                        Discount = item.Discount,
                        Total = itemTotal
                    });

                    // Update product quantity
                    product.Quantity -= item.Quantity;
                    _context.Entry(product).State = EntityState.Modified;
                }

                // Calculate tax (assuming 10% tax rate)
                decimal taxRate = 0.1m;
                decimal tax = total * taxRate;
                decimal grandTotal = total + tax - saleDto.Discount;

                // Create sale
                var sale = new Sale
                {
                    SaleDate = DateTime.UtcNow,
                    Total = total,
                    Tax = tax,
                    Discount = saleDto.Discount,
                    GrandTotal = grandTotal,
                    PaymentMethod = saleDto.PaymentMethod,
                    PaymentReference = saleDto.PaymentReference,
                    UserId = int.Parse(userId),
                    Notes = saleDto.Notes
                };

                _context.Sales.Add(sale);
                await _context.SaveChangesAsync();

                // Add sale items
                foreach (var item in saleItems)
                {
                    item.SaleId = sale.Id;
                    _context.SaleItems.Add(item);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Load related data for response
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

                // Create response DTO
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

                return CreatedAtAction(nameof(GetSale), new { id = sale.Id }, saleResponseDto);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred while processing the sale: {ex.Message}");
            }
        }

        // PUT: api/Sales/5/void
        [HttpPut("{id}/void")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> VoidSale(int id)
        {
            var sale = await _context.Sales
                .Include(s => s.SaleItems)
                .ThenInclude(si => si.Product)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sale == null)
            {
                return NotFound();
            }

            if (sale.Status != "Completed")
            {
                return BadRequest($"Cannot void a sale with status: {sale.Status}");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Restore product quantities
                foreach (var item in sale.SaleItems)
                {
                    item.Product.Quantity += item.Quantity;
                    _context.Entry(item.Product).State = EntityState.Modified;
                }

                // Update sale status
                sale.Status = "Voided";
                _context.Entry(sale).State = EntityState.Modified;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred while voiding the sale: {ex.Message}");
            }
        }
    }
}