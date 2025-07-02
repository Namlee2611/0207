using Dapper;
using Microsoft.Data.SqlClient;
using f1.Models;
using System;

namespace f1.Services;

public class AuthService
{
    private readonly string _connectionString;
    private readonly JwtService _jwtService;

    public AuthService(IConfiguration configuration, JwtService jwtService)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
        _jwtService = jwtService;
    }

    public LoginResponse? Login(string username, string password)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            var sql = "SELECT Id, Username, Password, Role FROM Users WHERE Username = @Username AND Password = @Password";
            var user = conn.QueryFirstOrDefault<dynamic>(sql, new { Username = username, Password = password });
            
            if (user == null)
                return null;

            var token = _jwtService.GenerateToken(user.Id, user.Username, user.Role);

            return new LoginResponse
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role,
                Token = token
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Login error: {ex.Message}");
            throw;
        }
    }
}