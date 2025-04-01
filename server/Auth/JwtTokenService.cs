using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using server.Models;

namespace server.Auth
{
    /// <summary>
    /// Service responsible for JWT token generation and password operations.
    /// This service handles all authentication-related cryptographic operations.
    /// </summary>
    public class JwtTokenService
    {
        private readonly IConfiguration _configuration; // Configuration to access token secret key

        /// <summary>
        /// Constructor initializes the service with application configuration.
        /// </summary>
        /// <param name="configuration">Application configuration containing JWT settings</param>
        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Creates a JSON Web Token (JWT) for the authenticated user.
        /// The token contains claims about the user's identity and role, which are used
        /// for authorization throughout the application after login.
        /// </summary>
        /// <param name="user">User entity for which to generate the token</param>
        /// <returns>JWT token string that can be used for authentication</returns>
        public string CreateToken(User user)
        {
            // Create claims that will be embedded in the token
            // These claims identify the user and specify their permissions
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // User ID for database lookups
                new Claim(ClaimTypes.Name, user.Username),                // Username for identification
                new Claim(ClaimTypes.Email, user.Email),                  // Email for communication
                new Claim(ClaimTypes.Role, user.Role)                     // Role for authorization
            };

            // Get the secret key from configuration
            // This key must be kept secure as it's used to sign/validate tokens
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration.GetSection("AppSettings:Token").Value!));

            // Create signing credentials using the key and HMAC SHA-256 algorithm
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            // Create the token with claims, expiration, and signing credentials
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1), // Token expires after 1 day
                signingCredentials: creds);

            // Serialize the token to a string for transmission
            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }

        /// <summary>
        /// Creates a secure hash of a password for storage in the database.
        /// Uses HMACSHA512 for generating a random salt and computing the hash.
        /// Both the hash and salt are needed for later verification.
        /// </summary>
        /// <param name="password">Plain text password to hash</param>
        /// <param name="passwordHash">Output parameter that will contain the password hash</param>
        /// <param name="passwordSalt">Output parameter that will contain the salt used for hashing</param>
        public void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            // HMACSHA512 generates a random key (salt) each time it's instantiated
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;                                    // Store the generated salt
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password)); // Compute hash using the salt
            }
        }

        /// <summary>
        /// Verifies a password against a stored hash and salt.
        /// This is used during login to check if the provided password matches the stored one.
        /// </summary>
        /// <param name="password">Plain text password to verify</param>
        /// <param name="passwordHash">Stored password hash from the database</param>
        /// <param name="passwordSalt">Stored salt from the database</param>
        /// <returns>True if password matches, false otherwise</returns>
        public bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            // Use the stored salt to hash the provided password
            using (var hmac = new HMACSHA512(passwordSalt))
            {
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                // Compare the computed hash with the stored hash
                return computedHash.SequenceEqual(passwordHash);
            }
        }
    }
} 