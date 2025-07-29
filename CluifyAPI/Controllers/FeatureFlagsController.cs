using Microsoft.AspNetCore.Mvc;
using CluifyAPI.Models;

namespace CluifyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeatureFlagsController : ControllerBase
    {
        private readonly FeatureFlags _featureFlags;

        public FeatureFlagsController(FeatureFlags featureFlags)
        {
            _featureFlags = featureFlags;
        }

        [HttpGet]
        public IActionResult GetFeatureFlags()
        {
            return Ok(_featureFlags);
        }
    }
} 