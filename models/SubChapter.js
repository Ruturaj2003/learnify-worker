const mongoose = require('mongoose');

const subChapterSchema = new mongoose.Schema({
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapters',
    required: true,
  },
  chapterName: {
    type: String,
    required: true,
  },
  chapterNumber: Number,
  originalText: {
    type: String,
    required: true,
  },
  simpleExplanation: {
    type: String,
    default: '',
  },
  detailedExplanation: {
    type: String,
    default: '',
  },
  completedStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  pdfBuffer: {
    type: Buffer, // Store the PDF as a binary buffer
    // required: true, Un Comment Later Bro
  },
  quiz: {
    attempted: { type: Boolean, default: false },
    correctAnswers: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    knowledgeScore: { type: Number, default: 0 },
    lastAttemptedAt: { type: Date },
  },
});

module.exports = mongoose.model('SubChapters', subChapterSchema);
