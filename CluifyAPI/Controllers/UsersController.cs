using Microsoft.AspNetCore.Mvc;
using CluifyAPI.Models;
using CluifyAPI.Services;
using MongoDB.Driver;
using System.Threading.Tasks;
using System.Linq;
using System;
using System.Collections.Generic;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace CluifyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;
        private readonly IConfiguration _config;

        public UsersController(MongoDbService mongoDbService, IConfiguration config)
        {
            _mongoDbService = mongoDbService;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest("All fields are required.");

            var existingUser = await _mongoDbService.Users.Find(u => u.Username == req.Username || u.Email == req.Email).FirstOrDefaultAsync();
            if (existingUser != null)
                return Conflict("Username or email already exists.");

            var user = new User
            {
                Username = req.Username,
                Email = req.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                DateCreated = DateTime.UtcNow
            };
            await _mongoDbService.Users.InsertOneAsync(user);
            return Ok(new { message = "Registration successful." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.UsernameOrEmail) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest("All fields are required.");

            var user = await _mongoDbService.Users.Find(u => u.Username == req.UsernameOrEmail || u.Email == req.UsernameOrEmail).FirstOrDefaultAsync();
            if (user == null)
                return Unauthorized("Invalid credentials.");

            if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials.");

            var token = GenerateJwtToken(user);
            return Ok(new { userId = user.Id, username = user.Username, token });
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id ?? ""),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "supersecretkey"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddDays(7);
            var token = new JwtSecurityToken(
                _config["Jwt:Issuer"] ?? "CluifyAPI",
                _config["Jwt:Issuer"] ?? "CluifyAPI",
                claims,
                expires: expires,
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public class RegisterRequest
        {
            public string Username { get; set; } = null!;
            public string Email { get; set; } = null!;
            public string Password { get; set; } = null!;
        }

        public class LoginRequest
        {
            public string UsernameOrEmail { get; set; } = null!;
            public string Password { get; set; } = null!;
        }
    }
} 