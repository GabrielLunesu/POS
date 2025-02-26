using System.ComponentModel.DataAnnotations;

namespace server.DTOs
{
    public class SaleCreateDto
    {
        [Required]
        public List<SaleItemCreateDto> Items { get; set; } = new List<SaleItemCreateDto>();
        
        public string PaymentMethod { get; set; } = "Cash";
        
        public string? PaymentReference { get; set; }
        
        public decimal Discount { get; set; } = 0;
        
        public string? Notes { get; set; }
    }
    
    public class SaleItemCreateDto
    {
        [Required]
        public int ProductId { get; set; }
        
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
        
        public decimal Discount { get; set; } = 0;
    }
    
    public class SaleResponseDto
    {
        public int Id { get; set; }
        public DateTime SaleDate { get; set; }
        public decimal Total { get; set; }
        public decimal Tax { get; set; }
        public decimal Discount { get; set; }
        public decimal GrandTotal { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string? PaymentReference { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public List<SaleItemResponseDto> Items { get; set; } = new List<SaleItemResponseDto>();
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
    
    public class SaleItemResponseDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
    }
} 