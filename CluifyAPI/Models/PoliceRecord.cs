using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace CluifyAPI.Models
{
    public class PoliceRecord
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string PersonId { get; set; } = null!;
        
        public int PreviousCaseNumber { get; set; }

        public string Offense { get; set; } = null!;

        public DateTime DateOfOffense { get; set; }

        public int EvidenceValue { get; set; }
    }
} 