# Books Order - MEAN (Express + MongoDB + AngularJS)

A minimal Books Order page with an Express + MongoDB backend and an AngularJS (1.x) frontend.

## Prerequisites
- Node.js 18+
- MongoDB Atlas account (already configured with connection string)

## Backend Setup
1. Install dependencies:

```bash
cd backend
npm install
```

2. (Optional) Create a `.env` in `backend/`:

```bash
# backend/.env
PORT=4000
# MongoDB Atlas connection string (default is already configured)
MONGODB_URI=mongodb+srv://bhanusreekandhukuri03_db_user:Bhanu123@cluster0.ylqlqef.mongodb.net/?appName=Cluster0
MONGODB_DB=mean_books
# Allow multiple origins separated by comma (omit to allow all)
CORS_ORIGIN=http://localhost:4000,http://127.0.0.1:4000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

**Note**: The app is configured to use MongoDB Atlas by default. The connection string is already set in the code, but you can override it using the `MONGODB_URI` environment variable.

3. Start the API:

```bash
npm start
```

API will run at `http://localhost:4000`:
- `GET /api/health`
- `GET /api/books` (sample data)
- `GET /api/orders` (last 50)
- `POST /api/orders` (create order)

## Frontend Setup
Static AngularJS app; no build required.

- Open `frontend/index.html` in a browser, or serve the `frontend/` folder with any static server.
- If your API isn’t on `http://localhost:4000`, set `window.API_BASE` before `app.js` loads:

```html
<script>window.API_BASE = 'http://your-host:your-port';</script>
```

## Notes
- CORS is enabled. Configure allowed origins with `CORS_ORIGIN`.
- Books are stored in MongoDB Atlas (already configured).
- Use `npm run dev` for watch mode on Node 18+.
- For Vercel deployment, see `VERCEL_DEPLOYMENT.md`.

## Deployment

This app is configured for MongoDB Atlas and ready for deployment. See `VERCEL_DEPLOYMENT.md` for detailed deployment instructions.
