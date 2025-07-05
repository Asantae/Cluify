using CasifyAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CasifyAPI.Controllers
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