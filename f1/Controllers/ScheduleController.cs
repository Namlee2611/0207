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
    public IActionResult GetPending() => Ok(_scheduleService.GetPending());

    [HttpGet("user/{userId}")]
    public IActionResult GetByUserId(int userId) => Ok(_scheduleService.GetByUserId(userId));

    [HttpPost]
    public IActionResult Add([FromBody] ScheduleDto schedule) =>
        _scheduleService.Add(schedule) ? Ok("Đặt lịch thành công") : BadRequest("Lịch trùng");

    [HttpPut("{id}")]
    public IActionResult Update(int id, [FromBody] ScheduleDto schedule)
    {
        var success = _scheduleService.Update(id, schedule);
        return success ? Ok("Cập nhật thành công") : BadRequest("Không thể cập nhật lịch đã duyệt");
    }

    [HttpPut("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public IActionResult Approve(int id)
    {
        _scheduleService.Approve(id);
        return Ok();
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        _scheduleService.Delete(id);
        return Ok();
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
}