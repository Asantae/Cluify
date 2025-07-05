using CluifyAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CluifyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public NotesController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        // Future methods for note management (GET, POST, PUT, DELETE) will go here.
    }
} 