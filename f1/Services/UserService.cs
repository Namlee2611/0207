using Dapper;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using f1.Models;

namespace f1.Services;

public class UserService
{
    private readonly string _connectionString;

    public UserService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }

    public List<object> GetAll()
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "SELECT Id, Username, Password, Role FROM Users";
        return conn.Query<object>(sql).AsList();
    }

    public void Add(UserDto user)
    {
        if (string.IsNullOrEmpty(user.Username) || string.IsNullOrEmpty(user.Password))
        {
            throw new ArgumentException("Username và Password là bắt buộc");
        }
        if (user.Role != "User" && user.Role != "Admin")
        {
            throw new ArgumentException("Role phải là 'User' hoặc 'Admin'");
        }

        using var conn = new SqlConnection(_connectionString);
        var checkSql = "SELECT COUNT(*) FROM Users WHERE Username = @Username";
        var count = conn.ExecuteScalar<int>(checkSql, new { Username = user.Username });
        if (count > 0)
        {
            throw new ArgumentException("Username đã tồn tại");
        }

        var sql = "INSERT INTO Users (Username, Password, Role) VALUES (@Username, @Password, @Role)";
        conn.Execute(sql, new
        {
            Username = user.Username,
            Password = user.Password,
            Role = user.Role
        });
    }

    public void Update(int id, UserDto user)
    {
        if (string.IsNullOrEmpty(user.Username) || string.IsNullOrEmpty(user.Password))
        {
            throw new ArgumentException("Username và Password là bắt buộc");
        }
        if (user.Role != "User" && user.Role != "Admin")
        {
            throw new ArgumentException("Role phải là 'User' hoặc 'Admin'");
        }

        using var conn = new SqlConnection(_connectionString);
        var sql = "UPDATE Users SET Username = @Username, Password = @Password, Role = @Role WHERE Id = @Id";
        conn.Execute(sql, new
        {
            Id = id,
            Username = user.Username,
            Password = user.Password,
            Role = user.Role
        });
    }

    public void Delete(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "DELETE FROM Users WHERE Id = @Id";
        conn.Execute(sql, new { Id = id });
    }
}