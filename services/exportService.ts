// import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// import { Issue } from '../types';

// export const exportCorrectedDocument = async (
//   originalBase64: string,
//   issues: Issue[],
//   fileName: string
// ): Promise<void> => {
//   try {
//     const base64Data = originalBase64.includes('base64,') 
//       ? originalBase64.split('base64,')[1] 
//       : originalBase64;

//     const existingPdfBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
//     const pdfDoc = await PDFDocument.load(existingPdfBytes);
//     const pages = pdfDoc.getPages();
//     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

//     const fixedIssues = issues.filter(i => i.isFixed && i.position);

//     for (const issue of fixedIssues) {
//       let pageIdx = 0;
//       if (issue.location) {
//         const match = issue.location.match(/\d+/);
//         if (match) pageIdx = parseInt(match[0]) - 1;
//       }

//       const page = pages[pageIdx] || pages[0];
//       const { width, height } = page.getSize();
//       const pos = issue.position!;

//       const x = (pos.left / 100) * width;
//       const y = height - ((pos.top / 100) * height) - ((pos.height / 100) * height);
//       const boxWidth = (pos.width / 100) * width;
//       const boxHeight = (pos.height / 100) * height;

//       page.drawRectangle({
//         x, y, width: boxWidth, height: boxHeight,
//         color: rgb(1, 1, 1),
//       });

//       page.drawText(issue.suggestion || "", {
//         x: x + 2,
//         y: y + (boxHeight / 4),
//         size: Math.max(8, boxHeight * 0.7),
//         font: font,
//         color: rgb(0, 0, 0),
//       });
//     }

//     // --- FIX FOR THE BLOBPART ERROR START ---

//     // 1. Get the bytes from pdf-lib
//     const pdfBytes = await pdfDoc.save();

//     // 2. Explicitly copy to a new Uint8Array to resolve the SharedArrayBuffer conflict
//     const safeBytes = new Uint8Array(pdfBytes);

//     // 3. Cast as any to bypass the strict TS BlobPart check if it persists
//     const blob = new Blob([safeBytes as any], { type: 'application/pdf' });

//     // --- FIX FOR THE BLOBPART ERROR END ---

//     const downloadUrl = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = downloadUrl;
//     link.download = `Corrected_${fileName.replace(/\s+/g, '_')}`;
//     document.body.appendChild(link);
//     link.click();

//     document.body.removeChild(link);
//     URL.revokeObjectURL(downloadUrl);

//   } catch (error) {
//     console.error("Export Error:", error);
//     alert("Could not generate PDF. Check the console for details.");
//   }
// };

// import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// import { Issue, isWordFile, isPDFFile } from '../types';

// export const exportCorrectedDocument = async (
//   originalBase64: string,
//   issues: Issue[],
//   fileName: string,
//   editedContent?: string,
//   mimeType?: string,
//   analysisId?: string
// ): Promise<void> => {
//   try {
//     // Check file type
//     const isWord = isWordFile(mimeType || '') || 
//                    fileName.toLowerCase().endsWith('.docx') || 
//                    fileName.toLowerCase().endsWith('.doc');

//     const isPDF = isPDFFile(mimeType || '') || fileName.toLowerCase().endsWith('.pdf');
//     const fixedIssues = issues.filter(i => i.isFixed);

//     // Validate export conditions
//     if (!isWord && fixedIssues.length === 0) {
//       alert("Please fix (click 'Apply Fix') at least one issue before exporting.");
//       return;
//     }

//     console.log('Exporting document:', {
//       fileName,
//       isWord,
//       isPDF,
//       fixedIssues: fixedIssues.length,
//       totalIssues: issues.length,
//       hasEdits: !!editedContent,
//       hasAnalysisId: !!analysisId
//     });

//     if (isWord) {
//       // Export Word document
//       await exportWordDocument(fileName, issues, editedContent, analysisId);
//     } else if (isPDF) {
//       // Export PDF document (original logic)
//       await exportPDFDocument(originalBase64, issues, fileName);
//     } else {
//       // For other file types, try PDF export as fallback
//       await exportPDFDocument(originalBase64, issues, fileName);
//     }
//   } catch (error) {
//     console.error("Export Error:", error);
//     alert("Could not generate corrected document. Check the console for details.");
//   }
// };

// // Word document export function
// const exportWordDocument = async (
//   fileName: string,
//   issues: Issue[],
//   editedContent?: string,
//   analysisId?: string
// ): Promise<void> => {
//   try {
//     const fixedIssues = issues.filter(i => i.isFixed);
//     const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');

//     // Create HTML content for Word document
//     const content = editedContent || 'No content available';

//     const docContent = `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <title>Corrected: ${fileName}</title>
//   <style>
//     body { 
//       font-family: 'Calibri', 'Arial', sans-serif; 
//       line-height: 1.5; 
//       margin: 2.54cm; 
//       font-size: 11pt; 
//     }
//     h1 { 
//       font-size: 16pt; 
//       color: #2E74B5; 
//       border-bottom: 2px solid #2E74B5; 
//       padding-bottom: 10px;
//     }
//     h2 { 
//       font-size: 14pt; 
//       color: #2E74B5; 
//       margin-top: 30px;
//     }
//     h3 { 
//       font-size: 12pt; 
//       color: #2E74B5;
//       font-weight: bold;
//     }
//     .document-info { 
//       background-color: #F2F2F2; 
//       padding: 15px; 
//       border-left: 4px solid #2E74B5; 
//       margin-bottom: 30px;
//     }
//     .correction-item { 
//       margin: 10px 0; 
//       padding: 8px 12px; 
//       background-color: #FFF;
//       border-left: 3px solid #4CAF50;
//     }
//     .original-text { 
//       color: #FF5252; 
//       text-decoration: line-through;
//       font-style: italic;
//     }
//     .corrected-text { 
//       color: #2E7D32; 
//       font-weight: bold;
//     }
//     .issue-type { 
//       display: inline-block; 
//       padding: 2px 8px; 
//       border-radius: 3px; 
//       font-size: 9pt; 
//       margin-right: 8px;
//     }
//     .critical { background-color: #FFEBEE; color: #C62828; }
//     .recommended { background-color: #FFF3E0; color: #EF6C00; }
//     .cosmetic { background-color: #E8F5E8; color: #2E7D32; }
//     .summary-box { 
//       background-color: #E3F2FD; 
//       padding: 15px; 
//       border-radius: 5px; 
//       margin: 20px 0;
//     }
//     .content-section { 
//       margin-top: 30px; 
//       border-top: 1px solid #E0E0E0; 
//       padding-top: 20px;
//     }
//   </style>
// </head>
// <body>
//   <h1>Corrected Document: ${fileName}</h1>

//   <div class="document-info">
//     <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
//     <p><strong>Applied Corrections:</strong> ${fixedIssues.length} of ${issues.length} issues</p>
//     ${analysisId ? `<p><strong>Analysis ID:</strong> ${analysisId}</p>` : ''}
//   </div>

//   <div class="summary-box">
//     <h3>📋 Correction Summary</h3>
//     <p>This document contains ${fixedIssues.length} applied corrections. Each correction includes the original text, suggested fix, and issue details.</p>
//   </div>

//   ${fixedIssues.length > 0 ? `
//   <h2>🔧 Applied Corrections</h2>
//   ${fixedIssues.map((issue, index) => `
//     <div class="correction-item">
//       <div style="margin-bottom: 8px;">
//         <span class="issue-type ${issue.severity.toLowerCase()}">${issue.severity}</span>
//         <span class="issue-type" style="background-color: #E8EAF6; color: #3F51B5;">${issue.type}</span>
//         <strong>#${index + 1}</strong>
//       </div>
//       ${issue.originalText ? `
//         <p><strong>Original:</strong> <span class="original-text">${issue.originalText}</span></p>
//       ` : ''}
//       ${issue.correctedText ? `
//         <p><strong>Corrected:</strong> <span class="corrected-text">${issue.correctedText}</span></p>
//       ` : ''}
//       <p><strong>Description:</strong> ${issue.description}</p>
//       <p><strong>Suggestion:</strong> ${issue.suggestion}</p>
//       ${issue.location ? `<p><strong>Location:</strong> ${issue.location}</p>` : ''}
//     </div>
//   `).join('')}
//   ` : ''}

//   <div class="content-section">
//     <h2>📄 Document Content</h2>
//     <div style="white-space: pre-wrap; font-family: 'Calibri', 'Arial', sans-serif;">
//       ${content}
//     </div>
//   </div>

//   <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #E0E0E0; font-size: 9pt; color: #666;">
//     <p>Generated by Document Analysis Tool • ${new Date().getFullYear()}</p>
//     <p>This document contains AI-suggested corrections. Please review all changes before final use.</p>
//   </div>
// </body>
// </html>`;

//     // Create and download the HTML file (which can be opened in Word)
//     const blob = new Blob([docContent], { type: 'text/html' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `Corrected_${fileName.replace(/\.[^/.]+$/, '')}_${timestamp}.html`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);

//     console.log('Word document exported successfully:', {
//       fileName: link.download,
//       fixedIssues: fixedIssues.length,
//       fileSize: blob.size
//     });

//   } catch (error) {
//     console.error('Word export error:', error);

//     // Fallback to simple text export
//     const fallbackContent = editedContent || 'No content available';
//     const simpleBlob = new Blob([fallbackContent], { type: 'text/plain' });
//     const url = URL.createObjectURL(simpleBlob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `Corrected_${fileName.replace(/\.[^/.]+$/, '')}.txt`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   }
// };

// // PDF document export function (your original code with minor improvements)
// const exportPDFDocument = async (
//   originalBase64: string,
//   issues: Issue[],
//   fileName: string
// ): Promise<void> => {
//   try {
//     const base64Data = originalBase64.includes('base64,') 
//       ? originalBase64.split('base64,')[1] 
//       : originalBase64;

//     const existingPdfBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
//     const pdfDoc = await PDFDocument.load(existingPdfBytes);
//     const pages = pdfDoc.getPages();
//     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

//     const fixedIssues = issues.filter(i => i.isFixed && i.position);

//     // Apply fixes to PDF
//     for (const issue of fixedIssues) {
//       let pageIdx = 0;
//       if (issue.location) {
//         const match = issue.location.match(/\d+/);
//         if (match) pageIdx = parseInt(match[0]) - 1;
//       }

//       const page = pages[pageIdx] || pages[0];
//       const { width, height } = page.getSize();
//       const pos = issue.position!;

//       const x = (pos.left / 100) * width;
//       const y = height - ((pos.top / 100) * height) - ((pos.height / 100) * height);
//       const boxWidth = (pos.width / 100) * width;
//       const boxHeight = (pos.height / 100) * height;

//       // Draw white rectangle to cover original text
//       page.drawRectangle({
//         x, y, width: boxWidth, height: boxHeight,
//         color: rgb(1, 1, 1),
//       });

//       // Draw corrected text
//       page.drawText(issue.suggestion || "", {
//         x: x + 2,
//         y: y + (boxHeight / 4),
//         size: Math.max(8, boxHeight * 0.7),
//         font: font,
//         color: rgb(0, 0, 0),
//       });

//       // Draw a subtle border around the correction
//       page.drawRectangle({
//         x, y, width: boxWidth, height: boxHeight,
//         borderColor: rgb(0.2, 0.6, 0.2),
//         borderWidth: 1,
//       });
//     }

//     // Add correction summary page if there are fixes
//     if (fixedIssues.length > 0) {
//       const lastPage = pages[pages.length - 1];
//       const { width, height } = lastPage.getSize();

//       // Add a note about corrections
//       page.drawText(`Document contains ${fixedIssues.length} corrections`, {
//         x: 50,
//         y: 50,
//         size: 10,
//         font: font,
//         color: rgb(0.2, 0.2, 0.2),
//       });
//     }

//     // Generate PDF bytes
//     const pdfBytes = await pdfDoc.save();
//     const safeBytes = new Uint8Array(pdfBytes);
//     const blob = new Blob([safeBytes], { type: 'application/pdf' });

//     // Download the PDF
//     const downloadUrl = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = downloadUrl;

//     // Create filename with timestamp
//     const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
//     link.download = `Corrected_${fileName.replace(/\.[^/.]+$/, '')}_${timestamp}.pdf`;

//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(downloadUrl);

//     console.log('PDF exported successfully:', {
//       fileName: link.download,
//       fixedIssues: fixedIssues.length,
//       fileSize: blob.size
//     });

//   } catch (error) {
//     console.error("PDF Export Error:", error);
//     throw error;
//   }
// };

// // Helper function for fallback text export
// export const exportAsText = async (
//   content: string,
//   fileName: string,
//   issues: Issue[]
// ): Promise<void> => {
//   try {
//     const fixedIssues = issues.filter(i => i.isFixed);
//     const timestamp = new Date().toISOString().split('T')[0];

//     const textContent = `CORRECTED DOCUMENT
// ========================
// File: ${fileName}
// Date: ${new Date().toLocaleString()}
// Applied Corrections: ${fixedIssues.length}
// Total Issues: ${issues.length}

// DOCUMENT CONTENT:
// ${content}

// ${fixedIssues.length > 0 ? `
// APPLIED CORRECTIONS:
// ${fixedIssues.map((issue, idx) => `
// ${idx + 1}. [${issue.type}] ${issue.severity}
//    Issue: ${issue.description}
//    Suggestion: ${issue.suggestion}
//    ${issue.originalText ? `Original: ${issue.originalText}` : ''}
//    ${issue.correctedText ? `Corrected: ${issue.correctedText}` : ''}
// `).join('\n')}
// ` : ''}
// --- End of Document ---`;

//     const blob = new Blob([textContent], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `Corrected_${fileName.replace(/\.[^/.]+$/, '')}_${timestamp}.txt`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   } catch (error) {
//     console.error('Text export error:', error);
//     throw error;
//   }
// };
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Issue, isWordFile, isPDFFile } from '../types';

export const exportCorrectedDocument = async (
  originalBase64: string,
  issues: Issue[],
  fileName: string,
  editedContent?: string,
  mimeType?: string,
  analysisId?: string,
  format: 'original' | 'html' | 'pdf' = 'original'
): Promise<void> => {
  try {
    // Check file type
    const isWord = isWordFile(mimeType || '') ||
      fileName.toLowerCase().endsWith('.docx') ||
      fileName.toLowerCase().endsWith('.doc');

    const isPDF = isPDFFile(mimeType || '') || fileName.toLowerCase().endsWith('.pdf');
    const fixedIssues = issues.filter(i => i.isFixed);

    // Validate export conditions (relaxed for edit mode export)
    if (!isWord && fixedIssues.length === 0 && format !== 'html') {
      alert("Please fix (click 'Apply Fix') at least one issue before exporting.");
      return;
    }

    console.log('Exporting document:', {
      fileName,
      format,
      isWord,
      isPDF,
      hasEdits: !!editedContent
    });

    // Logic based on requested format
    if (format === 'html' || (isWord && format === 'original')) {
      // Export as Word/HTML (EDITION FORMAT)
      await exportWordDocument(fileName, issues, editedContent, analysisId);
    } else if (format === 'pdf' || (isPDF && format === 'original')) {
      // Export as PDF (Visual highlights if PDF)
      if (isPDF) {
        await exportPDFDocument(originalBase64, issues, fileName);
      } else {
        // Word to PDF fallback (not implemented fully on client, stick to Word export or alert)
        await exportWordDocument(fileName, issues, editedContent, analysisId); // Fallback to word for now
      }
    } else {
      // Default fallback
      await exportWordDocument(fileName, issues, editedContent, analysisId);
    }
  } catch (error) {
    console.error("Export Error:", error);
    alert("Could not generate corrected document. Check the console for details.");
  }
};

// Word document export function
const exportWordDocument = async (
  fileName: string,
  issues: Issue[],
  editedContent?: string,
  analysisId?: string
): Promise<void> => {
  try {
    const fixedIssues = issues.filter(i => i.isFixed);
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');

    // Create HTML content for Word document
    const content = editedContent || 'No content available';

    const docContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Corrected: ${fileName}</title>
  <style>
    body { 
      font-family: 'Calibri', 'Arial', sans-serif; 
      line-height: 1.5; 
      margin: 2.54cm; 
      font-size: 11pt; 
    }
    h1 { 
      font-size: 16pt; 
      color: #2E74B5; 
      border-bottom: 2px solid #2E74B5; 
      padding-bottom: 10px;
    }
    h2 { 
      font-size: 14pt; 
      color: #2E74B5; 
      margin-top: 30px;
    }
    h3 { 
      font-size: 12pt; 
      color: #2E74B5;
      font-weight: bold;
    }
    .document-info { 
      background-color: #F2F2F2; 
      padding: 15px; 
      border-left: 4px solid #2E74B5; 
      margin-bottom: 30px;
    }
    .correction-item { 
      margin: 10px 0; 
      padding: 8px 12px; 
      background-color: #FFF;
      border-left: 3px solid #4CAF50;
    }
    .original-text { 
      color: #FF5252; 
      text-decoration: line-through;
      font-style: italic;
    }
    .corrected-text { 
      color: #2E7D32; 
      font-weight: bold;
    }
    .issue-type { 
      display: inline-block; 
      padding: 2px 8px; 
      border-radius: 3px; 
      font-size: 9pt; 
      margin-right: 8px;
    }
    .critical { background-color: #FFEBEE; color: #C62828; }
    .recommended { background-color: #FFF3E0; color: #EF6C00; }
    .cosmetic { background-color: #E8F5E8; color: #2E7D32; }
    .summary-box { 
      background-color: #E3F2FD; 
      padding: 15px; 
      border-radius: 5px; 
      margin: 20px 0;
    }
    .content-section { 
      margin-top: 30px; 
      border-top: 1px solid #E0E0E0; 
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <h1>Corrected Document: ${fileName}</h1>
  
  <div class="document-info">
    <p><strong>Export Date:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Applied Corrections:</strong> ${fixedIssues.length} of ${issues.length} issues</p>
    ${analysisId ? `<p><strong>Analysis ID:</strong> ${analysisId}</p>` : ''}
  </div>

  <div class="summary-box">
    <h3>📋 Correction Summary</h3>
    <p>This document contains ${fixedIssues.length} applied corrections. Each correction includes the original text, suggested fix, and issue details.</p>
  </div>

  ${fixedIssues.length > 0 ? `
  <h2>🔧 Applied Corrections</h2>
  ${fixedIssues.map((issue, index) => `
    <div class="correction-item">
      <div style="margin-bottom: 8px;">
        <span class="issue-type ${issue.severity.toLowerCase()}">${issue.severity}</span>
        <span class="issue-type" style="background-color: #E8EAF6; color: #3F51B5;">${issue.type}</span>
        <strong>#${index + 1}</strong>
      </div>
      ${issue.originalText ? `
        <p><strong>Original:</strong> <span class="original-text">${issue.originalText}</span></p>
      ` : ''}
      ${issue.correctedText ? `
        <p><strong>Corrected:</strong> <span class="corrected-text">${issue.correctedText}</span></p>
      ` : ''}
      <p><strong>Description:</strong> ${issue.description}</p>
      <p><strong>Suggestion:</strong> ${issue.suggestion}</p>
      ${issue.location ? `<p><strong>Location:</strong> ${issue.location}</p>` : ''}
    </div>
  `).join('')}
  ` : ''}

  <div class="content-section">
    <h2>📄 Document Content</h2>
    <div style="white-space: pre-wrap; font-family: 'Calibri', 'Arial', sans-serif;">
      ${content}
    </div>
  </div>

  <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #E0E0E0; font-size: 9pt; color: #666;">
    <p>Generated by Document Analysis Tool • ${new Date().getFullYear()}</p>
    <p>This document contains AI-suggested corrections. Please review all changes before final use.</p>
  </div>
</body>
</html>`;

    // Create and download the HTML file (which can be opened in Word)
    const blob = new Blob([docContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Corrected_${fileName.replace(/\.[^/.]+$/, '')}_${timestamp}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('Word document exported successfully:', {
      fileName: link.download,
      fixedIssues: fixedIssues.length,
      fileSize: blob.size
    });

  } catch (error) {
    console.error('Word export error:', error);

    // Fallback to simple text export
    const fallbackContent = editedContent || 'No content available';
    const simpleBlob = new Blob([fallbackContent], { type: 'text/plain' });
    const url = URL.createObjectURL(simpleBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Corrected_${fileName.replace(/\.[^/.]+$/, '')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// PDF document export function (your original code with FIX for the 'page' error)
const exportPDFDocument = async (
  originalBase64: string,
  issues: Issue[],
  fileName: string
): Promise<void> => {
  try {
    const base64Data = originalBase64.includes('base64,')
      ? originalBase64.split('base64,')[1]
      : originalBase64;

    const existingPdfBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const fixedIssues = issues.filter(i => i.isFixed && i.position);

    // Apply fixes to PDF
    for (const issue of fixedIssues) {
      let pageIdx = 0;
      if (issue.location) {
        const match = issue.location.match(/\d+/);
        if (match) pageIdx = parseInt(match[0]) - 1;
      }

      const page = pages[pageIdx] || pages[0];
      const { width, height } = page.getSize();
      const pos = issue.position!;

      const x = (pos.left / 100) * width;
      const y = height - ((pos.top / 100) * height) - ((pos.height / 100) * height);
      const boxWidth = (pos.width / 100) * width;
      const boxHeight = (pos.height / 100) * height;

      // Draw white rectangle to cover original text
      page.drawRectangle({
        x, y, width: boxWidth, height: boxHeight,
        color: rgb(1, 1, 1),
      });

      // Draw corrected text
      page.drawText(issue.suggestion || "", {
        x: x + 2,
        y: y + (boxHeight / 4),
        size: Math.max(8, boxHeight * 0.7),
        font: font,
        color: rgb(0, 0, 0),
      });

      // Draw a subtle border around the correction
      page.drawRectangle({
        x, y, width: boxWidth, height: boxHeight,
        borderColor: rgb(0.2, 0.6, 0.2),
        borderWidth: 1,
      });
    }

    // Add correction summary page if there are fixes
    if (fixedIssues.length > 0 && pages.length > 0) {
      const lastPage = pages[pages.length - 1];
      const { width, height } = lastPage.getSize();

      // Add a note about corrections at the bottom of the last page
      lastPage.drawText(`Document contains ${fixedIssues.length} corrections - Generated ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: 50,
        size: 8,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    const safeBytes = new Uint8Array(pdfBytes);
    const blob = new Blob([safeBytes], { type: 'application/pdf' });

    // Download the PDF
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    link.download = `Corrected_${fileName.replace(/\.[^/.]+$/, '')}_${timestamp}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    console.log('PDF exported successfully:', {
      fileName: link.download,
      fixedIssues: fixedIssues.length,
      fileSize: blob.size
    });

  } catch (error) {
    console.error("PDF Export Error:", error);
    throw error;
  }
};

// Helper function for fallback text export
export const exportAsText = async (
  content: string,
  fileName: string,
  issues: Issue[]
): Promise<void> => {
  try {
    const fixedIssues = issues.filter(i => i.isFixed);
    const timestamp = new Date().toISOString().split('T')[0];

    const textContent = `CORRECTED DOCUMENT
========================
File: ${fileName}
Date: ${new Date().toLocaleString()}
Applied Corrections: ${fixedIssues.length}
Total Issues: ${issues.length}

DOCUMENT CONTENT:
${content}

${fixedIssues.length > 0 ? `
APPLIED CORRECTIONS:
${fixedIssues.map((issue, idx) => `
${idx + 1}. [${issue.type}] ${issue.severity}
   Issue: ${issue.description}
   Suggestion: ${issue.suggestion}
   ${issue.originalText ? `Original: ${issue.originalText}` : ''}
   ${issue.correctedText ? `Corrected: ${issue.correctedText}` : ''}
`).join('\n')}
` : ''}
--- End of Document ---`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Corrected_${fileName.replace(/\.[^/.]+$/, '')}_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Text export error:', error);
    throw error;
  }
};