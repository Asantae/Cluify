using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace CluifyAPI.Models
{
    public class SearchHistory
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string PersonId { get; set; } = null!;
        
        public string Query { get; set; } = null!;

        public DateTime SearchDate { get; set; } = DateTime.UtcNow;

        public int EvidenceValue { get; set; }
    }
} 