using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CluifyAPI.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string Username { get; set; } = null!;
        
        public string HashedPassword { get; set; } = null!;

        [BsonRepresentation(BsonType.ObjectId)]
        public string? ActiveCaseId { get; set; }

        // User stats
        public int GamesPlayed { get; set; } = 0;
        public int Wins { get; set; } = 0;
        public int Losses { get; set; } = 0;
        public int CurrentStreak { get; set; } = 0;
        public int MaxStreak { get; set; } = 0;
        public int CorrectReportSubmissions { get; set; } = 0;
        public int WeakEvidenceSubmissions { get; set; } = 0;
        public int IncorrectReportSubmissions { get; set; } = 0;
        public int TotalReportSubmissions { get; set; } = 0;

        // User settings
        public bool DarkMode { get; set; } = true;
    }
} 