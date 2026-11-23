# TransitOps Hackathon & Evaluation Demo Flow

## 1. Authentication
- Access the platform at `http://localhost:5173/login`.
- Choose any preconfigured demo account via 1-click autofill:
  - **Fleet Manager:** `fleet@transitops.com` / `Fleet@123` (Full Access)
  - **Dispatcher:** `dispatcher@transitops.com` / `Dispatcher@123`
  - **Safety Officer:** `safety@transitops.com` / `Safety@123`
  - **Financial Analyst:** `finance@transitops.com` / `Finance@123`

## 2. Operations Dashboard
- Review the Executive Operations Header with live operations status dot.
- Inspect real actionable alerts (Draft trips awaiting dispatch, vehicles in workshop).
- Examine key fleet metrics: Fleet Utilization %, Active Trips, Ready Fleet, and Available Drivers.
- Review Monthly Operating Expenses chart and Fleet Allocation donut chart.
- Inspect Recent Dispatches table showing origin-to-destination corridors.

## 3. Fleet Vehicle Management (`/vehicles`)
- View all commercial trucks, freight categories, odometers, and payload capacities.
- Filter by status tabs (`Available`, `On Trip`, `In Shop`, `Retired`).
- Search by registration number or model.
- Click "+ Add Vehicle" to register a new commercial truck.

## 4. Freight Trips & Dispatch Console (`/trips`)
- Review transit corridors with visual route markers (`Origin → Destination`).
- Click "Dispatch Now" on a DRAFT trip to transition to `DISPATCHED` (syncs vehicle & driver to `ON_TRIP`).
- Click "Complete" on a DISPATCHED trip, input final odometer, and observe release to `AVAILABLE`.

## 5. Maintenance & Workshop Bay (`/maintenance`)
- Review open work orders and repair history.
- Log new maintenance with service category, description, and estimated cost.
- Click "Close" to complete work order and release vehicle back to service.

## 6. Financial & Fuel Telemetry (`/fuel`, `/expenses`, `/reports`)
- Audit fuel refills and volume per vehicle.
- Track expense vouchers (Toll, Parking, Maintenance, Fuel).
- Review Reports & Analytics with cost breakdown by vehicle and CSV export capability.

