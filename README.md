# CivicFix — Civic Issue Reporting & Resolution Platform

A full-stack web app where citizens report civic problems (potholes, power outages, water shortages) and officials resolve them — with real-time status tracking, photo uploads, and map pinning.

---

## 🗂️ Project Structure

```
civic-platform/
├── backend/     ← Node.js + Express + MongoDB Atlas
└── frontend/    ← React + Vite + Leaflet + Firebase
```

---

## ⚙️ Setup Instructions

### 1. MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → Create a free cluster
2. Create a database user + whitelist your IP (or `0.0.0.0/0` for dev)
3. Get your connection string: `mongodb+srv://user:pass@cluster.mongodb.net/civic_platform`

### 2. Firebase Storage
1. Go to [Firebase Console](https://console.firebase.google.com) → Create a project
2. Enable **Storage** (Firebase Storage)
3. In Storage Rules, allow reads/writes (for dev):
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true;
       }
     }
   }
   ```
4. Go to Project Settings → Your apps → Add a web app → Copy the config object

---

### 3. Backend Setup

```bash
cd backend
npm install

# Create your .env file
copy .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secret
```

Edit `backend/.env`:
```
MONGO_URI=mongodb+srv://youruser:yourpass@cluster.mongodb.net/civic_platform?retryWrites=true&w=majority
JWT_SECRET=pick_any_long_random_secret_string
PORT=5000
```

```bash
# Seed the database with test users + sample issues
npm run seed

# Start the dev server
npm run dev
```

---

### 4. Frontend Setup

```bash
cd frontend
npm install

# Create your .env file
copy .env.example .env
# Edit .env with your Firebase config
```

Edit `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

```bash
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 🧪 Demo Credentials (after seeding)

| Role    | Email                | Password   |
|---------|----------------------|------------|
| Admin   | admin@civic.gov      | Admin@123  |
| Citizen | citizen@test.com     | Test@123   |

The login page also has **Demo Citizen** and **Demo Admin** buttons to auto-fill credentials.

---

## 📡 API Endpoints

| Method | Route                     | Auth       | Description              |
|--------|---------------------------|------------|--------------------------|
| POST   | /api/auth/register        | Public     | Register citizen         |
| POST   | /api/auth/login           | Public     | Login (any role)         |
| GET    | /api/auth/me              | Any auth   | Get current user         |
| POST   | /api/issues               | Citizen    | Create issue             |
| GET    | /api/issues/mine          | Citizen    | Get own issues           |
| GET    | /api/issues               | Admin      | Get all issues (filters) |
| GET    | /api/issues/analytics     | Admin      | Analytics data           |
| GET    | /api/issues/:id           | Auth       | Get single issue         |
| PATCH  | /api/issues/:id/status    | Admin      | Update issue status      |

---

## 🚀 Deploying

- **Backend**: Deploy to [Render](https://render.com) or [Railway](https://railway.app). Set environment variables in their dashboard.
- **Frontend**: Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Set `VITE_*` env vars.
- Update CORS origins in `backend/src/index.js` with your frontend URL.
