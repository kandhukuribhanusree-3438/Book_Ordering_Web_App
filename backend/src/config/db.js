import mongoose from 'mongoose';

export async function connectToDatabase() {
  // Use MongoDB Atlas connection string from environment variable or default to provided Atlas cluster
  const uri = process.env.MONGODB_URI || 'mongodb+srv://bhanusreekandhukuri03_db_user:Bhanu123@cluster0.ylqlqef.mongodb.net/?appName=Cluster0';
  mongoose.set('strictQuery', true);
  
  // Extract database name from URI or use default
  const dbName = process.env.MONGODB_DB || 'mean_books';
  
  await mongoose.connect(uri, {
    dbName: dbName
  });
  console.log('Connected to MongoDB Atlas');
}


