const { PDFDocument } = require("pdf-lib");

module.exports = async function trimPdf(pdfBuffer, pagesToRemove) {
  console.log("[TRIM] Starting to trim PDF...");

  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(pdfBuffer);
    // console.log('[TRIM] PDF loaded successfully.');
  } catch (err) {
    console.error("[ERROR ❌] Failed to load PDF:", err.message);
    throw new Error("Failed to load PDF for trimming.");
  }

  const totalPages = pdfDoc.getPageCount();
  console.log(`[TRIM] Total pages in original PDF: ${totalPages}`);

  if (pagesToRemove >= totalPages) {
    console.error(
      `[ERROR ❌] Pages to remove (${pagesToRemove}) exceed total pages (${totalPages}).`
    );
    throw new Error("Pages to remove exceed total number of pages.");
  }

  try {
    const newPdfDoc = await PDFDocument.create();

    for (let i = pagesToRemove; i < totalPages; i++) {
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
      newPdfDoc.addPage(copiedPage);
      // console.log(`[TRIM] Kept page ${i + 1}`);
    }

    const newPdfBuffer = await newPdfDoc.save();
    console.log(
      `[TRIM ✅] Trimmed PDF created successfully with ${
        totalPages - pagesToRemove
      } pages.`
    );

    return newPdfBuffer;
  } catch (err) {
    console.error("[ERROR ❌] Failed during PDF trimming:", err.message);
    throw new Error("Error during PDF trimming.");
  }
};
