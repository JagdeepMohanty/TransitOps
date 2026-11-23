const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to login...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'login.png' });
  console.log('Saved login.png');

  // Fill in demo credentials
  await page.type('#email', 'fleet@transitops.com');
  await page.type('#password', 'Fleet@123');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {})
  ]);
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'dashboard.png' });
  console.log('Saved dashboard.png');

  // Visit vehicles
  await page.goto('http://localhost:5173/vehicles', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'vehicles.png' });
  console.log('Saved vehicles.png');

  // Visit trips
  await page.goto('http://localhost:5173/trips', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'trips.png' });
  console.log('Saved trips.png');

  // Visit drivers
  await page.goto('http://localhost:5173/drivers', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'drivers.png' });
  console.log('Saved drivers.png');

  // Visit maintenance
  await page.goto('http://localhost:5173/maintenance', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'maintenance.png' });
  console.log('Saved maintenance.png');

  // Visit fuel
  await page.goto('http://localhost:5173/fuel', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'fuel.png' });
  console.log('Saved fuel.png');

  // Visit expenses
  await page.goto('http://localhost:5173/expenses', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'expenses.png' });
  console.log('Saved expenses.png');

  // Visit reports
  await page.goto('http://localhost:5173/reports', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'reports.png' });
  console.log('Saved reports.png');

  await browser.close();
  console.log('Audit screenshots complete!');
})().catch(err => {
  console.error('Error in capture:', err);
  process.exit(1);
});

