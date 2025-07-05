namespace CluifyAPI.Models;

public class DmvSearchQuery
{
    public int? AgeStart { get; set; }
    public int? AgeEnd { get; set; }
    public string? HeightStart { get; set; }
    public string? HeightEnd { get; set; }
    public int? WeightStart { get; set; }
    public int? WeightEnd { get; set; }
    public string? Gender { get; set; }
    public string? HairColor { get; set; }
    public string? EyeColor { get; set; }
} 