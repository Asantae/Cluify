using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace CluifyAPI.Models
{
    public class Case
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public required int CaseNumber { get; set; }
        
        public required string Title { get; set; }

        public List<string>? VictimName { get; set; }

        public DateTime? DateOfIncident { get; set; }

        public string? Location { get; set; }

        public required string Details { get; set; }

        public required string Objective { get; set; }

        public required string Difficulty { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public List<string> ReportIds { get; set; } = new List<string>();

        public bool IsActive { get; set; } = true;

        public bool CanBePractice { get; set; } = false;
    }
} 