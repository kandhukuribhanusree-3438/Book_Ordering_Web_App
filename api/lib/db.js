import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Use MongoDB Atlas connection string
    const uri = process.env.MONGODB_URI || 'mongodb+srv://bhanusreekandhukuri03_db_user:Bhanu123@cluster0.ylqlqef.mongodb.net/?appName=Cluster0';
    const dbName = process.env.MONGODB_DB || 'mean_books';

    mongoose.set('strictQuery', true);
    
    cached.promise = mongoose.connect(uri, {
      ...opts,
      dbName: dbName
    }).then((mongoose) => {
      console.log('Connected to MongoDB Atlas');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

