using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using f1.Services;
using f1.Models;

namespace f1.Controllers;

[ApiController]
[Route("api/schedule")]
[Authorize]
public class ScheduleController : ControllerBase
{
    private readonly ScheduleService _scheduleService;
    public ScheduleController(ScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_scheduleService.GetAll());
    }

    [HttpGet("approved")]
    public IActionResult GetApproved() => Ok(_scheduleService.GetApproved());

    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetPending([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = _scheduleService.GetPending(page, pageSize);
        return Ok(result);
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetByUserId(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = _scheduleService.GetByUserId(userId, page, pageSize);
        return Ok(result);
    }

    [HttpPost]
    public IActionResult Add([FromBody] ScheduleDto schedule)
    {
        try
        {
            _scheduleService.Add(schedule);
            return Ok("Đặt lịch thành công");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest("Đặt lịch thất bại: " + ex.Message);
        }
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] ScheduleDto schedule)
    {
        try
        {
            var success = _scheduleService.Update(id, schedule);
            return Ok("Cập nhật thành công");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest("Cập nhật thất bại: " + ex.Message);
        }
    }

    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public IActionResult Approve(int id)
    {
        try
        {
            _scheduleService.Approve(id);
            return Ok("Duyệt lịch thành công");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest("Duyệt lịch thất bại: " + ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        try
        {
            _scheduleService.Delete(id);
            return Ok("Xóa lịch thành công");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest("Xóa lịch thất bại: " + ex.Message);
        }
    }

    [HttpGet("week")]
    public IActionResult GetByWeek([FromQuery] string startDate)
    {
        try
        {
            DateTime start = DateTime.ParseExact(startDate, "dd/MM/yyyy", null);
            return Ok(_scheduleService.GetByWeek(start));
        }
        catch (Exception ex)
        {
            return BadRequest($"Invalid date format: {ex.Message}");
        }
    }

    [HttpGet("search")]
    public IActionResult Search([FromQuery] string? leader, [FromQuery] string? content, [FromQuery] string? startTime,
        [FromQuery] string? endTime, [FromQuery] string? date, [FromQuery] string? location, [FromQuery] string? unit)
    {
        if (string.IsNullOrEmpty(leader) && string.IsNullOrEmpty(content) && string.IsNullOrEmpty(startTime) &&
            string.IsNullOrEmpty(endTime) && string.IsNullOrEmpty(date) && string.IsNullOrEmpty(location) &&
            string.IsNullOrEmpty(unit))
        {
            return BadRequest("Cần cung cấp ít nhất một tham số tìm kiếm");
        }
        
        try
        {
            var filter = new
            {
                Leader = leader,
                Content = content,
                StartTime = startTime,
                EndTime = endTime,
                Date = date,
                Location = location,
                Unit = unit
            };
            return Ok(_scheduleService.Search(filter));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest("Tìm kiếm thất bại: " + ex.Message);
        }
    }
}