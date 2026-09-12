# Ivy Homes — Software Engineering Internship Assignment

A production-ready Next.js & TypeScript web application connected to the Ivy Homes Property API, accompanied by an automated API auditing suite and data integrity solver.

---

## 1. How to Run It

### Prerequisites
- Node.js 18+ (tested on Node v25.8.1)
- npm or yarn

### Installation
1. Clone the repository and navigate into the root directory:
   ```bash
   cd ivy-homes
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
Copy the sample environment file to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your specific API key and credentials received from Ivy Homes:
```env
NEXT_PUBLIC_IVY_API_BASE=https://solve.ivy.homes
NEXT_PUBLIC_IVY_API_KEY=IVY26-YOUR_KEY
IVY_API_KEY=IVY26-YOUR_KEY
IVY_DEMO_PASSWORD=your-demo-password
IVY_ASSIGNED_LOCALITY=Miyapur
CANDIDATE_NAME="Your Name"
CANDIDATE_EMAIL="you@example.com"
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Running the API Ingestion & Data Solvers
- **Dump all records locally:**
  ```bash
  npm run fetch-data
  ```
- **Run the documentation audit:**
  ```bash
  npm run audit-api
  ```
- **Solve the 10 data questions and update `submission.json`:**
  ```bash
  npm run solve
  ```

---

## 2. Methodology: How We Worked Out What to Distrust (and What We Did)

The assignment highlighted that `API_REFERENCE.md` was drafted by an AI assistant from old notes and never verified against the production service. To tackle this rigorously, we adopted an empirical, test-driven approach:

1. **Endpoint & Route Probing:**
   - *Finding*: Documented route `` `GET /v1/listing/` `` returned 404. We discovered the live server follows standard REST conventions at `/v1/listings/{id}`.
   - *Mitigation*: The frontend API client implements automatic route resolution with fallbacks across both conventions.
2. **Filter Ignorance & Defensive Client Filtering:**
   - *Finding*: Certain query parameters (e.g., specific price ranges or furnishings) are received by the server but either return unfiltered collections or only partially filter.
   - *Mitigation*: We architected a **dual-layer filtering engine**. The client transmits query parameters to optimize network bandwidth, but also applies a local predicate filter over all returned payloads to guarantee that what the user sees strictly matches their selected filters.
3. **Data Quality & Physical Invariants:**
   - *Finding*: Some listing records describe impossible physical states (e.g., negative/zero carpet areas, or floor numbers greater than the building's total floors).
   - *Mitigation*: We created a data validator that identifies corrupt listings, removes them from calculation averages (such as `avg_price_per_sqft_2bhk`), and flags anomalies on the Insights screen.
4. **Project Inventory Consistency:**
   - *Finding*: `total_listings` on project records claimed to be dynamically synchronized with active listings. Direct cross-referencing revealed stale and mismatched counts on several projects.
   - *Mitigation*: Our project browser displays both the reported project count and the actual live listing count for maximum transparency.

---

## 3. Disproved Hypotheses (What Was Checked That Turned Out to Be Fine)

A critical part of empirical debugging is identifying which assumptions were *not* broken:

1. **Hypothesis: Pagination `limit` would fail or cap below 200.**
   - *Result*: The documentation claimed a maximum limit of 200. We tested fetching with `limit=100` and `limit=200`; the server gracefully respected the limits without rejecting or crashing, enabling fast bulk data ingestion in under 15 requests.
2. **Hypothesis: Prices were secretly recorded in Lakhs or Cents rather than Rupees.**
   - *Result*: Examination of raw numeric values (e.g., `14500000` for apartments and `42000` for rentals) confirmed that money is consistently represented as integer Indian Rupees across all endpoints.
3. **Hypothesis: Carpet areas were reported in Square Meters.**
   - *Result*: Calculated ratios of price-to-area aligned with standard Bangalore market rates (₹6,000 - ₹18,000 / sq.ft). If areas were in square meters, rates would have been roughly ~10x higher, confirming that area units are indeed in square feet.
4. **Hypothesis: Authentication token expired after 1 hour.**
   - *Result*: We verified token headers and server behavior over long intervals; the 24-hour token duration (`expires_in: 86400`) documented in the auth response is completely honest and valid.

---

## 4. What We Would Do With Another Two Days

If granted 48 additional hours, we would implement:
1. **Interactive Geospatial Map View:**
   - Integrate Mapbox or Leaflet using the provided `latitude` and `longitude` fields to plot properties, builder clusters, and school/metro transit overlays.
2. **Automated Price Anomaly & Deal Score Predictor:**
   - Train a lightweight gradient boosting or regression model on `carpet_area`, `bhk`, `locality`, and `furnishing` to assign each listing a "Fair Price" score, helping buyers spot under-priced deals.
3. **Real-time Webhook / Polling Alert System:**
   - Allow users to save search filters and receive instant browser notifications whenever a new property matching their criteria appears in the API.
4. **End-to-End Test Suite:**
   - Implement Playwright E2E tests simulating multi-step user sessions: logging in, filtering listings, adding to favourites, navigating to detail pages, and verifying persistence after page reloads.

---

## 5. Technology Stack
- **Framework:** Next.js 15 (App Router, Server & Client Components)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS
- **Data Visualization:** Recharts
- **Icons:** Lucide React
- **Scripting:** ts-node / Node.js
