# OptiTrack: Autonomous Logistics Ecosystem  🛡️🛰️🤖

[![Build Status](https://img.shields.io/github/actions/workflow/status/BuddhikaBICT-UoR-FoT-6/OptiTrack/azure-static-web-apps-blue-field-016f9f900.yml?branch=main)](https://github.com/BuddhikaBICT-UoR-FoT-6/OptiTrack/actions)
[![License](https://img.shields.io/github/license/BuddhikaBICT-UoR-FoT-6/OptiTrack)](./LICENSE)
[![React](https://img.shields.io/badge/react-18.0.0-blue.svg)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)

**OptiTrack** is a high-fidelity, AI-powered logistics management platform designed to revolutionize fleet operations and workforce performance. Built with a focus on real-time telemetry, predictive intelligence, and premium UI aesthetics, OptiTrack provides a comprehensive suite for modern logistical command centers.

---

## 🚀 Key Features

### 📡 Live Tactical Command Center
- **Ratnapura Hub Focus:** Optimized real-time tracking centered on Bandaranayake Road, Ratnapura.
- **Dynamic Telemetry:** Live mapping of speed, fuel levels, and environmental conditions across 30+ vehicles.
- **High-Fidelity UI:** Interactive Leaflet-powered map with custom HUD overlays and night-mode aesthetics.

### 👤 Workforce Intelligence (Dossier)
- **AI Performance Insights:** Google Gemini 1.5 Flash powered analysis of driver behavior and career trends.
- **Safety Hub:** Automated safety scoring (e.g., 9.4 / 10) and merit-based salary review generation.
- **Full Dossier Control:** Comprehensive CRUD management for a roster of 20+ specialized drivers.

### 🚛 Intelligent Fleet Management
- **Mass Seeding:** Authentic Sri Lankan operational data including vehicle makes (Toyota, Isuzu, etc.) and localized identities.
- **Search Intelligence:** Real-time filtering engines for instant asset discovery and crew management.
- **Status Monitoring:** Live tracking of maintenance states and operational availability.

### 🧠 Predictive Analytics
- **AI Recommendations:** Real-time feedback loops for fuel optimization and route safety.
- **Safety Scorecard:** Historical performance tracking and automated merit evaluation reports.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Tailwind CSS, Lucide Icons, Leaflet GIS, Recharts |
| **Backend** | Spring Boot, Spring Security, JPA / Hibernate, Azure PostgreSQL |
| **Intelligence** | Google Gemini 1.5 Flash AI API |
| **Operations** | Real-time Telemetry Simulation, JWT Authentication, GitHub Actions |

---

## 🚦 Getting Started

### Prerequisites
- **JDK 17+**
- **Node.js 18+**
- **Google API Key** (Set in `application.properties` as `GOOGLE_API_KEY`)
- **Azure PostgreSQL Database** (Configured via `DB_URL` environment variable)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/BuddhikaBICT-UoR-FoT-6/OptiTrack.git
   cd OptiTrack
   ```

2. **Backend Setup**
   ```bash
   cd optitrack-backend
   # Ensure you have your local PostgreSQL running or pointed to Azure
   ./mvnw spring-boot:run
   ```

3. **Frontend Setup**
   ```bash
   cd optitrack-frontend
   npm install
   npm run dev
   ```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 Documentation & Changelog

For a detailed history of updates and milestones, please refer to the [CHANGELOG.md](./CHANGELOG.md).

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Developed for the high-fidelity logistics project viva.* 🇱🇰✨🦾
