using CluifyAPI.Services;
using CluifyAPI.Middleware;
using CluifyAPI.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using System.Text;
using Serilog;
using Serilog.Events;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithThreadId()
    .WriteTo.Console(
        outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .WriteTo.File(
        path: "logs/app-.txt",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7,
        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .CreateLogger();

Log.Information("Starting Cluify API...");

var port = Environment.GetEnvironmentVariable("PORT") ?? "5096";
var builder = WebApplication.CreateBuilder(args);

// Configure host
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var allowedHosts = "localhost:5173,cluify.net,www.cluify.net,cluify.onrender.com,cluify.netlify.app";
builder.WebHost.UseSetting("AllowedHosts", "*");

Log.Information("Configured allowed hosts: {AllowedHosts}", allowedHosts);
Log.Information("Application will run on port: {Port}", port);

// Use Serilog
builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://cluify.net",
            "https://www.cluify.net",
            "https://cluify.netlify.app",
            "https://cluify.onrender.com"
        )
        .AllowAnyHeader()                     
        .AllowAnyMethod() 
        .AllowCredentials();  
    });
});

Log.Information("CORS policy configured for frontend origins");

// Configure MongoDB
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDB"));
builder.Services.AddSingleton<MongoDbService>();

Log.Information("MongoDB service configured");

// Configure Feature Flags
builder.Services.Configure<FeatureFlags>(builder.Configuration.GetSection("FeatureFlags"));
builder.Services.AddSingleton(sp => sp.GetRequiredService<IOptions<FeatureFlags>>().Value);

Log.Information("Feature flags configured");

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtConfig = builder.Configuration.GetSection("Jwt");
    var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? jwtConfig["Issuer"];
    var key = Environment.GetEnvironmentVariable("JWT_KEY") ?? jwtConfig["Key"];
    
    if (string.IsNullOrEmpty(issuer))
    {
        Log.Error("JWT Issuer is not configured");
        throw new InvalidOperationException("JWT Issuer is not configured");
    }
    
    if (string.IsNullOrEmpty(key))
    {
        Log.Error("JWT Key is not configured");
        throw new InvalidOperationException("JWT Key is not configured");
    }
    
    Log.Information("JWT configuration - Issuer: {Issuer}", issuer);
    
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
    };
});

Log.Information("JWT authentication configured");

var app = builder.Build();

Log.Information("Application built successfully");

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    Log.Information("Running in Development environment");
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use custom request logging middleware (before Serilog request logging)
app.UseMiddleware<RequestLoggingMiddleware>();

// Use Serilog request logging
app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
        diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
        diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"].ToString());
        diagnosticContext.Set("RemoteIP", httpContext.Connection.RemoteIpAddress?.ToString());
    };
});

Log.Information("Serilog request logging configured");

app.UseCors("AllowFrontend");
Log.Information("CORS middleware configured");

app.UseAuthentication();
app.UseAuthorization();
Log.Information("Authentication and authorization middleware configured");

app.MapControllers();
Log.Information("Controllers mapped");

try
{
    Log.Information("Starting Cluify API on port {Port}", port);
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
