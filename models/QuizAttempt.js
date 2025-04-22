const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subChapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubChapters",
    required: true,
  },
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
      userAnswer: String,
      explanation: String, // only for wrong ones
      isCorrect: Boolean,
      difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    },
  ],
  score: { type: Number }, // number of correct answers
  summary: { type: String },
  recommendations: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("QuizAttempts", quizAttemptSchema);
