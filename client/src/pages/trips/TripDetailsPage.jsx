import { useState, useEffect } from 'react';
import {
  ArrowLeft, MapPin, Truck, Users, Package, DollarSign,
  Calendar, CheckCircle2, Clock, Activity, AlertTriangle, Circle,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PageShell from '@/components/layout/PageShell';
import Button    from '@/components/common/Button';
import Card      from '@/components/common/Card';
import StatusBadge from '@/components/common/StatusBadge';
import { tripsApi } from '@/api/trips.api';

function InfoBlock({ label, value, icon: Icon, color = 'bg-brand-50 text-brand-600' }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
      {Icon && (
        <div className={`p-2 rounded-lg shrink-0 ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{value ?? '—'}</p>
      </div>
    </div>
  );
}

const STATUS_TIMELINE = [
  { key: 'DRAFT',      label: 'Draft',      icon: Clock        },
  { key: 'DISPATCHED', label: 'Dispatched', icon: Circle       },
  { key: 'COMPLETED',  label: 'Completed',  icon: CheckCircle2 },
];

function TripTimeline({ status }) {
  const ORDER = STATUS_TIMELINE.map(s => s.key);
  const currentIdx = ORDER.indexOf(status);

  return (
    <div className="flex items-center gap-0 w-full py-2">
      {STATUS_TIMELINE.map((step, i) => {
        const done   = i <= currentIdx && status !== 'CANCELLED';
        const active = i === currentIdx && status !== 'CANCELLED';
        const Icon   = step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                active ? 'bg-brand-600 border-brand-600 text-white shadow-md' :
                done   ? 'bg-emerald-50 border-emerald-500 text-emerald-600' :
                         'bg-slate-100 border-slate-200 text-slate-400'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${
                active ? 'text-brand-600 font-semibold' : done ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
            {i < STATUS_TIMELINE.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-6 rounded-full transition-all duration-300 ${
                i < currentIdx && status !== 'CANCELLED' ? 'bg-emerald-500' : 'bg-slate-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatDate(val) {
  if (!val) return null;
  return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(val) {
  if (val == null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(val));
}

export default function TripDetailsPage() {
  const { id } = useParams();
  const [trip,    setTrip]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    tripsApi.getById(id)
      .then(res => {
        if (!cancelled) setTrip(res.data?.data ?? null);
      })
      .catch(err => {
        if (!cancelled) {
          if (err?.response?.status === 404) {
            setError('Trip not found.');
          } else {
            setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load trip.');
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  const BackBtn = () => (
    <Link to="/trips">
      <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={14} />}>
        Back to Trips
      </Button>
    </Link>
  );

  if (loading) {
    return (
      <PageShell title="Loading Trip…" actions={<BackBtn />}>
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <span className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm mt-3">Loading trip details…</p>
        </div>
      </PageShell>
    );
  }

  if (error || !trip) {
    return (
      <PageShell title="Trip Details" actions={<BackBtn />}>
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-card max-w-md mx-auto">
          <p className="text-sm text-slate-600">{error ?? 'Trip not found.'}</p>
          <div className="mt-4"><BackBtn /></div>
        </div>
      </PageShell>
    );
  }

  const revenue = trip.revenue != null ? Number(trip.revenue) : null;

  return (
    <PageShell
      title={`Trip #${trip.id}`}
      subtitle={`${trip.source} → ${trip.destination}`}
      actions={
        <div className="flex items-center gap-2">
          <StatusBadge status={trip.status} />
          <BackBtn />
        </div>
      }
    >
      <div className="space-y-5 max-w-5xl">

        {/* Progress timeline */}
        {trip.status !== 'CANCELLED' && (
          <Card padding="lg">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Trip Lifecycle Progress</h2>
            <TripTimeline status={trip.status} />
          </Card>
        )}

        {/* Cancelled banner */}
        {trip.status === 'CANCELLED' && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold">This trip has been cancelled</p>
              <p className="text-xs text-red-600 mt-0.5">Assigned resources have been released back to available fleet inventory.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Route Card */}
          <Card padding="none">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                <MapPin size={16} />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Route & Cargo</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoBlock label="Source / Origin"  value={trip.source}                                       icon={MapPin}   color="bg-brand-50 text-brand-600" />
              <InfoBlock label="Destination"      value={trip.destination}                                  icon={MapPin}   color="bg-emerald-50 text-emerald-600" />
              <InfoBlock label="Planned Distance" value={trip.plannedDistance ? `${trip.plannedDistance} km` : null} icon={Activity} color="bg-blue-50 text-blue-600" />
              <InfoBlock label="Cargo Weight"     value={trip.cargoWeight ? `${trip.cargoWeight} kg` : null} icon={Package}  color="bg-purple-50 text-purple-600" />
            </div>
          </Card>

          {/* Assignment Card */}
          <Card padding="none">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users size={16} />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Resource Assignment</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoBlock label="Assigned Driver"  value={trip.driver?.name}                              icon={Users}    color="bg-emerald-50 text-emerald-600" />
              <InfoBlock label="Assigned Vehicle" value={trip.vehicle?.registrationNumber}               icon={Truck}    color="bg-brand-50 text-brand-600" />
              <InfoBlock label="Dispatched At"    value={formatDate(trip.dispatchedAt) ?? 'Pending dispatch'} icon={Calendar} color="bg-amber-50 text-amber-600" />
              <InfoBlock label="Completed At"     value={formatDate(trip.completedAt) ?? (trip.status === 'DISPATCHED' ? 'In Transit' : 'Pending')} icon={Calendar} color="bg-emerald-50 text-emerald-600" />
            </div>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card padding="none">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign size={16} />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Financial & Trip Performance Metrics</h2>
          </div>
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Revenue',         value: formatCurrency(revenue),                                                      color: 'text-slate-900' },
              { label: 'Actual Distance', value: trip.actualDistance ? `${trip.actualDistance} km` : '—',                     color: 'text-blue-600' },
              { label: 'Fuel Consumed',   value: trip.fuelConsumed ? `${trip.fuelConsumed} L` : '—',                           color: 'text-amber-600' },
              { label: 'Final Odometer',  value: trip.finalOdometer ? `${Number(trip.finalOdometer).toLocaleString()} km` : '—', color: 'text-emerald-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </PageShell>
  );
}
