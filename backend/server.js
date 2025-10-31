import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './src/config/db.js';
import { booksRouter } from './src/routes/books.js';
import { ordersRouter } from './src/routes/orders.js';
import { authRouter } from './src/routes/auth.js';
import { User } from './src/models/User.js';
import { Book } from './src/models/Book.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*'}));
app.use(express.json());

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/books', booksRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);

// Start
async function start() {
  try {
    await connectToDatabase();
    // Seed default admin if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() }).lean();
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPass, 10);
      await User.create({ name: 'Admin', email: adminEmail.toLowerCase(), passwordHash, role: 'admin' });
      console.log('Seeded default admin:', adminEmail);
    }

    // Seed books if none exist (traditional Indian titles)
    const countBooks = await Book.countDocuments();
    if (countBooks === 0) {
      await Book.insertMany([
        { title: 'Ramayana', author: 'Valmiki', price: 15.00, imageUrl: 'https://images.unsplash.com/photo-1544937950-fa07a98d237f?w=640' },
        { title: 'Mahabharata', author: 'Vyasa', price: 18.00, imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=640' },
        { title: 'Bhagavad Gita', author: 'Vyasa', price: 10.00, imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=640' },
        { title: 'Panchatantra', author: 'Vishnu Sharma', price: 12.00, imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=640' },
        { title: 'Upanishads (Selections)', author: 'Various', price: 14.50, imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=640' },
        { title: 'Arthashastra', author: 'Chanakya (Kautilya)', price: 16.75, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?w=640' }
      ]);
      console.log('Seeded traditional Indian books');
    }
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();


