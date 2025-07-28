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
    public class PurchasesController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public PurchasesController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpPost("search")]
        public async Task<IActionResult> SearchPurchaseRecords([FromBody] SearchRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.PersonId))
                {
                    return BadRequest("PersonId is required");
                }

                // Search for purchase records by person ID
                var purchasesFilter = Builders<PurchaseRecord>.Filter.Eq(pr => pr.PersonId, request.PersonId);
                var purchases = await _mongoDbService.PurchaseRecords.Find(purchasesFilter).ToListAsync();

                // Create response
                var response = purchases.Select(purchase => new
                {
                    purchase.Id,
                    purchase.PersonId,
                    purchase.ItemBought,
                    purchase.Price,
                    purchase.PurchaseDate
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("search-by-dmv")]
        public async Task<IActionResult> SearchPurchaseRecordsByDmv([FromQuery] string dmvRecordId)
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
                    return Ok(new List<object>());
                }

                // Search for purchase records using SuspectProfileId
                var purchasesFilter = Builders<PurchaseRecord>.Filter.Eq(pr => pr.PersonId, dmvRecord.SuspectProfileId);
                var purchases = await _mongoDbService.PurchaseRecords.Find(purchasesFilter).ToListAsync();

                // Create response
                var response = purchases.Select(purchase => new
                {
                    purchase.Id,
                    purchase.PersonId,
                    purchase.ItemBought,
                    purchase.Price,
                    purchase.PurchaseDate
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