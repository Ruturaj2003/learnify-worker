import mongoose from 'mongoose';
const chaptersSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Books', required: true },
  chapterName: { type: String, required: true },
  chapterNumber: { type: Number, required: true },
});
module.exports = mongoose.model('Chapters', chaptersSchema);
