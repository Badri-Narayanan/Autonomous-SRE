# 🚀 Quick Start Guide

Get the AutoSRE Dashboard running in 5 minutes.

## Step 1: Install Dependencies

```bash
cd dashboard
npm install
```

## Step 2: Setup Auth0

1. Go to [auth0.com](https://auth0.com) and create a free account
2. Create a new Application → Select **Single Page Application**
3. Go to Settings tab and copy:
   - Domain (e.g., `dev-xxxxx.us.auth0.com`)
   - Client ID (e.g., `xpdrlmlhZ32t4JRlQjEI0UTELFIFSGfX`)
4. Scroll down to Application URIs and set:
   - Allowed Callback URLs: `http://localhost:3000`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`
5. Click **Save Changes**

## Step 3: Create .env File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and paste your Auth0 credentials:

```env
VITE_AUTH0_DOMAIN=dev-xxxxx.us.auth0.com
VITE_AUTH0_CLIENT_ID=xpdrlmlhZ32t4JRlQjEI0UTELFIFSGfX
VITE_AUTH0_REDIRECT_URI=http://localhost:3000
```

## Step 4: Start the Dashboard

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: (Optional) Start Test Server

In a separate terminal, run the mock backend:

```bash
node test-server.js
```

This simulates a 42-second incident lifecycle with 3 overlapping incidents.

---

## ✅ You're Done!

The dashboard should now be running with:
- ✅ Auth0 login working
- ✅ Real-time incident feed
- ✅ System status heartbeat
- ✅ Diff viewer and analysis pane

If you see dummy data (3 incidents), that's normal - it means the backend isn't running yet.

---

## 🐛 Common Issues

**"Unauthorized" error after login**
- Make sure Application Type is **Single Page Application** (not Regular Web Application)
- Double-check the Allowed Callback URLs in Auth0 settings

**Dashboard not updating**
- Start the test server: `node test-server.js`
- Check that it's running on port 5000
- Look for console errors in browser DevTools

**Styles not loading**
- Run `npm install` again
- Restart the dev server with `npm run dev`

---

Need more details? Check the full [README.md](./README.md)
