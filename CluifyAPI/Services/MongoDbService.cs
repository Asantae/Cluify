using CluifyAPI.Models;
using CluifyAPI.DTOs;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Linq;
using System;
using Microsoft.Extensions.Configuration;
using Serilog;

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
            Log.Information("Initializing MongoDB service...");
            
            string? connectionString;
            string? databaseName;
            var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
            
            Log.Information("Environment: {Environment}", env);
            
            if (env == "Development")
            {
                connectionString = config.GetSection("MongoDB:ConnectionString").Value;
                databaseName = config.GetSection("MongoDB:DatabaseName").Value;
                Log.Information("Using configuration-based MongoDB settings for Development");
            }
            else
            {
                connectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING");
                databaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME");
                Log.Information("Using environment variable-based MongoDB settings for Production");
            }
            
            if (string.IsNullOrEmpty(connectionString))
            {
                Log.Error("MongoDB connection string is not set");
                throw new ArgumentNullException("connectionString", "MongoDB connection string is not set.");
            }
            
            if (string.IsNullOrEmpty(databaseName))
            {
                Log.Error("MongoDB database name is not set");
                throw new ArgumentNullException("databaseName", "MongoDB database name is not set.");
            }
            
            Log.Information("Connecting to MongoDB database: {DatabaseName}", databaseName);
            
            try
            {
                var client = new MongoClient(connectionString);
                _database = client.GetDatabase(databaseName);
                
                // Test the connection
                var adminDb = client.GetDatabase("admin");
                var result = adminDb.RunCommand<dynamic>(new MongoDB.Bson.BsonDocument("ping", 1));
                Log.Information("MongoDB connection test successful");
                
                Cases = _database.GetCollection<Case>("cases");
                Reports = _database.GetCollection<Report>("reports");
                DmvRecords = _database.GetCollection<DmvRecord>("dmvrecords");
                Notes = _database.GetCollection<Note>("notes");
                CaseProgress = _database.GetCollection<CaseProgress>("caseprogress");
                Users = _database.GetCollection<User>("users");
                
                Log.Information("MongoDB collections initialized successfully");
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Failed to connect to MongoDB");
                throw;
            }
        }

        public IMongoCollection<SuspectProfile> SuspectProfiles => _database.GetCollection<SuspectProfile>("suspectProfiles");
        public IMongoCollection<SocialMediaPost> SocialMediaPosts => _database.GetCollection<SocialMediaPost>("socialMediaPosts");
        public IMongoCollection<PoliceRecord> PoliceRecords => _database.GetCollection<PoliceRecord>("policeRecords");
        public IMongoCollection<PhoneRecord> PhoneRecords => _database.GetCollection<PhoneRecord>("phoneRecords");
        public IMongoCollection<PurchaseRecord> PurchaseRecords => _database.GetCollection<PurchaseRecord>("purchaseRecords");
        public IMongoCollection<SearchHistory> SearchHistories => _database.GetCollection<SearchHistory>("searchHistories");

        public async Task<List<SuspectProfile>> GetSuspectsAsync()
        {
            Log.Information("Querying all suspects from database");
            try
            {
                var suspects = await SuspectProfiles.Find(suspect => true).ToListAsync();
                Log.Information("Retrieved {Count} suspects from database", suspects.Count);
                return suspects;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error retrieving suspects from database");
                throw;
            }
        }

        public async Task<List<ReportDto>?> GetPopulatedReportsForCaseAsync(string caseId)
        {
            Log.Information("Getting populated reports for case ID: {CaseId}", caseId);
            
            try
            {
                var aCase = await Cases.Find(c => c.Id == caseId).FirstOrDefaultAsync();
                if (aCase == null)
                {
                    Log.Warning("Case not found with ID: {CaseId}", caseId);
                    return null;
                }
                
                if (aCase.ReportIds == null || !aCase.ReportIds.Any())
                {
                    Log.Warning("Case {CaseId} has no report IDs", caseId);
                    return null;
                }

                Log.Information("Case {CaseId} has {ReportCount} reports", caseId, aCase.ReportIds.Count);
                
                var reportFilter = Builders<Report>.Filter.In(r => r.Id, aCase.ReportIds);
                var reports = await Reports.Find(reportFilter).ToListAsync();

                Log.Information("Retrieved {ReportCount} reports from database for case {CaseId}", reports.Count, caseId);

                var populatedReports = new List<ReportDto>();

                foreach (var report in reports)
                {
                    Log.Debug("Processing report {ReportId} for case {CaseId}", report.Id, caseId);
                    
                    var reportDto = new DTOs.ReportDto
                    {
                        Id = report.Id,
                        SuspectProfileId = report.SuspectProfileId,
                        Details = report.Details,
                        ReportDate = report.ReportDate,
                        CaseId = report.CaseId,
                        Suspect = await GetSuspectProfileDtoAsync(report.SuspectProfileId)
                    };

                    populatedReports.Add(reportDto);
                }

                // Shuffle the reports using a more robust method
                var shuffledReports = populatedReports.OrderBy(r => Guid.NewGuid()).ToList();
                
                Log.Information("Successfully populated and shuffled {ReportCount} reports for case {CaseId}", 
                    shuffledReports.Count, caseId);

                return shuffledReports;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error getting populated reports for case ID: {CaseId}", caseId);
                throw;
            }
        }

        private async Task<SuspectProfileDto?> GetSuspectProfileDtoAsync(string suspectProfileId)
        {
            Log.Debug("Getting suspect profile DTO for suspect ID: {SuspectId}", suspectProfileId);
            
            try
            {
                var suspect = await SuspectProfiles.Find(s => s.Id == suspectProfileId).FirstOrDefaultAsync();
                if (suspect == null)
                {
                    Log.Debug("Suspect profile not found for ID: {SuspectId}", suspectProfileId);
                    return null;
                }

                var suspectDto = new SuspectProfileDto
                {
                    Id = suspect.Id,
                    FirstName = suspect.FirstName,
                    LastName = suspect.LastName,
                    Aliases = suspect.Aliases?.ToArray() ?? Array.Empty<string>(),
                    Height = suspect.Height,
                    Weight = suspect.Weight,
                    Age = suspect.Age,
                    Sex = suspect.Sex,
                    Occupation = suspect.Occupation,
                    HairColor = suspect.HairColor,
                    EyeColor = suspect.EyeColor,
                    LicensePlate = suspect.LicensePlate
                };

                Log.Debug("Successfully created suspect DTO for suspect ID: {SuspectId}", suspectProfileId);
                return suspectDto;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error getting suspect profile DTO for suspect ID: {SuspectId}", suspectProfileId);
                return null;
            }
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