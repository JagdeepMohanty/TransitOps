const fs = require('fs');

let text = fs.readFileSync('client/src/pages/maintenance/index.jsx', 'utf8');

text = text.replace(
  "<Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Maintenance' }]} />",
  "<Breadcrumb />"
);

text = text.replace(
  /return \[\s*\{\s*label:\s*'Total Records',[\s\S]*?\{ label:\s*'Page Cost',[\s\S]*?\]/m,
  `return [
      { label: 'Total Records', value: total, sub: 'service entries' },
      { label: 'In Shop (Active)', value: active, color: active > 0 ? 'text-amber-600' : 'text-slate-600', sub: 'in bay currently' },
      { label: 'Completed',     value: completed, color: 'text-emerald-600', sub: 'certified roadworthy' },
      { label: 'Cumulative Cost', value: formatCurrency(totalCost), color: 'text-slate-900', sub: 'maintenance spend' },
    ]`
);

text = text.replace(
  '<Card padding="none">',
  '<div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">'
);
text = text.replace(
  '      </Card>',
  '      </div>'
);

fs.writeFileSync('client/src/pages/maintenance/index.jsx', text, 'utf8');
console.log('Maintenance index.jsx updated successfully');

