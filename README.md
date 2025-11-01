# Books Order - MEAN Stack Web App

A Books Ordering application with AngularJS frontend and Node.js backend, fully deployable on Vercel with MongoDB Atlas.

## Features

- Full-stack deployment on Vercel (frontend + serverless API)
- MongoDB Atlas integration (no local MongoDB needed)
- User authentication and authorization
- Book ordering system
- Admin dashboard
- Serverless functions architecture

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Vercel account (for deployment)

## Local Development

### Backend Setup (for local testing)

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root (optional, defaults are set):

```bash
MONGODB_URI=mongodb+srv://bhanusreekandhukuri03_db_user:Bhanu123@cluster0.ylqlqef.mongodb.net/?appName=Cluster0
MONGODB_DB=mean_books
JWT_SECRET=your-secret-key-here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

3. Run the backend (for local testing):

```bash
cd backend
npm install
npm start
```

The backend will run at `http://localhost:4000` (Express server for local development only).

### Frontend Setup

- Open `frontend/index.html` in a browser
- The frontend will automatically use `http://localhost:4000` for API calls in local development
- When deployed on Vercel, it will use relative paths (`/api`)

## Vercel Deployment

### Quick Deploy

1. **Install Vercel CLI** (optional):
```bash
npm i -g vercel
```

2. **Deploy to Vercel**:
```bash
vercel
```

Or connect your GitHub repository to Vercel dashboard.

### Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://bhanusreekandhukuri03_db_user:Bhanu123@cluster0.ylqlqef.mongodb.net/?appName=Cluster0
MONGODB_DB=mean_books
JWT_SECRET=your-secret-jwt-key-change-this
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### Seed Database

After deployment, call the seed endpoint once to initialize default admin and books:

```bash
curl -X POST https://your-app.vercel.app/api/seed
```

Or visit: `https://your-app.vercel.app/api/seed` and make a POST request.

## API Endpoints

All endpoints are under `/api`:

- `GET /api/health` - Health check
- `GET /api/books` - Get all books
- `POST /api/books` - Create book (admin only)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/orders` - Get all orders (admin only)
- `POST /api/orders` - Create order (authenticated)
- `GET /api/orders/my` - Get user's orders (authenticated)
- `PATCH /api/orders/[id]/status` - Update order status (admin only)
- `POST /api/seed` - Seed database (one-time)

## Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── lib/                # Shared utilities (db, auth, models)
│   ├── auth/               # Authentication endpoints
│   ├── books/              # Book endpoints
│   └── orders/             # Order endpoints
├── frontend/               # AngularJS frontend
├── backend/                # Express server (for local dev only)
└── vercel.json            # Vercel configuration
```

## Notes

- **MongoDB Atlas**: Already configured with your connection string in `api/lib/db.js`
- **CORS**: Enabled for all origins in serverless functions
- **Authentication**: JWT-based with Bearer tokens
- **Database**: MongoDB Atlas (cloud database, no local setup needed)

## Default Admin Credentials

After seeding:
- Email: `admin@example.com`
- Password: `admin123`

Change these via environment variables: `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
