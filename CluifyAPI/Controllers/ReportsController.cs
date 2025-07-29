using CluifyAPI.Services;
using Microsoft.AspNetCore.Mvc;
using CluifyAPI.Models;
using MongoDB.Driver;
using System.Threading.Tasks;
using System.Collections.Generic;
using Serilog;

namespace CluifyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly MongoDbService _mongoDbService;

        public ReportsController(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitReport([FromBody] ReportSubmissionRequest req)
        {
            Log.Information("Report submission started - UserId: {UserId}, ReportId: {ReportId}, DmvRecordId: {DmvRecordId}, CaseId: {CaseId}, EvidenceCount: {EvidenceCount}", 
                req.UserId, req.ReportId, req.DmvRecordId, req.CaseId, req.EvidenceIds?.Count ?? 0);
            
            if (string.IsNullOrEmpty(req.CaseId))
            {
                Log.Warning("Report submission failed - No case ID provided");
                return BadRequest(new { message = "No case ID", success = false });
            }
            var report = await _mongoDbService.Reports.Find(r => r.Id == req.ReportId).FirstOrDefaultAsync();
            var dmv = await _mongoDbService.DmvRecords.Find(r => r.Id == req.DmvRecordId).FirstOrDefaultAsync();
            if (report == null || dmv == null)
            {
                Log.Warning("Report submission failed - Invalid report or DMV record. ReportId: {ReportId}, DmvRecordId: {DmvRecordId}", req.ReportId, req.DmvRecordId);
                return BadRequest(new { message = "Invalid report or DMV record", success = false });
            }
            
            var aCase = await _mongoDbService.Cases.Find(c => c.Id == req.CaseId).FirstOrDefaultAsync();
            if (aCase == null)
            {
                Log.Warning("Report submission failed - Case not found. CaseId: {CaseId}", req.CaseId);
                return BadRequest(new { message = "Case not found", success = false });
            }
            if (!aCase.IsActive && !aCase.CanBePractice)
            {
                Log.Warning("Report submission failed - Case no longer active. CaseId: {CaseId}, IsActive: {IsActive}, CanBePractice: {CanBePractice}", 
                    req.CaseId, aCase.IsActive, aCase.CanBePractice);
                return BadRequest(new { message = "Case no longer active", success = false });
            }

            // New 4-condition success system
            var isCorrectSuspect = report.SuspectProfileId == dmv.SuspectProfileId;
            var isGuilty = report.Guilty;
            
            Log.Information("Suspect validation - Report.SuspectProfileId: {ReportSuspectId}, Dmv.SuspectProfileId: {DmvSuspectId}, IsCorrectSuspect: {IsCorrectSuspect}, IsGuilty: {IsGuilty}", 
                report.SuspectProfileId, dmv.SuspectProfileId, isCorrectSuspect, isGuilty);
            
            // Calculate evidence value using the EvidenceValue field from the database
            var evidenceValue = 0;
            var evidenceIds = new List<string>();
            
            if (req.EvidenceIds != null && req.EvidenceIds.Count > 0)
            {
                Log.Information("Processing evidence - EvidenceIds: {EvidenceIds}", string.Join(", ", req.EvidenceIds));
                
                // Check phone records
                var phoneRecords = await _mongoDbService.PhoneRecords.Find(pr => req.EvidenceIds!.Contains(pr.Id)).ToListAsync();
                var phoneEvidenceValue = phoneRecords.Sum(pr => pr.EvidenceValue);
                evidenceValue += phoneEvidenceValue;
                evidenceIds.AddRange(phoneRecords.Select(pr => pr.Id!));
                Log.Information("Phone records found: {PhoneCount}, Total phone evidence value: {PhoneEvidenceValue}", phoneRecords.Count, phoneEvidenceValue);
                
                // Check social media posts
                var socialMediaPosts = await _mongoDbService.SocialMediaPosts.Find(sm => req.EvidenceIds!.Contains(sm.Id)).ToListAsync();
                var socialEvidenceValue = socialMediaPosts.Sum(sm => sm.EvidenceValue);
                evidenceValue += socialEvidenceValue;
                evidenceIds.AddRange(socialMediaPosts.Select(sm => sm.Id!));
                Log.Information("Social media posts found: {SocialCount}, Total social evidence value: {SocialEvidenceValue}", socialMediaPosts.Count, socialEvidenceValue);
                
                // Check search history
                var searchHistory = await _mongoDbService.SearchHistories.Find(sh => req.EvidenceIds!.Contains(sh.Id)).ToListAsync();
                var searchEvidenceValue = searchHistory.Sum(sh => sh.EvidenceValue);
                evidenceValue += searchEvidenceValue;
                evidenceIds.AddRange(searchHistory.Select(sh => sh.Id!));
                Log.Information("Search history found: {SearchCount}, Total search evidence value: {SearchEvidenceValue}", searchHistory.Count, searchEvidenceValue);
                
                // Check purchase records
                var purchaseRecords = await _mongoDbService.PurchaseRecords.Find(pr => req.EvidenceIds!.Contains(pr.Id)).ToListAsync();
                var purchaseEvidenceValue = purchaseRecords.Sum(pr => pr.EvidenceValue);
                evidenceValue += purchaseEvidenceValue;
                evidenceIds.AddRange(purchaseRecords.Select(pr => pr.Id!));
                Log.Information("Purchase records found: {PurchaseCount}, Total purchase evidence value: {PurchaseEvidenceValue}", purchaseRecords.Count, purchaseEvidenceValue);
                
                // Check police records - only count if they match the DMV record's personId
                var policeRecords = await _mongoDbService.PoliceRecords.Find(pr => req.EvidenceIds!.Contains(pr.Id)).ToListAsync();
                var matchingPoliceRecords = policeRecords.Where(pr => pr.PersonId == dmv.SuspectProfileId).ToList();
                var policeEvidenceValue = matchingPoliceRecords.Sum(pr => pr.EvidenceValue);
                evidenceValue += policeEvidenceValue;
                evidenceIds.AddRange(matchingPoliceRecords.Select(pr => pr.Id!));
                Log.Information("Police records found: {PoliceCount}, Matching police records: {MatchingCount}, Total police evidence value: {PoliceEvidenceValue}", 
                    policeRecords.Count, matchingPoliceRecords.Count, policeEvidenceValue);
            }

            var hasSufficientEvidence = evidenceValue >= 50;
            var hasCorrectEvidence = evidenceIds.Count > 0;
            
            Log.Information("Evidence calculation complete - Total evidence value: {EvidenceValue}, HasSufficientEvidence: {HasSufficientEvidence}, HasCorrectEvidence: {HasCorrectEvidence}", 
                evidenceValue, hasSufficientEvidence, hasCorrectEvidence);

            if (!string.IsNullOrEmpty(req.UserId) && aCase.IsActive && !aCase.CanBePractice)
            {
                // Progress tracking for logged-in users (only for active, non-practice cases)
                var filter = Builders<CaseProgress>.Filter.Where(p => p.UserId == req.UserId && p.CaseId == aCase.Id);
                var progress = await _mongoDbService.CaseProgress.Find(filter).FirstOrDefaultAsync();
                if (progress != null && progress.Attempts >= 5)
                    return StatusCode(403, new { message = "Locked out after 5 attempts", success = false });

                // Increment attempts
                var update = Builders<CaseProgress>.Update.Inc(p => p.Attempts, 1);
                var options = new FindOneAndUpdateOptions<CaseProgress> { IsUpsert = true, ReturnDocument = ReturnDocument.After };
                var updated = await _mongoDbService.CaseProgress.FindOneAndUpdateAsync(filter, update, options);
                
                if (updated.Attempts >= 5)
                    return StatusCode(403, new { message = "Locked out after 5 attempts", success = false });

                // Check all 4 conditions
                if (isCorrectSuspect && isGuilty && hasSufficientEvidence && hasCorrectEvidence)
                {
                    Log.Information("Complete success - All 4 conditions met. Setting win for user {UserId}, case {CaseId}", req.UserId, req.CaseId);
                    // Complete success - set win
                    var winUpdate = Builders<CaseProgress>.Update.Set(p => p.HasWon, true);
                    await _mongoDbService.CaseProgress.FindOneAndUpdateAsync(filter, winUpdate, options);
                    return Ok(new { 
                        message = "Your report was accepted! You solved the case.", 
                        success = true,
                        isCorrectSuspect = true,
                        evidenceValue = evidenceValue,
                        evidenceIds = evidenceIds
                    });
                }
                else if (isCorrectSuspect && isGuilty && (!hasSufficientEvidence || !hasCorrectEvidence))
                {
                    Log.Information("Insufficient evidence - Correct suspect but insufficient evidence. UserId: {UserId}, CaseId: {CaseId}, EvidenceValue: {EvidenceValue}", 
                        req.UserId, req.CaseId, evidenceValue);
                    // Correct suspect but insufficient/incorrect evidence
                    return Ok(new { 
                        message = "Correct suspect but insufficient evidence", 
                        success = false,
                        isCorrectSuspect = true,
                        evidenceValue = evidenceValue,
                        evidenceIds = evidenceIds
                    });
                }
                else
                {
                    Log.Information("Wrong suspect - Incorrect suspect selected. UserId: {UserId}, CaseId: {CaseId}, IsCorrectSuspect: {IsCorrectSuspect}, IsGuilty: {IsGuilty}", 
                        req.UserId, req.CaseId, isCorrectSuspect, isGuilty);
                    // Wrong suspect
                    return Ok(new { 
                        message = "Your report was not accepted. Try again with different evidence or a different suspect.", 
                        success = false,
                        isCorrectSuspect = false,
                        evidenceValue = evidenceValue,
                        evidenceIds = evidenceIds
                    });
                }
            }
                            else
                {
                    // Guest/anonymous submission: no attempt tracking (also used for practice/inactive cases)
                    if (isCorrectSuspect && isGuilty && hasSufficientEvidence && hasCorrectEvidence)
                    {
                        Log.Information("Guest complete success - All 4 conditions met. CaseId: {CaseId}", req.CaseId);
                        return Ok(new { 
                            message = "Your report was accepted! You solved the case.", 
                            success = true,
                            isCorrectSuspect = true,
                            evidenceValue = evidenceValue,
                            evidenceIds = evidenceIds
                        });
                    }
                    else if (isCorrectSuspect && isGuilty && (!hasSufficientEvidence || !hasCorrectEvidence))
                    {
                        Log.Information("Guest insufficient evidence - Correct suspect but insufficient evidence. CaseId: {CaseId}, EvidenceValue: {EvidenceValue}", 
                            req.CaseId, evidenceValue);
                        return Ok(new { 
                            message = "Correct suspect but insufficient evidence", 
                            success = false,
                            isCorrectSuspect = true,
                            evidenceValue = evidenceValue,
                            evidenceIds = evidenceIds
                        });
                    }
                    else
                    {
                        Log.Information("Guest wrong suspect - Incorrect suspect selected. CaseId: {CaseId}, IsCorrectSuspect: {IsCorrectSuspect}, IsGuilty: {IsGuilty}", 
                            req.CaseId, isCorrectSuspect, isGuilty);
                        return Ok(new { 
                            message = "Your report was not accepted. Try again with different evidence or a different suspect.", 
                            success = false,
                            isCorrectSuspect = false,
                            evidenceValue = evidenceValue,
                            evidenceIds = evidenceIds
                        });
                    }
                }
        }

        public class ReportSubmissionRequest
        {
            public string UserId { get; set; } = null!;
            public string ReportId { get; set; } = null!;
            public string DmvRecordId { get; set; } = null!;
            public string CaseId { get; set; } = null!;
            public List<string> EvidenceIds { get; set; } = new List<string>();
        }
    }
} 