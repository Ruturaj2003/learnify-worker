const { PDFDocument } = require("pdf-lib");

async function trimPdf(pdfBuffer, pagesToRemove) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  // Get the total number of pages in the PDF
  const totalPages = pdfDoc.getPages().length;

  // Ensure that pagesToRemove does not exceed the total number of pages
  //   if (pagesToRemove >= totalPages) {
  //     throw new Error("Pages to remove exceeds the total number of pages.");
  //   }

  // Slice the PDF to remove the first `pagesToRemove` pages
  const pagesToKeep = pdfDoc.getPages().slice(25, totalPages);

  // Create a new PDF with the remaining pages
  const newPdfDoc = await PDFDocument.create();
  for (const page of pagesToKeep) {
    const [newPage] = await newPdfDoc.copyPages(pdfDoc, [page.index]);
    newPdfDoc.addPage(newPage);
  }

  const newPdfBuffer = await newPdfDoc.save();
  return newPdfBuffer;
}
