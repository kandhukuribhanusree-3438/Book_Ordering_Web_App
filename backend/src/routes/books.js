import { Router } from 'express';
import Joi from 'joi';
import { Book } from '../models/Book.js';
import { authMiddleware } from './auth.js';

export const booksRouter = Router();

booksRouter.get('/', async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 }).lean();
  res.json(
    books.map(b => ({ id: b._id.toString(), title: b.title, author: b.author, price: b.price, imageUrl: b.imageUrl || '' }))
  );
});

const createSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  author: Joi.string().min(2).max(200).required(),
  price: Joi.number().min(0).required(),
  imageUrl: Joi.string().uri().allow('', null)
});

// Admin-only: create book
booksRouter.post('/', authMiddleware('admin'), async (req, res) => {
  const { error, value } = createSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: 'Invalid book', details: error.details.map(d => d.message) });
  }
  const created = await Book.create(value);
  res.status(201).json({ id: created._id.toString(), title: created.title, author: created.author, price: created.price, imageUrl: created.imageUrl || '' });
});


