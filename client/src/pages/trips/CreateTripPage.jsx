import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Route, MapPin, Package, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';
import Button    from '@/components/common/Button';
import Input     from '@/components/common/Input';
import Select    from '@/components/common/Select';
import Card      from '@/components/common/Card';
import { vehiclesApi } from '@/api/vehicles.api';
import { driversApi }  from '@/api/drivers.api';
import { tripsApi }    from '@/api/trips.api';

const CARGO_OPTIONS = [
  { value: 'Electronics',            label: 'Electronics' },
  { value: 'Textiles',               label: 'Textiles' },
  { value: 'Auto Parts',             label: 'Auto Parts' },
  { value: 'FMCG',                   label: 'FMCG' },
  { value: 'Chemicals',              label: 'Chemicals' },
  { value: 'Steel',                  label: 'Steel' },
  { value: 'Machinery',              label: 'Machinery' },
  { value: 'Pharmaceuticals',        label: 'Pharmaceuticals' },
  { value: 'Food & Beverages',        label: 'Food & Beverages' },
  { value: 'Construction Materials', label: 'Construction Materials' },
  { value: 'Other',                  label: 'Other' },
];

const INITIAL = {
  source: '', destination: '', driverId: '', vehicleId: '',
  cargo: '', weight: '', distance: '', revenue: '',
};

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [form,      setForm]      = useState(INITIAL);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [apiError,  setApiError]  = useState('');
  const [vehicles,  setVehicles]  = useState([]);
  const [drivers,   setDrivers]   = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);

  // Fetch available vehicles and drivers on mount
  useEffect(() => {
    let cancelled = false;
    setLoadingResources(true);

    Promise.all([
      vehiclesApi.getAvailable(),
      driversApi.getAvailable(),
    ])
      .then(([vRes, dRes]) => {
        if (cancelled) return;
        setVehicles(vRes.data?.data ?? []);
        setDrivers(dRes.data?.data ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setApiError('Failed to load available vehicles and drivers. Please refresh and try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingResources(false);
      });

    return () => { cancelled = true; };
  }, []);

  function set(field, value) {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
    if (apiError) setApiError('');
  }

  function validate() {
    const e = {};
    if (!form.source.trim())      e.source      = 'Source is required';
    if (!form.destination.trim()) e.destination = 'Destination is required';
    if (!form.driverId)           e.driverId    = 'Driver is required';
    if (!form.vehicleId)          e.vehicleId   = 'Vehicle is required';
    if (!form.weight)             e.weight      = 'Cargo weight is required';
    else if (Number(form.weight) <= 0) e.weight = 'Weight must be greater than 0';
    if (!form.distance)           e.distance    = 'Distance is required';
    else if (Number(form.distance) <= 0) e.distance = 'Distance must be greater than 0';
    if (form.revenue && Number(form.revenue) < 0) e.revenue = 'Revenue cannot be negative';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    try {
      const payload = {
        source:          form.source.trim(),
        destination:     form.destination.trim(),
        vehicleId:       Number(form.vehicleId),
        driverId:        Number(form.driverId),
        cargoWeight:     Number(form.weight),
        plannedDistance: Number(form.distance),
        ...(form.revenue ? { revenue: Number(form.revenue) } : {}),
      };

      await tripsApi.create(payload);
      navigate('/trips');
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        'Failed to create trip. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }

  const driverOptions = drivers.map(d => ({
    value: String(d.id),
    label: `${d.name} (${d.licenseNumber})`,
  }));

  const vehicleOptions = vehicles.map(v => ({
    value: String(v.id),
    label: `${v.registrationNumber} — ${v.name ?? v.type} (Cap: ${Number(v.maxLoadCapacity).toLocaleString()} kg)`,
  }));

  return (
    <PageShell
      title="Create Trip"
      subtitle="Schedule a new freight or transit trip for your fleet"
      actions={
        <Link to="/trips">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Back to Trips
          </Button>
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5 max-w-4xl">

          {apiError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {apiError}
            </div>
          )}

          {/* Route Section */}
          <Card padding="none">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <MapPin size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Route & Distance</h2>
                <p className="text-xs text-slate-500">Origin, destination, and planned transit distance</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                id="source"
                label="Origin / Source"
                placeholder="e.g. Mumbai, Maharashtra"
                value={form.source}
                onChange={e => set('source', e.target.value)}
                error={errors.source}
                required
              />
              <Input
                id="destination"
                label="Destination"
                placeholder="e.g. Pune, Maharashtra"
                value={form.destination}
                onChange={e => set('destination', e.target.value)}
                error={errors.destination}
                required
              />
              <Input
                id="distance"
                label="Planned Distance (km)"
                type="number"
                min="1"
                step="0.1"
                placeholder="e.g. 148"
                value={form.distance}
                onChange={e => set('distance', e.target.value)}
                error={errors.distance}
                required
              />
              <Input
                id="revenue"
                label="Agreed Revenue (₹)"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 25000"
                value={form.revenue}
                onChange={e => set('revenue', e.target.value)}
                error={errors.revenue}
              />
            </div>
          </Card>

          {/* Assignment Section */}
          <Card padding="none">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Route size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Vehicle & Driver Assignment</h2>
                <p className="text-xs text-slate-500">Only currently AVAILABLE fleet resources are displayed</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {loadingResources ? (
                <div className="col-span-2 py-4 text-center text-sm text-slate-400 animate-pulse">
                  Loading available drivers and vehicles…
                </div>
              ) : (
                <>
                  <Select
                    id="driverId"
                    label="Assigned Driver"
                    options={driverOptions}
                    value={form.driverId}
                    onChange={e => set('driverId', e.target.value)}
                    error={errors.driverId}
                    placeholder={drivers.length === 0 ? 'No available drivers' : 'Select available driver'}
                    required
                  />
                  <Select
                    id="vehicleId"
                    label="Assigned Vehicle"
                    options={vehicleOptions}
                    value={form.vehicleId}
                    onChange={e => set('vehicleId', e.target.value)}
                    error={errors.vehicleId}
                    placeholder={vehicles.length === 0 ? 'No available vehicles' : 'Select available vehicle'}
                    required
                  />
                </>
              )}
            </div>
          </Card>

          {/* Cargo Section */}
          <Card padding="none">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Package size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Cargo Details</h2>
                <p className="text-xs text-slate-500">Payload weight and category</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Select
                id="cargo"
                label="Cargo Category"
                options={CARGO_OPTIONS}
                value={form.cargo}
                onChange={e => set('cargo', e.target.value)}
                placeholder="Select category"
              />
              <Input
                id="weight"
                label="Cargo Weight (kg)"
                type="number"
                min="1"
                step="0.1"
                placeholder="e.g. 5000"
                value={form.weight}
                onChange={e => set('weight', e.target.value)}
                error={errors.weight}
                required
              />
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/trips">
              <Button variant="secondary" type="button">Cancel</Button>
            </Link>
            <Button
              type="submit"
              leftIcon={<Save size={16} />}
              loading={loading || loadingResources}
            >
              Create Trip
            </Button>
          </div>
        </div>
      </form>
    </PageShell>
  );
}
