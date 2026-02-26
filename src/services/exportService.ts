import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Issue, isWordFile, isPDFFile } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper to generate Word Docx from HTML content (Client-side)
// @ts-ignore
import { asBlob } from 'html-docx-js-typescript';

const exportHtmlAsDocx = async (
  content: string,
  fileName: string
): Promise<void> => {
  try {
    if (!content) {
      alert("No content to export.");
      return;
    }

    // Wrap content in a full HTML structure with styles for Word
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #000000; }
            h1, h2, h3, h4, h5, h6 { color: #2E74B5; margin-top: 12pt; margin-bottom: 6pt; font-weight: bold; }
            h1 { font-size: 24pt; border-bottom: 2px solid #2E74B5; padding-bottom: 6pt; }
            h2 { font-size: 18pt; margin-top: 18pt; }
            h3 { font-size: 14pt; }
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000000;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Times New Roman', Times, serif;
            font-weight: bold;
            color: #000000;
            margin-top: 24pt;
            margin-bottom: 12pt;
          }
          h1 { font-size: 24pt; text-align: center; margin-bottom: 24pt; }
          h2 { font-size: 18pt; border-bottom: 1px solid #000; padding-bottom: 6pt; text-align: left; }
          h3 { font-size: 14pt; text-align: left; }
          p { margin-bottom: 12pt; text-align: left; line-height: 1.5; }
          
          /* Titles often come as strong/bold paragraphs - ensure they don't justify */
          strong, b { font-weight: bold; }
          
          /* Table Styling for Word */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12pt;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: left;
            padding: 8pt;
            border: 1px solid #000;
          }
          td {
            padding: 8pt;
            border: 1px solid #000;
            vertical-align: top;
          }
          
          /* List Styling */
          ul, ol { margin-bottom: 12pt; }
          li { margin-bottom: 6pt; }
          
          /* Links */
          a { color: #0563C1; text-decoration: underline; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;

    // Convert HTML to Docx Blob
    // 'asBlob' returns a Blob (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
    const blob = await asBlob(htmlContent, {
      orientation: 'portrait',
      margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 } // 1 inch margins
    });

    if (!blob) {
      throw new Error("Failed to generate Word document blob.");
    }

    // Trigger download
    const url = URL.createObjectURL(blob as Blob);
    const link = document.createElement('a');
    link.href = url;

    // Use a clean filename with .docx extension
    const cleanFileName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_ ]/g, "");
    link.download = `Corrected_${cleanFileName}.docx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error("HTML to Docx Export Error:", error);
    alert("Word document generation failed. Please try 'Original Format' or 'HTML' export.");
    throw error;
  }
};

// Helper to generate PDF from HTML content (Client-side)
const exportHtmlAsPdf = async (
  content: string,
  fileName: string
): Promise<void> => {
  try {
    if (!content) {
      alert("No content to export.");
      return;
    }

    // Create a temporary container for rendering
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '0px';
    container.style.top = '0px';
    container.style.zIndex = '-9999';
    // Use a width suitable for A4 content (approx 700px gives good margins)
    container.style.width = '700px';
    container.style.backgroundColor = 'white';
    container.style.padding = '40px';

    // Inject styles for better formatting
    const style = document.createElement('style');
    style.innerHTML = `
      body { 
        font-family: Arial, sans-serif; 
        color: #000; 
        line-height: 1.6; 
      }
      h1, h2, h3, h4, h5, h6 { 
        color: #2E74B5; 
        margin-top: 24px; 
        margin-bottom: 12px; 
        font-weight: bold; 
        page-break-after: avoid; 
        letter-spacing: 0.5px;
      }
      h1 { font-size: 24pt; border-bottom: 2px solid #2E74B5; padding-bottom: 8px; }
      h2 { font-size: 18pt; margin-top: 20px; }
      h3 { font-size: 14pt; }
      p { 
        margin-bottom: 12px; 
        font-size: 11pt; 
        text-align: left; 
        letter-spacing: 0.2px;
      }
      
      /* Table Styling */
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin: 20px 0; 
        font-size: 10pt; 
        page-break-inside: avoid;
        table-layout: fixed;
      }
      th { 
        background-color: #f2f2f2; 
        color: #333;
        font-weight: bold; 
        text-align: left; 
        padding: 8px 12px; 
        border: 1px solid #ddd; 
      }
      td { 
        padding: 8px 12px; 
        border: 1px solid #ddd; 
        vertical-align: top;
        word-wrap: break-word;
      }
      tr:nth-child(even) { background-color: #fafafa; }
      
      img { max-width: 100%; height: auto; display: block; margin: 10px auto; }
      
      /* Ensure text doesn't overflow horizontally */
      * { max-width: 100%; box-sizing: border-box; }

      /* Fix potential issues */
      div, span, p { display: block; position: static; width: auto; height: auto; } 
    `;
    container.appendChild(style);

    const contentWrapper = document.createElement('div');
    contentWrapper.innerHTML = content;
    container.appendChild(contentWrapper);

    document.body.appendChild(container);

    // Wait for images
    const images = container.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    // Delay for rendering
    await new Promise(r => setTimeout(r, 800));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    // Use narrower content width to enforce margins
    const margin = 30;
    const contentWidth = pdfWidth - (margin * 2);

    await new Promise<void>((resolve, reject) => {
      pdf.html(container, {
        callback: (doc) => {
          try {
            const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
            doc.save(`Corrected_${fileName.replace(/\.[^/.]+$/, '')}_${timestamp}.pdf`);
            resolve();
          } catch (e) {
            reject(e);
          }
        },
        x: margin,
        y: margin,
        width: contentWidth,
        windowWidth: 700,
        autoPaging: 'text',
        html2canvas: {
          scale: 2,
          logging: false,
          useCORS: true,
          scrollY: 0,
          windowWidth: 700,
          letterRendering: true, // Try to fix text spacing
        }
      });
    });

    document.body.removeChild(container);

  } catch (error) {
    console.error("HTML to PDF Export Error:", error);
    alert("PDF generation failed. Please try 'Original Format' or 'HTML' export.");
    throw error;
  }
};

export const exportCorrectedDocument = async (
  originalBase64: string,
  issues: Issue[],
  fileName: string,
  editedContent?: string,
  mimeType?: string,
  analysisId?: string,
  format: 'original' | 'html' | 'pdf' | 'docx' = 'original'
): Promise<void> => {
  try {
    // If we have edited content and format is PDF, HTML, or DOCX, use the CLIENT-SIDE export
    if ((format === 'html' || format === 'pdf' || format === 'docx') && editedContent) {
      if (format === 'html') {
        const blob = new Blob([editedContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Corrected_${fileName}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      if (format === 'pdf') {
        await exportHtmlAsPdf(editedContent, fileName);
        return;
      }

      if (format === 'docx') {
        await exportHtmlAsDocx(editedContent, fileName);
        return;
      }
    }
    // Check file type
    const isWord = isWordFile(mimeType || '') ||
      fileName.toLowerCase().endsWith('.docx') ||
      fileName.toLowerCase().endsWith('.doc');

    const isPDF = isPDFFile(mimeType || '') || fileName.toLowerCase().endsWith('.pdf');
    const fixedIssues = issues.filter(i => i.isFixed);

    // Validate export conditions (relaxed for edit mode export)
    if (!isWord && fixedIssues.length === 0 && format !== 'html' && !editedContent) {
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

    // Strategy Selection
    if (format === 'html' || (isWord && format === 'original')) {
      // Export as Word-compatible HTML
      await exportWordDocument(fileName, issues, editedContent, analysisId);
    }
    else if (format === 'pdf' || (isPDF && format === 'original')) {
      // PREFER HTML-TO-PDF export if we have edited content (User wants the "Corrected View")
      if (editedContent) {
        await exportHtmlAsPdf(editedContent, fileName);
      }
      // If no edited content but we have PDF, annotate the original
      else if (isPDF) {
        await exportPDFDocument(originalBase64, issues, fileName);
      }
      // Fallback: Word/HTML export
      else {
        await exportWordDocument(fileName, issues, editedContent, analysisId);
      }
    }
    else {
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