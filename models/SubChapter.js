const mongoose = require('mongoose');

const subChapterSchema = new mongoose.Schema({
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapters',
    required: true,
  },
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

const SubChapter = mongoose.model('SubChapter', subChapterSchema);

module.exports = SubChapter;
