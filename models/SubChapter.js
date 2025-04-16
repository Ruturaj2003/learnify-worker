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
});

const SubChapter = mongoose.model('SubChapters', subChapterSchema);

module.exports = SubChapter;
