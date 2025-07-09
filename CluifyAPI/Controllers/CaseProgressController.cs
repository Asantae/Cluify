using Microsoft.AspNetCore.Mvc;
using CluifyAPI.Models;
using CluifyAPI.Services;
using MongoDB.Driver;

namespace CluifyAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CaseProgressController : ControllerBase
{
    private readonly MongoDbService _mongoDbService;

    public CaseProgressController(MongoDbService mongoDbService)
    {
        _mongoDbService = mongoDbService;
    }

    // GET: api/caseprogress?userId=...&caseId=...
    [HttpGet]
    public async Task<IActionResult> GetProgress([FromQuery] string userId, [FromQuery] string caseId)
    {
        var progress = await _mongoDbService.CaseProgress.Find(p => p.UserId == userId && p.CaseId == caseId).FirstOrDefaultAsync();
        if (progress == null)
            return NotFound();
        return Ok(progress);
    }

    // POST: api/caseprogress/increment
    [HttpPost("increment")]
    public async Task<IActionResult> IncrementAttempts([FromBody] ProgressRequest req)
    {
        // Validate user/case
        var aCase = await _mongoDbService.Cases.Find(c => c.Id == req.CaseId).FirstOrDefaultAsync();
        if (aCase == null || !aCase.IsActive || aCase.CanBePractice)
            return BadRequest("Case no longer active");
        if (string.IsNullOrEmpty(req.UserId))
            return BadRequest("No user ID");

        var filter = Builders<CaseProgress>.Filter.Where(p => p.UserId == req.UserId && p.CaseId == req.CaseId);
        var update = Builders<CaseProgress>.Update.Inc(p => p.Attempts, 1);
        var options = new FindOneAndUpdateOptions<CaseProgress> { IsUpsert = true, ReturnDocument = ReturnDocument.After };
        var progress = await _mongoDbService.CaseProgress.FindOneAndUpdateAsync(filter, update, options);
        return Ok(progress);
    }

    // PATCH: api/caseprogress/win
    [HttpPatch("win")]
    public async Task<IActionResult> SetWin([FromBody] ProgressRequest req)
    {
        var aCase = await _mongoDbService.Cases.Find(c => c.Id == req.CaseId).FirstOrDefaultAsync();
        if (aCase == null || !aCase.IsActive || aCase.CanBePractice)
            return BadRequest("Case no longer active");
        if (string.IsNullOrEmpty(req.UserId))
            return BadRequest("No user ID");

        var filter = Builders<CaseProgress>.Filter.Where(p => p.UserId == req.UserId && p.CaseId == req.CaseId);
        var update = Builders<CaseProgress>.Update.Set(p => p.HasWon, true);
        var options = new FindOneAndUpdateOptions<CaseProgress> { IsUpsert = true, ReturnDocument = ReturnDocument.After };
        var progress = await _mongoDbService.CaseProgress.FindOneAndUpdateAsync(filter, update, options);
        return Ok(progress);
    }

    public class ProgressRequest
    {
        public string UserId { get; set; } = null!;
        public string CaseId { get; set; } = null!;
    }
} 