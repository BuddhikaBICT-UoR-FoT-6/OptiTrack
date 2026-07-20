# Changelog

All notable changes to the **OptiTrack** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-07-20
### Added
- **Tactical UI Overhaul:** Replaced glassmorphism with a high-density, precision-engineered dark-mode tactical interface (`#090A0F`, `#00F0FF`, `#FF4D00`).
- **PostgreSQL Migration:** Upgraded the backend data layer to natively support Azure Database for PostgreSQL (`org.postgresql.Driver`).
- **Cloud Hardening:** Externalized `DB_URL` environment variables to support seamless Azure App Service deployments without startup crashes.

### Fixed
- **CORS Policy:** Whitelisted the Azure Static Web Apps frontend origin to securely interact with the backend API.

## [2.0.0] - 2026-04-08
### Added
- **Predictive Intelligence Core:** Implemented Gemini-backed route optimization and deterministic fuel forecasting engines.
- **Digital Document Vault (e-Waybills):** Added high-fidelity PDF generation with customer e-signatures for secure custody transfer.
- **Atmospheric Intelligence:** Integrated live OpenWeatherMap API for real-time Sri Lankan weather overlays on the tactical map.
- **Full QA Suite:** Established JUnit/Mockito unit tests for salary evaluation and Playwright E2E "Happy Path" automation.
- **System Documentation:** Architected high-fidelity Mermaid diagrams (ER, Architecture, Sequence) for technical documentation.

### Changed
- **Architectural Hardening:** Standardized backend testing dependencies in `pom.xml` and resolved technical debt across the service layer.
- **Telemetry Optimization:** Synchronized telemetry services to provide precise data windows for AI analytics.
- **UI Refinement:** Upgraded Login and Tracking HUDs with real-time operational overlays.

## [1.2.0] - 2026-04-03
### Added
- **Mass Data Seeding Engine:** Overhauled DataInitializer to generate 30+ vehicles and 22+ drivers with unique Sri Lankan identities.
- **High-Fidelity Search Intelligence:** Integrated real-time search bars in Fleet and Workforce hubs for instant asset/crew filtering.
- **Ratnapura Command Post:** Calibrated live tracking to center on Bandaranayake Road, Ratnapura for localized operational focus.
- **Predictive Intelligence:** Added skeleton for Fatigue and Maintenance analyzers in the service layer.
- **Workforce Dossier:** Upgraded driver profiles with full CRUD capabilities and merit-based salary review reports.

### Changed
- Refined map zoom levels and centering logic for high-fidelity command center demonstrations.
- Polished UI metrics (Safety Score) to fixed-decimal precision for production aesthetics.

## [1.0.0] - 2026-01-07
### Added
- **AI Performance Analyst:** Integrated Google Gemini 1.5 Flash for automated driver behavior analysis.
- **Safety Hub:** High-fidelity dashboard for risk profiling and AI-driven recommendations.
- **Production Config:** Finalized application properties with live AI activation.

### Changed
- Finalized backend-frontend synchronization for all telemetry fields (`gpsLatitude`, `gpsLongitude`, `speedKph`).
- Hardened `.gitignore` and purged build artifacts from the repository.

## [0.8.0] - 2026-01-05
### Added
- **Performance Analytics:** Interactive charting system (Recharts) for velocity and fuel trends.
- **Live Tracking Hub:** Real-time interactive map (Leaflet) with HUD overlay.
- **Driver Management:** Profile card system for fleet human resources tracking.
- **Fleet Hub:** Automated asset status tracking and management table.

### Fixed
- Dependency resolution for GIS and analytics libraries.

## [0.5.0] - 2025-12-28
### Added
- **Telemetry Simulation:** Background engine for real-time IoT data generation.
- **Dynamic Dashboard:** Connected frontend to live telemetry polling streams.
- **Design System:** Centralized semantic CSS system with custom entrance animations.
- **Service Layer:** Completed telemetry business logic and REST controller endpoints.

## [0.1.0] - 2025-12-15
### Added
- **Core Security:** Hardened CORS policy and externalized application properties.
- **Data Models:** Established JPA entities for Drivers, Vehicles, and Telemetry.
- **Repository Layer:** Added optimized JQL queries for history and scorecard lookups.
