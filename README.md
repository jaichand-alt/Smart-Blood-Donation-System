# Agentic AI-Based Intelligent Blood Donor Coordination System

A production-ready full-stack web application that coordinates blood donations autonomously during medical emergencies. Using an **Agentic AI architecture**, the system performs planning, reasoning, inventory checks, ranking, multi-channel outreach, and adaptive failover when donors are unavailable.

Seeded with real-world public healthcare sites across **Tamil Nadu, India** (Chennai, Coimbatore, Vellore, Madurai), and styled with a professional, high-performance medical theme.

---

## 🚀 Key Features & Workflow

1. **Hospital Emergency Dispatches**: Hospitals create requests specifying blood group, units, location, and urgency.
2. **AI Autonomous Inventory Roster Check**: Before contacting donors, the AI sweeps blood bank inventories and automatically reserves compatible blocks, resolving the ticket instantly if stock exists.
3. **Verified Donor Ranking & Scoring**: If stock is empty, the AI filters available donors by blood compatibility, biological eligibility (last donation date > 56 days), and distance. It computes matching scores:
   $$\text{Score} = (W_d \times \text{Distance}) + (W_r \times \text{Reliability}) + (W_{rc} \times \text{Recency})$$
4. **Outreach & Automated Timeout Escalation**: The AI contacts the top-ranked donor. If the donor declines or fails to respond within the configured timeout (e.g. 15-30 seconds for simulation), the AI penalizes the donor's reliability index and escalates immediately to the next candidate.
5. **Supervised Medical Validation**: Once a donor accepts and arrives, hospital staff perform clinical screening. If the screening fails (e.g., low hemoglobin), the AI immediately restarts the donor search loop.
6. **Real-time Map Visualizations**: Interactive Leaflet.js maps displaying hospitals, blood banks, and donors with dynamic vector lines tracking the active routing path.
7. **AI Reasoning Logs & Audits**: Live terminal-style console displaying thoughts, calculations, status updates, and a complete system audit trail.

---

## 🛠️ Technology Stack & Schema

- **Frontend**: React + Vite, Lucide Icons, Leaflet Maps
- **Database**: Connected to **Supabase** for user profiles, transaction ticketing, logs, and settings.
- **Alternative Standalone**: Supports a zero-dependency high-fidelity browser emulation in [index.html](file:///c:/Users/tldde/OneDrive/Desktop/Intern%20Project/index.html) that runs completely inside the browser via localStorage persistence.

---

## ⚡ Supabase Setup (Database Connectivity)

1. Create a free project on [Supabase](https://supabase.com/).
2. Go to the **SQL Editor** tab in your Supabase Dashboard.
3. Copy the contents of [database.sql](file:///c:/Users/tldde/OneDrive/Desktop/Intern%20Project/database.sql) from the root of this project and paste it into the editor. Click **Run** to generate the tables, Row Level Security (RLS) policies, and seed values.
4. Create a `.env` file inside the `/client` directory containing your project keys:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. When Vite runs, it will automatically connect to your live Supabase cloud database. If these variables are not set, the application will automatically fall back to **Local Simulation Mode** so the app remains fully testable.

---

## 🚦 Quick Start Guide

### Installation

1. In the project root directory, run the installation script:
   ```bash
   npm run install:all
   ```
   *This command will install package dependencies for both the `/client` and `/server` workspaces.*

### Running the Application

To start the local developer server, run:
   ```bash
   npm run dev
   ```
- The **Frontend App** will launch at: `http://localhost:3000`
- The **Backend API** will run at: `http://localhost:5000`

---

## 🧑‍🤝‍🧑 Presets for Testing (Credentials)

Use the built-in preset login cards on the login screen to sign in instantly with simulated roles:

| Role | Username | Password | Institution / Location |
| :--- | :--- | :--- | :--- |
| **Hospital** | `hospital1` | `hosp123` | Rajiv Gandhi Government General Hospital (Chennai) |
| **Blood Donor** | `johndoe` | `donor123` | John Doe (Chennai Central - O+ Roster Donor) |
| **Blood Bank** | `bloodbank1` | `bank123` | Chennai Red Cross Blood Bank (Egmore) |
| **Administrator** | `admin` | `admin123` | System Administrator (Weights & parameters tuner) |

---

## 🧠 Live Simulator Controls

To make review easy, the **AI Coordination Console** on the hospital dashboard includes live simulation buttons:
- **Force Accept**: Simulates the active donor clicking "Accept" on their phone, triggering the AI to advance the request to the screening phase.
- **Force Decline**: Simulates the active donor declining, causing the AI to adapt its plan and immediately contact the second-best candidate.
- **Simulate Timeout**: Triggers a timeout, causing the AI to lower the donor's reliability rating by 5% and advance to the next candidate.
