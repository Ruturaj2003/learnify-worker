const Segment = require('../models/Segment'); // Mongoose model for saving chapters

/**
 * Saves the parsed chapters to the Segment model.
 *
 * @param {Array} chapterBuffers - Array of chapter data with title and buffer.
 * @param {mongoose.Types.ObjectId} bookId - The ID of the book being processed.
 */
module.exports = async function saveChapters(chapterBuffers, bookId) {
  console.log('[SaveChapters] Saving parsed chapters to database...');

  try {
    for (let i = 0; i < chapterBuffers.length; i++) {
      const chapter = chapterBuffers[i];
      const { title, buffer } = chapter;

      // Extract text content from the chapter PDF buffer (could use pdf-parse or another method)
      const content = await extractTextFromPDFBuffer(buffer);

      // Create a new segment (chapter) in the database
      const segment = new Segment({
        book: bookId, // Reference to the book being processed
        title,
        content, // Chapter content (text extracted from PDF)
        order: i + 1, // Order of the chapter based on its position in the TOC
      });

      // Save the segment to the database
      await segment.save();
      console.log(
        `[SaveChapters] Chapter "${title}" saved as Segment ${i + 1}`
      );
    }

    console.log('[SaveChapters] All chapters saved successfully.');
  } catch (err) {
    console.error('[SaveChapters ❌] Error saving chapters:', err.message);
  }
};

/**
 * Extracts text from a PDF buffer.
 * (Note: You can use pdf-parse or any text extraction library that works for your use case)
 *
 * @param {Buffer} pdfBuffer - The buffer of the chapter's PDF.
 * @returns {Promise<string>} - Extracted text content of the PDF.
 */
async function extractTextFromPDFBuffer(pdfBuffer) {
  const pdfParse = require('pdf-parse');
  try {
    const parsed = await pdfParse(pdfBuffer);
    return parsed.text.trim(); // Return extracted text content
  } catch (err) {
    console.error(
      '[ERROR ❌] Failed to extract text from chapter PDF:',
      err.message
    );
    return ''; // Return empty string in case of error
  }
}
