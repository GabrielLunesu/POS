using Microsoft.EntityFrameworkCore;
using server.Auth;
using server.Data;
using server.Models;

namespace server.Scripts
{
    /// <summary>
    /// Static class responsible for ensuring that an admin user exists in the database.
    /// This script runs during application startup to guarantee admin access to the system.
    /// </summary>
    public static class CreateAdminUser
    {
        /// <summary>
        /// Seeds an admin user in the database if no admin user exists.
        /// This ensures that there's always an admin account to manage the system,
        /// even if the database is newly created.
        /// 
        /// SECURITY NOTE: In production, this default admin password should be changed immediately after first login.
        /// For a more secure approach, consider prompting for admin credentials during first run
        /// or using environment variables/configuration for the initial password.
        /// </summary>
        /// <param name="serviceProvider">Service provider for dependency resolution</param>
        /// <returns>Asynchronous task</returns>
        public static async Task SeedAdminUser(IServiceProvider serviceProvider)
        {
            // Create a service scope to resolve scoped services (DbContext)
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var tokenService = scope.ServiceProvider.GetRequiredService<JwtTokenService>();
            
            // Check if at least one admin user already exists in the database
            var adminExists = await context.Users.AnyAsync(u => u.Role == "Admin");
            
            if (!adminExists)
            {
                Console.WriteLine("Creating admin user...");
                
                // Create admin user with default credentials
                // The password is hashed before storage
                tokenService.CreatePasswordHash("Admin123!", out byte[] passwordHash, out byte[] passwordSalt);
                
                // Create user entity with admin role
                var admin = new User
                {
                    Username = "admin",
                    Email = "admin@example.com",
                    PasswordHash = passwordHash,
                    PasswordSalt = passwordSalt,
                    Role = "Admin",     // Admin role grants full access to the system
                    IsActive = true,    // Account is active and can be used immediately
                    CreatedAt = DateTime.UtcNow
                };
                
                // Save the admin user to the database
                context.Users.Add(admin);
                await context.SaveChangesAsync();
                
                // Log success message with credentials
                // In production, consider removing or obscuring this password in logs
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