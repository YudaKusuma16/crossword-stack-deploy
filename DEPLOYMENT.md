# Crossword Stack - Deployment Guide

This guide walks you through deploying the Crossword Stack application to production using three separate platforms:

- **Clever Cloud** - MySQL Database
- **Render** - Backend API (Express.js)
- **Vercel** - Frontend (React + Vite)

## Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │     │    Render       │     │  Clever Cloud   │
│  (Frontend)     │────▶│   (Backend)     │────▶│    (MySQL)      │
│  React + Vite   │     │   Express.js    │     │   Database      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Phase 1: Clever Cloud - MySQL Database

### 1.1 Create MySQL Instance

1. Go to [Clever Cloud Console](https://console.clever-cloud.com)
2. Click **"Create"** → **"Add an application"**
3. Select **"Database"** → **"MySQL"**
4. Choose a plan:
   - **Free plan**: Limited resources, good for development
   - **Paid plan**: Better performance for production
5. Click **"Create"**

### 1.2 Get Database Credentials

After your MySQL instance is created:

1. Go to your MySQL instance in Clever Console
2. Click on **"Configuration"** tab
3. Find your connection details:
   - **Host**: `xxxxx.mysql.clever-cloud.com`
   - **Port**: `3306`
   - **User**: `xxxxx`
   - **Password**: `xxxxx`
   - **Database Name**: `xxxxx`

Alternatively, you can find the connection string in the **"Environment Variables"** section.

### 1.3 Test Database Connection (Optional)

You can test the connection using MySQL client:

```bash
mysql -h xxxxx.mysql.clever-cloud.com -P 3306 -u xxxxx -p
```

---

## Phase 2: Render - Backend Deployment

### 2.1 Prepare Your Repository

Ensure your repository has:
- `backend/server.js` - Main entry point
- `backend/package.json` - Dependencies and scripts
- `backend/config/database.js` - Database configuration

### 2.2 Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub/GitLab repository
4. Configure the service:

   | Setting | Value |
   |---------|-------|
   | **Name** | `crossword-backend` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | (leave empty) |
   | **Start Command** | `node server.js` |

5. Click **"Create Web Service"**

### 2.3 Set Environment Variables on Render

After creating the service, add these environment variables:

**Required Variables:**

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `3001` | Server port (Render default is 10000, but 3001 works) |

**Database Variables (from Clever Cloud):**

| Variable | Value | Description |
|----------|-------|-------------|
| `DB_HOST` | Clever Cloud host | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | Clever Cloud user | MySQL username |
| `DB_PASSWORD` | Clever Cloud password | MySQL password |
| `DB_NAME` | Clever Cloud database | Database name |
| `DB_SSL` | `true` | Enable SSL connection |

**Authentication Variables:**

| Variable | Value | Description |
|----------|-------|-------------|
| `JWT_SECRET` | Generate random string | JWT signing key |
| `JWT_EXPIRES_IN` | `7d` | Token expiration time |

**CORS Variable (set after Phase 3):**

| Variable | Value | Description |
|----------|-------|-------------|
| `CORS_ORIGIN` | Vercel frontend URL | Frontend domain |

**Generate JWT_SECRET:**

```bash
# Using OpenSSL
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2.4 Deploy Backend

Render will automatically deploy when you save the environment variables. Monitor the deployment in the **"Logs"** tab.

### 2.5 Get Backend URL

After successful deployment, copy your backend URL:
- Example: `https://crossword-backend.onrender.com`

### 2.6 Verify Backend Health

Test the health endpoint:

```bash
curl https://your-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "message": "Server is running",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## Phase 3: Vercel - Frontend Deployment

### 3.1 Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your repository
4. Configure the project:

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | `Vite` |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

5. Click **"Deploy"**

### 3.2 Set Environment Variables on Vercel

After creating the project, add environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Render backend URL |

Example: `VITE_API_URL=https://crossword-backend.onrender.com`

1. Go to **Settings** → **Environment Variables**
2. Add the variable
3. Trigger a new deployment

### 3.3 Get Frontend URL

After deployment, copy your frontend URL:
- Example: `https://crossword-frontend.vercel.app`

### 3.4 Update CORS on Render

Return to Render dashboard and update the `CORS_ORIGIN` variable with your Vercel URL:

```
CORS_ORIGIN=https://your-frontend.vercel.app
```

---

## Verification Checklist

### Database (Clever Cloud)
- [ ] MySQL instance is running
- [ ] Connection details are accessible
- [ ] SSL is enabled

### Backend (Render)
- [ ] Service is deployed and healthy
- [ ] Health check endpoint returns success
- [ ] Database connection is established
- [ ] All environment variables are set
- [ ] CORS allows frontend requests

### Frontend (Vercel)
- [ ] Site is deployed and accessible
- [ ] API calls reach the backend
- [ ] User registration works
- [ ] Puzzle creation works
- [ ] Score submission works
- [ ] PDF generation works

---

## End-to-End Testing

### Test User Registration
1. Open your Vercel frontend URL
2. Navigate to Register page
3. Create a new account
4. Verify user is created in database (check Render logs)

### Test Puzzle Creation
1. Login to your account
2. Go to Creator page
3. Create a new puzzle with words
4. Save the puzzle
5. Verify puzzle is stored in database

### Test Score Submission
1. Go to Player page
2. Load a puzzle
3. Complete the puzzle
4. Submit your score
5. Verify score is recorded

---

## Environment Variables Reference

### Production Environment Variables

#### Render (Backend)
```bash
NODE_ENV=production
PORT=3001

# Clever Cloud MySQL
DB_HOST=xxxxx.mysql.clever-cloud.com
DB_PORT=3306
DB_USER=xxxxx
DB_PASSWORD=xxxxx
DB_NAME=xxxxx
DB_SSL=true

# JWT
JWT_SECRET=<generate_random_string>
JWT_EXPIRES_IN=7d

# CORS (after Vercel deployment)
CORS_ORIGIN=https://your-frontend.vercel.app
```

#### Vercel (Frontend)
```bash
VITE_API_URL=https://your-backend.onrender.com
```

---

## Troubleshooting

### Backend Issues

**Problem: Backend fails to start**
- Check Render logs for error messages
- Verify all environment variables are set correctly
- Ensure database credentials are correct

**Problem: Database connection fails**
- Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME are correct
- Ensure DB_SSL=true for Clever Cloud
- Check if Clever Cloud MySQL instance is running

**Problem: CORS errors**
- Ensure CORS_ORIGIN matches your Vercel URL exactly
- Check for typos in the URL (no trailing slashes)
- Verify the backend is properly configured

### Frontend Issues

**Problem: API calls fail**
- Check browser console for errors
- Verify VITE_API_URL is correct
- Test backend health endpoint directly
- Check CORS configuration

**Problem: Build fails on Vercel**
- Check Vercel deployment logs
- Verify all dependencies are in package.json
- Ensure build command is `npm run build`

### Database Issues

**Problem: Tables not created**
- Check backend logs for initialization errors
- The app auto-creates tables on first run
- Verify database user has CREATE TABLE permissions

---

## Security Checklist

- [ ] Use strong, unique JWT_SECRET
- [ ] Enable SSL for database connections
- [ ] Set CORS_ORIGIN to specific domain only
- [ ] Use environment variables for sensitive data
- [ ] Never commit .env files to repository
- [ ] Regularly update dependencies
- [ ] Monitor logs for suspicious activity

---

## Cost Summary (as of 2025)

### Clever Cloud (MySQL)
- **Free**: Good for development, limited resources
- **Paid**: Starts at ~€10/month for better performance

### Render (Backend)
- **Free**: Available with limits (spins down after inactivity)
- **Paid**: Starts at ~$7/month for consistent performance

### Vercel (Frontend)
- **Hobby**: Free for personal projects
- **Pro**: $20/month for production applications

---

## Post-Deployment Maintenance

### Regular Tasks
- Monitor Render and Vercel logs
- Check database usage limits
- Update dependencies regularly
- Backup database periodically

### Scaling
- If traffic increases, upgrade Render plan
- Consider database optimization for Clever Cloud
- Enable caching on Vercel for static assets

---

## Additional Resources

- [Clever Cloud Documentation](https://www.clever-cloud.com/doc/)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
