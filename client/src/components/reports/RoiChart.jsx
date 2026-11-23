import React from 'react';
import Card, { CardHeader } from '@/components/common/Card';
import { formatCurrency } from '@/utils';
import { TrendingUp } from 'lucide-react';

export default function RoiChart({ vehicles = [] }) {
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  const topPerformers = safeVehicles
    .map(v => {
      const rev = Number(v.totalRevenue || 0);
      const cost = Number(v.operationalCost || 0);
      const net = rev - cost;
      const roi = cost > 0 ? ((net / cost) * 100).toFixed(1) : 0;
      return { ...v, net, roi: Number(roi) };
    })
    .sort((a, b) => b.net - a.net)
    .slice(0, 5);

  return (
    <Card header={<CardHeader title="Vehicle Net Freight Return (ROI)" subtitle="Revenue generated vs operational expenses" />}>
      <div className="space-y-3 py-2">
        {topPerformers.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No financial ROI data available yet.</p>
        ) : (
          topPerformers.map(v => (
            <div key={v.id || v.registrationNumber} className="flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-bold text-slate-800">{v.registrationNumber}</span>
                <span className="text-slate-400 text-[11px] block">{v.name || v.vehicleName}</span>
              </div>
              <div className="text-right">
                <span className={`font-semibold ${v.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatCurrency(v.net)}
                </span>
                <span className="text-slate-400 block text-[10px]">
                  ROI: {v.roi > 0 ? `+${v.roi}%` : `${v.roi}%`}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

