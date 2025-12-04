package com.optitrack.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Purpose: Stores the AI-generated performance scorecard for a driver,
 * produced by the Gemini API after analysing a batch of TelemetryEvents.
 *
 * Design Note: Linked to DriverProfile (not User directly) to maintain
 * Separation of Concerns. The raw Gemini response is stored as a TEXT
 * column to avoid complex JSON parsing at the persistence layer.
 */
@Entity
@Table(name = "scorecards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scorecard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_profile_id", nullable = false)
    private DriverProfile driverProfile;

    @Column(nullable = false)
    private LocalDate periodDate; // The day this scorecard covers

    @Column(nullable = false)
    private Double safetyRating; // e.g., 7.5 out of 10

    @Column(nullable = false)
    private Double efficiencyRating; // e.g., 8.2 out of 10

    // Full AI-generated recommendation text from Gemini
    @Column(columnDefinition = "TEXT")
    private String aiRecommendations;

    // Raw Gemini API JSON response preserved for auditing
    @Column(columnDefinition = "TEXT")
    private String rawGeminiResponse;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime generatedAt;
}
