using CluifyAPI.Services;
using CluifyAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;

namespace CluifyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CasesController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public CasesController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpGet("active")]
        public async Task<ActionResult<Case>> GetActiveCase()
        {
            var activeCase = await _mongoDbService.Cases.Find(c => c.IsActive).FirstOrDefaultAsync();

            if (activeCase == null)
            {
                return NotFound("No active case found.");
            }

            return Ok(activeCase);
        }

        [HttpGet("practice")]
        public async Task<ActionResult<List<Case>>> GetPracticeCases()
        {
            var practiceCases = await _mongoDbService.Cases.Find(c => c.CanBePractice).ToListAsync();
            return Ok(practiceCases);
        }

        [HttpGet("{caseId}")]
        public async Task<ActionResult<Case>> GetCaseById(string caseId)
        {
            var aCase = await _mongoDbService.Cases.Find(c => c.Id == caseId).FirstOrDefaultAsync();

            if (aCase == null)
            {
                return NotFound("Case not found.");
            }

            return Ok(aCase);
        }

        [HttpGet("{caseId}/reports")]
        public async Task<ActionResult<List<Report>>> GetReportsForCase(string caseId)
        {
            var aCase = await _mongoDbService.Cases.Find(c => c.Id == caseId).FirstOrDefaultAsync();

            if (aCase == null)
            {
                return NotFound("Case not found.");
            }

            if (aCase.ReportIds == null || !aCase.ReportIds.Any())
            {
                return Ok(new List<Report>());
            }

            var filter = Builders<Report>.Filter.In(r => r.Id, aCase.ReportIds);
            var reports = await _mongoDbService.Reports.Find(filter).ToListAsync();

            return Ok(reports);
        }
    }
} 