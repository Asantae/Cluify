using CluifyAPI.Models;
using CluifyAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using System.Threading.Tasks;
using MongoDB.Driver;
using System.Collections.Generic;
using MongoDB.Bson;

namespace CluifyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeedController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;
        private readonly IWebHostEnvironment _env;

        public SeedController(MongoDbService mongoDbService, IWebHostEnvironment env)
        {
            _mongoDbService = mongoDbService;
            _env = env;
        }

        [HttpPost("generate-case")]
        public async Task<IActionResult> GeneratePracticeCase()
        {
            if (!_env.IsDevelopment())
            {
                return Forbid("This endpoint is only available in the development environment.");
            }
            
            // Clear existing practice cases to prevent duplicates
            var caseFilter = Builders<Case>.Filter.Eq(c => c.CaseNumber, 0);
            await _mongoDbService.Cases.DeleteManyAsync(caseFilter);
            await _mongoDbService.SuspectProfiles.DeleteManyAsync(Builders<SuspectProfile>.Filter.Empty); // Clear all profiles for a clean seed
            await _mongoDbService.Reports.DeleteManyAsync(Builders<Report>.Filter.Empty); // Clear all reports

            // --- Define a fixed date for the case ---
            var caseDate = new System.DateTime(2024, 7, 6);

            // --- 1. Create All Suspect Profiles ---
            // We create and insert all suspects first so we can get their generated IDs for linking evidence.
            var guiltyPerson = new SuspectProfile
            {
                FirstName = "E",
                LastName = "",
                Age = "20-25",
                Occupation = "",
                Sex = "Male",
                Height = "5'10\"-6'0\"",
                Weight = "",
                HairColor = "Black",
                EyeColor = "",
                LicensePlate = "",
                IsGuilty = true
            };

            var redHerring = new SuspectProfile
            {
                FirstName = "Arthur",
                LastName = "Finch",
                Age = "35",
                Occupation = "Business Partner",
                Sex = "Male",
                Height = "5'10\"",
                Weight = "160",
                HairColor = "Brown",
                EyeColor = "Green",
                LicensePlate = "6HFD432",
                IsGuilty = false
            };

            var rivalInvestor = new SuspectProfile
            {
                FirstName = "Brenda",
                LastName = "Miller",
                Age = "50s",
                Occupation = "Investor",
                Sex = "Female",
                Height = "",
                Weight = "",
                IsGuilty = false,
                HairColor = "",
                EyeColor = "",
                LicensePlate = ""
            };

            var deliveryDriver = new SuspectProfile
            {
                FirstName = "",
                LastName = "",
                Age = "",
                Occupation = "Delivery Driver",
                Sex = "",
                Height = "",
                Weight = "",
                IsGuilty = false,
                HairColor = "",
                EyeColor = "",
                LicensePlate = ""
            };

            var exEmployee = new SuspectProfile
            {
                FirstName = "",
                LastName = "",
                Age = "",
                Occupation = "Ex-Employee",
                Sex = "",
                Height = "",
                Weight = "",
                IsGuilty = false,
                HairColor = "",
                EyeColor = "",
                LicensePlate = ""
            };

            var personalTrainer = new SuspectProfile
            {
                FirstName = "",
                LastName = "",
                Age = "",
                Occupation = "Personal Trainer",
                Sex = "",
                Height = "",
                Weight = "",
                IsGuilty = false,
                HairColor = "",
                EyeColor = "",
                LicensePlate = ""
            };

            var nosyNeighbor = new SuspectProfile
            {
                FirstName = "",
                LastName = "",
                Age = "",
                Occupation = "Neighbor",
                Sex = "",
                Height = "",
                Weight = "",
                IsGuilty = false,
                HairColor = "",
                EyeColor = "",
                LicensePlate = ""
            };

            var barista = new SuspectProfile
            {
                FirstName = "Elias",
                LastName = "Moreno",
                Age = "28",
                Occupation = "Barista / Student",
                Sex = "Male",
                Height = "5'8\"",
                Weight = "150",
                HairColor = "Black",
                EyeColor = "Hazel",
                LicensePlate = "7BRC912",
                IsGuilty = false
            };

            var allSuspects = new[] { guiltyPerson, redHerring, rivalInvestor, deliveryDriver, exEmployee, personalTrainer, nosyNeighbor, barista };
            await _mongoDbService.SuspectProfiles.InsertManyAsync(allSuspects);

            // --- 2. Define and Group Evidence & Reports by Suspect ---
            
            // --- Guilty: E. Hayes ---
            var reportGuilty = new Report
            {
                Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
                SuspectProfileId = guiltyPerson.Id!,
                Details = "I couldn't help but overhear a phone call the other day. It was some young guy, sounded desperate, begging for money from an 'Arthur'. He kept saying 'you're my last chance.' The person on the other end just laughed and hung up. The kid sounded like he was about to snap. I think I heard his name and it started with an E or something.",
                ReportDate = caseDate.AddDays(-2).AddHours(15).AddMinutes(17)
            };
            var purchaseRecordGuilty = new PurchaseRecord
            {
                PersonId = guiltyPerson.Id!,
                ItemBought = "Advanced Pest Control Formula",
                Price = 125.50m,
                PurchaseDate = caseDate.AddDays(-7).AddHours(15), // 3 PM
                EvidenceValue = 95
            };
            var dmvRecordGuilty = new DmvRecord
            {
                SuspectProfileId = guiltyPerson.Id!,
                FirstName = "Ethan",
                LastName = "Hayes",
                Age = 24,
                Sex = "Male",
                Height = "5'11\"",
                Weight = 165,
                LicensePlate = "",
                EyeColor = "Brown",
                HairColor = "Black",
                DateOfBirth = new System.DateTime(2001, 4, 12)
            };
            var searchQueryGuilty = new SearchHistory
            {
                PersonId = guiltyPerson.Id!,
                Query = "how to get away with poisoning",
                SearchDate = caseDate.AddDays(-5).AddHours(20), // 8 PM
                EvidenceValue = 85
            };
            var textMessageGuilty = new PhoneRecord
            {
                PersonId = guiltyPerson.Id!,
                ToName = "Friend",
                MessageContent = "Hey man, you still up for grabbing a bite later? I'm starving.",
                MessageDateTime = caseDate.AddHours(-12).AddHours(17), // 5 PM
                EvidenceValue = 0
            };
            var purchaseRecordGuilty2 = new PurchaseRecord
            {
                PersonId = guiltyPerson.Id!,
                ItemBought = "Video Game: 'Chrono Trigger'",
                Price = 59.99m,
                PurchaseDate = caseDate.AddDays(-1).AddHours(18), // 6 PM
                EvidenceValue = 0
            };

            // --- Red Herring: Arthur Finch ---
            var reportRedHerring = new Report
            {
                Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
                SuspectProfileId = redHerring.Id!,
                Details = "I saw one of Hayes's business partners leaving the office building a few days ago. " +
                          "He looked furious, muttering to himself. I think I heard him say 'you'll get what's " +
                          "coming to you,' or something like that. It was kinda scary.",
                ReportDate = caseDate.AddDays(-3).AddHours(18).AddMinutes(41)
            };
            var policeRecordRedHerring = new PoliceRecord
            {
                PersonId = redHerring.Id!,
                PreviousCaseNumber = 74321,
                Offense = "Public Disturbance",
                DateOfOffense = caseDate.AddMonths(-3),
                EvidenceValue = 30
            };
            var dmvRecordRedHerring = new DmvRecord
            {
                SuspectProfileId = redHerring.Id!,
                FirstName = "Arthur",
                LastName = "Finch",
                Age = 35,
                Sex = "Male",
                Height = "5'10\"",
                Weight = 160,
                LicensePlate = "6HFD432",
                EyeColor = "Green",
                HairColor = "Brown",
                DateOfBirth = new System.DateTime(1989, 5, 25)
            };
            var socialPostRedHerring = new SocialMediaPost
            {
                PersonId = redHerring.Id!,
                Content = "evil should come at a cost 🤷",
                PostDate = caseDate.AddDays(-1),
                EvidenceValue = 70
            };
            var textMessageRedHerring = new PhoneRecord
            {
                PersonId = redHerring.Id!,
                ToName = "Unknown",
                MessageContent = "Don't worry about Hayes anymore. He won't be a problem for us much longer.",
                MessageDateTime = caseDate.AddDays(-4),
                EvidenceValue = 80
            };
            var purchaseRecordRedHerring = new PurchaseRecord
            {
                PersonId = redHerring.Id!,
                ItemBought = "Deluxe Golf Club Set",
                Price = 1850.00m,
                PurchaseDate = caseDate.AddMonths(-3).AddDays(1), // Day after the public disturbance
                EvidenceValue = 20
            };
            
            // --- Noise: Brenda Miller (Rival Investor) ---
            var reportRival = new Report
            {
                Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
                SuspectProfileId = rivalInvestor.Id!,
                Details = "I saw that investor, Brenda Miller, at a charity gala last month. She was complaining " +
                          "to someone that Hayes had 'muscled her out' of a big deal. She did not sound happy " +
                          "about it, believe me.",
                ReportDate = caseDate.AddDays(-30).AddHours(14).AddMinutes(29)
            };
            var rivalPost = new SocialMediaPost
            {
                PersonId = rivalInvestor.Id!,
                Content = "Another win for Miller Capital. Some people just can't keep up. #investment #finance",
                PostDate = caseDate.AddDays(-2),
                EvidenceValue = 5
            };
            var rivalSearch = new SearchHistory
            {
                PersonId = rivalInvestor.Id!,
                Query = "Arthur Hayes tech acquisition rumors",
                SearchDate = caseDate.AddDays(-10),
                EvidenceValue = 5
            };
            var dmvRecordRival = new DmvRecord
            {
                SuspectProfileId = rivalInvestor.Id!,
                FirstName = "Brenda",
                LastName = "Miller",
                Age = 55,
                Sex = "Female",
                Height = "5'5\"",
                Weight = 145,
                LicensePlate = "",
                EyeColor = "Hazel",
                HairColor = "Blonde",
                DateOfBirth = new System.DateTime(1969, 3, 15)
            };
            
            // --- Noise: Leo Martinez (Delivery Driver) ---
            var reportDriver = new Report
            {
                Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
                SuspectProfileId = deliveryDriver.Id!,
                Details = "Yeah I delivered food to that house all the time. Rich dude. The night he died a lady " +
                          "I'd never seen before answered the door, just grabbed the food and slammed it shut. " +
                          "Very weird vibe.",
                ReportDate = caseDate.AddHours(-10).AddHours(19).AddMinutes(55)
            };
            var driverPurchase = new PurchaseRecord
            {
                PersonId = deliveryDriver.Id!,
                ItemBought = "Gas & Red Bull",
                Price = 45.50m,
                PurchaseDate = caseDate.AddHours(-16),
                EvidenceValue = 0
            };
            var driverText = new PhoneRecord
            {
                PersonId = deliveryDriver.Id!,
                ToName = "Dispatcher",
                MessageContent = "Last delivery for the night is on Hayes Ave. Then I'm done.",
                MessageDateTime = caseDate.AddHours(-11),
                EvidenceValue = 10
            };
            var dmvRecordDriver = new DmvRecord
            {
                SuspectProfileId = deliveryDriver.Id!,
                FirstName = "Leo",
                LastName = "Martinez",
                Age = 22,
                Sex = "Male",
                Height = "5'9\"",
                Weight = 160,
                LicensePlate = "5QRT921",
                EyeColor = "Brown",
                HairColor = "Black",
                DateOfBirth = new System.DateTime(2002, 1, 20)
            };

            // --- Noise: Ben Carter (Ex-Employee) ---
            var reportExEmployee = new Report
            {
                Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
                SuspectProfileId = exEmployee.Id!,
                Details = "I was on a local tech message board and someone who said they got laid off from that " +
                          "startup Hayes took over was going off. Said Hayes ruined his life and that powerful " +
                          "people need to be 'put in their place.'",
                ReportDate = caseDate.AddDays(-15).AddHours(16).AddMinutes(3)
            };
            var exEmployeeSearch = new SearchHistory
            {
                PersonId = exEmployee.Id!,
                Query = "average severance package tech industry",
                SearchDate = caseDate.AddDays(-20),
                EvidenceValue = 0
            };
            var exEmployeePost = new SocialMediaPost
            {
                PersonId = exEmployee.Id!,
                Content = "Some CEOs are just parasites. Time for a major redistribution of wealth.",
                PostDate = caseDate.AddDays(-18),
                EvidenceValue = 20
            };
            var dmvRecordExEmployee = new DmvRecord
            {
                SuspectProfileId = exEmployee.Id!,
                FirstName = "Ben",
                LastName = "Carter",
                Age = 38,
                Sex = "Male",
                Height = "6'1\"",
                Weight = 195,
                LicensePlate = "", // No car
                EyeColor = "Green",
                HairColor = "Brown",
                DateOfBirth = new System.DateTime(1986, 11, 5)
            };

            // --- Noise: Jessica Crane (Personal Trainer) ---
            var reportTrainer = new Report
            {
                Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
                SuspectProfileId = personalTrainer.Id!,
                Details = "I work out at the same gym as Hayes. I heard one of the trainers saying he cancelled " +
                          "his session on the day he died, which she said was really weird for him. Said he " +
                          "never cancels.",
                ReportDate = caseDate.AddHours(-12).AddHours(20).AddMinutes(11)
            };
            var trainerText = new PhoneRecord
            {
                PersonId = personalTrainer.Id!,
                ToName = "Client",
                MessageContent = "Hey! Just had a last-minute cancellation for tomorrow at 9am, are you free? 💪",
                MessageDateTime = caseDate.AddHours(-6),
                EvidenceValue = 0
            };
            var trainerPurchase = new PurchaseRecord
            {
                PersonId = personalTrainer.Id!,
                ItemBought = "Box of disposable latex gloves",
                Price = 15.99m,
                PurchaseDate = caseDate.AddDays(-2),
                EvidenceValue = 30
            };
            var dmvRecordTrainer = new DmvRecord
            {
                SuspectProfileId = personalTrainer.Id!,
                FirstName = "Jessica",
                LastName = "Crane",
                Age = 35,
                Sex = "Female",
                Height = "5'7\"",
                Weight = 130,
                LicensePlate = "8VXC201",
                EyeColor = "Blue",
                HairColor = "Red",
                DateOfBirth = new System.DateTime(1989, 5, 25)
            };

            // --- Noise: Clara Evans (Nosy Neighbor) ---
            var reportNeighbor = new Report
            {
                Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
                SuspectProfileId = nosyNeighbor.Id!,
                Details = "A black sedan was parked out front of Arthur's place for nearly an hour that night. " +
                          "I didn't see who it was, but it peeled out of there real fast around 10 PM. My " +
                          "security camera might've caught the plates.",
                ReportDate = caseDate.AddHours(-14).AddHours(21).AddMinutes(37)
            };
            var neighborPurchase = new PurchaseRecord
            {
                PersonId = nosyNeighbor.Id!,
                ItemBought = "High-End Security Camera System",
                Price = 1200.00m,
                PurchaseDate = caseDate.AddMonths(-2),
                EvidenceValue = 0
            };
            var neighborText = new PhoneRecord
            {
                PersonId = nosyNeighbor.Id!,
                ToName = "Brenda",
                MessageContent = "Arthur Hayes is having another one of his loud parties. I swear, the nerve of some people! I'm half tempted to call the cops again.",
                MessageDateTime = caseDate.AddMonths(-1),
                EvidenceValue = 10
            };
            var dmvRecordNeighbor = new DmvRecord
            {
                SuspectProfileId = nosyNeighbor.Id!,
                FirstName = "Clara",
                LastName = "Evans",
                Age = 62,
                Sex = "Female",
                Height = "5'4\"",
                Weight = 155,
                LicensePlate = "3WPL678",
                EyeColor = "Brown",
                HairColor = "Gray",
                DateOfBirth = new System.DateTime(1962, 7, 10)
            };

            // --- Noise: Arthur Finch (Barista) ---
            var reportBarista = new Report
            {
                Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
                SuspectProfileId = barista.Id!,
                Details = "I work at a coffee shop and the other day my coworker was acting strange before mentioning Mr. Hayes. He seemed really on edge. After our shift, he said something about 'people getting what they deserve' and then left in a hurry. It was out of character for him, and it made me uneasy.",
                ReportDate = caseDate.AddDays(-1).AddHours(13).AddMinutes(23)
            };
            var baristaPurchase = new PurchaseRecord
            {
                PersonId = barista.Id!,
                ItemBought = "Book: 'A Study in Scarlet' by Arthur Conan Doyle",
                Price = 12.99m,
                PurchaseDate = caseDate.AddDays(-3),
                EvidenceValue = 5
            };
            var dmvRecordBarista = new DmvRecord
            {
                SuspectProfileId = barista.Id!,
                FirstName = "Elias",
                LastName = "Moreno",
                Age = 28,
                Sex = "Male",
                Height = "5'8\"",
                Weight = 150,
                LicensePlate = "7BRC912",
                EyeColor = "Hazel",
                HairColor = "Black",
                DateOfBirth = new System.DateTime(1996, 3, 12)
            };
            
            // --- 4. Create the Final Case ---
            var case0 = new Case
            {
                CaseNumber = 0,
                Title = "Practice",
                VictimName = new List<string> { "Hayes, Arthur" },
                DateOfIncident = caseDate,
                Location = "123 Hayes Residence",
                Details = "Victim was discovered by household staff, deceased, in a locked room with no signs of forced entry. Preliminary M.E. report indicates poisoning via a fast-acting neurotoxin, likely administered through the victim's evening tea. The victim's known associates and recent activities are under investigation.",
                Objective = "Analyze anonymous reports to identify the primary suspect.",
                Difficulty = "Easy",
                IsActive = false,
                CanBePractice = true,
                ReportIds = new System.Collections.Generic.List<string> {
                    reportGuilty.Id!, reportRedHerring.Id!, reportRival.Id!, reportDriver.Id!, reportExEmployee.Id!, reportTrainer.Id!, reportNeighbor.Id!, reportBarista.Id!
                }
            };

            await _mongoDbService.Cases.InsertOneAsync(case0);

            // Set CaseId and Guilty flag for each report
            reportGuilty.CaseId = case0.Id!;
            reportGuilty.Guilty = true;
            reportRedHerring.CaseId = case0.Id!;
            reportRedHerring.Guilty = false;
            reportRival.CaseId = case0.Id!;
            reportRival.Guilty = false;
            reportDriver.CaseId = case0.Id!;
            reportDriver.Guilty = false;
            reportExEmployee.CaseId = case0.Id!;
            reportExEmployee.Guilty = false;
            reportTrainer.CaseId = case0.Id!;
            reportTrainer.Guilty = false;
            reportNeighbor.CaseId = case0.Id!;
            reportNeighbor.Guilty = false;
            reportBarista.CaseId = case0.Id!;
            reportBarista.Guilty = false;

            // --- 3. Insert All Evidence and Reports ---
            // Group inserts by collection for efficiency
            await _mongoDbService.Reports.InsertManyAsync(new[] { 
                reportGuilty, reportRedHerring, reportRival, reportDriver, reportExEmployee, reportTrainer, reportNeighbor, reportBarista
            });

            await _mongoDbService.PurchaseRecords.InsertManyAsync(new[] {
                purchaseRecordGuilty, purchaseRecordGuilty2, purchaseRecordRedHerring, driverPurchase, neighborPurchase, trainerPurchase, baristaPurchase
            });
            
            await _mongoDbService.DmvRecords.InsertManyAsync(new[] {
                dmvRecordGuilty, dmvRecordRedHerring, dmvRecordRival, dmvRecordDriver, dmvRecordExEmployee, dmvRecordTrainer, dmvRecordNeighbor, dmvRecordBarista
            });

            await _mongoDbService.PoliceRecords.InsertOneAsync(policeRecordRedHerring);

            await _mongoDbService.SearchHistories.InsertManyAsync(new[] {
                searchQueryGuilty, exEmployeeSearch, rivalSearch
            });
            
            await _mongoDbService.PhoneRecords.InsertManyAsync(new[] {
                textMessageGuilty, textMessageRedHerring, trainerText, driverText, neighborText
            });

            await _mongoDbService.SocialMediaPosts.InsertManyAsync(new[] {
                socialPostRedHerring, rivalPost, exEmployeePost
            });

            return Ok(new { message = "Practice case created successfully.", caseId = case0.Id });
        }
    }
}