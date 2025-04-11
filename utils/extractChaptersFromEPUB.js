const EPub = require('epub');
const { convert } = require('html-to-text');
const Segment = require('../models/Segment');

module.exports = function extractChaptersFromEPUB(epubBuffer, bookId) {
  return new Promise((resolve, reject) => {
    const epub = new EPub(epubBuffer);

    epub.on('error', (err) => {
      console.error('[CHAPTER EXTRACT ❌] EPUB parse error:', err);
      reject(err);
    });

    epub.on('end', async () => {
      const chapters = epub.flow;
      console.log(`[CHAPTER EXTRACT] Found ${chapters.length} chapters`);

      let count = 0;

      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];

        await new Promise((res) => {
          epub.getChapter(chapter.id, async (err, html) => {
            if (err || !html) return res();

            const plain = convert(html, { wordwrap: false }).trim();
            if (plain.length < 100) return res();

            await Segment.create({
              book: bookId,
              title: chapter.title || `Section ${i + 1}`,
              content: plain,
              order: i,
            });

            count++;
            res();
          });
        });
      }

      resolve(count);
    });

    epub.parse();
  });
};
