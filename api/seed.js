// One-time seed script for initializing database
import { User, Book, ensureConnection } from './lib/models.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await ensureConnection();
    
    if (req.method === 'POST') {
      // Seed default admin if not exists
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
      
      const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() }).lean();
      if (!existingAdmin) {
        const passwordHash = await bcrypt.hash(adminPass, 10);
        await User.create({
          name: 'Admin',
          email: adminEmail.toLowerCase(),
          passwordHash,
          role: 'admin'
        });
        console.log('Seeded default admin:', adminEmail);
      }

      // Seed books if none exist
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

      res.json({ message: 'Database seeded successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

