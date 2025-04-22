const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk user ID
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  pdfUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ["processing", "ready"],
    default: "processing",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Books", bookSchema);
