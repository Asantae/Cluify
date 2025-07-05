using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace CluifyAPI.Models
{
    public class Report
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string PersonId { get; set; } = null!;

        public string Details { get; set; } = null!;

        public DateTime ReportDate { get; set; } = DateTime.UtcNow;
    }
} 