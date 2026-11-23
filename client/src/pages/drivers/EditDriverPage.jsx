import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Users, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';
import Button    from '@/components/common/Button';
import Input     from '@/components/common/Input';
import Select    from '@/components/common/Select';
import Card      from '@/components/common/Card';
import { driversApi } from '@/api/drivers.api';
import { LICENSE_CATEGORIES, DRIVER_STATUSES } from '@/utils/constants';

export default function EditDriverPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [form,     setForm]     = useState(null);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    driversApi.getById(id)
      .then(res => {
        const d = res.data.data;
        setForm({
          name:              d.name,
          licenseNumber:     d.licenseNumber,
          licenseCategory:   d.licenseCategory,
          licenseExpiryDate: d.licenseExpiryDate ? d.licenseExpiryDate.slice(0, 10) : '',
          contactNumber:     d.contactNumber,
          safetyScore:       String(d.safetyScore),
          status:            d.status,
        });
      })
      .catch(() => setApiError('Driver not found'))
      .finally(() => setFetching(false));
  }, [id]);

  function set(field, value) {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
    if (apiError) setApiError('');
  }

  function validate() {
    const e = {};
    if (!form.name.trim())          e.name          = 'Full name is required';
    if (!form.licenseNumber.trim()) e.licenseNumber = 'License number is required';
    if (!form.contactNumber.trim()) e.contactNumber = 'Contact number is required';
    if (form.licenseExpiryDate && new Date(form.licenseExpiryDate) <= new Date()) {
      e.licenseExpiryDate = 'License expiry must be a future date';
    }
    const score = Number(form.safetyScore);
    if (isNaN(score) || score < 0 || score > 100) e.safetyScore = 'Safety score must be between 0 and 100';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError('');
    try {
      await driversApi.update(id, {
        name:              form.name.trim(),
        licenseNumber:     form.licenseNumber.trim(),
        licenseCategory:   form.licenseCategory || undefined,
        licenseExpiryDate: form.licenseExpiryDate || undefined,
        contactNumber:     form.contactNumber.trim(),
        safetyScore:       Number(form.safetyScore),
        status:            form.status,
      });
      navigate('/drivers');
    } catch (err) {
      setApiError(err.response?.data?.message ?? 'Failed to update driver');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <PageShell title="Loading Driver…">
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <span className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm mt-3">Loading driver profile…</p>
        </div>
      </PageShell>
    );
  }

  if (!form) {
    return (
      <PageShell title="Driver Not Found">
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-card max-w-md mx-auto">
          <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
          <p className="text-sm text-slate-700 font-medium">{apiError || 'Driver not found'}</p>
          <Link to="/drivers" className="inline-block mt-4">
            <Button size="sm" variant="secondary">Back to Drivers</Button>
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Edit Driver"
      subtitle={`Editing profile of ${form.name}`}
      actions={
        <Link to="/drivers">
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
            Back to Drivers
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
                <Users size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Driver Credentials & Status</h2>
                <p className="text-xs text-slate-500">Update license information, contact number, and duty status</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <Input
                id="name"
                label="Full Name"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                error={errors.name}
                required
              />
              <Input
                id="contactNumber"
                label="Contact Number"
                value={form.contactNumber}
                onChange={e => set('contactNumber', e.target.value)}
                error={errors.contactNumber}
                required
              />
              <Input
                id="licenseNumber"
                label="License Number"
                value={form.licenseNumber}
                onChange={e => set('licenseNumber', e.target.value)}
                error={errors.licenseNumber}
                required
              />
              <Select
                id="licenseCategory"
                label="License Category"
                options={LICENSE_CATEGORIES}
                value={form.licenseCategory}
                onChange={e => set('licenseCategory', e.target.value)}
                placeholder="Select category"
              />
              <Input
                id="licenseExpiryDate"
                label="License Expiry Date"
                type="date"
                value={form.licenseExpiryDate}
                onChange={e => set('licenseExpiryDate', e.target.value)}
                error={errors.licenseExpiryDate}
              />
              <Input
                id="safetyScore"
                label="Safety Score (0–100)"
                type="number"
                value={form.safetyScore}
                onChange={e => set('safetyScore', e.target.value)}
                error={errors.safetyScore}
                min="0"
                max="100"
              />
              <Select
                id="status"
                label="Duty Status"
                options={DRIVER_STATUSES}
                value={form.status}
                onChange={e => set('status', e.target.value)}
                placeholder="Select status"
              />
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/drivers">
              <Button variant="secondary" type="button">Cancel</Button>
            </Link>
            <Button type="submit" leftIcon={<Save size={16} />} loading={loading}>
              Update Driver
            </Button>
          </div>
        </div>
      </form>
    </PageShell>
  );
}
