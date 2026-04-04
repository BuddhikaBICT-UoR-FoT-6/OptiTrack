# OptiTrack System Documentation

This document contains high-fidelity Mermaid diagrams representing the OptiTrack logistics ecosystem's data architecture, system components, and operational workflows.

## 1. Entity Relationship (ER) Diagram
Represents the core data model and relationships between assets, personnel, and operational intelligence.

```mermaid
erDiagram
    VEHICLE ||--o| DRIVER_PROFILE : "assigned to"
    VEHICLE ||--o{ TELEMETRY_EVENT : "emits"
    VEHICLE ||--o{ DELIVERY : "performs"
    DRIVER_PROFILE ||--o{ TELEMETRY_EVENT : "associated with"
    DRIVER_PROFILE ||--o{ SCORECARD : "evaluated by"
    USER ||--o{ DELIVERY : "requests (as customer)"
    USER ||--o| DRIVER_PROFILE : "as personnel"

    VEHICLE {
        long id PK
        string licensePlate UK
        string make
        string model
        string status
        boolean maintenanceDue
    }

    DRIVER_PROFILE {
        long id PK
        string fullName
        string licenseNumber
        double averageScore
        double baseSalary
        double currentSalary
    }

    TELEMETRY_EVENT {
        long id PK
        double gpsLatitude
        double gpsLongitude
        double speedKph
        double fuelLevel
        double engineTemp
        boolean isHarshBraking
        datetime recordedAt
    }

    DELIVERY {
        long id PK
        string packageName
        string status
        string waybillNumber
        string customerSignature
        double userRating
        datetime assignedAt
        datetime deliveredAt
    }

    SCORECARD {
        long id PK
        double safetyRating
        double efficiencyRating
        string aiRecommendations
        datetime generatedAt
    }
```

## 2. System Architecture Diagram
Illustrates the high-level infrastructure and data flow between the frontend, backend, and external intelligence engines.

```mermaid
graph TD
    subgraph "Frontend Layer (React)"
        A[Command Center Dashboard]
        B[Tactical Tracking Map]
        C[Customer Portal]
        D[AI Insights HUD]
    end

    subgraph "Logic Layer (Spring Boot)"
        E[REST Controllers]
        F[Predictive Intelligence Service]
        G[Telemetry Engine]
        H[Digital Document Vault]
        I[Weather Integration Hub]
    end

    subgraph "Data Layer"
        J[(PostgreSQL Database)]
        K[IoT Simulation/ESP32 Stream]
    end

    subgraph "External Intelligence"
        L[Google Gemini AI]
        M[OpenWeatherMap API]
    end

    A <--> E
    B <--> E
    C <--> E
    D <--> E
    
    E <--> F
    E <--> G
    E <--> H
    E <--> I

    F <--> L
    I <--> M
    G <--> J
    K --> G
```

## 3. Real-Time AI Telemetry Sequence
Demonstrates the data lifecycle: from IoT pulse to AI analysis and predictive visualization in the HUD.

```mermaid
sequenceDiagram
    participant IoT as IoT Unit (ESP32/Sim)
    participant BE as Spring Boot Backend
    participant Gemini as Google Gemini AI
    participant DB as PostgreSQL
    participant FE as React Dashboard (HUD)

    loop Every 4 Seconds
        IoT->>BE: POST /api/telemetry/record (Speed, Fuel, GPS)
        BE->>DB: Persist TelemetryEvent
        FE->>BE: GET /api/telemetry/latest/{id}
        BE-->>FE: Return Live Telemetry
    end

    rect rgb(20, 20, 40)
        Note over FE, Gemini: AI Predictive Insight Trigger
        FE->>BE: GET /api/predictive/insights/{id}
        BE->>DB: Fetch Latest 50 Events
        BE->>Gemini: POST /v1beta/models/gemini-1.5-flash:generateContent
        Gemini-->>BE: Return Strategic Route/Fuel Optimization
        BE-->>FE: Return Predictive JSON
        FE->>FE: Update AI Insights HUD
    end
```

## 4. Digital Signature & e-Waybill Flow
Illustrates the secure custody transfer and document generation workflow.

```mermaid
sequenceDiagram
    participant Customer
    participant FE as Customer Portal
    participant BE as Backend
    participant PDF as OpenPDF Engine

    Customer->>FE: Validates QR Proximity
    FE->>Customer: Unlocks Signature Pad
    Customer->>FE: Signs e-Endorsement
    FE->>BE: POST /api/deliveries/{id}/signature
    BE->>BE: Persist Base64 Signature
    Customer->>FE: Click "Download Waybill"
    FE->>BE: GET /api/deliveries/{id}/waybill
    BE->>PDF: Generate High-Fidelity Document
    PDF-->>BE: Return PDF Binary
    BE-->>FE: Download waybill.pdf
```
