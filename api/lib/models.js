import mongoose from 'mongoose';
import { connectToDatabase } from './db.js';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const OrderItemSchema = new mongoose.Schema(
  {
    bookId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true },
    items: { type: [OrderItemSchema], required: true, validate: v => v.length > 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['created', 'paid', 'shipped'], default: 'created' }
  },
  { timestamps: true }
);

// Use existing models if already compiled
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// Helper function to ensure connection
export async function ensureConnection() {
  await connectToDatabase();
}

