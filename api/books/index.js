import Joi from 'joi';
import { Book, ensureConnection } from '../lib/models.js';
import { requireAuth } from '../lib/auth.js';

const createSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  author: Joi.string().min(2).max(200).required(),
  price: Joi.number().min(0).required(),
  imageUrl: Joi.string().uri().allow('', null)
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await ensureConnection();
    
    if (req.method === 'GET') {
      const books = await Book.find().sort({ createdAt: -1 }).lean();
      res.json(
        books.map(b => ({
          id: b._id.toString(),
          title: b.title,
          author: b.author,
          price: b.price,
          imageUrl: b.imageUrl || ''
        }))
      );
    } else if (req.method === 'POST') {
      // Admin only
      requireAuth('admin')(req);

      const { error, value } = createSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          message: 'Invalid book',
          details: error.details.map(d => d.message)
        });
      }

      const created = await Book.create(value);
      res.status(201).json({
        id: created._id.toString(),
        title: created.title,
        author: created.author,
        price: created.price,
        imageUrl: created.imageUrl || ''
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

