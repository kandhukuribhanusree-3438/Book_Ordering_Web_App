# Vercel Deployment Guide

This guide will help you deploy your Book Ordering Web App to Vercel.

## Prerequisites

1. **Backend Deployment**: Since Vercel is primarily for frontend/static sites and serverless functions, you'll need to deploy your backend separately. Recommended options:
   - **Railway**: https://railway.app (easy Node.js deployment)
   - **Render**: https://render.com (free tier available)
   - **Vercel Serverless Functions**: Convert backend to serverless functions (more complex)

2. **MongoDB Atlas**: Already configured with your connection string.

## Deployment Steps

### Step 1: Deploy Backend (on Railway/Render)

1. Create an account on Railway or Render
2. Create a new Node.js service
3. Connect your GitHub repository
4. Set the root directory to `backend`
5. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://bhanusreekandhukuri03_db_user:Bhanu123@cluster0.ylqlqef.mongodb.net/?appName=Cluster0
   MONGODB_DB=mean_books
   PORT=4000
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123
   ```
6. Deploy and note your backend URL (e.g., `https://your-backend.railway.app`)

### Step 2: Deploy Frontend on Vercel

1. Install Vercel CLI (optional):
   ```bash
   npm i -g vercel
   ```

2. In your project root, run:
   ```bash
   vercel
   ```

3. Or connect your GitHub repo to Vercel:
   - Go to https://vercel.com
   - Import your repository
   - Set these settings:
     - **Framework Preset**: Other
     - **Root Directory**: `frontend`
     - **Build Command**: (leave empty)
     - **Output Directory**: `.`

4. Add Environment Variables in Vercel Dashboard:
   - `NEXT_PUBLIC_API_URL` or set `window.API_BASE` in your HTML

5. Before deploying, update `frontend/index.html` to set the API URL:
   ```html
   <script>
     window.API_BASE = 'https://your-backend.railway.app';
   </script>
   ```

   Or use environment variables with a build step.

### Step 3: Configure CORS

Update your backend `CORS_ORIGIN` environment variable to include your Vercel frontend URL:
```
CORS_ORIGIN=https://your-app.vercel.app,https://your-app.vercel.app
```

## Alternative: Using Vercel Serverless Functions

If you want everything on Vercel, you'll need to convert your Express routes to Vercel serverless functions. This is more complex but keeps everything in one place.

## Environment Variables Summary

### Backend (Railway/Render)
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `MONGODB_DB` - Database name (default: mean_books)
- `PORT` - Server port (default: 4000)
- `CORS_ORIGIN` - Your Vercel frontend URL
- `ADMIN_EMAIL` - Admin email
- `ADMIN_PASSWORD` - Admin password

### Frontend (Vercel)
- Set `window.API_BASE` in `index.html` to your backend URL

## Testing

After deployment:
1. Visit your Vercel frontend URL
2. Test registration/login
3. Test adding books to cart
4. Test placing orders
5. Test admin panel (if logged in as admin)

## Troubleshooting

- **CORS errors**: Make sure `CORS_ORIGIN` in backend includes your Vercel URL
- **API not connecting**: Check `window.API_BASE` is set correctly in frontend
- **Database errors**: Verify MongoDB Atlas connection string and network access settings

