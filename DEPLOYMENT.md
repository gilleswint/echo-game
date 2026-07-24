# Deployment Guide for Echo (Friends-Only Internet Play)

This guide walks you through deploying **Echo** online so your friends can join your party rooms from anywhere using a single web link.

- **Frontend**: Hosted on [Vercel](https://vercel.com) (Free tier)
- **Backend**: Hosted on [Render](https://render.com) (Free tier)
- **Database**: None required (All game state is stored in-memory)

---

## 1. Backend Deployment (Render)

### Step 1: Create a Render Service
1. Sign up / Log in to [Render.com](https://render.com).
2. Click **New +** ➔ **Web Service**.
3. Connect your GitHub repository containing the `echo-game` codebase.

### Step 2: Configure Build Settings
Fill in the following fields on Render:

- **Name**: `echo-backend` (or your preferred service name)
- **Root Directory**: Leave blank (or `.` root)
- **Environment**: `Node`
- **Region**: Select a region close to your friends
- **Branch**: `main` (or your active branch)
- **Build Command**:
  ```bash
  pnpm --filter echo-shared build && pnpm --filter echo-server build
  ```
- **Start Command**:
  ```bash
  pnpm --filter echo-server start
  ```

### Step 3: Set Backend Environment Variables
In the Render Web Service dashboard, go to **Environment** ➔ **Add Environment Variable**:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_VERSION` | `20.11.0` | Node.js version |
| `CLIENT_ORIGIN` | `https://your-frontend-name.vercel.app` | Allowed frontend origin for CORS |

*(Note: If you don't know your frontend Vercel URL yet, set `CLIENT_ORIGIN` to `*` initially, then update it after Vercel deployment).*

### Step 4: Deploy & Copy Backend URL
Click **Create Web Service**. Once deployed, Render will provide a URL like:
`https://echo-backend-xxxx.onrender.com`

---

## 2. Frontend Deployment (Vercel)

### Step 1: Import Project to Vercel
1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New...** ➔ **Project**.
3. Import your GitHub repository.

### Step 2: Configure Project Settings
- **Framework Preset**: `Vite`
- **Root Directory**: Edit and set to `client`
- **Build Command**: `pnpm --filter echo-shared build && tsc && vite build` (or default `vite build` if root is set to `client`)
- **Output Directory**: `dist`

### Step 3: Set Frontend Environment Variables
In Vercel, expand **Environment Variables** and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_BACKEND_URL` | `https://echo-backend-xxxx.onrender.com` | Your Render backend URL |

### Step 4: Deploy Frontend
Click **Deploy**. Vercel will generate your live game link:
`https://echo-game-xxxx.vercel.app`

---

## 3. Connecting the Two Services

1. Copy your live Vercel URL (e.g. `https://echo-game-xxxx.vercel.app`).
2. Go back to Render ➔ **Environment Variables**.
3. Set `CLIENT_ORIGIN` = `https://echo-game-xxxx.vercel.app`.
4. Click **Save Changes** (Render will automatically re-deploy with updated CORS).

---

## 4. Environment Variables Summary

### Backend (`server/.env.example`)
```env
PORT=4000
CLIENT_ORIGIN=https://echo-game-xxxx.vercel.app
```

### Frontend (`client/.env.example`)
```env
VITE_BACKEND_URL=https://echo-backend-xxxx.onrender.com
```

---

## 5. Shareable Room Links

Echo features automatic URL parameter room joining!

- When you click the **Code: ECHO99** button in the game header, it copies a direct invite link:
  `https://echo-game-xxxx.vercel.app/?code=ECHO99`
- When your friends open this link, Echo automatically selects **Join Room** and pre-fills `ECHO99` in the input field!

---

## 6. Updating the Backend URL in the Future

If your backend URL ever changes:
1. Go to **Vercel** ➔ Project Settings ➔ **Environment Variables**.
2. Edit `VITE_BACKEND_URL` to your new backend URL.
3. Click **Deployments** ➔ **Redeploy** on the latest deployment.
