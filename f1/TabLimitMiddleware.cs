using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;
using System.Threading.Tasks;

public class TabLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IMemoryCache _cache;
    private const int MaxRequests = 10;
    private static readonly TimeSpan Window = TimeSpan.FromMinutes(1); 
    public TabLimitMiddleware(RequestDelegate next, IMemoryCache cache)
    {
        _next = next;
        _cache = cache;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = !string.IsNullOrEmpty(userId)
                ? userId
                : (context.Connection.RemoteIpAddress?.ToString() ?? "unknown");
            var userKey = $"user:{user}:ratelimit";
            var now = DateTimeOffset.UtcNow;

            if (!_cache.TryGetValue(userKey, out List<DateTimeOffset> timestamps))
            {
                timestamps = new List<DateTimeOffset>();
            }

            timestamps = timestamps.Where(ts => ts > now - Window).ToList();
            timestamps.Add(now);

            _cache.Set(userKey, timestamps, now.Add(Window));

            if (timestamps.Count > MaxRequests)
            {
                context.Response.StatusCode = 429;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync("{\"error\": \"Quá số lần \"}");
                return;
            }
        }
        await _next(context);
    }
} 