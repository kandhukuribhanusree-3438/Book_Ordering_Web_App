import Joi from 'joi';
import { Order, ensureConnection } from '../lib/models.js';
import { requireAuth } from '../lib/auth.js';

const orderSchema = Joi.object({
  customerName: Joi.string().min(2).max(100).required(),
  customerEmail: Joi.string().email().required(),
  items: Joi.array()
    .items(
      Joi.object({
        bookId: Joi.string().required(),
        title: Joi.string().required(),
        price: Joi.number().min(0).required(),
        quantity: Joi.number().integer().min(1).required()
      })
    )
    .min(1)
    .required()
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
      // Admin only
      const user = requireAuth('admin')(req);
      const orders = await Order.find().sort({ createdAt: -1 }).limit(50).lean();
      res.json(orders);
    } else if (req.method === 'POST') {
      // Requires auth
      const user = requireAuth()(req);

      const { error, value } = orderSchema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          message: 'Invalid order',
          details: error.details.map(d => d.message)
        });
      }

      const total = value.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const created = await Order.create({
        ...value,
        total,
        userId: user.sub || null
      });
      res.status(201).json(created);
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

