package com.optitrack.service.impl;

import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.service.GeminiService;
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
public class GeminiServiceImpl implements GeminiService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.api.key:REPLACE_WITH_YOUR_KEY}")
    private String apiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    @Override
    public String generateRecommendations(List<TelemetryEvent> events) {
        if (events == null || events.isEmpty()) {
            return "No telemetry data available for analysis.";
        }

        String telemetrySummary = events.stream()
                .map(e -> String.format("Speed: %.1f kph, Fuel: %.0f%%, Harsh Braking: %s", 
                        e.getSpeedKph(), e.getFuelLevel(), e.getIsHarshBraking()))
                .collect(Collectors.joining("\n"));

        String prompt = "As an expert fleet safety analyst, review the following telemetry data for a professional truck driver:\n\n" +
                telemetrySummary + "\n\n" +
                "Provide a concise summary (max 3 sentences) of their performance and 3 specific, professional bullet points for improvement. " +
                "Focus on safety, fuel efficiency, and asset preservation.";

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            )
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(GEMINI_API_URL + apiKey, requestBody, Map.class);
            
            if (response == null || !response.containsKey("candidates")) {
                return "AI analysis returned an empty response. Verify API key and network connectivity.";
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            
            if (candidates.isEmpty()) return "No AI candidates generated.";

            @SuppressWarnings("unchecked")
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            log.error("Failed to generate AI recommendations: {}", e.getMessage());
            return "AI Analysis temporarily unavailable. Please check driver telemetry manually.";
        }
    }
}
