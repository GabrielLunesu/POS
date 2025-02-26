using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
    public class Sale
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public DateTime SaleDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Tax { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Discount { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal GrandTotal { get; set; }
        
        public string PaymentMethod { get; set; } = "Cash"; // Cash, Credit Card, Debit Card, etc.
        
        public string? PaymentReference { get; set; } // For card transactions, etc.
        
        public int? UserId { get; set; }
        public User? User { get; set; } // Cashier who processed the sale
        
        public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
        
        public string Status { get; set; } = "Completed"; // Completed, Refunded, Voided
        
        public string? Notes { get; set; }
    }
} 