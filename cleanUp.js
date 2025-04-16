const mongoose = require('mongoose');
require('dotenv').config(); // Load MONGODB_URI from .env

const DB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/your-db-name';

async function cleanupDatabase() {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB');

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const collectionNames = collections.map((col) => col.name);

    if (collectionNames.includes('books')) {
      await mongoose.connection.db.collection('books').deleteMany({});
      console.log('🗑️ Deleted all documents from "books" collection');
    }

    if (collectionNames.includes('segments')) {
      await mongoose.connection.db.collection('segments').deleteMany({});
      console.log('🗑️ Deleted all documents from "segments" collection');
    }
    if (collectionNames.includes('chapters')) {
      await mongoose.connection.db.collection('chapters').deleteMany({});
      console.log('🗑️ Deleted all documents from "segments" collection');
    }
    if (collectionNames.includes('subchapters')) {
      await mongoose.connection.db.collection('subchapters').deleteMany({});
      console.log('🗑️ Deleted all documents from "segments" collection');
    }
    console.log('✅ Cleanup complete');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

cleanupDatabase();
