const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Generates explanation based on type
async function generateExplanation(chapterText, explanationType) {
  try {
    let prompt;
    if (explanationType === "simple") {
      // Simple explanation prompt
      prompt = `
        You are a teacher explaining complex concepts to high school students. 
        Provide a simple and clear explanation for the following chapter text.
        Keep the explanation around 30% of the chapter's original length. 
        Focus on the key concepts and make it easy to understand:
        
        Chapter Text: ${chapterText}
      `;
    } else if (explanationType === "detailed") {
      // Detailed explanation prompt
      prompt = `
        You are a subject matter expert. 
        Provide a detailed and thorough explanation of the following chapter text. 
        The explanation should be about 45% of the original chapter's length, covering all essential details, examples, and context:
        
        Chapter Text: ${chapterText}
      `;
    } else {
      throw new Error(
        "Invalid explanation type. Choose either 'simple' or 'detailed'."
      );
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Error from Gemini:", err);
    return "Sorry, couldn't get an explanation.";
  }
}

async function getChapterExplanation(chapterText, explanationType) {
  const explanation = await generateExplanation(chapterText, explanationType);
  return explanation;
}

// Generate Quiz
async function generateQuiz(chapterText, difficulty) {
  try {
    const prompt = `
        You're an expert teacher preparing a quiz based on a chapter from a textbook. Your task is to create 10 high-quality, clear multiple-choice questions from the chapter below.
        
        Generate questions based on the following difficulty level: ${difficulty}
        
        Each question must have:
        - One correct answer
        - Three plausible incorrect options
        - No repeated questions
        - A balance of conceptual and factual questions
        
        Format the output as a JSON array like this:
        
        [
            {
            "question": "Question text here",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Correct option text"
            },
            ...
        ]
        
        Chapter Text:
        """
        ${chapterText}
        """`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Error generating quiz:", err);
    return "Error generating quiz.";
  }
}

// Analyze Quiz results
async function analyzeQuizResults(questions, userAnswers, correctAnswers) {
  const quizData = questions.map((q, index) => {
    return {
      question: q.question,
      options: q.options,
      correctAnswer: correctAnswers[index],
      userAnswer: userAnswers[index],
    };
  });

  const prompt = `
    You are an educational AI assistant. Analyze the quiz performance of a student.

    Here is the quiz data:
    ${JSON.stringify(quizData, null, 2)}

    Generate the following sections:

    1. General Summary:
    - Total questions, correct answers, wrong answers, percentage
    - Overall performance remark (e.g., Excellent, Needs Improvement)

    2. Study Recommendations:
    - List 3-5 topics or concepts the user should review based on their mistakes
    - Provide links or keywords for further reading (if applicable)

    3. Detailed Review:
    - For each incorrect answer, explain why the user's answer was wrong
    - Provide a brief explanation of the correct answer

    Output the result in 3 separate sections using clear headings.
    `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Error analyzing quiz:", err);
    return "Error analyzing quiz results.";
  }
}

// Exporting all functions
module.exports = {
  getChapterExplanation,
  generateQuiz,
  analyzeQuizResults,
};
