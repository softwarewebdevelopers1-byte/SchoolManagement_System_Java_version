package com.example.school.system.services.sms;

import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

public final class SubjectAbbreviation {
    private static final Map<String, String> ABBREVIATIONS = Map.ofEntries(
            Map.entry("english", "Eng"),
            Map.entry("mathematics", "Mat"),
            Map.entry("kiswahili", "Kis"),
            Map.entry("science", "Sci"),
            Map.entry("social studies", "SST"),
            Map.entry("agriculture", "Agric"),
            Map.entry("cre", "CRE"),
            Map.entry("computer studies", "Comp"),
            Map.entry("business studies", "Bus"),
            Map.entry("geography", "Geo"),
            Map.entry("history", "Hist"),
            Map.entry("physics", "Phy"),
            Map.entry("chemistry", "Chem"),
            Map.entry("biology", "Bio"));

    private SubjectAbbreviation() {
    }

    public static String abbreviate(String subjectName) {
        String normalized = subjectName == null
                ? ""
                : subjectName.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
        String knownAbbreviation = ABBREVIATIONS.get(normalized);
        if (knownAbbreviation != null) {
            return knownAbbreviation;
        }

        String compact = Arrays.stream(normalized.split("[^\\p{L}\\p{N}]+"))
                .filter(word -> !word.isBlank())
                .limit(3)
                .map(SubjectAbbreviation::compactWord)
                .collect(Collectors.joining(" "));
        return compact.isEmpty() ? "Sub" : compact;
    }

    private static String compactWord(String word) {
        String abbreviated = word.length() <= 3 ? word : word.substring(0, 3);
        return abbreviated.substring(0, 1).toUpperCase(Locale.ROOT) + abbreviated.substring(1);
    }
}
