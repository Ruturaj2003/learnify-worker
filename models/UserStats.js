const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const userStatsSchema = new mongoose.Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  bookStats: [
    {
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Books" },
      progress: { type: Number, default: 0 }, // percent of completed subchapters
      avgScore: { type: Number, default: 0 }, // average knowledge score
      lastActivity: { type: Date },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserStats", userStatsSchema);
