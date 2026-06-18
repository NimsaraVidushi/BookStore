const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      console.error('Error: MONGO_URI is not defined. Please create a .env file in the backend directory and configure MONGO_URI.');
      process.exit(1);
    }
    const redactedUri = uri.replace(/:([^:@]+)@/, ':******@');
    console.log(`Connecting to: ${redactedUri}`);
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
