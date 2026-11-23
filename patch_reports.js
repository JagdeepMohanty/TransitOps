const fs = require('fs');

let text = fs.readFileSync('client/src/pages/reports/index.jsx', 'utf8');

text = text.replace(
  "<Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Reports' }]} />",
  "<Breadcrumb />"
);

text = text.replace(
  /const kpiCards = \[\s*\{\s*label:\s*'Total Revenue',[\s\S]*?\{ label:\s*'Maintenance Cost',[\s\S]*?\]/m,
  `const kpiCards = [
    { label: 'Total Freight Revenue', value: formatCurrency(totalRevenue), sub: 'earned freight', color: 'text-emerald-600' },
    { label: 'Total Operational Cost', value: formatCurrency(totalOpCost), sub: 'fleet expenses', color: 'text-slate-900' },
    { label: 'Cumulative Fuel Spend', value: formatCurrency(totalFuelCost), sub: 'refueling total', color: 'text-blue-600' },
    { label: 'Maintenance & Service', value: formatCurrency(totalMaintCost), sub: 'shop work orders', color: 'text-amber-600' },
  ]`
);

text = text.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">\s*\{kpiCards\.map\(\(kpi\) => \([\s\S]*?<\/div>\s*\)\)\}\s*<\/div>/m,
  `<StatsGrid stats={kpiCards} />`
);

fs.writeFileSync('client/src/pages/reports/index.jsx', text, 'utf8');
console.log('Reports index.jsx updated successfully');

