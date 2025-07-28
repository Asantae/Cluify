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
    public class PhoneController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public PhoneController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpPost("search")]
        public async Task<IActionResult> SearchPhoneRecords([FromBody] SearchRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.PersonId))
                {
                    return BadRequest("PersonId is required");
                }

                // Search for phone records by person ID
                var phoneFilter = Builders<PhoneRecord>.Filter.Eq(pr => pr.PersonId, request.PersonId);
                var phoneRecords = await _mongoDbService.PhoneRecords.Find(phoneFilter).ToListAsync();

                // Create response
                var response = phoneRecords.Select(record => new
                {
                    record.Id,
                    record.PersonId,
                    record.ToName,
                    record.MessageContent,
                    record.MessageDateTime
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("search-all")]
        public async Task<IActionResult> SearchAllPhoneData([FromQuery] string dmvRecordId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dmvRecordId))
                {
                    return BadRequest("DmvRecordId is required");
                }

                // Find the DMV record by ID
                var dmvFilter = Builders<DmvRecord>.Filter.Eq(dr => dr.Id, dmvRecordId);
                var dmvRecord = await _mongoDbService.DmvRecords.Find(dmvFilter).FirstOrDefaultAsync();

                if (dmvRecord == null)
                {
                    return NotFound("DMV record not found");
                }

                // If DMV record has no SuspectProfileId, return empty results
                if (string.IsNullOrWhiteSpace(dmvRecord.SuspectProfileId))
                {
                    return Ok(new
                    {
                        phoneRecords = new List<object>(),
                        socialMediaPosts = new List<object>(),
                        searchHistory = new List<object>()
                    });
                }

                // Search across all phone-related collections using SuspectProfileId
                var phoneFilter = Builders<PhoneRecord>.Filter.Eq(pr => pr.PersonId, dmvRecord.SuspectProfileId);
                var socialMediaFilter = Builders<SocialMediaPost>.Filter.Eq(sm => sm.PersonId, dmvRecord.SuspectProfileId);
                var searchHistoryFilter = Builders<SearchHistory>.Filter.Eq(sh => sh.PersonId, dmvRecord.SuspectProfileId);

                var phoneRecords = await _mongoDbService.PhoneRecords.Find(phoneFilter).ToListAsync();
                var socialMediaPosts = await _mongoDbService.SocialMediaPosts.Find(socialMediaFilter).ToListAsync();
                var searchHistory = await _mongoDbService.SearchHistories.Find(searchHistoryFilter).ToListAsync();

                var response = new
                {
                    phoneRecords = phoneRecords.Select(record => new
                    {
                        record.Id,
                        record.PersonId,
                        record.ToName,
                        record.MessageContent,
                        record.MessageDateTime
                    }).ToList(),
                    socialMediaPosts = socialMediaPosts.Select(post => new
                    {
                        post.Id,
                        post.PersonId,
                        post.Content,
                        post.PostDate
                    }).ToList(),
                    searchHistory = searchHistory.Select(history => new
                    {
                        history.Id,
                        history.PersonId,
                        history.Query,
                        history.SearchDate
                    }).ToList()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 