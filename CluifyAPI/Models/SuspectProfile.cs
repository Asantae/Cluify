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

        public string FirstName { get; set; } = null!;

        public string LastName { get; set; } = null!;
        
        public List<string> Aliases { get; set; } = new List<string>();

        public string? Height { get; set; }

        public string? Weight { get; set; }

        public string? Age { get; set; }

        public string? Sex { get; set; }

        public string? Occupation { get; set; }

        public bool IsGuilty { get; set; }
        
        public int TimesUsedInCase { get; set; } = 0;
    }
} 