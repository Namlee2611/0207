using Dapper;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using f1.Models;

namespace f1.Services;

public class ScheduleService
{
    private readonly string _connectionString;

    public ScheduleService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }

    public List<object> GetApproved()
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "SELECT Id as id, Leader as leader, Content as content, CONVERT(varchar, StartTime, 108) AS startTime, CONVERT(varchar, EndTime, 108) AS endTime, CONVERT(varchar, Date, 103) AS date, Location as location, Unit as unit, Note as note, IsApproved as isApproved FROM Schedules WHERE IsApproved = 1";
        return conn.Query<object>(sql).AsList();
    }

    public List<object> GetPending()
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "SELECT Id as id, Leader as leader, Content as content, CONVERT(varchar, StartTime, 108) AS startTime, CONVERT(varchar, EndTime, 108) AS endTime, CONVERT(varchar, Date, 103) AS date, Location as location, Unit as unit, Note as note, IsApproved as isApproved FROM Schedules WHERE IsApproved = 0";
        return conn.Query<object>(sql).AsList();
    }

    public List<object> GetByUserId(int userId)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "SELECT Id as id, Leader as leader, Content as content, CONVERT(varchar, StartTime, 108) AS startTime, CONVERT(varchar, EndTime, 108) AS endTime, CONVERT(varchar, Date, 103) AS date, Location as location, Unit as unit, Note as note, IsApproved as isApproved FROM Schedules WHERE UserId = @UserId ORDER BY Date DESC, StartTime ASC";
        return conn.Query<object>(sql, new { UserId = userId }).AsList();
    }

    public List<object> GetByWeek(DateTime startDate)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "SELECT Id as id, Leader as leader, Content as content, CONVERT(varchar, StartTime, 108) AS startTime, CONVERT(varchar, EndTime, 108) AS endTime, CONVERT(varchar, Date, 103) AS date, Location as location, Unit as unit, Note as note, IsApproved as isApproved FROM Schedules WHERE IsApproved = 1 AND Date BETWEEN @StartDate AND @EndDate";
        return conn.Query<object>(sql, new { StartDate = startDate, EndDate = startDate.AddDays(6) }).AsList();
    }

    public bool Add(ScheduleDto schedule)
    {
        using var conn = new SqlConnection(_connectionString);
        var checkSql = "SELECT COUNT(*) FROM Schedules WHERE StartTime = @StartTime AND EndTime = @EndTime AND Date = @Date AND Leader = @Leader AND Content = @Content AND Location = @Location AND Unit = @Unit";
        var count = conn.ExecuteScalar<int>(checkSql, new
        {
            StartTime = TimeSpan.Parse(schedule.StartTime),
            EndTime = TimeSpan.Parse(schedule.EndTime),
            Date = DateTime.ParseExact(schedule.Date, "yyyy-MM-dd", null),
            Leader = schedule.Leader,
            Content = schedule.Content,
            Location = schedule.Location,
            Unit = schedule.Unit
        });

        if (count > 0) return false;

        var sql = "INSERT INTO Schedules (Leader, Content, StartTime, EndTime, Date, Location, Unit, Note, IsApproved, UserId) VALUES (@Leader, @Content, @StartTime, @EndTime, @Date, @Location, @Unit, @Note, 0, @UserId)";
        conn.Execute(sql, new
        {
            Leader = schedule.Leader,
            Content = schedule.Content,
            StartTime = TimeSpan.Parse(schedule.StartTime),
            EndTime = TimeSpan.Parse(schedule.EndTime),
            Date = DateTime.ParseExact(schedule.Date, "yyyy-MM-dd", null),
            Location = schedule.Location,
            Unit = schedule.Unit,
            Note = schedule.Note ?? (object)DBNull.Value,
            UserId = schedule.UserId
        });
        return true;
    }

    public void Approve(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "UPDATE Schedules SET IsApproved = 1 WHERE Id = @Id";
        conn.Execute(sql, new { Id = id });
    }

    public void Delete(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "DELETE FROM Schedules WHERE Id = @Id";
        conn.Execute(sql, new { Id = id });
    }

    public bool Update(int id, ScheduleDto schedule)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "UPDATE Schedules SET Leader = @Leader, Content = @Content, StartTime = @StartTime, EndTime = @EndTime, Date = @Date, Location = @Location, Unit = @Unit, Note = @Note WHERE Id = @Id AND IsApproved = 0";
        var rowsAffected = conn.Execute(sql, new
        {
            Id = id,
            Leader = schedule.Leader,
            Content = schedule.Content,
            StartTime = TimeSpan.Parse(schedule.StartTime),
            EndTime = TimeSpan.Parse(schedule.EndTime),
            Date = DateTime.ParseExact(schedule.Date, "yyyy-MM-dd", null),
            Location = schedule.Location,
            Unit = schedule.Unit,
            Note = schedule.Note ?? (object)DBNull.Value
        });
        return rowsAffected > 0;
    }

    public List<object> Search(dynamic searchParams)
    {
        using var conn = new SqlConnection(_connectionString);
        var query = "SELECT Id, Leader, Content, CONVERT(varchar, StartTime, 108) AS StartTime, CONVERT(varchar, EndTime, 108) AS EndTime, CONVERT(varchar, Date, 103) AS Date, Location, Unit, Note, IsApproved FROM Schedules WHERE IsApproved = 1";
        var parameters = new Dictionary<string, object>();

        if (!string.IsNullOrEmpty(searchParams.Leader))
        {
            query += " AND Leader = @Leader";
            parameters.Add("Leader", searchParams.Leader);
        }
        if (!string.IsNullOrEmpty(searchParams.Content))
        {
            query += " AND Content = @Content";
            parameters.Add("Content", searchParams.Content);
        }
        if (!string.IsNullOrEmpty(searchParams.StartTime))
        {
            query += " AND StartTime = @StartTime";
            parameters.Add("StartTime", TimeSpan.Parse(searchParams.StartTime));
        }
        if (!string.IsNullOrEmpty(searchParams.EndTime))
        {
            query += " AND EndTime = @EndTime";
            parameters.Add("EndTime", TimeSpan.Parse(searchParams.EndTime));
        }
        if (!string.IsNullOrEmpty(searchParams.Date))
        {
            query += " AND Date = @Date";
            parameters.Add("Date", DateTime.ParseExact(searchParams.Date, "dd/MM/yyyy", null));
        }
        if (!string.IsNullOrEmpty(searchParams.Location))
        {
            query += " AND Location = @Location";
            parameters.Add("Location", searchParams.Location);
        }
        if (!string.IsNullOrEmpty(searchParams.Unit))
        {
            query += " AND Unit = @Unit";
            parameters.Add("Unit", searchParams.Unit);
        }

        try
        {
            return conn.Query<object>(query, parameters).AsList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in Search: {ex.Message}");
            throw;
        }
    }

    public List<object> GetAll()
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "SELECT Id as id, Leader as leader, Content as content, CONVERT(varchar, StartTime, 108) AS startTime, CONVERT(varchar, EndTime, 108) AS endTime, CONVERT(varchar, Date, 103) AS date, Location as location, Unit as unit, Note as note, IsApproved as isApproved, UserId as userId FROM Schedules ORDER BY Date DESC, StartTime ASC";
        return conn.Query<object>(sql).AsList();
    }
}