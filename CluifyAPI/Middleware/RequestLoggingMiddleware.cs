using Microsoft.AspNetCore.Http;
using Serilog;
using System.Diagnostics;
using System.Text;

namespace CluifyAPI.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;

        public RequestLoggingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var requestId = Guid.NewGuid().ToString();
            var stopwatch = Stopwatch.StartNew();
            
            // Log request details
            Log.Information("=== REQUEST START {RequestId} ===", requestId);
            Log.Information("Request {RequestId}: {Method} {Path} from {RemoteIP}", 
                requestId, context.Request.Method, context.Request.Path, context.Connection.RemoteIpAddress);
            Log.Information("Request {RequestId}: Host: {Host}, Scheme: {Scheme}, Protocol: {Protocol}", 
                requestId, context.Request.Host, context.Request.Scheme, context.Request.Protocol);
            Log.Information("Request {RequestId}: User-Agent: {UserAgent}", 
                requestId, context.Request.Headers["User-Agent"].ToString());
            Log.Information("Request {RequestId}: Referer: {Referer}", 
                requestId, context.Request.Headers["Referer"].ToString());
            
            // Log headers
            foreach (var header in context.Request.Headers)
            {
                Log.Debug("Request {RequestId}: Header {HeaderName}: {HeaderValue}", 
                    requestId, header.Key, header.Value.ToString());
            }

            try
            {
                // Call the next middleware
                await _next(context);
                
                stopwatch.Stop();
                
                // Log response details
                Log.Information("Response {RequestId}: Status {StatusCode} in {ElapsedMs}ms", 
                    requestId, context.Response.StatusCode, stopwatch.ElapsedMilliseconds);
                
                // Log response headers
                foreach (var header in context.Response.Headers)
                {
                    Log.Debug("Response {RequestId}: Header {HeaderName}: {HeaderValue}", 
                        requestId, header.Key, header.Value.ToString());
                }
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                Log.Error(ex, "Request {RequestId}: Exception occurred after {ElapsedMs}ms", 
                    requestId, stopwatch.ElapsedMilliseconds);
                throw;
            }
            finally
            {
                Log.Information("=== REQUEST END {RequestId} ===", requestId);
            }
        }
    }
} 