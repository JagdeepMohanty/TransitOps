import { Link } from 'react-router-dom';
import { ShieldOff, Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/common/Button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="flex flex-col items-center gap-6 max-w-md bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-card">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
          <ShieldOff className="w-8 h-8 text-red-600" />
        </div>

        <div>
          <p className="text-6xl font-black text-red-600 leading-none">403</p>
          <h1 className="mt-3 text-xl font-bold text-slate-900">Access Restricted</h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Your assigned role does not have authorization to view this resource. Contact your fleet administrator for elevated permissions.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center pt-2">
          <Link to="/">
            <Button size="sm" leftIcon={<Home size={14} />}>
              Go to Dashboard
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft size={14} />}
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
