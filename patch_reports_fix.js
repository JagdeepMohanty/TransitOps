const fs = require('fs');

let text = fs.readFileSync('client/src/pages/reports/index.jsx', 'utf8');

text = text.replace(/actions=\{\s*<Button variant="secondary" size="sm" leftIcon=\{<Download/m, 'action={<Button variant="secondary" size="sm" leftIcon={<Download');

text = text.replace(
  /<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">\s*\{kpiCards\.map[\s\S]*?<\/Card>\s*\)\)\}\s*<\/div>/m,
  '<StatsGrid stats={kpiCards} />'
);

fs.writeFileSync('client/src/pages/reports/index.jsx', text, 'utf8');
console.log('Reports fixed successfully');

