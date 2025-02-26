using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        
        [Required]
        public int Quantity { get; set; }
        
        [StringLength(50)]
        public string Barcode { get; set; } = string.Empty;
        
        public int? CategoryId { get; set; }
        public Category? Category { get; set; }
        
        public string? ImageUrl { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Cost { get; set; } // Cost price
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
    }
} 