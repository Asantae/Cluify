using CluifyAPI.Services;
using Microsoft.AspNetCore.Mvc;
using CluifyAPI.Models;
using MongoDB.Driver;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace CluifyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public ReportsController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitReport([FromBody] ReportSubmissionRequest req)
        {
            if (string.IsNullOrEmpty(req.CaseId))
                return BadRequest(new { message = "No case ID", success = false });
            var report = await _mongoDbService.Reports.Find(r => r.Id == req.ReportId).FirstOrDefaultAsync();
            var dmv = await _mongoDbService.DmvRecords.Find(r => r.Id == req.DmvRecordId).FirstOrDefaultAsync();
            if (report == null || dmv == null)
                return BadRequest(new { message = "Invalid report or DMV record", success = false });
            var aCase = await _mongoDbService.Cases.Find(c => c.Id == req.CaseId).FirstOrDefaultAsync();
            if (aCase == null)
                return BadRequest(new { message = "Case not found", success = false });
            if (!aCase.IsActive && !aCase.CanBePractice)
                return BadRequest(new { message = "Case no longer active", success = false });

            if (!string.IsNullOrEmpty(req.UserId) && aCase.IsActive && !aCase.CanBePractice)
            {
                // Progress tracking for logged-in users (only for active, non-practice cases)
                var filter = Builders<CaseProgress>.Filter.Where(p => p.UserId == req.UserId && p.CaseId == aCase.Id);
                var progress = await _mongoDbService.CaseProgress.Find(filter).FirstOrDefaultAsync();
                if (progress != null && progress.Attempts >= 5)
                    return StatusCode(403, new { message = "Locked out after 5 attempts", success = false });

                // Check ID match
                if (report.SuspectProfileId != dmv.SuspectProfileId)
                {
                    // Increment attempts
                    var update = Builders<CaseProgress>.Update.Inc(p => p.Attempts, 1);
                    var options = new FindOneAndUpdateOptions<CaseProgress> { IsUpsert = true, ReturnDocument = ReturnDocument.After };
                    var updated = await _mongoDbService.CaseProgress.FindOneAndUpdateAsync(filter, update, options);
                    if (updated.Attempts >= 5)
                        return StatusCode(403, new { message = "Locked out after 5 attempts", success = false });
                    return Ok(new { message = "Your report was not accepted. Try again with different evidence or a different suspect.", success = false });
                }

                // Check guilty
                if (report.Guilty)
                {
                    var update = Builders<CaseProgress>.Update.Inc(p => p.Attempts, 1).Set(p => p.HasWon, true);
                    var options = new FindOneAndUpdateOptions<CaseProgress> { IsUpsert = true, ReturnDocument = ReturnDocument.After };
                    await _mongoDbService.CaseProgress.FindOneAndUpdateAsync(filter, update, options);
                    return Ok(new { message = "Your report was accepted! You solved the case.", success = true });
                }
                else
                {
                    var update = Builders<CaseProgress>.Update.Inc(p => p.Attempts, 1);
                    var options = new FindOneAndUpdateOptions<CaseProgress> { IsUpsert = true, ReturnDocument = ReturnDocument.After };
                    var updated = await _mongoDbService.CaseProgress.FindOneAndUpdateAsync(filter, update, options);
                    if (updated.Attempts >= 5)
                        return StatusCode(403, new { message = "Locked out after 5 attempts", success = false });
                    return Ok(new { message = "Your report was not accepted. Try again with different evidence or a different suspect.", success = false });
                }
            }
            else
            {
                // Guest/anonymous submission: no attempt tracking (also used for practice/inactive cases)
                if (report.SuspectProfileId != dmv.SuspectProfileId)
                {
                    return Ok(new { message = "Your report was not accepted. Try again with different evidence or a different suspect.", success = false });
                }
                if (report.Guilty)
                {
                    return Ok(new { message = "Your report was accepted! You solved the case.", success = true });
                }
                else
                {
                    return Ok(new { message = "Your report was not accepted. Try again with different evidence or a different suspect.", success = false });
                }
            }
        }

        public class ReportSubmissionRequest
        {
            public string UserId { get; set; } = null!;
            public string ReportId { get; set; } = null!;
            public string DmvRecordId { get; set; } = null!;
            public string CaseId { get; set; } = null!;
            public List<string> EvidenceIds { get; set; } = new List<string>();
        }
    }
} 