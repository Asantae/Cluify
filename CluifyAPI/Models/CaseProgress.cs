using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CluifyAPI.Models
{
    public class CaseProgress
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("userId")]
        public string UserId { get; set; } = null!;

        [BsonElement("caseId")]
        public string CaseId { get; set; } = null!;

        [BsonElement("attempts")]
        public int Attempts { get; set; } = 0;

        [BsonElement("hasWon")]
        public bool HasWon { get; set; } = false;
    }
} 