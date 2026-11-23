const fs = require('fs');

let text = fs.readFileSync('client/src/pages/Expenses/index.jsx', 'utf8');

text = text.replace(
  "<Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Expenses' }]} />",
  "<Breadcrumb />"
);

text = text.replace(
  '<Card padding="none">',
  '<div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">'
);
text = text.replace(
  '      </Card>',
  '      </div>'
);

text = text.replace(
  /return \[\s*\{\s*label:\s*'Page Total',[\s\S]*?\{ label:\s*'Total Records',[\s\S]*?\]/m,
  `return [
      { label: 'Total In View', value: total, sub: 'expense vouchers' },
      { label: 'Page Subtotal', value: formatCurrency(pageTotal), color: 'text-slate-900', sub: 'current view' },
      { label: 'Fuel Spend',    value: formatCurrency(fuelTotal), color: 'text-blue-600', sub: 'energy costs' },
      { label: 'Workshop / Maint', value: formatCurrency(maintTotal), color: 'text-amber-600', sub: 'repairs & servicing' },
    ]`
);

fs.writeFileSync('client/src/pages/Expenses/index.jsx', text, 'utf8');
console.log('Expenses index.jsx updated successfully');

