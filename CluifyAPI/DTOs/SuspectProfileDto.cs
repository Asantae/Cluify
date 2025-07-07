namespace CluifyAPI.DTOs
{
    public class SuspectProfileDto
    {
        public string Id { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string[] Aliases { get; set; } = [];

        public string? Height { get; set; }

        public string? Weight { get; set; }

        public string? Age { get; set; }

        public string? Sex { get; set; }

        public string? Occupation { get; set; }

        public string HairColor { get; set; } = string.Empty;

        public string EyeColor { get; set; } = string.Empty;

        public string LicensePlate { get; set; } = "";
    }
} 