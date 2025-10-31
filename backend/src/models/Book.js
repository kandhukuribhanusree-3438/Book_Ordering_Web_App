import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Book = mongoose.model('Book', BookSchema);


