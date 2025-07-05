using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace CasifyAPI.Models
{
    public class DmvRecord
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string PersonId { get; set; } = null!;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;
        
        public int Age { get; set; }
        
        public string Sex { get; set; } = string.Empty;
        
        public string Height { get; set; } = string.Empty;
        
        public int Weight { get; set; }
        
        public string LicenseNumber { get; set; } = string.Empty;
        
        public string EyeColor { get; set; } = string.Empty;
        
        public string HairColor { get; set; } = string.Empty;
        
        public DateTime DateOfBirth { get; set; }
    }
} 