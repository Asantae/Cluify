using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CluifyAPI.Models
{
    public class Note
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string CaseId { get; set; } = null!;

        public string Content { get; set; } = string.Empty;
    }
} 