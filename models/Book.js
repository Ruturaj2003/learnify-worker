const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const bookSchema = new mongoose.Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  startsFrom: { type: Number },
  createdAt: { type: Date, default: Date.now },
  lastAccessed: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Book || mongoose.model('Books', bookSchema);
