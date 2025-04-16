const mongoose = require('mongoose');

const chaptersSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  title: String,
  subChapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubChapter' }],
  order: Number,
});

module.exports = mongoose.model('Chapters', segmentSchema);
