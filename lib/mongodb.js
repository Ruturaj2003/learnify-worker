const mongoose = require('mongoose');
require('dotenv').config();

const connectToDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  }
};

module.exports = connectToDB;
