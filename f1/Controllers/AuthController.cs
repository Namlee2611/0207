using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using f1.Services;
using f1.Models;

namespace f1.Controllers;

public class LoginRequest {
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase {
    private readonly AuthService _authService;
    public AuthController(AuthService authService) {
        _authService = authService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest login) {
        Console.WriteLine($"Received login: Username={login?.Username}, Password={login?.Password}");
        if (login == null || string.IsNullOrEmpty(login.Username) || string.IsNullOrEmpty(login.Password)) {
            return BadRequest("Username hoặc Password không hợp lệ");
        }
        var loginResponse = _authService.Login(login.Username, login.Password);
        if (loginResponse == null) {
            Console.WriteLine("Login failed: Invalid credentials");
            return Unauthorized("Đăng nhập thất bại");
        }
        Console.WriteLine("Login successful");
        return Ok(loginResponse);
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser() {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        return Ok(new
        {
            Id = int.Parse(userId),
            Username = username,
            Role = role
        });
    }

    [HttpGet]
    public IActionResult Info()
    {
        return Ok("Auth API is working");
    }
}