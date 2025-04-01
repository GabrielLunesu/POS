using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using server.Auth;
using server.Data;
using System.Text;

// Create a new WebApplication builder instance
var builder = WebApplication.CreateBuilder(args);

//==============================================
// SERVICES CONFIGURATION
//==============================================

// Register controllers for handling API endpoints
builder.Services.AddControllers();

// Configure database connection using Entity Framework
// The connection string is retrieved from appsettings.json
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT authentication for secure API access
// JWT tokens are used to authenticate users after login
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Configure token validation parameters
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true, // Verify token is signed with the correct key
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8
            .GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value!)), // Get secret key from config
        ValidateIssuer = false, // Not validating issuer for simplicity
        ValidateAudience = false, // Not validating audience for simplicity
        // Don't use custom SignatureValidator as it can cause issues
        ValidateLifetime = true, // Check if token is expired
        ClockSkew = TimeSpan.Zero // No time skew allowed (token expires exactly at expiration time)
    };
    
    // Add event handlers for debugging token validation issues
    // These help troubleshoot authentication problems during development
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("Token successfully validated");
            return Task.CompletedTask;
        },
        OnMessageReceived = context =>
        {
            Console.WriteLine($"Token received: {context.Token?.Substring(0, Math.Min(10, context.Token?.Length ?? 0))}...");
            return Task.CompletedTask;
        }
    };
});

// Register JwtTokenService for dependency injection
// This service handles token generation and password operations
builder.Services.AddScoped<JwtTokenService>();

// Configure CORS (Cross-Origin Resource Sharing) to allow frontend access
// In a production environment, this should be restricted to specific origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

// Configure Swagger for API documentation and testing
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "POS API", Version = "v1" });
    
    // Configure Swagger to use JWT Authentication
    // This allows testing secured endpoints directly from Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

//==============================================
// APPLICATION PIPELINE CONFIGURATION
//==============================================

// Build the application
var app = builder.Build();

// Configure the HTTP request pipeline with middleware
// The order of middleware is important!
if (app.Environment.IsDevelopment())
{
    // Enable Swagger UI for API testing in development environment
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Redirect HTTP requests to HTTPS for security
app.UseHttpsRedirection();

// Enable CORS with the "AllowAll" policy
app.UseCors("AllowAll");

// Add authentication middleware to validate JWT tokens
app.UseAuthentication();

// Add authorization middleware to check user permissions
app.UseAuthorization();

// Map controller endpoints to route requests
app.MapControllers();

//==============================================
// APPLICATION INITIALIZATION
//==============================================

// Seed admin user to ensure there's always an admin account
// This runs when the application starts up
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        await server.Scripts.CreateAdminUser.SeedAdminUser(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the admin user.");
    }
}

// Start the application
app.Run();
