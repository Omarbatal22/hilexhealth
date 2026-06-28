using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Infrastructure.Services;

public class SymptomExtractionService : ISymptomExtractionService
{
    private static readonly Dictionary<string, (string[] EnglishKeys, string[] ArabicKeys)> SymptomDictionary = 
        new(StringComparer.OrdinalIgnoreCase)
        {
            {
                "fever", 
                (
                    new[] { "fever", "high temperature", "feverish", "sweating", "chills" },
                    new[] { "حمى", "حرارة", "سخونية", "سخن", "سخونة", "مرتفع الحرارة" }
                )
            },
            {
                "cough", 
                (
                    new[] { "cough", "coughing", "dry cough", "wet cough" },
                    new[] { "كحة", "سعال", "سعل", "يكح", "بلغم" }
                )
            },
            {
                "shortness_of_breath", 
                (
                    new[] { "shortness of breath", "breathless", "difficulty breathing", "dyspnea", "breathing difficulty" },
                    new[] { "ضيق تنفس", "نهجان", "صعوبة تنفس", "مش قادر اتنفس", "مخنوق" }
                )
            },
            {
                "chest_pain", 
                (
                    new[] { "chest pain", "pain in chest", "heart pain", "chest tightness" },
                    new[] { "ألم صدر", "وجع صدر", "صدري بيوجعني", "صدري يوجعني", "ألم في الصدر", "وجع في الصدر", "ألم في صدري", "وجع في صدري", "ألم صدري", "وجع صدري" }
                )
            },
            {
                "abdominal_pain", 
                (
                    new[] { "abdominal pain", "stomach ache", "belly pain", "stomach pain", "cramps" },
                    new[] { "ألم بطن", "وجع بطن", "مغص", "بطني بتوجعني", "ألم في البطن", "وجع في البطن" }
                )
            },
            {
                "headache", 
                (
                    new[] { "headache", "migraine", "pain in head", "head pain" },
                    new[] { "صداع", "ألم رأس", "وجع رأس", "مصدع", "رأسي بيوجعني" }
                )
            },
            {
                "fatigue", 
                (
                    new[] { "fatigue", "tired", "exhausted", "weakness", "lethargy", "sleepy" },
                    new[] { "تعب", "إرهاق", "خمول", "همدان", "تعبان", "مرهق", "كسل" }
                )
            },
            {
                "sore_throat", 
                (
                    new[] { "sore throat", "throat pain", "difficulty swallowing", "inflamed throat" },
                    new[] { "ألم حلق", "ألم زور", "احتقان حلق", "حلقي بيوجعني", "زوري بيوجعني" }
                )
            },
            {
                "nausea", 
                (
                    new[] { "nausea", "vomiting", "nauseous", "vomit", "puke" },
                    new[] { "غثيان", "ترجيع", "إستفراغ", "غمم نفس", "عايز ارجع", "برجع" }
                )
            },
            {
                "dizziness", 
                (
                    new[] { "dizziness", "dizzy", "lightheaded", "vertigo" },
                    new[] { "دوخة", "دوار", "دايخ", "بدوخ" }
                )
            }
        };

    public Task<IReadOnlyList<ExtractedSymptom>> ExtractSymptomsAsync(string text, CancellationToken cancellationToken = default)
    {
        var result = new List<ExtractedSymptom>();
        if (string.IsNullOrWhiteSpace(text))
        {
            return Task.FromResult<IReadOnlyList<ExtractedSymptom>>(result);
        }

        var normalizedText = text.ToLowerInvariant();

        // Simple normalization for Arabic characters (removing diacritics/tashkeel, unifying Alef, Yeh, Teh Marbuta)
        var cleanedArabicText = NormalizeArabic(normalizedText);

        foreach (var pair in SymptomDictionary)
        {
            var symptomName = pair.Key;
            var (englishKeys, arabicKeys) = pair.Value;

            // Check English keywords
            foreach (var key in englishKeys)
            {
                if (Regex.IsMatch(normalizedText, $@"\b{Regex.Escape(key)}\b") || normalizedText.Contains(key))
                {
                    result.Add(new ExtractedSymptom(key, symptomName, "en"));
                    break; // Move to next symptom category once matched
                }
            }

            // Check Arabic keywords (if not already matched)
            bool alreadyMatched = false;
            foreach (var res in result)
            {
                if (res.NormalizedText == symptomName)
                {
                    alreadyMatched = true;
                    break;
                }
            }

            if (!alreadyMatched)
            {
                foreach (var key in arabicKeys)
                {
                    var normalizedKey = NormalizeArabic(key.ToLowerInvariant());
                    if (cleanedArabicText.Contains(normalizedKey))
                    {
                        result.Add(new ExtractedSymptom(key, symptomName, "ar"));
                        break;
                    }
                }
            }
        }

        return Task.FromResult<IReadOnlyList<ExtractedSymptom>>(result);
    }

    private string NormalizeArabic(string text)
    {
        if (string.IsNullOrEmpty(text)) return text;

        // Unify Alef
        text = Regex.Replace(text, "[أإآ]", "ا");
        // Unify Teh Marbuta & Heh
        text = Regex.Replace(text, "ة", "ه");
        // Unify Yeh & Alef Maksura
        text = Regex.Replace(text, "ى", "ي");

        // Remove diacritics
        text = Regex.Replace(text, "[\u064B-\u065F]", "");

        return text;
    }
}
