const fs = require('fs');

let text = fs.readFileSync('client/src/pages/Fuel/index.jsx', 'utf8');

text = text.replace(
  "<Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Fuel Logs' }]} />",
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
  /badge=\{<span className="badge bg-blue-100 text-blue-700 ring-1 ring-blue-200">\{total\} entries<\/span>\}/,
  ''
);

fs.writeFileSync('client/src/pages/Fuel/index.jsx', text, 'utf8');
console.log('Fuel index.jsx updated successfully');

