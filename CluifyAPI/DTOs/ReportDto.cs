using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace CluifyAPI.DTOs
{
    public class ReportDto
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string SuspectProfileId { get; set; } = null!;

        public string Details { get; set; } = string.Empty;

        public DateTime ReportDate { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string CaseId { get; set; } = null!;

        public SuspectProfileDto? Suspect { get; set; }
    }
} 