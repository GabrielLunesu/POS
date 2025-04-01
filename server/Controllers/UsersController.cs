using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Auth;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Controllers
{
    /// <summary>
    /// Controller responsible for managing user accounts in the POS system.
    /// All endpoints require Admin role authentication as they handle sensitive user operations.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context; // Database context for user operations
        private readonly JwtTokenService _tokenService; // Service for password hashing and token operations

        /// <summary>
        /// Constructor that initializes the controller with required dependencies via dependency injection.
        /// </summary>
        /// <param name="context">Database context for accessing the users table</param>
        /// <param name="tokenService">Service for password-related operations</param>
        public UsersController(ApplicationDbContext context, JwtTokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        /// <summary>
        /// Retrieves all users from the database.
        /// Used in admin panel to display and manage all user accounts.
        /// </summary>
        /// <returns>List of all users with sensitive information removed</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserResponseDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role,
                    // Don't include token in the response for security reasons
                    Token = string.Empty
                })
                .ToListAsync();

            return Ok(users);
        }

        /// <summary>
        /// Retrieves a specific user by their unique ID.
        /// Used when viewing or editing specific user details in the admin panel.
        /// </summary>
        /// <param name="id">The unique identifier of the user to retrieve</param>
        /// <returns>User information if found, 404 NotFound if user doesn't exist</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                // Don't include token in the response for security reasons
                Token = string.Empty
            };

            return Ok(userDto);
        }

        /// <summary>
        /// Creates a new user account with provided information.
        /// Used when adding new employees or administrators to the system.
        /// </summary>
        /// <param name="request">User registration information containing username, email, password, etc.</param>
        /// <returns>Newly created user information with 201 Created status</returns>
        [HttpPost]
        public async Task<ActionResult<UserResponseDto>> CreateUser(UserRegisterDto request)
        {
            // Validate uniqueness of username and email to prevent duplicates
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest("Username already exists");

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email already exists");

            // Hash the password for secure storage - never store plaintext passwords
            _tokenService.CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                Role = request.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userDto = new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                // Don't include token in the response for security reasons
                Token = string.Empty
            };

            // Return 201 Created with location header and user information
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, userDto);
        }

        /// <summary>
        /// Updates an existing user by their ID with provided information.
        /// The method uses ID in the route (not in the request body) for several important reasons:
        /// 1. Follows REST principles where resource identification is in the URL path
        /// 2. Prevents ID mismatch between URL and request body (security/consistency)
        /// 3. Allows partial updates since not all fields need to be included in UserUpdateDto
        /// 4. Makes the API more intuitive as the ID clearly identifies which user to update
        /// </summary>
        /// <param name="id">The unique identifier of the user to update</param>
        /// <param name="userDto">New user information to apply (username, email, etc.)</param>
        /// <returns>204 NoContent if successful, 404 NotFound if user doesn't exist</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserUpdateDto userDto)
        {
            // Find the user to update by ID
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Update user properties with new values from the DTO
            user.Username = userDto.Username;
            user.Email = userDto.Email;
            user.Role = userDto.Role;
            user.IsActive = userDto.IsActive;

            // Only update password if a new one is provided (optional field)
            if (!string.IsNullOrEmpty(userDto.Password))
            {
                _tokenService.CreatePasswordHash(userDto.Password, out byte[] passwordHash, out byte[] passwordSalt);
                user.PasswordHash = passwordHash;
                user.PasswordSalt = passwordSalt;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Handle case where the user was deleted by another operation
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            // Return 204 No Content to indicate successful update without returning data
            return NoContent();
        }

        /// <summary>
        /// Soft deletes a user by marking them as inactive rather than removing from database.
        /// This preserves historical data and relationships while preventing the user from logging in.
        /// </summary>
        /// <param name="id">The unique identifier of the user to delete</param>
        /// <returns>204 NoContent if successful, 404 NotFound if user doesn't exist</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Safety check: Prevent deleting the last admin to ensure admin access is never lost
            if (user.Role == "Admin")
            {
                var adminCount = await _context.Users.CountAsync(u => u.Role == "Admin");
                if (adminCount <= 1)
                {
                    return BadRequest("Cannot delete the last admin user");
                }
            }

            // Soft delete - just deactivate the user instead of removing from database
            // This preserves data integrity and history while preventing login
            user.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Helper method to check if a user with the specified ID exists in the database.
        /// Used internally to validate existence before performing operations.
        /// </summary>
        /// <param name="id">The unique identifier to check</param>
        /// <returns>True if user exists, false otherwise</returns>
        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }
} 