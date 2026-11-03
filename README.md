# AI-Powered Smart Blood Donation and Management System

A production-grade, centralized healthcare logistics and emergency blood coordination platform with four independent portals, real-time AI decision engines, and verified medical compliance.

Deployed on **Vercel** & configured for high-availability healthcare coordination across **Tamil Nadu, India** (Chennai, Madurai, Coimbatore, Vellore).

---

## 🏛️ System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │               Centralized State Engine                 │
                    │   (Users, Hospitals, Banks, Donors, Inventory, Ledger)  │
                    └───────────────────────────┬────────────────────────────┘
                                                │
         ┌───────────────────┬──────────────────┴────────────────┬───────────────────┐
         │                   │                                   │                   │
┌────────┴────────┐ ┌────────┴────────┐                 ┌────────┴────────┐ ┌────────┴────────┐
│  Admin Portal   │ │ Hospital Portal │                 │  Donor Portal   │ │Blood Bank Portal│
│ Control Center  │ │Emergency Orders │                 │Voluntary Roster │ │  Stock Manager  │
└─────────────────┘ └─────────────────┘                 └─────────────────┘ └─────────────────┘
```

---

## 🚀 Key Features by Portal

### 1. 👑 Central Administrator Control Centre
- **Real-Time Ecosystem Overview**: Live counts of registered donors, hospitals, blood banks, available units across all 8 blood groups, active emergency tickets, and online sessions.
- **User Verification & Approvals**: Non-admin registrations (hospitals, blood banks, donors) enter `pending_approval` and require explicit admin verification before login is permitted. Admin accounts cannot be publicly registered.
- **AI Recommendation Centre**: Evaluates emergency hospital requests against real-time blood bank inventories and GPS coordinates. Admins can approve the AI recommendation or override with an alternative bank.
- **AI Analytics & Shortage Forecasting**: Interactive bar distribution across 8 blood groups plus a 30-day predictive shortage forecasting model.
- **Compliance Audit Ledger & Reports**: Immutable activity trail of all submissions, dispatches, and approvals with 1-click **CSV export**.
- **Interactive Geospatial Network Map**: Embedded Leaflet.js map plotting all hospitals, blood banks, and donors.

### 2. 🏥 Hospital Emergency Dispatch Portal
- **Broadcast Emergency Request**: Request blood by group, required units, urgency (`Normal`, `Urgent`, `Emergency`), and patient reference ID.
- **Autonomous AI Matching Trigger**: Automatically initiates inventory checks and donor pool ranking upon submission.
- **Hospital Blood Inventory Manager**: Track and adjust on-site surgical reserve stock.
- **Multi-Stage Order Tracking**: Real-time progression tracker from submission to fulfillment.

### 3. 🩸 Voluntary Blood Donor Portal
- **Donor Digital Pass**: Displays verified blood group, reliability index, rest period, and past donation history.
- **Live Availability Switch**: Real-time toggle (`Available to Donate 🟢` vs `Currently Unavailable 🔴`).
- **AI Health Pre-Screening**: Evaluates age (18–65), weight ($\ge 50\text{ kg}$), donation interval ($\ge 56\text{ days}$), chronic conditions, and medications:
  - 🟢 **GREEN**: No obvious eligibility concerns identified.
  - 🟡 **YELLOW**: Additional pre-donation clinical check required.
  - 🔴 **RED**: Temporary or absolute deferral.
- **Incoming Emergency Dispatches**: Compatible requests within distance with Accept and Decline actions.

### 4. 🏦 Blood Bank Repository Portal
- **8-Blood Group Stock Manager**: Real-time units adjuster for $A^+, A^-, B^+, B^-, AB^+, AB^-, O^+, O^-$.
- **Admin-Approved Emergency Orders**: Receive emergency hospital dispatch authorizations with 1-click fulfillment.
- **Transaction-Safe Ledger**: Automatically logs additions, reserves, and deductions to prevent double allocation.

---

## 🤖 Core AI Decision Engines

### A. Closest Blood Bank Recommendation Engine
Calculates the optimal source for an emergency hospital ticket:
1. Calculates actual distance via the **Haversine formula** using hospital and blood bank GPS coordinates.
2. Estimates transit time based on urban emergency routing ($T = \text{round}((\text{dist} / 35) \times 60 + 5)\text{ minutes}$).
3. Verifies inventory sufficiency across all medically compatible blood groups.
4. Generates an explainable reasoning summary for admin review.

### B. Multi-Criteria Donor Ranking Algorithm
$$\text{Score} = (W_d \times \text{Distance}) + (W_r \times \text{Reliability}) + (W_{rc} \times \text{Recency})$$
- Default weights: Distance 40%, Reliability 30%, Recency 30%.
- Filters out unavailable or medically deferred donors.

---

## 🧑‍💻 Built-In Testing Credentials

Use the quick-fill cards on the login screen or enter manually:

| Portal | Email | Password | Role Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@bloodcoop.gov.in` | `admin123` | State Health Director (Central Control) |
| **Hospital** | `hospital1@rggh.gov.in` | `hosp123` | Rajiv Gandhi Govt General Hospital (Chennai) |
| **Blood Bank** | `bloodbank1@redcrosschennai.org` | `bank123` | Chennai Red Cross Blood Bank (Egmore) |
| **Donor** | `johndoe@gmail.com` | `donor123` | John Doe (O+ Roster Donor, Chennai Central) |

---

## ⚡ Quick Start & Testing

### Run Locally
```bash
# Start zero-dependency HTTP server
node server.js
# Or
npm start
```
Open **`http://localhost:3000`** in any web browser.

### Run Automated Test Suite
```bash
npm test
```
Verifies authentication, registration approval barriers, request creation, AI blood bank recommendations, preliminary donor screening, inventory deductions, and audit logging.

---

## ☁️ Vercel Deployment

Configured with `vercel.json` for zero-configuration, production-grade deployment on Vercel:
```bash
npx vercel
```
Or connect your GitHub repository directly to Vercel for automated CI/CD deployments on `main`.
