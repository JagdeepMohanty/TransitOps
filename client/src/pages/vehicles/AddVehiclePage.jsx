import { useState } from 'react';
import { ArrowLeft, Truck, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';
import Button    from '@/components/common/Button';
import Input     from '@/components/common/Input';
import Select    from '@/components/common/Select';
import Card      from '@/components/common/Card';
import { vehiclesApi } from '@/api/vehicles.api';
import { VEHICLE_TYPES } from '@/utils/constants';

const INITIAL = {
  registrationNumber: '',
  name:               '',
  model:              '',
  type:               '',
  region:             '',
  maxLoadCapacity:    '',
  acquisitionCost:    '',
  odometer:           '0',
};

export default function AddVehiclePage() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState(INITIAL);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

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
      await vehiclesApi.create({
        registrationNumber: form.registrationNumber.trim(),
        name:               form.name.trim(),
        model:              form.model.trim() || undefined,
        type:               form.type,
        region:             form.region.trim() || undefined,
        maxLoadCapacity:    Number(form.maxLoadCapacity),
        acquisitionCost:    Number(form.acquisitionCost),
        odometer:           Number(form.odometer) || 0,
      });
      navigate('/vehicles');
    } catch (err) {
      setApiError(err.response?.data?.message ?? 'Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Add Vehicle"
      subtitle="Register a new vehicle to your fleet inventory"
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
                <h2 className="text-sm font-bold text-slate-900">Vehicle Specifications</h2>
                <p className="text-xs text-slate-500">Provide legal identification and capacity parameters</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Input
                id="registrationNumber"
                label="Registration Number"
                placeholder="e.g. MH12AB1234"
                value={form.registrationNumber}
                onChange={e => set('registrationNumber', e.target.value)}
                error={errors.registrationNumber}
                required
              />
              <Input
                id="name"
                label="Vehicle Name / Make"
                placeholder="e.g. Tata Prima"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                error={errors.name}
                required
              />
              <Input
                id="model"
                label="Model / Variant"
                placeholder="e.g. Prima 4028.S"
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
                placeholder="Select vehicle type"
              />
              <Input
                id="region"
                label="Operational Region"
                placeholder="e.g. Western Zone"
                value={form.region}
                onChange={e => set('region', e.target.value)}
              />
              <Input
                id="maxLoadCapacity"
                label="Max Load Capacity (kg)"
                type="number"
                placeholder="e.g. 28000"
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
                placeholder="e.g. 3500000"
                value={form.acquisitionCost}
                onChange={e => set('acquisitionCost', e.target.value)}
                error={errors.acquisitionCost}
                required
                min="1"
              />
              <Input
                id="odometer"
                label="Starting Odometer (km)"
                type="number"
                placeholder="0"
                value={form.odometer}
                onChange={e => set('odometer', e.target.value)}
                min="0"
              />
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/vehicles">
              <Button variant="secondary" type="button">Cancel</Button>
            </Link>
            <Button type="submit" leftIcon={<Save size={16} />} loading={loading}>
              Save Vehicle
            </Button>
          </div>
        </div>
      </form>
    </PageShell>
  );
}
