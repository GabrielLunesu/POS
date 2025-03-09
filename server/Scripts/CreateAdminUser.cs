using Microsoft.EntityFrameworkCore;
using server.Auth;
using server.Data;
using server.Models;

namespace server.Scripts
{
    public static class CreateAdminUser
    {
        public static async Task SeedAdminUser(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var tokenService = scope.ServiceProvider.GetRequiredService<JwtTokenService>();
            
            // Check if admin user already exists
            var adminExists = await context.Users.AnyAsync(u => u.Role == "Admin");
            
            if (!adminExists)
            {
                Console.WriteLine("Creating admin user...");
                
                // Create admin user
                tokenService.CreatePasswordHash("Admin123!", out byte[] passwordHash, out byte[] passwordSalt);
                
                var admin = new User
                {
                    Username = "admin",
                    Email = "admin@example.com",
                    PasswordHash = passwordHash,
                    PasswordSalt = passwordSalt,
                    Role = "Admin",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                
                context.Users.Add(admin);
                await context.SaveChangesAsync();
                
                Console.WriteLine("Admin user created successfully!");
                Console.WriteLine("Username: admin");
                Console.WriteLine("Password: Admin123!");
            }
            else
            {
                Console.WriteLine("Admin user already exists.");
            }
        }
    }
} 