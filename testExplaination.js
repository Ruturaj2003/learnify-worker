const mongoose = require("mongoose");
const { getChapterExplanation } = require("./geminiService");
require("dotenv").config();

// Load the Segment model
const Segment = require("./models/Segment");

// MongoDB connection string
const MONGO_URI = process.env.MONGODB_URI;

// Set explanation type for testing
const explanationType = "simple"; // or "detailed"
const segmentId = "67fa7463b799356f3c5ac600"; // Replace with an actual _id from your Segment collection

async function testGemini() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const segment = await Segment.findById(segmentId);
    if (!segment) {
      console.error("❌ Segment not found");
      return;
    }

    console.log(`\n📖 Segment Title: ${segment.title}`);
    console.log(
      `🔍 Requesting a ${explanationType} explanation from Gemini...`
    );

    const explanation = await getChapterExplanation(
      segment.content,
      explanationType
    );

    console.log(`\n📘 ${explanationType.toUpperCase()} EXPLANATION:\n`);
    console.log(explanation);
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    mongoose.connection.close();
  }
}

testGemini();
