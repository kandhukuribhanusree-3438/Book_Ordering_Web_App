# Books Order - MEAN (Express + MongoDB + AngularJS)

A minimal Books Order page with an Express + MongoDB backend and an AngularJS (1.x) frontend.

## Prerequisites
- Node.js 18+
- MongoDB running locally (or provide a connection string)

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
MONGODB_URI=mongodb://127.0.0.1:27017/mean_books
MONGODB_DB=mean_books
# Allow multiple origins separated by comma (omit to allow all)
CORS_ORIGIN=http://localhost:4000,http://127.0.0.1:4000
```

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
- Books list is in-memory at `backend/src/routes/books.js`. Move to MongoDB as needed.
- Use `npm run dev` for watch mode on Node 18+.
