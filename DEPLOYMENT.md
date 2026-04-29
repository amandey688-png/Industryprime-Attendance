# Deployment Guide

This project is deployed as three separate services:

- Frontend: Vercel (`web/`)
- Backend: Render (`backend/`)
- Database: Supabase

## Backend on Render

Create a Render Web Service from this GitHub repository.

Use these settings if configuring manually:

- Root Directory: `backend`
- Runtime: `Python 3`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health Check Path: `/health`

Render can also read `render.yaml` from the repository root.

### Render Environment Variables

Set these in Render:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_long_random_secret
FRONTEND_URL=https://industryprime-attendance.vercel.app
```

Verify backend:

```text
https://industryprime-attendance.onrender.com/
```

Expected:

```json
{"message":"API is running"}
```

Health check:

```text
https://industryprime-attendance.onrender.com/health
```

Expected:

```json
{"status":"ok"}
```

## Frontend on Vercel

Create a Vercel project from this GitHub repository.

Use these settings:

- Root Directory: `web`
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Install Command: `npm install`

### Vercel Environment Variables

Set these in Vercel:

```env
NEXT_PUBLIC_API_URL=https://industryprime-attendance.onrender.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not add `SUPABASE_SERVICE_ROLE_KEY` or `JWT_SECRET` to Vercel.
Those must stay only on Render.

## Supabase

Run the SQL files in this order:

1. `backend/database/auth_schema.sql`
2. `backend/database/phase2_schema.sql` only if creating fresh tables
3. `backend/database/payroll_leave_update.sql`

If data already exists, do not rerun SQL that drops tables.
