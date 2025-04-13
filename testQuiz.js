const mongoose = require("mongoose");
const { generateQuiz } = require("./geminiService");
const Segment = require("./models/Segment");
require("dotenv").config();

// MongoDB connection string
const MONGO_URI = process.env.MONGODB_URI;

// Set difficulty level and segment ID to test
const difficulty = "medium"; // "easy", "medium", or "hard"
const segmentId = "67fa7463b799356f3c5ac600"; // Replace with actual segment ID

async function testQuiz() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const segment = await Segment.findById(segmentId);
    if (!segment) {
      console.error("❌ Segment not found");
      return;
    }

    console.log(`\n📖 Segment Title: ${segment.title}`);
    console.log(`🔍 Generating ${difficulty} level quiz from Gemini...`);

    const quiz = await generateQuiz(segment.content, difficulty);
    console.log(`📘 Quiz (${difficulty.toUpperCase()}):\n`);
    console.log(quiz);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    mongoose.connection.close();
  }
}

testQuiz();
