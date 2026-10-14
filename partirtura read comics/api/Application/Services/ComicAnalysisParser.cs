using System.Reflection.Metadata.Ecma335;
using System.Text.Json;
using Application.DTOs;

namespace Application.Services;

public static class ComicAnalysisParser
{
    public static ComicAnalysisResult Parse(string content)
    {
        if (TryParse(content, out var result))
        {
            return result == null ? Empty() : result;
        }
        return Empty();
    }

    public static bool TryParse(string content, out ComicAnalysisResult? result)
    {
        result = null;

        if (string.IsNullOrWhiteSpace(content))
        {
            return false;
        }

        var trimmed = content.Trim();
        var jsonStart = trimmed.IndexOf('{');
        var jsonEnd = trimmed.LastIndexOf('}');
        if (jsonStart < 0 || jsonEnd <= jsonStart)
        {
            return false;
        }

        var json = trimmed[jsonStart..(jsonEnd + 1)];

        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            result = new ComicAnalysisResult(
                GetStringOrNull(root, "title"),
                GetStringOrNull(root, "publisher"),
                GetStringOrNull(root, "number"),
                GetStringOrNull(root, "description"),
                GetStringOrNull(root, "summary"),
                GetStringOrNull(root, "publicationDate"),
                GetStringArray(root, "writers"),
                GetStringArray(root, "artists"),
                GetStringArray(root, "inkers"),
                GetStringArray(root, "tags"),
                GetStringArray(root, "characters"));

            return true;
        }
        catch
        {
            return false;
        }
    }

    public static string BuildPrompt(string language)
    {
        return $$"""
    Analyze all provided comic book pages as belonging to the same comic book issue.

    Return ONLY one valid JSON object matching the exact structure defined below.
    Do not return markdown, explanations, comments, or any text outside the JSON object.

    RESULT LANGUAGE:
    {{language}}

    INFORMATION SOURCES:

    Use the provided comic book pages as the primary source for identifying the exact issue.

    Once the exact issue has been identified, you may use your general knowledge to enrich and complete information that is not available in the images.

    The information does NOT need to be visible in the provided pages.

    For example:
    - The publication date may not appear in the images, but may be determined from knowledge of the identified issue.
    - The publisher may be determined from knowledge of the identified issue.
    - A description may be generated or recalled from the identified issue.
    - Writers, artists, inkers, and characters may be completed using knowledge of the identified issue.
    - A summary may be generated from knowledge of the identified issue.

    Do not fabricate information.
    External knowledge may be used only when the exact issue can be identified with sufficient confidence.

    ANALYSIS PROCESS:

    Follow these steps internally before producing the JSON:

    1. Examine all provided pages.
    2. Extract identifying information visible in the images.
    3. Identify the comic series and the exact individual issue.
    4. Determine the issue title and issue number.
    5. Use your general knowledge to enrich missing metadata for the identified issue.
    6. Cross-check the enriched information against the identified issue.
    7. Return the final normalized JSON.

    Do not output these analysis steps.

    GENERAL RULES:

    - Do not fabricate information.
    - You may use general knowledge to complete missing information after the exact issue has been identified.
    - If the exact issue cannot be identified with sufficient confidence, do not guess.
    - For scalar properties, return null when reliable information cannot be determined.
    - For collection properties, return an empty array when reliable information cannot be determined.
    - Do not return "Unknown", "N/A", "Not available", or similar placeholder values.
    - Information may appear on different pages. Combine information found across all provided pages.
    - Avoid duplicate values in arrays.
    - Preserve proper names and official names when possible.
    - Translate descriptive content according to the requested result language.

    ISSUE TITLE:

    The "title" field refers to the title of THIS SPECIFIC ISSUE, not the title of the comic series.

    For example:

    Series: "Taskmaster"
    Issue: "#2"
    Issue title: "El gatillo rubicón"

    The expected result is:

    "title": "El gatillo rubicón"
    "number": "2"

    If the exact issue title cannot be determined, return null.

    IMPORTANT:
    If only the series title is known, do NOT use the series title as the issue title.

    NUMBER:

    - Return the issue number of the specific issue.
    - Use the number visible in the images when available.
    - If the number is not visible, you may determine it from the identified issue using general knowledge.
    - Do not confuse the issue number with a volume number, collection number, edition number, or page number.
    - Return only the number itself when possible.
    - Do not include "#" unless it is actually part of the number.

    PUBLISHER:

    - Identify the publisher of the specific issue.
    - The publisher does not need to be visible in the images.
    - You may determine it using general knowledge once the exact issue has been identified.
    - Prefer the publisher associated with the original issue.
    - Do not confuse the original publisher with a later reprint, distributor, or collected edition.

    PUBLICATION DATE:

    - Identify the original publication date of the specific issue.
    - The publication date does not need to appear in the provided images.
    - You may determine it using general knowledge once the exact issue has been identified.
    - Prefer the original publication date of the individual issue rather than a reprint or collected edition date.
    - Use the format YYYY-MM-DD when the complete date is known.
    - If the exact date cannot be reliably determined, return null.
    - Do not invent missing date components.

    CREDITS:

    Identify writers, artists, and inkers separately.

    - Use information visible in the images when available.
    - You may complete missing credits using general knowledge of the identified issue.
    - Do not infer a person's role from their name alone.
    - Do not place a creator in a role unless that role is reliably known.
    - Keep writers, artists, and inkers in their respective arrays.
    - Do not include colorists, letterers, editors, translators, cover artists, or other roles in these arrays unless the same person is also reliably credited as a writer, artist, or inker.

    DESCRIPTION:

    Provide a concise catalog-style description of the specific issue.

    - The description does not need to appear in the provided images.
    - You may use your general knowledge of the identified issue.
    - If no reliable official description is known, generate a concise factual description based on the identified issue.
    - Do not invent plot elements or factual details.
    - Do not confuse the description of the series with the description of the individual issue.

    SUMMARY:

    Provide a concise summary of the story of the specific issue.

    - The summary does not need to appear in the provided images.
    - You may use your general knowledge of the identified issue.
    - Use the provided pages as additional evidence when appropriate.
    - Do not invent events, characters, relationships, or conclusions.
    - Do not confuse the plot of the series with the plot of this specific issue.

    TAGS:

    Return relevant descriptive tags for the specific issue.

    Tags may include:
    - themes
    - genres
    - locations
    - organizations
    - events
    - concepts
    - narrative elements

    Use general knowledge when appropriate, but only include tags that are relevant to the identified issue.

    CHARACTERS:

    Return the fictional characters appearing in the specific issue.

    - Use the provided images when possible.
    - You may complete the list using general knowledge of the identified issue.
    - Include only characters that are reliably associated with the issue.
    - Do not invent character identities based solely on visual resemblance.

    JSON STRUCTURE:

    {
    "title": string or null,
    "publisher": string or null,
    "number": string or null,
    "description": string or null,
    "summary": string or null,
    "publicationDate": string or null,
    "writers": [string],
    "artists": [string],
    "inkers": [string],
    "tags": [string],
    "characters": [string]
    }

    OUTPUT REQUIREMENTS:

    - Return exactly one JSON object.
    - The JSON must be syntactically valid.
    - Use double quotes for all property names and string values.
    - Use null for unknown scalar values.
    - Use [] for unknown collection values.
    - Do not use trailing commas.
    - Do not wrap the JSON in markdown or code fences.
    - Do not include any additional text before or after the JSON object.
    """;
    }

    private static ComicAnalysisResult Empty() =>
        new(null, null, null, null, null, null, [], [], [], [], []);

    private static string? GetStringOrNull(JsonElement root, string propertyName)
    {
        if (root.TryGetProperty(propertyName, out var element) && element.ValueKind == JsonValueKind.String)
        {
            var value = element.GetString();
            return string.IsNullOrWhiteSpace(value) ? null : value;
        }
        return null;
    }

    private static IReadOnlyList<string> GetStringArray(JsonElement root, string propertyName)
    {
        if (!root.TryGetProperty(propertyName, out var element) || element.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        return element.EnumerateArray()
            .Where(e => e.ValueKind == JsonValueKind.String)
            .Select(e => e.GetString() ?? string.Empty)
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .ToList();
    }
}
