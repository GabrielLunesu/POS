using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data
{
    /// <summary>
    /// Database context class that serves as the primary interface for interacting with the database.
    /// This class defines the database schema and relationships between entities.
    /// Entity Framework Core uses this class to generate migrations and execute database operations.
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        /// <summary>
        /// Constructor that accepts DbContextOptions for configuration.
        /// The options are configured in Program.cs and injected via dependency injection.
        /// </summary>
        /// <param name="options">Configuration options for the database context</param>
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        
        // Entity collections representing database tables
        public DbSet<User> Users { get; set; } // Users table - store user accounts and credentials
        public DbSet<Product> Products { get; set; } // Products table - store inventory items
        public DbSet<Category> Categories { get; set; } // Categories table - product classifications
        public DbSet<Sale> Sales { get; set; } // Sales table - store sales transactions
        public DbSet<SaleItem> SaleItems { get; set; } // SaleItems table - store line items within sales
        
        /// <summary>
        /// Configure the database model and relationships between entities.
        /// This method is called when the model is being created during startup.
        /// </summary>
        /// <param name="modelBuilder">Builder class used to construct the model</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure relationships between entities
            
            // Product to Category: Many-to-One relationship
            // A product belongs to one category, a category can have many products
            // If a category is deleted, set product's CategoryId to null (soft delete approach)
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)         // A product has one category
                .WithMany(c => c.Products)       // A category has many products
                .HasForeignKey(p => p.CategoryId) // Foreign key is CategoryId
                .OnDelete(DeleteBehavior.SetNull); // If category is deleted, products remain with null category
                
            // Sale to User: Many-to-One relationship
            // A sale is created by one user, a user can create many sales
            // If a user is deleted, keep the sale but set UserId to null
            modelBuilder.Entity<Sale>()
                .HasOne(s => s.User)             // A sale is associated with one user
                .WithMany()                      // No navigation property from User to Sales
                .HasForeignKey(s => s.UserId)    // Foreign key is UserId
                .OnDelete(DeleteBehavior.SetNull); // If user is deleted, sales remain with null user
                
            // SaleItem to Sale: Many-to-One relationship
            // A sale item belongs to one sale, a sale can have many items
            // If a sale is deleted, all related sale items are also deleted (cascade)
            modelBuilder.Entity<SaleItem>()
                .HasOne(si => si.Sale)           // A sale item belongs to one sale
                .WithMany(s => s.SaleItems)      // A sale has many sale items
                .HasForeignKey(si => si.SaleId)  // Foreign key is SaleId
                .OnDelete(DeleteBehavior.Cascade); // If sale is deleted, delete all its items too
                
            // SaleItem to Product: Many-to-One relationship
            // A sale item references one product, a product can be in many sale items
            // If a product is referenced in a sale, prevent its deletion (restrict)
            modelBuilder.Entity<SaleItem>()
                .HasOne(si => si.Product)        // A sale item references one product
                .WithMany()                      // No navigation property from Product to SaleItems
                .HasForeignKey(si => si.ProductId) // Foreign key is ProductId
                .OnDelete(DeleteBehavior.Restrict); // Prevent deletion of products that are in sales
        }
    }
} 