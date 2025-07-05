using CasifyAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace CasifyAPI.Services
{
    public class MongoDbService
    {
        private readonly IMongoDatabase _database;

        public MongoDbService(IOptions<MongoDbSettings> mongoDbSettings)
        {
            MongoClient client = new MongoClient(mongoDbSettings.Value.ConnectionString);
            _database = client.GetDatabase(mongoDbSettings.Value.DatabaseName);
        }

        public IMongoCollection<User> Users => _database.GetCollection<User>("users");
        public IMongoCollection<Case> Cases => _database.GetCollection<Case>("cases");
        public IMongoCollection<SuspectProfile> SuspectProfiles => _database.GetCollection<SuspectProfile>("suspectProfiles");
        public IMongoCollection<Report> Reports => _database.GetCollection<Report>("reports");
        public IMongoCollection<DmvRecord> DmvRecords => _database.GetCollection<DmvRecord>("dmvRecords");
        public IMongoCollection<SocialMediaPost> SocialMediaPosts => _database.GetCollection<SocialMediaPost>("socialMediaPosts");
        public IMongoCollection<PoliceRecord> PoliceRecords => _database.GetCollection<PoliceRecord>("policeRecords");
        public IMongoCollection<PhoneRecord> PhoneRecords => _database.GetCollection<PhoneRecord>("phoneRecords");
        public IMongoCollection<PurchaseRecord> PurchaseRecords => _database.GetCollection<PurchaseRecord>("purchaseRecords");
        public IMongoCollection<SearchHistory> SearchHistories => _database.GetCollection<SearchHistory>("searchHistories");
        public IMongoCollection<Note> Notes => _database.GetCollection<Note>("notes");
    }

    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
    }
} 