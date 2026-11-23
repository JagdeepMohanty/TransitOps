# TransitOps Business Rules & Operational Logic

## 1. Fleet & Vehicle Lifecycle
- A vehicle can exist in one of four states: `AVAILABLE`, `ON_TRIP`, `IN_SHOP`, or `RETIRED`.
- Only `AVAILABLE` vehicles can be assigned to a new trip or dispatched.
- Creating a maintenance work order atomically sets the vehicle status to `IN_SHOP`.
- Completing a maintenance work order returns the vehicle to `AVAILABLE`.
- A vehicle cannot be dispatched on a trip if its payload capacity is less than the cargo weight.
- `RETIRED` vehicles cannot be scheduled, dispatched, or admitted for routine maintenance.

## 2. Driver & Compliance Rules
- Driver statuses: `AVAILABLE`, `ON_TRIP`, `OFF_DUTY`, or `SUSPENDED`.
- A driver with an expired commercial license cannot be dispatched on any trip.
- A driver on duty must have an active license category matching the vehicle freight category (e.g., HTV/HMV).
- Drivers on active trips cannot be assigned to another trip concurrently.

## 3. Trip & Dispatch Workflows
- Trip lifecycle: `DRAFT` -> `DISPATCHED` -> `COMPLETED` (or `CANCELLED`).
- When a trip transitions to `DISPATCHED`, the vehicle and driver status both change to `ON_TRIP`.
- Starting odometer is captured from the vehicle's last recorded odometer reading.
- Completing a trip records the `endOdometer`, verifies that `endOdometer >= startOdometer`, calculates distance, updates the vehicle odometer, and releases both vehicle and driver back to `AVAILABLE`.
- Cancelling a trip immediately releases the vehicle and driver back to `AVAILABLE`.

## 4. Expenses & Fuel Telemetry
- Expenses are categorized as `FUEL`, `MAINTENANCE`, `TOLL`, `PARKING`, `REPAIR`, or `OTHER`.
- Fuel logs record liters, cost, log date, and odometer readings.
- All vehicle operational costs sum fuel spend, maintenance work order costs, and incidental expenses.

