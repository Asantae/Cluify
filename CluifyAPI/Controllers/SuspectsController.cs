using Microsoft.AspNetCore.Mvc;
using CluifyAPI.Services;
using CluifyAPI.Models;

namespace CluifyAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuspectsController : ControllerBase
{
    private readonly MongoDbService _mongoDbService;

    public SuspectsController(MongoDbService mongoDbService)
    {
        _mongoDbService = mongoDbService;
    }

    [HttpGet]
    public async Task<List<SuspectProfile>> Get()
    {
        return await _mongoDbService.GetSuspectsAsync();
    }
} 