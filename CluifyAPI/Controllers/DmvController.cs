using Microsoft.AspNetCore.Mvc;
using CluifyAPI.Models;
using CluifyAPI.Services;
using Microsoft.Extensions.Hosting;
using MongoDB.Driver;

namespace CluifyAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DmvController : ControllerBase
{
    private readonly MongoDbService _mongoDbService;
    private readonly IWebHostEnvironment _env;

    public DmvController(MongoDbService mongoDbService, IWebHostEnvironment env)
    {
        _mongoDbService = mongoDbService;
        _env = env;
    }

    [HttpPost("search")]
    public async Task<IActionResult> SearchDmvRecords([FromBody] DmvSearchQuery query)
    {
        if (query == null)
        {
            return BadRequest("Search query cannot be null.");
        }

        var results = await _mongoDbService.SearchDmvRecordsAsync(query);
        var projected = results.Select(r => new {
            id = r.Id,
            firstName = r.FirstName,
            lastName = r.LastName,
            age = r.Age,
            sex = r.Sex,
            height = r.Height,
            weight = r.Weight,
            licensePlate = r.LicensePlate,
            eyeColor = r.EyeColor,
            hairColor = r.HairColor,
            dateOfBirth = r.DateOfBirth
        });
        return Ok(projected);
    }

    [HttpPost("generate-random")]
    public async Task<IActionResult> GenerateRandomDmvRecords([FromQuery] int count)
    {
        if (!_env.IsDevelopment())
        {
            return Forbid("This endpoint is only available in the development environment.");
        }
        if (count < 1 || count > 1000)
        {
            return BadRequest("Count must be between 1 and 1000.");
        }

        var client = _mongoDbService.DmvRecords.Database.Client;
        using var session = await client.StartSessionAsync();
        session.StartTransaction();
        try
        {
            var existingPlates = (await _mongoDbService.DmvRecords.Find(_ => true).Project(r => r.LicensePlate).ToListAsync())
                .Where(lp => !string.IsNullOrWhiteSpace(lp)).ToHashSet();
            var records = new List<DmvRecord>();
            for (int i = 0; i < count; i++)
            {
                var record = GenerateRandomDmvRecord(existingPlates);
                records.Add(record);
                if (!string.IsNullOrWhiteSpace(record.LicensePlate))
                    existingPlates.Add(record.LicensePlate);
            }
            await _mongoDbService.DmvRecords.InsertManyAsync(session, records);
            await session.CommitTransactionAsync();
            return Ok(new { message = $"{count} DMV records generated successfully." });
        }
        catch (Exception ex)
        {
            await session.AbortTransactionAsync();
            return StatusCode(500, $"Error generating DMV records: {ex.Message}");
        }
    }

    private static readonly string[] Sexes = new[] { "Male", "Female", "Other" };
    private static readonly string[] EyeColors = new[] { "Brown", "Blue", "Green", "Hazel", "Other" };
    private static readonly string[] HairColors = new[] { "Black", "Brown", "Blonde", "Red", "Gray", "Bald", "Other" };
    private static readonly Random Rand = new Random();

    private static DmvRecord GenerateRandomDmvRecord(HashSet<string> existingPlates)
    {
        string firstName = NameData.FirstNames[Rand.Next(NameData.FirstNames.Count)];
        string lastName = NameData.LastNames[Rand.Next(NameData.LastNames.Count)];
        int age = Rand.Next(18, 101);
        string sex = Sexes[Rand.Next(Sexes.Length)];
        int heightInches = WeightedRandomHeight();
        string height = $"{heightInches / 12}'{heightInches % 12}\"";
        int baseWeight = (int)(heightInches * Rand.NextDouble() * 2.2 + 60);
        int weight = Math.Clamp(baseWeight + Rand.Next(-15, 16), 90, 300);
        if (Rand.NextDouble() < 0.01)
        {
            weight = Rand.Next(90, 301);
        }
        string licensePlate = Rand.NextDouble() < 0.10 ? "" : GenerateUniqueLicensePlate(existingPlates);
        string eyeColor = EyeColors[Rand.Next(EyeColors.Length)];
        string hairColor = HairColors[Rand.Next(HairColors.Length)];
        DateTime dob = DateTime.Today.AddYears(-age).AddDays(-Rand.Next(0, 365));
        return new DmvRecord
        {
            SuspectProfileId = null!,
            FirstName = firstName,
            LastName = lastName,
            Age = age,
            Sex = sex,
            Height = height,
            Weight = weight,
            LicensePlate = licensePlate,
            EyeColor = eyeColor,
            HairColor = hairColor,
            DateOfBirth = dob
        };
    }

    private static int WeightedRandomHeight()
    {
        // Use a normal distribution centered at 5'10" (70 inches), stddev ~3.5"
        double mean = 70, stddev = 3.5;
        double u1 = 1.0 - Rand.NextDouble();
        double u2 = 1.0 - Rand.NextDouble();
        double randStdNormal = Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);
        int height = (int)Math.Round(mean + stddev * randStdNormal);
        return Math.Clamp(height, 48, 84);
    }

    private static string GenerateUniqueLicensePlate(HashSet<string> existingPlates)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (int attempt = 0; attempt < 1000; attempt++)
        {
            int len = Rand.Next(6, 9);
            var plate = new string(Enumerable.Range(0, len).Select(_ => chars[Rand.Next(chars.Length)]).ToArray());
            if (!existingPlates.Contains(plate))
                return plate;
        }
        // Fallback: extremely unlikely
        return Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
    }
} 