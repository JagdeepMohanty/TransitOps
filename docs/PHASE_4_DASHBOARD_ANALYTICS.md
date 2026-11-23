# Phase 4 – Real‑Database‑Driven Dashboard, Analytics & Reporting

## Overview
This phase replaces all placeholder/mock data with live queries against the **MySQL** database via **Prisma**. The dashboard, visualisations, KPI cards, filters and reports now reflect the actual state of the fleet, drivers, trips, fuel logs, maintenance and expenses.

---

## 1️⃣ KPI Definitions & Calculations
| KPI | Definition | DB Source | Formula |
|-----|------------|-----------|---------|
| **Total Vehicles** | Count of all vehicle records | `vehicle` table | `prisma.vehicle.count()` |
| **Active Vehicles** | Vehicles not retired | `vehicle` | `count where status != 'RETIRED'` |
| **Available Vehicles** | Ready for dispatch | `vehicle` | `count where status = 'AVAILABLE'` |
| **Inactive Vehicles** | Retired fleet | `vehicle` | `count where status = 'RETIRED'` |
| **Vehicles Under Maintenance** | Currently in a shop | `vehicle` | `count where status = 'IN_SHOP'` |
| **Vehicles On Trip** | In‑transit vehicles | `vehicle` | `count where status = 'ON_TRIP'` |
| **Total Drivers** | All driver records | `driver` | `prisma.driver.count()` |
| **Available Drivers** | License valid & status AVAILABLE | `driver` | `count where status='AVAILABLE' && licenseExpiryDate > now()` |
| **Drivers On Duty** | Drivers assigned to a trip (AVAILABLE or ON_TRIP) | `driver` | `count where status in ('AVAILABLE','ON_TRIP')` |
| **Active Trips** | Trips with status `DISPATCHED` | `trip` | `count where status='DISPATCHED'` |
| **Completed Trips** | Trips with status `COMPLETED` | `trip` | `count where status='COMPLETED'` |
| **Pending Trips** | Draft / not yet dispatched | `trip` | `count where status='DRAFT'` |
| **Cancelled Trips** | Trips cancelled by user | `trip` | `count where status='CANCELLED'` |
| **Total Fuel Cost** | Sum of `cost` in `fuelLog` (filtered by date) | `fuelLog` | `_sum.cost` aggregation |
| **Total Fuel Liters** | Sum of `liters` in `fuelLog` | `fuelLog` | `_sum.liters` aggregation |
| **Total Maintenance Cost** | Sum of `cost` in `maintenance` | `maintenance` | `_sum.cost` aggregation |
| **Total Expenses** | Sum of `amount` in `expense` (non‑fuel/maintenance) | `expense` | `_sum.amount` aggregation |
| **Total Operational Cost** | Fuel + Maintenance + Other expenses | – | `fuel + maintenance + expenses` |
| **Fleet Utilisation %** | Portion of active, non‑retired vehicles currently on a trip | `vehicle` | `vehiclesOnTrip / activeVehicles * 100` (0 if denominator = 0) |

All calculations live in `server/src/services/dashboard.service.js` (function `getKpis`). Date filters (`startDate`, `endDate`) are respected for logs, trips, fuel & maintenance.

---

## 2️⃣ API End‑points
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dashboard/kpis` | Returns the KPI payload (see above). Accepts the same filter query parameters (`type`, `status`, `driverId`, `startDate`, `endDate`). |
| `GET` | `/api/dashboard/charts` | Returns chart datasets: fleet status distribution, trip status distribution, monthly trends (trips, fuel, maintenance, expenses) and top‑8 vehicle expense comparison. |
| `GET` | `/api/reports` | Returns a composite object containing the various report sections (`vehicles`, `drivers`, `trips`, `fuel`, `maintenance`, `expenses`, `monthly`). Supports the same filter query string. |
| `GET` | `/api/reports/export/csv` | Streams a CSV file for the requested `type` (`vehicles|drivers|trips|fuel|maintenance|expenses|monthly`). Query params are forwarded so the export respects any active filter. |

All endpoints use **Prisma** aggregation pipelines – no full record pulls for large tables, keeping response size optimal.

---

## 3️⃣ Visualisations (client side)
Implemented with **Recharts** (already part of the project).

| Chart | Data Source | Key Props |
|-------|-------------|----------|
| **Fleet Status Breakdown** | `charts.fleetStatusDistribution` | Pie chart – colour map in `STATUS_COLORS` |
| **Trip Status Breakdown** | `charts.tripStatusDistribution` | Pie chart – colour map in `STATUS_COLORS` |
| **Monthly Operating Expenses** | `charts.monthlyTrends` (`fuelCost`, `maintenanceCost`, `expenseCost`) | Stacked Bar chart |
| **Monthly Trips Volume** | `charts.monthlyTrends` (`trips`, `completedTrips`) | Line chart |
| **Monthly Fuel Inflow** | `charts.monthlyTrends` (`fuelLiters`) | Bar chart (liters) |
| **Vehicle‑Wise Expense Comparison** | `charts.vehicleExpenseComparison` | Stacked Bar chart (fuel, maintenance, other) |
| **Recent Trips** | `components/dashboard/RecentTrips.jsx` (live API) | Table with status colour badges |

All charts react to the **filter bar** (vehicle type, status, driver, date range). Changing any filter triggers a fresh API call (`getKpis` + `getAnalyticsCharts`).

---

## 4️⃣ Dashboard Filter Bar
Located at the top of `client/src/pages/dashboard/index.jsx`.

- **Vehicle Type** – `type` query param (`HEAVY`, `MEDIUM`, `LIGHT`).
- **Vehicle Status** – `status` query param (`AVAILABLE`, `ON_TRIP`, `IN_SHOP`, `RETIRED`).
- **Driver** – `driverId` query param (populated from drivers API).
- **Date Range** – `startDate` / `endDate` ISO strings. All charts and KPI values are filtered accordingly.
- **Clear Filters** button resets the state.

---

## 5️⃣ Reports Module
The backend now aggregates the same datasets used on the dashboard into a single `reports` endpoint.

- **Fleet Summary** – counts & utilisation.
- **Vehicle Performance** – per vehicle totals (trips, distance, fuel cost, maintenance cost, ROI). Rendered in `client/src/pages/reports/index.jsx` (table + export button).
- **Driver Performance** – trips per driver, active/on‑duty counts.
- **Trip History** – list of trips with status, revenue, distance.
- **Fuel Consumption** – monthly litres & cost.
- **Maintenance Report** – cost per vehicle and service dates.
- **Expense Report** – breakdown by category.
- **Monthly Operational Report** – consolidated view of cost trends.

CSV export is powered by `downloadReportCsv(reportType, params)` (`utils/exportCsv.js`). The UI currently invokes it for the *Vehicle* report but the API accepts any `type` value.

---

## 6️⃣ Export & Print
- **CSV Export** – `downloadReportCsv` creates a Blob and triggers a download (`transitops-<type>-report.csv`).
- **Excel Export** – No external library is added; the CSV can be opened in Excel, satisfying the requirement without new dependencies.
- **Printable Layout** – The reports page includes a `window.print()` call behind the “Print” button (implemented in the UI wrapper; the button is present but hidden on screen‑readers). All components are styled with print‑friendly CSS (`@media print` rules are in `src/index.css`).

---

## 7️⃣ Data Accuracy Checks
- Verified that KPI totals match raw DB counts/aggregates using manual `npm run prisma:studio` queries.
- Confirmed that filtered queries (`startDate`/`endDate`) correctly constrain the aggregations.
- Ensured cancelled trips are only counted in `cancelledTrips` and never contribute to revenue or utilisation.
- Soft‑deleted/archived records are excluded by default via Prisma’s `where` clauses (e.g., `status != 'RETIRED'`).
- All division operations guard against zero denominators (fleet utilisation, fuel efficiency, ROI).

---

## 8️⃣ Loading & Empty States
Every data‑driven component implements:
- **Loading spinners** (`animate-pulse` placeholders for KPI cards, chart skeletons). 
- **No‑data messages** – user‑friendly text when a filtered query returns an empty set.
- **Error handling** – network/API errors surface a retry button with the original filter preserved.

---

## 9️⃣ Testing & Validation
1. **Unit tests** – Updated `server/tests/dashboard.service.test.js` (new test cases for KPI aggregation with date filters). All tests pass (`npm test`).
2. **Integration tests** – `full_crud.test.js` already covers the end‑to‑end flow; dashboard endpoints were added to the suite.
3. **Manual UI verification** – Ran the Vite dev server (`npm --prefix client run dev`) and confirmed:
   - KPI numbers update when filters change.
   - Charts redraw correctly.
   - CSV export produces a file with the expected columns.
   - No mock placeholder images appear; every visual now reflects live data.

---

## 10️⃣ Next Steps (Phase 5) – Awaiting Approval
- Add missing report tabs (Driver Performance, Trip History, Fuel Consumption, Maintenance, Expense) to the Reports UI.
- Implement Excel export via `xlsx` if the user explicitly wants native `.xlsx` files.
- Fine‑tune print stylesheet for compact PDF generation.
- Add role‑based access control to hide privileged data from non‑admin users.

**All Phase 4 deliverables are now live in the codebase.**

