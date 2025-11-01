import { Order, ensureConnection } from '../../lib/models.js';
import { requireAuth } from '../../lib/auth.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await ensureConnection();
    
    if (req.method === 'PATCH') {
      // Admin only
      requireAuth('admin')(req);

      const { id } = req.query;
      const allowed = ['created', 'paid', 'shipped'];
      const nextStatus = req.body?.status || '';

      if (!allowed.includes(nextStatus)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const updated = await Order.findByIdAndUpdate(
        id,
        { status: nextStatus },
        { new: true }
      ).lean();

      if (!updated) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(updated);
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

