# Complete Vercel Deployment Guide

This app is now fully configured for deployment on Vercel with MongoDB Atlas.

## ✅ What's Been Configured

1. **Backend converted to Vercel serverless functions** - All Express routes are now in the `api/` directory
2. **MongoDB Atlas integration** - Connection string is configured in `api/lib/db.js`
3. **Frontend ready for Vercel** - Uses relative API paths in production
4. **CORS configured** - All API endpoints have CORS enabled

## 🚀 Deployment Steps

### Step 1: Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
npm i -g vercel
vercel
```

**Option B: Using GitHub**
1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the configuration

### Step 2: Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```
MONGODB_URI=mongodb+srv://bhanusreekandhukuri03_db_user:Bhanu123@cluster0.ylqlqef.mongodb.net/?appName=Cluster0
MONGODB_DB=mean_books
JWT_SECRET=your-secret-jwt-key-please-change-this
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

**Important**: Change `JWT_SECRET` to a secure random string in production!

### Step 3: Seed the Database

After deployment, call the seed endpoint once:

```bash
curl -X POST https://your-app-name.vercel.app/api/seed
```

Or use Postman/Thunder Client to make a POST request to:
```
https://your-app-name.vercel.app/api/seed
```

This will create:
- Default admin user (email: admin@example.com, password: admin123)
- Initial book catalog (6 traditional Indian books)

### Step 4: Test Your App

1. Visit `https://your-app-name.vercel.app`
2. Register a new user or login with admin credentials
3. Browse books, add to cart, and place orders
4. Login as admin to manage orders

## 📁 Project Structure

```
├── api/                      # Vercel serverless functions
│   ├── lib/
│   │   ├── db.js            # MongoDB Atlas connection
│   │   ├── auth.js          # JWT authentication utilities
│   │   └── models.js        # Mongoose models
│   ├── auth/
│   │   ├── login.js         # POST /api/auth/login
│   │   └── register.js      # POST /api/auth/register
│   ├── books/
│   │   └── index.js         # GET/POST /api/books
│   ├── orders/
│   │   ├── index.js         # GET/POST /api/orders
│   │   ├── my.js            # GET /api/orders/my
│   │   └── [id]/
│   │       └── status.js    # PATCH /api/orders/[id]/status
│   ├── health.js            # GET /api/health
│   └── seed.js              # POST /api/seed (one-time)
├── frontend/                 # AngularJS frontend
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── backend/                  # Express server (for local dev only)
├── package.json              # Root dependencies
└── vercel.json              # Vercel configuration
```

## 🔧 How It Works

1. **Frontend**: Static files served from `/frontend/` directory
2. **API**: Serverless functions in `/api/` automatically become `/api/*` endpoints
3. **Database**: MongoDB Atlas (cloud, no local setup)
4. **Routing**: Vercel automatically routes `/api/*` to serverless functions and `/*` to frontend

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MongoDB Atlas network access allows all IPs (0.0.0.0/0) or your Vercel IPs
- Check `MONGODB_URI` environment variable is set correctly
- Ensure database name is correct in `MONGODB_DB`

### API Not Working
- Check Vercel function logs: Vercel Dashboard → Deployments → View Function Logs
- Verify CORS headers are set (they should be)
- Ensure routes match the file structure in `api/` directory

### Frontend Can't Connect to API
- Check browser console for errors
- Verify `window.API_BASE` is set correctly (should be empty string in production)
- API calls should go to `/api/...` (relative path)

### Authentication Issues
- Verify `JWT_SECRET` is set in environment variables
- Clear browser localStorage and try logging in again

## 📝 Notes

- **MongoDB Atlas**: Connection string is already configured in code
- **No local MongoDB needed**: Everything uses Atlas
- **Serverless**: Each API endpoint is a separate serverless function
- **Scalable**: Vercel automatically scales your functions
- **Free Tier**: Vercel free tier is generous for small apps

## 🔐 Security Recommendations

1. Change `JWT_SECRET` to a strong random string
2. Change default admin credentials
3. Consider restricting CORS to your domain in production
4. Enable MongoDB Atlas IP whitelist (recommended)
5. Use MongoDB Atlas authentication (already configured)

## ✨ Next Steps

After successful deployment:
1. Update admin credentials
2. Add more books via admin panel
3. Customize styling if needed
4. Set up custom domain (optional)

