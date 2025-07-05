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
        public string PersonId { get; set; } = null!;

        public string Details { get; set; } = string.Empty;

        public DateTime ReportDate { get; set; }

        public SuspectProfileDto? Suspect { get; set; }
    }
} 