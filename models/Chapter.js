const mongoose = require('mongoose');

const chaptersSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  chapterName: String,
  chapterNumber: Number,
});

module.exports = mongoose.model('Chapters', chaptersSchema);
