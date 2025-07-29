using Microsoft.AspNetCore.Mvc;
using CluifyAPI.Services;
using CluifyAPI.Models;
using CluifyAPI.DTOs;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CluifyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PoliceController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public PoliceController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpPost("search")]
        public async Task<IActionResult> SearchPoliceRecords([FromBody] SearchRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.PersonId))
                {
                    return BadRequest("PersonId is required");
                }

                // Search for police records by person ID
                var policeFilter = Builders<PoliceRecord>.Filter.Eq(pr => pr.PersonId, request.PersonId);
                var policeRecords = await _mongoDbService.PoliceRecords.Find(policeFilter).ToListAsync();

                // Create response
                var response = policeRecords.Select(record => new
                {
                    record.Id,
                    record.PersonId,
                    record.PreviousCaseNumber,
                    record.Offense,
                    record.DateOfOffense,
                    record.EvidenceValue
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("search-by-dmv")]
        public async Task<IActionResult> SearchPoliceRecordsByDmv([FromQuery] string dmvRecordId)
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

                // Search for police records using SuspectProfileId
                var policeFilter = Builders<PoliceRecord>.Filter.Eq(pr => pr.PersonId, dmvRecord.SuspectProfileId);
                var policeRecords = await _mongoDbService.PoliceRecords.Find(policeFilter).ToListAsync();

                // Create response
                var response = policeRecords.Select(record => new
                {
                    record.Id,
                    record.PersonId,
                    record.PreviousCaseNumber,
                    record.Offense,
                    record.DateOfOffense,
                    record.EvidenceValue
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("search-by-name")]
        public async Task<IActionResult> SearchPoliceRecordsByName([FromQuery] string? firstName = null, [FromQuery] string? lastName = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(firstName) && string.IsNullOrWhiteSpace(lastName))
                {
                    return BadRequest("At least one of firstName or lastName is required");
                }

                // Build filter for suspect profiles based on name
                var suspectFilterBuilder = Builders<SuspectProfile>.Filter;
                var suspectFilter = suspectFilterBuilder.Empty;

                if (!string.IsNullOrWhiteSpace(firstName))
                {
                    suspectFilter &= suspectFilterBuilder.Regex(sp => sp.FirstName, new MongoDB.Bson.BsonRegularExpression($"^{firstName}$", "i"));
                }

                if (!string.IsNullOrWhiteSpace(lastName))
                {
                    suspectFilter &= suspectFilterBuilder.Regex(sp => sp.LastName, new MongoDB.Bson.BsonRegularExpression($"^{lastName}$", "i"));
                }

                // Find matching suspect profiles
                var suspectProfiles = await _mongoDbService.SuspectProfiles.Find(suspectFilter).ToListAsync();

                if (!suspectProfiles.Any())
                {
                    return Ok(new List<PersonWithPoliceRecordsDto>());
                }

                // Get all suspect IDs
                var suspectIds = suspectProfiles.Select(sp => sp.Id).ToList();

                // Search for police records for all matching suspects
                var policeFilter = Builders<PoliceRecord>.Filter.In(pr => pr.PersonId, suspectIds);
                var policeRecords = await _mongoDbService.PoliceRecords.Find(policeFilter).ToListAsync();

                // Group police records by person ID to get unique people with records
                var peopleWithRecords = policeRecords
                    .GroupBy(pr => pr.PersonId)
                    .Select(group => 
                    {
                        var suspect = suspectProfiles.FirstOrDefault(sp => sp.Id == group.Key);
                        var records = group.ToList();
                        
                        return new PersonWithPoliceRecordsDto
                        {
                            PersonId = group.Key,
                            FirstName = suspect?.FirstName,
                            LastName = suspect?.LastName,
                            Height = suspect?.Height,
                            Weight = suspect?.Weight,
                            Age = suspect?.Age,
                            EyeColor = suspect?.EyeColor,
                            HairColor = suspect?.HairColor,
                            Sex = suspect?.Sex,
                            RecordCount = records.Count,
                            Records = records.Select(r => new PoliceRecordDto
                            {
                                Id = r.Id,
                                PreviousCaseNumber = r.PreviousCaseNumber,
                                Offense = r.Offense,
                                DateOfOffense = r.DateOfOffense,
                                EvidenceValue = r.EvidenceValue
                            }).ToList()
                        };
                    })
                    .ToList();

                return Ok(peopleWithRecords);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 