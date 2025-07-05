using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace CluifyAPI.Models
{
    public class PurchaseRecord
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string PersonId { get; set; } = null!;
        
        public string ItemBought { get; set; } = null!;

        public decimal Price { get; set; }

        public DateTime PurchaseDate { get; set; }

        public int EvidenceValue { get; set; }
    }
} 