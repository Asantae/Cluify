using CluifyAPI.Models;
using CluifyAPI.DTOs;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Linq;
using System;
using Microsoft.Extensions.Configuration;

namespace CluifyAPI.Services
{
    public class MongoDbService
    {
        private readonly IMongoDatabase _database;

        public IMongoCollection<Case> Cases { get; }
        public IMongoCollection<Report> Reports { get; }
        public IMongoCollection<DmvRecord> DmvRecords { get; }
        public IMongoCollection<Note> Notes { get; }
        public IMongoCollection<CaseProgress> CaseProgress { get; }
        public IMongoCollection<User> Users { get; }

        public MongoDbService(IConfiguration config)
        {
            string? connectionString;
            string? databaseName;
            var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
            if (env == "Development")
            {
                connectionString = config.GetSection("MongoDB:ConnectionString").Value;
                databaseName = config.GetSection("MongoDB:DatabaseName").Value;
            }
            else
            {
                connectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING");
                databaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME");
            }
            if (string.IsNullOrEmpty(connectionString))
                throw new ArgumentNullException("connectionString", "MongoDB connection string is not set.");
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
            Cases = _database.GetCollection<Case>("cases");
            Reports = _database.GetCollection<Report>("reports");
            DmvRecords = _database.GetCollection<DmvRecord>("dmvrecords");
            Notes = _database.GetCollection<Note>("notes");
            CaseProgress = _database.GetCollection<CaseProgress>("caseprogress");
            Users = _database.GetCollection<User>("users");
        }

        public IMongoCollection<SuspectProfile> SuspectProfiles => _database.GetCollection<SuspectProfile>("suspectProfiles");
        public IMongoCollection<SocialMediaPost> SocialMediaPosts => _database.GetCollection<SocialMediaPost>("socialMediaPosts");
        public IMongoCollection<PoliceRecord> PoliceRecords => _database.GetCollection<PoliceRecord>("policeRecords");
        public IMongoCollection<PhoneRecord> PhoneRecords => _database.GetCollection<PhoneRecord>("phoneRecords");
        public IMongoCollection<PurchaseRecord> PurchaseRecords => _database.GetCollection<PurchaseRecord>("purchaseRecords");
        public IMongoCollection<SearchHistory> SearchHistories => _database.GetCollection<SearchHistory>("searchHistories");

        public async Task<List<SuspectProfile>> GetSuspectsAsync()
        {
            return await SuspectProfiles.Find(suspect => true).ToListAsync();
        }

        public async Task<List<ReportDto>?> GetPopulatedReportsForCaseAsync(string caseId)
        {
            var aCase = await Cases.Find(c => c.Id == caseId).FirstOrDefaultAsync();
            if (aCase == null || aCase.ReportIds == null || !aCase.ReportIds.Any())
            {
                return null;
            }

            var reportFilter = Builders<Report>.Filter.In(r => r.Id, aCase.ReportIds);
            var reports = await Reports.Find(reportFilter).ToListAsync();

            var populatedReports = new List<ReportDto>();

            foreach (var report in reports)
            {
                var reportDto = new DTOs.ReportDto
                {
                    Id = report.Id,
                    SuspectProfileId = report.SuspectProfileId,
                    Details = report.Details,
                    ReportDate = report.ReportDate,
                    Suspect = await GetSuspectProfileDtoAsync(report.SuspectProfileId)
                };

                populatedReports.Add(reportDto);
            }

            // Shuffle the reports using a more robust method
            var shuffledReports = populatedReports.OrderBy(r => Guid.NewGuid()).ToList();

            return shuffledReports;
        }

        private async Task<SuspectProfileDto?> GetSuspectProfileDtoAsync(string suspectProfileId)
        {
            var suspect = await SuspectProfiles.Find(s => s.Id == suspectProfileId).FirstOrDefaultAsync();
            if (suspect == null)
            {
                return null;
            }

            var dmvRecord = await DmvRecords.Find(r => r.SuspectProfileId == suspectProfileId).FirstOrDefaultAsync();
            suspect.LicensePlate = dmvRecord?.LicensePlate ?? "";

            return new SuspectProfileDto
            {
                Id = suspect.Id,
                FirstName = suspect.FirstName,
                LastName = suspect.LastName,
                Aliases = suspect.Aliases?.ToArray() ?? Array.Empty<string>(),
                Height = suspect.Height ?? "",
                Weight = suspect.Weight ?? "",
                Age = suspect.Age ?? "",
                Sex = suspect.Sex,
                Occupation = suspect.Occupation,
                HairColor = suspect.HairColor,
                EyeColor = suspect.EyeColor,
                LicensePlate = suspect.LicensePlate
            };
        }

        public async Task<List<DmvRecord>> SearchDmvRecordsAsync(DmvSearchQuery query)
        {
            var filterBuilder = Builders<DmvRecord>.Filter;
            var filter = filterBuilder.Empty;

            if (query.AgeStart.HasValue)
                filter &= filterBuilder.Gte(r => r.Age, query.AgeStart.Value);
            if (query.AgeEnd.HasValue)
                filter &= filterBuilder.Lte(r => r.Age, query.AgeEnd.Value);

            if (query.WeightStart.HasValue)
                filter &= filterBuilder.Gte(r => r.Weight, query.WeightStart.Value);
            if (query.WeightEnd.HasValue)
                filter &= filterBuilder.Lte(r => r.Weight, query.WeightEnd.Value);

            if (!string.IsNullOrEmpty(query.Gender))
                filter &= filterBuilder.Eq(r => r.Sex, query.Gender);

            if (!string.IsNullOrEmpty(query.HairColor))
                filter &= filterBuilder.Eq(r => r.HairColor, query.HairColor);
            
            if (!string.IsNullOrEmpty(query.EyeColor))
                filter &= filterBuilder.Eq(r => r.EyeColor, query.EyeColor);

            if (!string.IsNullOrEmpty(query.FirstName))
                filter &= filterBuilder.Regex(r => r.FirstName, new MongoDB.Bson.BsonRegularExpression($"^{query.FirstName}$", "i"));
            if (!string.IsNullOrEmpty(query.LastName))
                filter &= filterBuilder.Regex(r => r.LastName, new MongoDB.Bson.BsonRegularExpression($"^{query.LastName}$", "i"));
            if (!string.IsNullOrEmpty(query.LicensePlate))
            {
                var normalizedInput = new string(query.LicensePlate.Where(c => !char.IsWhiteSpace(c) && c != '-' ).ToArray()).ToUpperInvariant();
                var all = await DmvRecords.Find(filter).ToListAsync();
                return all.Where(r =>
                    !string.IsNullOrEmpty(r.LicensePlate) &&
                    new string(r.LicensePlate.Where(c => !char.IsWhiteSpace(c) && c != '-').ToArray()).ToUpperInvariant().StartsWith(normalizedInput)
                ).ToList();
            }

            var results = await DmvRecords.Find(filter).ToListAsync();

            // Height filtering in C#
            if (!string.IsNullOrEmpty(query.HeightStart) || !string.IsNullOrEmpty(query.HeightEnd))
            {
                int? start = ParseHeightToInches(query.HeightStart);
                int? end = ParseHeightToInches(query.HeightEnd);
                results = results.Where(r =>
                {
                    int? h = ParseHeightToInches(r.Height);
                    if (h == null) return false;
                    bool gte = !start.HasValue || h.Value >= start.Value;
                    bool lte = !end.HasValue || h.Value <= end.Value;
                    return gte && lte;
                }).ToList();
            }

            return results;
        }

        // Helper to parse height strings like "5'10\"" to inches
        private static int? ParseHeightToInches(string? height)
        {
            if (string.IsNullOrWhiteSpace(height)) return null;
            var match = System.Text.RegularExpressions.Regex.Match(height.Trim(), @"^(\d+)'(\d+)");
            if (!match.Success) return null;
            if (!int.TryParse(match.Groups[1].Value, out int feet)) return null;
            if (!int.TryParse(match.Groups[2].Value, out int inches)) return null;
            return feet * 12 + inches;
        }
    }

    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
    }
} 