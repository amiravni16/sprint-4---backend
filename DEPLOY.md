# Deployment Guide to Render.com

## Prerequisites

- Backend and frontend pushed to GitHub (Step 1 ✅)
- MongoDB Atlas connection string (Step 2 - doing now)

## Step 2: MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email
3. **Create Cluster**:
   - Choose **Free tier (M0)**
   - Select a **region** close to you
   - Give it a name (e.g., `Cluster0`)
   - Click **Create Cluster**

4. **Create Database User**:
   - Click **Database Access** in left sidebar
   - Click **Add New Database User**
   - Username: `admin` (or your choice)
   - Password: Generate a strong password or create your own
   - **IMPORTANT**: Save this password! You'll need it
   - Click **Add User**

5. **Whitelist Your IP** (for Render.com):
   - Click **Network Access** in left sidebar
   - Click **Add IP Address**
   - Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
   - Click **Confirm**

6. **Get Connection String**:
   - Click **Database** in left sidebar
   - Click **Connect** button on your cluster
   - Choose **Connect your application**
   - Copy the connection string (looks like: `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/`)
   - **Replace `<password>` with your actual password**
   - **Add database name**: Replace `/?retryWrites=true&w=majority` with `/?retryWrites=true&w=majority` OR add `&dbName=instagram_db` at the end
   
   **Final connection string should look like:**
   ```
   mongodb+srv://admin:yourpassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

7. **Save this connection string** - you'll need it for Render deployment

## Step 3: Deploy Backend to Render

1. Go to https://render.com and sign in (GitHub login)

2. Click **"New +"** button → **"Web Service"**

3. **Connect GitHub repo**:
   - Select your `instagram-clone-backend` repository
   - Click **Connect**

4. **Configure Settings**:
   - **Name**: `instagram-clone-backend` (or any name)
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: Leave empty (we're not building anything)
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. **Environment Variables** (Click "Advanced" → "Add Environment Variable"):
   - `MONGODB_URL` = your MongoDB Atlas connection string
   - `MONGODB_DB_NAME` = `instagram_db`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = leave empty for now (add after frontend deploys)
   - `SECRET` = any random string (e.g., `your-secret-key-123456789`)

6. Click **"Create Web Service"**

7. Wait for deployment (takes 5-10 minutes)

8. **Note your backend URL** (e.g., `instagram-clone-backend.onrender.com`)

## Step 4: Deploy Frontend to Render

1. Click **"New +"** button → **"Static Site"**

2. **Connect GitHub repo**:
   - Select your `instagram-clone-frontend` repository
   - Click **Connect**

3. **Configure Settings**:
   - **Name**: `instagram-clone-frontend` (or any name)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
   - **Instance Type**: Free

4. Click **"Create Static Site"**

5. Wait for deployment (takes 5-10 minutes)

6. **Note your frontend URL** (e.g., `instagram-clone-frontend.onrender.com`)

## Step 5: Connect Backend and Frontend

1. Go back to your **backend service** in Render

2. Click **"Environment"** tab

3. Update **FRONTEND_URL** environment variable:
   - Change it to: `https://your-frontend-url.onrender.com`
   - (Use your actual frontend URL from Step 4)

4. Click **"Save Changes"**

5. Render will automatically redeploy with new settings

## Step 6: Test Your Deployed App

1. Visit your frontend URL: `https://your-frontend-url.onrender.com`

2. Try to:
   - Sign up for an account
   - Login
   - Create a post
   - See the feed

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in backend matches exactly (including `https://`)
- No trailing slashes

### Database Connection Errors
- Check your MongoDB Atlas connection string
- Make sure password doesn't have special characters that need URL encoding
- Verify `Network Access` has `0.0.0.0/0` enabled

### Build Errors
- Check logs in Render dashboard
- Make sure all dependencies are in `package.json`
- Frontend build command: `npm ci && npm run build`

### Images Not Loading
- Unsplash URLs are stable and should work
- Check browser console for specific image URLs that fail

## Post-Deployment Checklist

- ✅ Backend deployed and running
- ✅ Frontend deployed and running
- ✅ CORS configured correctly
- ✅ Database connected
- ✅ Can sign up and login
- ✅ Posts load with images
- ✅ Feed displays correctly

## Optional: Seed Demo Data

If you want to add demo data to production:

1. In your backend repo, create a one-time script to seed data
2. Run it manually or add it as a build step
3. Or use MongoDB Compass to import data directly

---

**Your app is now live! Share your URL with others.**

