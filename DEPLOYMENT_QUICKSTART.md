# Quick Deployment Guide - Crossword Stack

A condensed reference for deploying Crossword Stack to production.

## Deployment Order

```
1. Clever Cloud (MySQL)  →  Get DB credentials
2. Render (Backend)      →  Get Backend URL
3. Vercel (Frontend)     →  Set VITE_API_URL
4. Render (Update CORS)  →  Set CORS_ORIGIN
```

---

## Step 1: Clever Cloud - MySQL

1. Go to [console.clever-cloud.com](https://console.clever-cloud.com)
2. Create → Database → MySQL
3. Copy credentials:
   - `DB_HOST`
   - `DB_PORT` (3306)
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`

---

## Step 2: Render - Backend

### Create Service
1. Go to [dashboard.render.com](https://dashboard.render.com)
2. New → Web Service
3. Connect repository
4. Configure:
   - Root Directory: `backend`
   - Runtime: Node
   - Start Command: `node server.js`

### Environment Variables
```bash
NODE_ENV=production
PORT=3001

# From Clever Cloud
DB_HOST=xxxxx.mysql.clever-cloud.com
DB_PORT=3306
DB_USER=xxxxx
DB_PASSWORD=xxxxx
DB_NAME=xxxxx
DB_SSL=true

# Generate with: npm run generate-jwt
JWT_SECRET=<run_generate-jwt_script>
JWT_EXPIRES_IN=7d

# Skip for now, set after Step 3
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Deploy & Get URL
- Wait for deployment to complete
- Copy backend URL: `https://xxxxx.onrender.com`
- Test: `curl https://xxxxx.onrender.com/health`

---

## Step 3: Vercel - Frontend

### Create Project
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Add New → Project
3. Import repository
4. Configure:
   - Root Directory: `frontend`
   - Framework: Vite

### Environment Variable
```bash
# IMPORTANT: Include /api at the end!
VITE_API_URL=https://your-backend.onrender.com/api
```

### Deploy & Get URL
- Wait for deployment to complete
- Copy frontend URL: `https://xxxxx.vercel.app`

---

## Step 4: Update CORS

Return to Render dashboard:
1. Go to your backend service
2. Update `CORS_ORIGIN` with Vercel URL:
   ```
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

---

## Verification

```bash
# Test backend health
curl https://your-backend.onrender.com/health

# Expected response:
# {"status":"ok","database":"connected"}
```

Open your Vercel URL and test:
- User registration
- Login
- Create puzzle
- Submit score

---

## Generate JWT Secret

```bash
# From project root
node scripts/generate-jwt-secret.js

# Or from backend directory
npm run generate-jwt
```

---

## URLs Summary

| Platform | Example URL |
|----------|-------------|
| Clever Cloud MySQL | `xxxxx.mysql.clever-cloud.com` |
| Render Backend | `https://crossword-backend.onrender.com` |
| Vercel Frontend | `https://crossword-frontend.vercel.app` |

---

## Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
