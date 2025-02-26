using System.ComponentModel.DataAnnotations;

namespace server.DTOs
{
    public class ProductCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
        
        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }
        
        [StringLength(50)]
        public string Barcode { get; set; } = string.Empty;
        
        public int? CategoryId { get; set; }
        
        public string? ImageUrl { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Cost { get; set; }
    }
    
    public class ProductUpdateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
        
        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }
        
        [StringLength(50)]
        public string Barcode { get; set; } = string.Empty;
        
        public int? CategoryId { get; set; }
        
        public string? ImageUrl { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Cost { get; set; }
        
        public bool IsActive { get; set; } = true;
    }
    
    public class ProductResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string Barcode { get; set; } = string.Empty;
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? ImageUrl { get; set; }
        public decimal Cost { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
} 