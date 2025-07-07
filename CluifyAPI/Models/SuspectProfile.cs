using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace CluifyAPI.Models
{
    public class SuspectProfile
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public string? FirstName { get; set; }

        public string? LastName { get; set; }
        
        public List<string>? Aliases { get; set; }

        public string Height { get; set; } = "";

        public string Weight { get; set; } = "";

        public string Age { get; set; } = "";

        public string? Sex { get; set; }

        public string? Occupation { get; set; }

        public string HairColor { get; set; } = string.Empty;

        public string EyeColor { get; set; } = string.Empty;

        public bool IsGuilty { get; set; }
        
        public int? TimesUsedInCase { get; set; }

        public string LicensePlate { get; set; } = "";
    }
} 