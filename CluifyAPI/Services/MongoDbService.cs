using CluifyAPI.Models;
using CluifyAPI.DTOs;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Linq;
using System;

namespace CluifyAPI.Services
{
    public class MongoDbService
    {
        private readonly IMongoDatabase _database;

        public MongoDbService(IOptions<MongoDbSettings> mongoDbSettings)
        {
            MongoClient client = new MongoClient(mongoDbSettings.Value.ConnectionString);
            _database = client.GetDatabase(mongoDbSettings.Value.DatabaseName);
        }

        public IMongoCollection<User> Users => _database.GetCollection<User>("users");
        public IMongoCollection<Case> Cases => _database.GetCollection<Case>("cases");
        public IMongoCollection<SuspectProfile> SuspectProfiles => _database.GetCollection<SuspectProfile>("suspectProfiles");
        public IMongoCollection<Report> Reports => _database.GetCollection<Report>("reports");
        public IMongoCollection<DmvRecord> DmvRecords => _database.GetCollection<DmvRecord>("dmvRecords");
        public IMongoCollection<SocialMediaPost> SocialMediaPosts => _database.GetCollection<SocialMediaPost>("socialMediaPosts");
        public IMongoCollection<PoliceRecord> PoliceRecords => _database.GetCollection<PoliceRecord>("policeRecords");
        public IMongoCollection<PhoneRecord> PhoneRecords => _database.GetCollection<PhoneRecord>("phoneRecords");
        public IMongoCollection<PurchaseRecord> PurchaseRecords => _database.GetCollection<PurchaseRecord>("purchaseRecords");
        public IMongoCollection<SearchHistory> SearchHistories => _database.GetCollection<SearchHistory>("searchHistories");
        public IMongoCollection<Note> Notes => _database.GetCollection<Note>("notes");

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

            var suspectIds = reports.Select(r => r.PersonId).Distinct();
            var suspectFilter = Builders<SuspectProfile>.Filter.In(s => s.Id, suspectIds);
            var suspects = await SuspectProfiles.Find(suspectFilter).ToListAsync();
            var suspectsById = suspects.Where(s => s.Id != null).ToDictionary(s => s.Id!);

            var populatedReports = reports.Select(r => new DTOs.ReportDto
            {
                Id = r.Id,
                PersonId = r.PersonId,
                Details = r.Details,
                ReportDate = r.ReportDate,
                Suspect = suspectsById.TryGetValue(r.PersonId, out var suspect) 
                    ? new DTOs.SuspectProfileDto 
                    {
                        Id = suspect.Id,
                        FirstName = suspect.FirstName,
                        LastName = suspect.LastName,
                        Aliases = suspect.Aliases.ToArray(),
                        Height = suspect.Height,
                        Weight = suspect.Weight,
                        Age = suspect.Age,
                        Sex = suspect.Sex,
                        Occupation = suspect.Occupation,
                        HairColor = suspect.HairColor,
                        EyeColor = suspect.EyeColor
                    } 
                    : null
            }).ToList();

            // Shuffle the reports using a more robust method
            var shuffledReports = populatedReports.OrderBy(r => Guid.NewGuid()).ToList();

            return shuffledReports;
        }

        public async Task<List<DmvRecord>> SearchDmvRecordsAsync(DmvSearchQuery query)
        {
            var filterBuilder = Builders<DmvRecord>.Filter;
            var filter = filterBuilder.Empty;

            if (query.AgeStart.HasValue)
                filter &= filterBuilder.Gte(r => r.Age, query.AgeStart.Value);
            if (query.AgeEnd.HasValue)
                filter &= filterBuilder.Lte(r => r.Age, query.AgeEnd.Value);

            // Note: Height is stored as a string.
            // This logic assumes height is stored in a format that can be compared lexicographically (e.g., "5'11\"").
            // Adjust if your data model is different.
            if (!string.IsNullOrEmpty(query.HeightStart))
                filter &= filterBuilder.Gte(r => r.Height, query.HeightStart);
            if (!string.IsNullOrEmpty(query.HeightEnd))
                filter &= filterBuilder.Lte(r => r.Height, query.HeightEnd);

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

            return await DmvRecords.Find(filter).ToListAsync();
        }
    }

    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
    }
} 