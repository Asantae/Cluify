using System;
using System.Collections.Generic;

namespace CluifyAPI.DTOs
{
    public class PoliceRecordDto
    {
        public string Id { get; set; } = null!;
        public int PreviousCaseNumber { get; set; }
        public string Offense { get; set; } = null!;
        public DateTime DateOfOffense { get; set; }
        public int EvidenceValue { get; set; }
    }

    public class PersonWithPoliceRecordsDto
    {
        public string PersonId { get; set; } = null!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Height { get; set; }
        public string? Weight { get; set; }
        public string? Age { get; set; }
        public string? EyeColor { get; set; }
        public string? HairColor { get; set; }
        public string? Sex { get; set; }
        public int RecordCount { get; set; }
        public List<PoliceRecordDto> Records { get; set; } = new List<PoliceRecordDto>();
    }
} 