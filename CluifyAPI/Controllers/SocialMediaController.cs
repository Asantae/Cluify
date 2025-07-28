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
    public class SocialMediaController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public SocialMediaController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpPost("search")]
        public async Task<IActionResult> SearchSocialMediaPosts([FromBody] SearchRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.PersonId))
                {
                    return BadRequest("PersonId is required");
                }

                // Search for social media posts by person ID
                var postsFilter = Builders<SocialMediaPost>.Filter.Eq(sp => sp.PersonId, request.PersonId);
                var posts = await _mongoDbService.SocialMediaPosts.Find(postsFilter).ToListAsync();

                // Create response
                var response = posts.Select(post => new
                {
                    post.Id,
                    post.PersonId,
                    post.Content,
                    post.ImageUrl,
                    post.PostDate,
                    post.EvidenceValue
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