import { Order, ensureConnection } from '../lib/models.js';
import { requireAuth } from '../lib/auth.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await ensureConnection();
    
    if (req.method === 'GET') {
      const user = requireAuth()(req);
      const orders = await Order.find({ userId: user.sub }).sort({ createdAt: -1 }).limit(50).lean();
      res.json(orders);
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

