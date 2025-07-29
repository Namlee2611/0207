using Dapper;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using f1.Models;
using System.Data;
using System.Linq;

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
        var sql = "sp_GetApprovedSchedules";
        return conn.Query<object>(sql, commandType: CommandType.StoredProcedure).AsList();
    }

    public object GetPending(int page, int pageSize)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "sp_GetPendingSchedulesPaged";
        var multi = conn.QueryMultiple(sql, new { Page = page, PageSize = pageSize }, commandType: CommandType.StoredProcedure);
        int totalCount = multi.ReadFirst<int>();
        var data = multi.Read<object>().ToList();
        return new { data, totalCount };
    }

    public object GetByUserId(int userId, int page, int pageSize)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "sp_GetSchedulesByUserIdPaged";
        var multi = conn.QueryMultiple(sql, new { UserId = userId, Page = page, PageSize = pageSize }, commandType: CommandType.StoredProcedure);
        int totalCount = multi.ReadFirst<int>();
        var data = multi.Read<object>().ToList();
        return new { data, totalCount };
    }

    public List<object> GetByWeek(DateTime startDate)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "sp_GetSchedulesByWeek";
        return conn.Query<object>(sql, new { StartDate = startDate }, commandType: CommandType.StoredProcedure).AsList();
    }

    public bool Add(ScheduleDto schedule)
    {
        if (string.IsNullOrEmpty(schedule.Leader) || string.IsNullOrEmpty(schedule.Content) || 
            string.IsNullOrEmpty(schedule.StartTime) || string.IsNullOrEmpty(schedule.EndTime) || 
            string.IsNullOrEmpty(schedule.Date) || string.IsNullOrEmpty(schedule.Location) || 
            string.IsNullOrEmpty(schedule.Unit))
        {
            throw new ArgumentException("Vui lòng điền đầy đủ các trường bắt buộc");
        }

        if (!TimeSpan.TryParse(schedule.StartTime, out var startTime) || 
            !TimeSpan.TryParse(schedule.EndTime, out var endTime))
        {
            throw new ArgumentException("Định dạng thời gian không hợp lệ");
        }

        if (startTime >= endTime)
        {
            throw new ArgumentException("Thời gian bắt đầu phải trước thời gian kết thúc");
        }

        if (!DateTime.TryParseExact(schedule.Date, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out var date))
        {
            throw new ArgumentException("Định dạng ngày không hợp lệ");
        }

        if (date.Date < DateTime.Today)
        {
            throw new ArgumentException("Không thể đặt lịch cho ngày trong quá khứ");
        }

        using var conn = new SqlConnection(_connectionString);
        var conflictCount = conn.ExecuteScalar<int>(
            "sp_CheckScheduleConflict",
            new { schedule.Leader, Date = date, StartTime = startTime, EndTime = endTime, ExcludeId = (int?)null },
            commandType: CommandType.StoredProcedure
        );
        if (conflictCount > 0)
        {
            throw new ArgumentException("Lịch trùng với lịch đã có của lãnh đạo này");
        }
        try
        {   
            var sql = "sp_AddSchedule";
            conn.Execute(sql, new
            {
                schedule.Leader,
                schedule.Content,
                StartTime = startTime,
                EndTime = endTime,
                Date = date,
                schedule.Location,
                schedule.Unit,
                Note = schedule.Note ?? (object)DBNull.Value,
                schedule.UserId
            }, commandType: CommandType.StoredProcedure);
            return true;
        }
        catch (SqlException ex)
        {
            throw new ArgumentException("lỗi : "+ ex.Message);
        }
    }

    public void Approve(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        try
        {
            var sql = "sp_ApproveSchedule";
            conn.Execute(sql, new { Id = id }, commandType: CommandType.StoredProcedure);
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
            var sql = "sp_DeleteSchedule";
            conn.Execute(sql, new { Id = id }, commandType: CommandType.StoredProcedure);
        }
        catch (SqlException ex)
        {
            throw new ArgumentException(ex.Message);
        }
    }

    public bool Update(int id, ScheduleDto schedule)
    {
        if (string.IsNullOrEmpty(schedule.Leader) || string.IsNullOrEmpty(schedule.Content) || 
            string.IsNullOrEmpty(schedule.StartTime) || string.IsNullOrEmpty(schedule.EndTime) || 
            string.IsNullOrEmpty(schedule.Date) || string.IsNullOrEmpty(schedule.Location) || 
            string.IsNullOrEmpty(schedule.Unit))
        {
            throw new ArgumentException("Vui lòng điền đầy đủ các trường bắt buộc");
        }

        if (!TimeSpan.TryParse(schedule.StartTime, out var startTime) || 
            !TimeSpan.TryParse(schedule.EndTime, out var endTime))
        {
            throw new ArgumentException("Định dạng thời gian không hợp lệ");
        }

        if (startTime >= endTime)
        {
            throw new ArgumentException("Thời gian bắt đầu phải trước thời gian kết thúc");
        }

        if (!DateTime.TryParseExact(schedule.Date, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out var date))
        {
            throw new ArgumentException("Định dạng ngày không hợp lệ");
        }

        if (date.Date < DateTime.Today)
        {
            throw new ArgumentException("Không thể đặt lịch cho ngày trong quá khứ");
        }

        using var conn = new SqlConnection(_connectionString);
        var conflictCount = conn.ExecuteScalar<int>(
            "sp_CheckScheduleConflict",
            new { schedule.Leader, Date = date, StartTime = startTime, EndTime = endTime, ExcludeId = id },
            commandType: CommandType.StoredProcedure
        );
        if (conflictCount > 0)
        {
            throw new ArgumentException("Lịch trùng với lịch đã có của lãnh đạo này");
        }
        try
        {
            var sql = "sp_UpdateSchedule";
            var rowsAffected = conn.Execute(sql, new
            {
                Id = id,
                schedule.Leader,
                schedule.Content,
                StartTime = startTime,
                EndTime = endTime,
                Date = date,
                schedule.Location,
                schedule.Unit,
                Note = schedule.Note ?? (object)DBNull.Value
            }, commandType: CommandType.StoredProcedure);
            return rowsAffected > 0;
        }
        catch (SqlException ex)
        {
            throw new ArgumentException(ex.Message);
        }
    }

    public List<object> Search(dynamic searchParams)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "sp_SearchSchedules";
        var parameters = new DynamicParameters();
        parameters.Add("Leader", (string)searchParams.Leader ?? null);
        parameters.Add("Content", (string)searchParams.Content ?? null);
        parameters.Add("StartTime", string.IsNullOrEmpty((string)searchParams.StartTime) ? null : TimeSpan.Parse((string)searchParams.StartTime));
        parameters.Add("EndTime", string.IsNullOrEmpty((string)searchParams.EndTime) ? null : TimeSpan.Parse((string)searchParams.EndTime));
        parameters.Add("Date", string.IsNullOrEmpty((string)searchParams.Date) ? null : DateTime.Parse((string)searchParams.Date));
        parameters.Add("Location", (string)searchParams.Location ?? null);
        parameters.Add("Unit", (string)searchParams.Unit ?? null);
        return conn.Query<object>(sql, parameters, commandType: CommandType.StoredProcedure).AsList();
    }

    public List<object> GetAll()
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "sp_GetAllSchedules";
        return conn.Query<object>(sql, commandType: CommandType.StoredProcedure).AsList();
    }
}