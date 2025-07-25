using CluifyAPI.Services;
using CluifyAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using CluifyAPI.DTOs;
using Microsoft.Extensions.Logging;
using Serilog;

namespace CluifyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CasesController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;
        private readonly ILogger<CasesController> _logger;

        public CasesController(MongoDbService mongoDbService, ILogger<CasesController> logger)
        {
            _mongoDbService = mongoDbService;
            _logger = logger;
        }

        [HttpGet("test")]
        public ActionResult<object> TestEndpoint()
        {
            var requestId = Guid.NewGuid().ToString();
            var host = Request.Host.Value;
            var scheme = Request.Scheme;
            var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var userAgent = Request.Headers["User-Agent"].ToString();

            Log.Information("Test endpoint called - RequestId: {RequestId}, Host: {Host}, Scheme: {Scheme}, RemoteIP: {RemoteIP}", 
                requestId, host, scheme, remoteIp);

            return Ok(new
            {
                message = "Test endpoint working",
                requestId = requestId,
                host = host,
                scheme = scheme,
                remoteIp = remoteIp,
                userAgent = userAgent,
                timestamp = DateTime.UtcNow,
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"
            });
        }

        [HttpGet("active")]
        public async Task<ActionResult<Case>> GetActiveCase()
        {
            var requestId = Guid.NewGuid().ToString();
            var userAgent = Request.Headers["User-Agent"].ToString();
            var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var host = Request.Host.Value;
            var scheme = Request.Scheme;

            Log.Information("API Request {RequestId}: GET /api/cases/active from {RemoteIP} via {Host} ({Scheme})", 
                requestId, remoteIp, host, scheme);
            Log.Information("API Request {RequestId}: User-Agent: {UserAgent}", requestId, userAgent);

            try
            {
                Log.Information("API Request {RequestId}: Querying MongoDB for active case", requestId);
                
                var activeCase = await _mongoDbService.Cases.Find(c => c.IsActive).FirstOrDefaultAsync();
                
                if (activeCase == null)
                {
                    Log.Warning("API Request {RequestId}: No active case found.", requestId);
                    return Ok(new { success = false });
                }
                
                Log.Information("API Request {RequestId}: Active case found - CaseId: {CaseId}, Title: {CaseTitle}", 
                    requestId, activeCase.Id, activeCase.Title);
                
                var response = new { 
                    success = true,
                    caseData = activeCase,
                };
                
                Log.Information("API Request {RequestId}: Returning successful response with active case data", requestId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "API Request {RequestId}: Exception occurred while retrieving active case", requestId);
                return Ok(new { success = false });
            }
        }

        [HttpGet("practice")]
        public async Task<ActionResult<List<Case>>> GetPracticeCases()
        {
            var requestId = Guid.NewGuid().ToString();
            var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var host = Request.Host.Value;

            Log.Information("API Request {RequestId}: GET /api/cases/practice from {RemoteIP} via {Host}", 
                requestId, remoteIp, host);

            try
            {
                Log.Information("API Request {RequestId}: Querying MongoDB for practice cases", requestId);
                
                var practiceCases = await _mongoDbService.Cases.Find(c => c.CanBePractice).ToListAsync();
                
                Log.Information("API Request {RequestId}: Found {CaseCount} practice cases", requestId, practiceCases.Count);
                
                return Ok(practiceCases);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "API Request {RequestId}: Exception occurred while retrieving practice cases", requestId);
                throw;
            }
        }

        [HttpGet("{caseId}")]
        public async Task<ActionResult<Case>> GetCaseById(string caseId)
        {
            var requestId = Guid.NewGuid().ToString();
            var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var host = Request.Host.Value;

            Log.Information("API Request {RequestId}: GET /api/cases/{CaseId} from {RemoteIP} via {Host}", 
                requestId, caseId, remoteIp, host);

            try
            {
                Log.Information("API Request {RequestId}: Querying MongoDB for case with ID: {CaseId}", requestId, caseId);
                
                var aCase = await _mongoDbService.Cases.Find(c => c.Id == caseId).FirstOrDefaultAsync();

                if (aCase == null)
                {
                    Log.Warning("API Request {RequestId}: Case not found with ID: {CaseId}", requestId, caseId);
                    return NotFound("Case not found.");
                }

                Log.Information("API Request {RequestId}: Case found - CaseId: {CaseId}, Title: {CaseTitle}", 
                    requestId, aCase.Id, aCase.Title);
                
                return Ok(aCase);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "API Request {RequestId}: Exception occurred while retrieving case with ID: {CaseId}", 
                    requestId, caseId);
                throw;
            }
        }

        [HttpGet("{caseId}/reports")]
        public async Task<ActionResult<List<DTOs.ReportDto>>> GetReportsForCase(string caseId)
        {
            var requestId = Guid.NewGuid().ToString();
            var remoteIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            var host = Request.Host.Value;

            Log.Information("API Request {RequestId}: GET /api/cases/{CaseId}/reports from {RemoteIP} via {Host}", 
                requestId, caseId, remoteIp, host);

            try
            {
                Log.Information("API Request {RequestId}: Querying MongoDB for reports for case ID: {CaseId}", requestId, caseId);
                
                var reports = await _mongoDbService.GetPopulatedReportsForCaseAsync(caseId);

                if (reports == null)
                {
                    Log.Warning("API Request {RequestId}: Case not found or no reports available for case ID: {CaseId}", 
                        requestId, caseId);
                    return NotFound("Case not found or no reports available.");
                }

                Log.Information("API Request {RequestId}: Found {ReportCount} reports for case ID: {CaseId}", 
                    requestId, reports.Count, caseId);

                var reportDtos = reports.Select(report => new DTOs.ReportDto
                {
                    Id = report.Id,
                    SuspectProfileId = report.SuspectProfileId,
                    Details = report.Details,
                    ReportDate = report.ReportDate,
                    Suspect = report.Suspect == null ? null : new DTOs.SuspectProfileDto
                    {
                        Id = report.Suspect.Id,
                        FirstName = report.Suspect.FirstName,
                        LastName = report.Suspect.LastName,
                        Aliases = report.Suspect.Aliases,
                        Height = report.Suspect.Height,
                        Weight = report.Suspect.Weight,
                        Age = report.Suspect.Age,
                        Sex = report.Suspect.Sex,
                        Occupation = report.Suspect.Occupation,
                        HairColor = report.Suspect.HairColor,
                        EyeColor = report.Suspect.EyeColor,
                        LicensePlate = report.Suspect.LicensePlate
                    }
                }).ToList();

                Log.Information("API Request {RequestId}: Successfully mapped {ReportCount} reports to DTOs", 
                    requestId, reportDtos.Count);
                
                return Ok(reportDtos);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "API Request {RequestId}: Exception occurred while retrieving reports for case ID: {CaseId}", 
                    requestId, caseId);
                throw;
            }
        }
    }
} 