import { Routes, Route } from 'react-router-dom'

import ProtectedRoute   from '@/routes/ProtectedRoute'
import AppLayout        from '@/components/layout/AppLayout'

import LoginPage        from '@/pages/auth/LoginPage'
import RegisterPage     from '@/pages/auth/RegisterPage'
import UnauthorizedPage from '@/pages/auth/UnauthorizedPage'
import NotFoundPage     from '@/pages/NotFoundPage'

import DashboardPage    from '@/pages/dashboard'

// Vehicles — VehiclesPage is the live API-connected registry
import VehiclesPage     from '@/pages/vehicles/VehiclesPage'
import AddVehiclePage   from '@/pages/vehicles/AddVehiclePage'
import EditVehiclePage  from '@/pages/vehicles/EditVehiclePage'

// Drivers — DriversPage is the live API-connected registry
import DriversPage      from '@/pages/drivers/DriversPage'
import AddDriverPage    from '@/pages/drivers/AddDriverPage'
import EditDriverPage   from '@/pages/drivers/EditDriverPage'

// Trips
import TripsPage        from '@/pages/trips'
import CreateTripPage   from '@/pages/trips/CreateTripPage'
import EditTripPage     from '@/pages/trips/EditTripPage'
import TripDetailsPage  from '@/pages/trips/TripDetailsPage'

import MaintenancePage  from '@/pages/maintenance'
import FuelPage         from '@/pages/Fuel'
import ExpensesPage     from '@/pages/Expenses'
import ReportsPage      from '@/pages/reports'
import ProfilePage      from '@/pages/profile/ProfilePage'
import SettingsPage     from '@/pages/settings/SettingsPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"        element={<LoginPage />} />
      <Route path="/register"     element={<RegisterPage />} />
      <Route path="/signup"       element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index                      element={<DashboardPage />}   />
          <Route path="dashboard"           element={<DashboardPage />}   />

          {/* Vehicles */}
          <Route path="vehicles"            element={<VehiclesPage />}    />
          <Route path="vehicles/add"        element={<AddVehiclePage />}  />
          <Route path="vehicles/new"        element={<AddVehiclePage />}  />
          <Route path="vehicles/:id/edit"   element={<EditVehiclePage />} />

          {/* Drivers */}
          <Route path="drivers"             element={<DriversPage />}     />
          <Route path="drivers/add"         element={<AddDriverPage />}   />
          <Route path="drivers/new"         element={<AddDriverPage />}   />
          <Route path="drivers/:id/edit"    element={<EditDriverPage />}  />

          {/* Trips */}
          <Route path="trips"               element={<TripsPage />}       />
          <Route path="trips/create"        element={<CreateTripPage />}  />
          <Route path="trips/new"           element={<CreateTripPage />}  />
          <Route path="trips/:id"           element={<TripDetailsPage />} />
          <Route path="trips/:id/edit"      element={<EditTripPage />}    />

          {/* Operations & Finance */}
          <Route path="maintenance"         element={<MaintenancePage />} />
          <Route path="fuel"                element={<FuelPage />}        />
          <Route path="expenses"            element={<ExpensesPage />}    />
          <Route path="reports"             element={<ReportsPage />}     />
          <Route path="profile"             element={<ProfilePage />}     />
          <Route path="settings"            element={<SettingsPage />}    />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
