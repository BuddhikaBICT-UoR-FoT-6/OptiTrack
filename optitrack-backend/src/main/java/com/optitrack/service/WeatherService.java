package com.optitrack.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Purpose: Integrates with OpenWeatherMap to provide real-time Sri Lankan atmospheric data.
 * Falls back to realistic simulation if API key is not provided.
 */
@Service
@Slf4j
public class WeatherService {

    @Value("${weather.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getWeatherData(double lat, double lon) {
        if (apiKey == null || apiKey.equals("INSERT_YOUR_WEATHER_KEY_HERE")) {
            return simulateWeather(lat, lon);
        }

        try {
            String url = String.format("https://api.openweathermap.org/data/2.5/weather?lat=%f&lon=%f&appid=%s&units=metric", lat, lon, apiKey);
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return response;
        } catch (Exception e) {
            log.error("Weather API Error: {}. Falling back to simulation.", e.getMessage());
            return simulateWeather(lat, lon);
        }
    }

    private Map<String, Object> simulateWeather(double lat, double lon) {
        Map<String, Object> weather = new HashMap<>();
        Map<String, Object> main = new HashMap<>();
        
        // Simulate Sri Lankan tropical weather
        double baseTemp = 28.0;
        if (lat < 7.0) baseTemp = 30.0; // Hotter in South
        if (lat > 8.0 && lat < 9.0 && lon > 80.5) baseTemp = 22.0; // Cooler in Hill Country

        main.put("temp", baseTemp + Math.random() * 5);
        main.put("humidity", 70 + Math.random() * 20);
        main.put("pressure", 1012);

        weather.put("main", main);
        weather.put("name", "Localized Hub");
        
        Map<String, Object> wind = new HashMap<>();
        wind.put("speed", 5 + Math.random() * 15);
        weather.put("wind", wind);

        return weather;
    }
}
