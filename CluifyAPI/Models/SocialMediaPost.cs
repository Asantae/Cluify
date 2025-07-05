using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace CluifyAPI.Models
{
    public class SocialMediaPost
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string PersonId { get; set; } = null!;
        
        public string Content { get; set; } = null!;

        public string? ImageUrl { get; set; }

        public DateTime PostDate { get; set; } = DateTime.UtcNow;

        public int EvidenceValue { get; set; }
    }
} 