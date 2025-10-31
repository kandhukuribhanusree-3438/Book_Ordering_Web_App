import { Router } from 'express';
import Joi from 'joi';
import { Order } from '../models/Order.js';
import { authMiddleware } from './auth.js';

export const ordersRouter = Router();

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

// Admin-only: list orders
ordersRouter.get('/', authMiddleware('admin'), async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(50).lean();
  res.json(orders);
});

// User: create order (requires auth)
ordersRouter.post('/', authMiddleware(), async (req, res) => {
  const { error, value } = orderSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: 'Invalid order', details: error.details.map(d => d.message) });
  }

  const total = value.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    const created = await Order.create({ ...value, total, userId: req.user?.sub || null });
    res.status(201).json(created);
  } catch (e) {
    console.error('Failed to create order:', e);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// User: my orders
ordersRouter.get('/my', authMiddleware(), async (req, res) => {
  const userId = req.user?.sub;
  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
  res.json(orders);
});

// Admin: update order status
ordersRouter.patch('/:id/status', authMiddleware('admin'), async (req, res) => {
  const allowed = ['created', 'paid', 'shipped'];
  const next = (req.body && req.body.status) || '';
  if (!allowed.includes(next)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const updated = await Order.findByIdAndUpdate(req.params.id, { status: next }, { new: true }).lean();
  if (!updated) { return res.status(404).json({ message: 'Order not found' }); }
  res.json(updated);
});


