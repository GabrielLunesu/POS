using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Auth;
using server.Data;
using server.DTOs;
using server.Models;

namespace server.Controllers
{
    /// <summary>
    /// Controller responsible for user authentication operations including registration and login.
    /// This controller does not require authorization as it handles the initial authentication process.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context; // Database context for user data access
        private readonly JwtTokenService _tokenService; // Service for handling JWT tokens and password operations

        /// <summary>
        /// Constructor that initializes the controller with required dependencies.
        /// </summary>
        /// <param name="context">Database context for accessing user data</param>
        /// <param name="tokenService">Service for JWT token generation and password verification</param>
        public AuthController(ApplicationDbContext context, JwtTokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        /// <summary>
        /// Registers a new user in the system with provided credentials.
        /// Note: In production, this endpoint might be restricted to admin users or removed entirely,
        /// with user creation happening through the UsersController instead.
        /// </summary>
        /// <param name="request">Registration details including username, email, and password</param>
        /// <returns>User information with authentication token if registration is successful</returns>
        [HttpPost("register")]
        public async Task<ActionResult<UserResponseDto>> Register(UserRegisterDto request)
        {
            // Verify username uniqueness to prevent duplicate accounts
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest("Username already exists");

            // Verify email uniqueness to prevent duplicate accounts
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email already exists");

            // Hash the password for secure storage
            _tokenService.CreatePasswordHash(request.Password, out byte[] passwordHash, out byte[] passwordSalt);

            // Create new user entity with provided information
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                Role = request.Role
            };

            // Save user to database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate JWT token for immediate authentication
            var token = _tokenService.CreateToken(user);

            // Return user information with token for client-side authentication
            return Ok(new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Token = token
            });
        }

        /// <summary>
        /// Authenticates a user with provided credentials and returns a JWT token.
        /// This is the primary authentication endpoint used by the POS system's login screen.
        /// </summary>
        /// <param name="request">Login credentials including username and password</param>
        /// <returns>User information with authentication token if login is successful</returns>
        [HttpPost("login")]
        public async Task<ActionResult<UserResponseDto>> Login(UserLoginDto request)
        {
            // Find user by username
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (user == null)
                return BadRequest("User not found");

            // Verify password using hash comparison - never compare plaintext passwords
            if (!_tokenService.VerifyPasswordHash(request.Password, user.PasswordHash, user.PasswordSalt))
                return BadRequest("Wrong password");

            // Check if user account is active - prevents deactivated/deleted accounts from logging in
            if (!user.IsActive)
                return BadRequest("User account is deactivated");

            // Update last login timestamp for audit purposes
            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Generate JWT token containing user claims (like ID and role)
            var token = _tokenService.CreateToken(user);

            // Return user information with token for client-side authentication
            return Ok(new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Token = token
            });
        }
    }
} 