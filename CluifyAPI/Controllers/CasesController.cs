using CluifyAPI.Services;
using CluifyAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using CluifyAPI.DTOs;

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
            return Ok(new { caseData = activeCase, message = activeCase == null ? "No active case found." : null });
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
        public async Task<ActionResult<List<DTOs.ReportDto>>> GetReportsForCase(string caseId)
        {
            var reports = await _mongoDbService.GetPopulatedReportsForCaseAsync(caseId);

            if (reports == null)
            {
                return NotFound("Case not found or no reports available.");
            }

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

            return Ok(reportDtos);
        }
    }
} 