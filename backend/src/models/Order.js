import mongoose from 'mongoose';

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

export const Order = mongoose.model('Order', OrderSchema);


