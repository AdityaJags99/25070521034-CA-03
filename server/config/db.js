// Connects Node.js to MongoDB using Mongoose.
const mongoose = require('mongoose');

module.exports = async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error('Is MongoDB running? Check MONGO_URI in server/.env');
    process.exit(1);
  }
};
