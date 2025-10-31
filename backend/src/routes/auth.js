import { Router } from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const authRouter = Router();

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('user', 'admin').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

function signToken(user) {
  const payload = { sub: user._id.toString(), email: user.email, role: user.role };
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

authRouter.post('/register', async (req, res) => {
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: 'Invalid data', details: error.details.map(d => d.message) });
  }
  const existing = await User.findOne({ email: value.email.toLowerCase() }).lean();
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(value.password, 10);
  const user = await User.create({ name: value.name, email: value.email.toLowerCase(), passwordHash, role: value.role || 'user' });
  const token = signToken(user);
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

authRouter.post('/login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const user = await User.findOne({ email: value.email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const ok = await bcrypt.compare(value.password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const token = signToken(user);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

export function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }
    try {
      const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
      const payload = jwt.verify(token, secret);
      req.user = payload;
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
}


