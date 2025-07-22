require('dotenv').config();
const mongoose = require('mongoose');

const connection = process.env.MONGODB_URL;

const dbConnection = async () => {
  try {
    await mongoose.connect(connection);
    console.log('MongoDB connection successful');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = dbConnection;