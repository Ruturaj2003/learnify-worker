const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  title: String,
  content: String,
  order: Number,
});

module.exports = mongoose.model('Segment', segmentSchema);
