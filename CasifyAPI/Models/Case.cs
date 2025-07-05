using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace CasifyAPI.Models
{
    public class Case
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public int CaseNumber { get; set; }
        
        public string Title { get; set; } = null!;

        public string? Description { get; set; }

        public string Difficulty { get; set; } = "Easy";

        [BsonRepresentation(BsonType.ObjectId)]
        public List<string> ReportIds { get; set; } = new List<string>();

        public bool IsActive { get; set; } = true;

        public bool CanBePractice { get; set; } = false;
    }
} 