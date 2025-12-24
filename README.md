# 🛰️ OptiTrack: High-Fidelity Fleet Management & AI Analytics

OptiTrack is a production-grade, full-stack fleet management platform designed for real-time asset tracking, performance analytics, and AI-driven safety monitoring. Built with a focus on high-performance engineering and premium aesthetics, OptiTrack transforms raw IoT telemetry into actionable operational intelligence.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://img.shields.io/badge/build-success-brightgreen.svg)

## 🚀 Key Features

*   **📡 Live Telemetry Pipeline:** Real-time tracking of vehicle location, speed, and fuel levels using an integrated IoT simulation engine.
*   **🗺️ Interactive Tracking Hub:** High-fidelity dark-themed map (React-Leaflet) with truck-specific markers and a professional HUD (Heads-Up Display).
*   **📊 Performance Analytics:** Dynamic data visualization (Recharts) for speed velocity trends and fuel efficiency history.
*   **🤖 AI Performance Analyst:** Integration with **Google Gemini 1.5 Flash** to analyze driver behavior and generate professional safety recommendations.
*   **🛡️ Safety & Compliance:** Automated risk profiling based on incident tracking (harsh braking, speeding) and AI-generated scorecards.
*   **🔒 Enterprise Security:** Stateless JWT authentication, role-based access control (Admin/User), and hardened CORS policies.

## 🛠️ Technology Stack

### Backend
*   **Java 21 / Spring Boot 3**
*   **Spring Security & JWT** (Stateless Auth)
*   **Spring Data JPA** (MySQL Persistence)
*   **Google Gemini API** (AI Analysis)
*   **Lombok & MapStruct**

### Frontend
*   **React 18 / Vite**
*   **Tailwind CSS** (Custom Semantic Design System)
*   **React-Leaflet** (GIS Visualization)
*   **Recharts** (Data Analytics)
*   **Zustand** (State Management)

## ⚙️ Installation & Setup

### Prerequisites
*   JDK 21 or higher
*   Node.js 18+
*   MySQL 8.0+

### Backend Setup
1. Clone the repository and navigate to `optitrack-backend`.
2. Configure your `application.properties` or set environment variables:
   ```properties
   spring.datasource.username=your_user
   spring.datasource.password=your_password
   google.api.key=YOUR_GEMINI_API_KEY
   ```
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup
1. Navigate to `optitrack-frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## 📜 Documentation

*   [CHANGELOG.md](./CHANGELOG.md) - Detailed development history and version milestones.
*   [LICENSE](./LICENSE) - MIT License details.

---
Developed with ❤️ by **BuddhikaBICT-UoR-FoT-6**
