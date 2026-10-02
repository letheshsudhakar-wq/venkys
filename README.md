# VENKY'S TRANSPORT MANAGEMENT SYSTEM (VTMS)

Internal enterprise operations web application for transport scheduling, deterministic transporter rotation, trip dispatch, breakdown auditing, and kilometer verification across Venky's / Venkateshwara Hatcheries poultry supply chain network.

---

## 🐔 Core Business Workflow

```
MASTER DATA
     ↓
SCHEDULE CREATION
     ↓
TRANSPORTER ROTATION (A → B → C → D)
     ↓
VEHICLE ALLOCATION (Vehicle No. is Key)
     ↓
TRIP DISPATCH
     ↓
START KM ENTRY (Gate Inspection)
     ↓
RETURN / COMPLETION
     ↓
END KM ENTRY
     ↓
ACTUAL KM AUTO-CALCULATION (Ending KM - Starting KM)
     ↓
OPERATIONAL AUDIT REPORT
```

---

## ⚙️ Key Business Rules & Features

1. **Schedule-Based Transporter Rotation**:
   - Transporters follow a strict database-driven sequence order ($A \rightarrow B \rightarrow C \rightarrow D \rightarrow A\dots$).
   - When a new schedule is created, the system identifies and preselects the next eligible transporter.
   - Rotation order is persistent across page refreshes and session restarts.

2. **Transporter Unavailability & Breakdown Handling**:
   - If the scheduled transporter or vehicle suffers a breakdown or unavailability, the Transport Manager records the mandatory reason (e.g., `Vehicle Breakdown`, `Clutch Plate Failure`).
   - The system logs a permanent audit in `transporter_skip_records`.
   - The schedule records:
     - `original_transporter_id` (e.g. Transporter B)
     - `final_transporter_id` (e.g. Transporter C)
     - `skip_reason`
   - The cycle continues seamlessly to the next eligible transporter ($A \rightarrow B(\text{SKIPPED}) \rightarrow C \rightarrow D \rightarrow A$).

3. **Kilometer Management & Auto-Calculation**:
   - **Starting KM**: Manually entered at dispatch gate before trip begins.
   - **Ending KM**: Manually entered upon vehicle return.
   - **Actual KM**: Calculated automatically by the system ($\text{Ending KM} - \text{Starting KM}$).
   - **Variance**: Compared against benchmark approximate route distance ($\text{Actual KM} - \text{Expected KM}$).
   - **Trip Type**: Round Trip ($\text{Approx KM} \times 2$) vs. One Way.

4. **Role-Based Access Control**:
   - **Transport Manager**: Operational Command Dashboard ("What is happening today?"), Schedule Creation Wizard, Breakdown/Skip Handler, Start KM/End KM Odometer Entries, Operational Reports.
   - **Admin**: Full Master Data CRUD (Transporters, Vehicles, Items, Farms, Routes, Users), Rotation Order sequencing, and entity soft-deactivations.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production bundle
npm run build
```

---

## 🗄️ Database & Supabase Integration

- **Dual-Mode Persistence**: The application includes a persistent local repository and is pre-configured for Supabase PostgreSQL.
- To connect a live Supabase project, copy `.env.example` to `.env` and set:
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```
- The complete relational schema script is provided in [`supabase/schema.sql`](file:///c:/Users/lethe/Venky%20s/supabase/schema.sql).
