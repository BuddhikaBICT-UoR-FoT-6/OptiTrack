package com.optitrack.ai;

import com.optitrack.model.entity.Delivery;
import com.optitrack.model.entity.DriverProfile;
import com.optitrack.model.entity.TelemetryEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiAnalyzerImpl implements GeminiAnalyzer {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.api.key}")
    private String apiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    @Override
    public String analyzePerformance(List<TelemetryEvent> events) {
        String prompt = buildAnalysisPrompt(events);
        return callGemini(prompt, events);
    }

    @Override
    public String generateSafetyReport(List<TelemetryEvent> events, String driverName) {
        String prompt = "Generate a professional, executive-level safety report for driver: " + driverName + "\n\n" +
                "Based on the following telemetry data, provide a 'Executive Summary', 'Risk Assessment', and 'Action Plan'. " +
                "Maintain a formal, corporate tone suitable for fleet management stakeholders.\n\n" +
                buildTelemetrySummary(events);
        return callGemini(prompt, events);
    }

    @Override
    public String analyzeDriverProfile(DriverProfile profile, List<Delivery> history) {
        String historySummary = history.stream()
                .limit(10)
                .map(d -> String.format("- Package: %s, Rating: %s, Night: %s, Weather: %s, Time: %s mins",
                        d.getPackageName(), d.getUserRating(), d.getIsNightDelivery(), d.getIsWeatherChallenged(), d.getAssignmentToDeliveryMinutes()))
                .collect(Collectors.joining("\n"));

        String prompt = String.format("As a senior logistics operations consultant, analyze this driver's career performance profile:\n\n" +
                "Driver: %s\n" +
                "Experience: %d years\n" +
                "Internal Safety Score: %.1f/10\n" +
                "Recent Delivery History:\n%s\n\n" +
                "Provide a high-fidelity performance evaluation (max 4 sentences). Analyze their ability to handle pressure (night/weather) and summarize their value to the fleet. Recommend if they are suitable for high-priority critical routes.",
                profile.getFullName(), profile.getExperienceYears(), profile.getAverageScore(), historySummary);

        return callGemini(prompt, null);
    }

    private String buildAnalysisPrompt(List<TelemetryEvent> events) {
        return "As an expert fleet safety coach, review this telemetry data:\n\n" +
                buildTelemetrySummary(events) + "\n\n" +
                "Provide a concise summary (max 3 sentences) and 3 bullet points for improvement focusing on safety and fuel efficiency.";
    }

    private String buildTelemetrySummary(List<TelemetryEvent> events) {
        if (events == null || events.isEmpty()) return "No telemetry data recorded.";
        return events.stream()
                .limit(20)
                .map(e -> String.format("[%s] Speed: %.1f kph, Fuel: %.0f%%, Harsh Braking: %s", 
                        e.getRecordedAt(), e.getSpeedKph(), e.getFuelLevel(), e.getIsHarshBraking()))
                .collect(Collectors.joining("\n"));
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String prompt, List<TelemetryEvent> events) {
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            )
        );

        try {
            Map<String, Object> response = restTemplate.postForObject(GEMINI_API_URL + apiKey, requestBody, Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            log.error("Gemini API Failure: {}", e.getMessage());
            return "AI Insights temporarily unavailable. Manual audit of delivery history and safety scores is required for evaluation.";
        }
    }
}
