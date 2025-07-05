using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace CluifyAPI.Models
{
    public class PhoneRecord
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string PersonId { get; set; } = null!;
        
        public string ToName { get; set; } = null!;

        public string MessageContent { get; set; } = null!;

        public DateTime MessageDateTime { get; set; }

        public int EvidenceValue { get; set; }
    }
} 