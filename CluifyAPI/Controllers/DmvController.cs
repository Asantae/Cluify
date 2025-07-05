using Microsoft.AspNetCore.Mvc;
using CluifyAPI.Models;
using CluifyAPI.Services;

namespace CluifyAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DmvController : ControllerBase
{
    private readonly MongoDbService _mongoDbService;

    public DmvController(MongoDbService mongoDbService)
    {
        _mongoDbService = mongoDbService;
    }

    [HttpPost("search")]
    public async Task<IActionResult> SearchDmvRecords([FromBody] DmvSearchQuery query)
    {
        if (query == null)
        {
            return BadRequest("Search query cannot be null.");
        }

        var results = await _mongoDbService.SearchDmvRecordsAsync(query);
        return Ok(results);
    }
} 