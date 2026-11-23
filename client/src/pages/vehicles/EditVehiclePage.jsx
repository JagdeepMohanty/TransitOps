import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Truck, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';
import Button    from '@/components/common/Button';
import Input     from '@/components/common/Input';
import Select    from '@/components/common/Select';
import Card      from '@/components/common/Card';
import { vehiclesApi } from '@/api/vehicles.api';
import { VEHICLE_TYPES, VEHICLE_STATUSES } from '@/utils/constants';

export default function EditVehiclePage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [form,     setForm]     = useState(null);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    vehiclesApi.getById(id)
      .then(res => {
        const v = res.data.data;
        setForm({
          registrationNumber: v.registrationNumber,
          name:               v.name,
          model:              v.model ?? '',
          type:               v.type,
          region:             v.region ?? '',
          maxLoadCapacity:    String(parseFloat(v.maxLoadCapacity)),
          acquisitionCost:    String(parseFloat(v.acquisitionCost)),
          odometer:           String(parseFloat(v.odometer)),
          status:             v.status,
        });
      })
      .catch(() => setApiError('Vehicle not found'))
      .finally(() => setFetching(false));
  }, [id]);

  function set(field, value) {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
    if (apiError) setApiError('');
  }

  function validate() {
    const e = {};
    if (!form.registrationNumber.trim()) e.registrationNumber = 'Registration number is required';
    if (!form.name.trim())               e.name               = 'Vehicle name is required';
    if (!form.type)                      e.type               = 'Vehicle type is required';
    if (!form.maxLoadCapacity)           e.maxLoadCapacity    = 'Max load capacity is required';
    else if (Number(form.maxLoadCapacity) <= 0) e.maxLoadCapacity = 'Must be greater than 0';
    if (!form.acquisitionCost)           e.acquisitionCost    = 'Acquisition cost is required';
    else if (Number(form.acquisitionCost) <= 0) e.acquisitionCost = 'Must be greater than 0';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      await vehiclesApi.update(id, {
        registrationNumber: form.registrationNumber.trim(),
        name:               form.name.trim(),
        model:              form.model.trim() || undefined,
        type:               form.type,
        region:             form.region.trim() || undefined,
        maxLoadCapacity:    Number(form.maxLoadCapacity),
        acquisitionCost:    Number(form.acquisitionCost),
        odometer:           Number(form.odometer),
        status:             form.status,
      });
      navigate('/vehicles');
    } catch (err) {
      setApiError(err.response?.data?.message ?? 'Failed to update vehicle');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <PageShell title="Loading Vehicle…">
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <span className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm mt-3">Loading vehicle details…</p>
        </div>
      </PageShell>
    );
  }

  if (!form) {
    return (
      <PageShell title="Vehicle Not Found">
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-card max-w-md mx-auto">
          <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
          <p className="text-sm text-slate-700 font-medium">{apiError || 'Vehicle not found'}</p>
          <Link to="/vehicles" className="inline-block mt-4">
            <Button size="sm" variant="secondary">Back to Vehicles</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Edit Vehicle"
      subtitle={`Editing ${form.registrationNumber} • ${form.name}`}
      actions={
        <Link to="/vehicles">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Back to Vehicles
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

          <Card padding="none">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <Truck size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Vehicle Information</h2>
                <p className="text-xs text-slate-500">Update specifications and operational status</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Input
                id="registrationNumber"
                label="Registration Number"
                value={form.registrationNumber}
                onChange={e => set('registrationNumber', e.target.value)}
                error={errors.registrationNumber}
                required
              />
              <Input
                id="name"
                label="Vehicle Name"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                error={errors.name}
                required
              />
              <Input
                id="model"
                label="Model"
                value={form.model}
                onChange={e => set('model', e.target.value)}
              />
              <Select
                id="type"
                label="Vehicle Type"
                options={VEHICLE_TYPES}
                value={form.type}
                onChange={e => set('type', e.target.value)}
                error={errors.type}
                required
                placeholder="Select type"
              />
              <Input
                id="region"
                label="Region"
                value={form.region}
                onChange={e => set('region', e.target.value)}
              />
              <Input
                id="maxLoadCapacity"
                label="Max Load Capacity (kg)"
                type="number"
                value={form.maxLoadCapacity}
                onChange={e => set('maxLoadCapacity', e.target.value)}
                error={errors.maxLoadCapacity}
                required
                min="1"
              />
              <Input
                id="acquisitionCost"
                label="Acquisition Cost (₹)"
                type="number"
                value={form.acquisitionCost}
                onChange={e => set('acquisitionCost', e.target.value)}
                error={errors.acquisitionCost}
                required
                min="1"
              />
              <Input
                id="odometer"
                label="Odometer (km)"
                type="number"
                value={form.odometer}
                onChange={e => set('odometer', e.target.value)}
                min="0"
              />
              <Select
                id="status"
                label="Status"
                options={VEHICLE_STATUSES}
                value={form.status}
                onChange={e => set('status', e.target.value)}
                placeholder="Select status"
              />
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/vehicles">
              <Button variant="secondary" type="button">Cancel</Button>
            </Link>
            <Button type="submit" leftIcon={<Save size={16} />} loading={loading}>
              Update Vehicle
            </Button>
          </div>
        </div>
      </form>
    </PageShell>
  );
}
