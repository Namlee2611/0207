using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using f1.Services;
using f1.Models;

namespace f1.Controllers;

[ApiController]
[Route("api/user")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly UserService _userService;

    public UserController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet("profile")]
    public IActionResult GetProfile()
    {
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
    [Authorize(Roles = "Admin")]
    public IActionResult GetAllUsers()
    {
        var users = _userService.GetAll();
        return Ok(users);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public IActionResult Add([FromBody] UserDto user)
    {
        try
        {
            if (string.IsNullOrEmpty(user.Username) || string.IsNullOrEmpty(user.Password))
            {
                return BadRequest("Username và Password là bắt buộc");
            }
            _userService.Add(user);
            return Ok("Thêm người dùng thành công");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest("Lỗi: " + ex.Message);
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Update(int id, [FromBody] UserDto user)
    {
        try
        {
            if (string.IsNullOrEmpty(user.Username) || string.IsNullOrEmpty(user.Password))
            {
                return BadRequest("Username và Password là bắt buộc");
            }
            _userService.Update(id, user);
            return Ok("Cập nhật người dùng thành công");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest("Lỗi: " + ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Delete(int id)
    {
        try
        {
            _userService.Delete(id);
            return Ok("Xóa người dùng thành công");
        }
        catch (Exception ex)
        {
            return BadRequest("Lỗi: " + ex.Message);
        }
    }
}