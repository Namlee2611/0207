using Dapper;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using f1.Models;
using System.Data;

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
        var sql = "sp_GetAllUsers";
        return conn.Query<object>(sql, commandType: CommandType.StoredProcedure).AsList();
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
        try
        {
            var sql = "AddUser";
            conn.Execute(sql, new { user.Username, user.Password, user.Role }, commandType: CommandType.StoredProcedure);
        }
        catch (SqlException ex)
        {
            throw new ArgumentException(ex.Message);
        }
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
        try
        {
            var sql = "sp_UpdateUser";
            conn.Execute(sql, new { Id = id, user.Username, user.Password, user.Role }, commandType: CommandType.StoredProcedure);
        }
        catch (SqlException ex)
        {
            throw new ArgumentException(ex.Message);
        }
    }

    public void Delete(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        try
        {
            var sql = "sp_DeleteUser";
            conn.Execute(sql, new { Id = id }, commandType: CommandType.StoredProcedure);
        }
        catch (SqlException ex)
        {
            throw new ArgumentException(ex.Message);
        }
    }
}