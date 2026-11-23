# TransitOps Deployment & Infrastructure Guide

## Prerequisites
- Node.js >= 18.0.0 (v20+ or v22 LTS recommended)
- MySQL Server 8.0+ or compatible MariaDB
- npm 9+ or pnpm 8+

## Environment Configuration

### Backend (`server/.env`)
```env
PORT=5001
NODE_ENV=production
DATABASE_URL="mysql://root:password@localhost:3306/transitops"
JWT_SECRET="supersecret_jwt_key_at_least_32_characters_long"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (`client/.env`)
```env
VITE_API_URL="http://localhost:5001/api"
```

## Production Build & Run

### 1. Database Setup & Migrations
```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed   # (Optional: seeds initial fleet, drivers, and trips)
```

### 2. Build Client Application
```bash
cd ../client
npm install
npm run build
```

### 3. Start Backend API
```bash
cd ../server
npm start
```
The server will bind to port 5001 and serve the API endpoints under `/api`.
Health check is accessible at `http://localhost:5001/api/health`.

