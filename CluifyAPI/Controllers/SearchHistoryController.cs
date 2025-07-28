using Microsoft.AspNetCore.Mvc;
using CluifyAPI.Services;
using CluifyAPI.Models;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CluifyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchHistoryController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public SearchHistoryController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpPost("search")]
        public async Task<IActionResult> SearchHistory([FromBody] SearchRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.PersonId))
                {
                    return BadRequest("PersonId is required");
                }

                // Search for search history by person ID
                var searchFilter = Builders<SearchHistory>.Filter.Eq(sh => sh.PersonId, request.PersonId);
                var searchHistory = await _mongoDbService.SearchHistories.Find(searchFilter).ToListAsync();

                // Create response
                var response = searchHistory.Select(record => new
                {
                    record.Id,
                    record.PersonId,
                    record.Query,
                    record.SearchDate,
                    record.EvidenceValue
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 