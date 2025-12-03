const { analyzeQuizResults } = require("./geminiService");

const questions = [
  {
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
  },
  {
    question: "Which gas is most abundant in the Earth's atmosphere?",
    options: ["Oxygen", "Hydrogen", "Nitrogen", "Carbon Dioxide"],
  },
];

const userAnswers = ["Nucleus", "Oxygen"];
const correctAnswers = ["Mitochondria", "Nitrogen"];

analyzeQuizResults(questions, userAnswers, correctAnswers).then((result) => {
  console.log("📊 Quiz Analysis:\n", result);
});
