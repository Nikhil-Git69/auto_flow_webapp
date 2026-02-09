import React, { useState, useEffect, useRef } from 'react';
import { UploadedFile, DocumentAnalysis, Issue, isWordFile, isPDFFile } from '../types';
import { PDFDocument, rgb } from 'pdf-lib';
import IssueCard from './IssueCard';
import Stats from './Stats';
import AIChatSidebar from './AIChatSidebar';
import { Editor } from '@tinymce/tinymce-react';
import {
  ArrowLeft, CheckCircle, Download, FileText, Filter,
  Loader2, FileEdit, FileDown, Info, Ruler, AlignLeft,
  Type, Space, Layout, AlertTriangle, Check, X, Eye, Sparkles
} from 'lucide-react';
import { exportCorrectedDocument as runExportService } from '../services/exportService';
import { analysisApi } from '../services/api';

interface AnalysisViewProps {
  file: UploadedFile;
  analysis: DocumentAnalysis;
  onBack: () => void;
}

// Define a local issue type that includes customFormatIssue
interface EnhancedIssue extends Issue {
  isFixed?: boolean;
  customFormatIssue?: boolean;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ file, analysis, onBack }) => {
  const [issues, setIssues] = useState<EnhancedIssue[]>(analysis.issues.map(issue => ({
    ...issue,
    isFixed: issue.isFixed || false,
    customFormatIssue: issue.customFormatIssue || false
  })));
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'TOPOLOGY' | 'SPACING' | 'TYPOGRAPHY' | 'GRAMMAR' | 'CUSTOM_FORMAT'>('ALL');
  const [isExporting, setIsExporting] = useState(false);
  const [editedContent, setEditedContent] = useState<string>(file.textContent || '');
  const [exportFormat, setExportFormat] = useState<'original' | 'pdf' | 'html' | 'docx'>('original'); // Added docx
  const [showFormatInfo, setShowFormatInfo] = useState(false);
  const [showTopologyMetrics, setShowTopologyMetrics] = useState(true);
  const [isChatProcessing, setIsChatProcessing] = useState(false);

  // Ref for TinyMCE editor instance
  const editorRef = useRef<any>(null);

  // Derived state
  const isWord = isWordFile(file.mimeType);
  const isPDF = isPDFFile(file.mimeType);



  // View mode state (Preview vs Edit)
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>(isWord ? 'edit' : 'preview');

  const fixedCount = issues.filter(i => i.isFixed).length;

  // Local analysis state to support updates from re-analysis
  const [localAnalysis, setLocalAnalysis] = useState<DocumentAnalysis>(analysis);
  const [highlightedPdfUrl, setHighlightedPdfUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync prop changes
  useEffect(() => {
    setLocalAnalysis(analysis);
  }, [analysis]);

  // Synchronize state if analysis changes
  useEffect(() => {
    setIssues(localAnalysis.issues.map(issue => ({
      ...issue,
      isFixed: issue.isFixed || false,
      customFormatIssue: issue.customFormatIssue || false
    })));
  }, [localAnalysis]);

  // Initialize edited content with highlights or corrected text
  useEffect(() => {
    // If we have auto-corrected content from backend, use it directly
    if (analysis.correctedContent && !editedContent) {
      setEditedContent(analysis.correctedContent);
      return;
    }

    // Determine base content from other sources if not already set
    if (!editedContent) {
      let baseContent = analysis.processedContent || file.textContent || '';

      // Only highlight if NOT fixed (but if using processedContent, we imply we might want highlights)
      // If backend returned isFixed=true for everything, highlightErrors will return clear text anyway 
      // UNLESS we want to show what WAS fixed.
      // For "Instant Correction", showing clean text is usually the goal.

      if (baseContent) {
        // If we don't have correctedContent but have issues, try to highlight
        const highlighted = highlightErrors(baseContent, issues);
        setEditedContent(highlighted);
      }
    }
  }, [file.textContent, analysis.processedContent, analysis.correctedContent, issues]);

  // Initialize PDF with corrected version if available
  useEffect(() => {
    if (analysis.correctedPdfBase64 && !highlightedPdfUrl) {
      setHighlightedPdfUrl(`data:application/pdf;base64,${analysis.correctedPdfBase64}`);
    }
  }, [analysis.correctedPdfBase64]);


  // Calculate metrics
  const topologyIssues = issues.filter(i =>
    i.type === 'Layout' || i.type === 'Margin' || i.type === 'Spacing' ||
    i.type === 'Alignment' || i.type === 'Indentation'
  );

  // Helper function to inject highlights
  const highlightErrors = (content: string, issueList: EnhancedIssue[]) => {
    if (!content) return '';
    let processedContent = content;

    // Sort issues by length of originalText (descending) to avoid partial replacements overlapping weirdly
    // This is a simple heuristic; a robust one would track indices.
    const sortedIssues = [...issueList].sort((a, b) =>
      (b.originalText?.length || 0) - (a.originalText?.length || 0)
    );

    sortedIssues.forEach(issue => {
      if (!issue.isFixed && issue.originalText) {
        // Create a precise regex to find the text
        // calculating "context" might be hard if not provided, but we assume exact match for now.
        // We escape special regex characters in the original text
        const escapedText = issue.originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Construct the replacement span
        // We use a specific class or inline style. Inline style is safer for TinyMCE preservation sometimes.
        const fileType = file.mimeType.toLowerCase();
        // Light red background, red underline, and a data attribute for ID
        const highlightStyle = "background-color: rgba(254, 202, 202, 0.5); border-bottom: 2px solid #ef4444; cursor: pointer;";
        const replacement = `<span id="issue-${issue.id}" style="${highlightStyle}" title="${issue.description}" data-issue-id="${issue.id}">${issue.originalText}</span>`;

        // Simple replacement - replace the FIRST occurrence to minimize false positives if context is missing
        // If we had context, we'd use it.
        // For HTML content, we need to be careful not to break tags. 
        // This is a naive implementation; for complex HTML, DOM parsing is better.
        // But since this is likely simple extracted text or HTML, this might suffice.

        // Check if it's already highlighted
        if (!processedContent.includes(`data-issue-id="${issue.id}"`)) {
          processedContent = processedContent.replace(issue.originalText, replacement);
        }
      }
    });

    return processedContent;
  };

  const spacingIssues = issues.filter(i => i.type === 'Spacing');
  const alignmentIssues = issues.filter(i => i.type === 'Alignment');
  const typographyIssues = issues.filter(i => i.type === 'Typography');
  const customFormatIssues = issues.filter(i => i.customFormatIssue);

  // Custom format analysis
  const isCustomFormat = analysis.formatType === 'custom' || analysis.analysisType?.includes('custom_format');
  const formatRequirements = analysis.formatRequirements || '';

  // Extract requirements for display
  const extractRequirements = (req: string) => {
    const requirements: Record<string, string> = {};
    if (!req) return requirements;

    const lines = req.split('\n');
    lines.forEach(line => {
      const match = line.match(/([^:]+):\s*(.+)/i);
      if (match) {
        requirements[match[1].trim()] = match[2].trim();
      }
    });
    return requirements;
  };

  const requirements = extractRequirements(formatRequirements);
  const hasFontRequirement = requirements['Font'] || requirements['font'];
  const hasSpacingRequirement = requirements['Spacing'] || requirements['spacing'];
  const hasMarginRequirement = requirements['Margins'] || requirements['margins'];

  // Check custom format compliance
  const hasFontMismatch = typographyIssues.some(issue =>
    issue.description?.includes('FONT MISMATCH') ||
    issue.description?.toLowerCase().includes('font mismatch')
  );

  const customFormatScore = analysis.totalScore || 0;
  const isFormatCompliant = customFormatScore >= 80;
  const isPartiallyCompliant = customFormatScore >= 60 && customFormatScore < 80;
  const isNonCompliant = customFormatScore < 60;

  const handleApplyFix = (id: string, suggestedFix?: string) => {
    const updatedIssues = issues.map(issue =>
      issue.id === id ? { ...issue, isFixed: true } : issue
    );
    setIssues(updatedIssues);

    if (isWordFile(file.mimeType)) {
      const issue = issues.find(i => i.id === id);
      if (issue && (issue.correctedText || suggestedFix)) {
        const fixText = issue.correctedText || suggestedFix || '';
        if (issue.originalText && fixText) {
          let updated = editedContent;

          // Try to find and replace the highlighted span first
          // We look for a span with the specific data-issue-id
          const spanRegex = new RegExp(`<span[^>]*data-issue-id="${id}"[^>]*>([\\s\\S]*?)<\\/span>`, 'g');

          if (spanRegex.test(updated)) {
            updated = updated.replace(spanRegex, fixText);
          } else {
            // Fallback to simple text replacement if highlight isn't found
            updated = updated.replace(issue.originalText, fixText);
          }

          setEditedContent(updated);

          // Update TinyMCE
          if (editorRef.current) {
            editorRef.current.setContent(updated);
          }
        }
      }
    }
  };

  const handleApplyAll = () => {
    const updatedIssues = issues.map(issue => ({ ...issue, isFixed: true }));
    setIssues(updatedIssues);

    if (isWordFile(file.mimeType)) {
      let updated = editedContent;
      issues.forEach(issue => {
        if (issue.correctedText && issue.originalText) {
          // Try to find and replace the highlighted span first
          const spanRegex = new RegExp(`<span[^>]*data-issue-id="${issue.id}"[^>]*>([\\s\\S]*?)<\\/span>`, 'g');

          if (spanRegex.test(updated)) {
            updated = updated.replace(spanRegex, issue.correctedText);
          } else {
            updated = updated.replace(issue.originalText, issue.correctedText);
          }
        }
      });
      setEditedContent(updated);

      // Update TinyMCE
      if (editorRef.current) {
        editorRef.current.setContent(updated);
      }
    }
  };

  const handleExport = async (format?: 'original' | 'pdf' | 'html' | 'docx') => {
    const fixedCount = issues.filter(i => i.isFixed).length;
    const isWord = isWordFile(file.mimeType);
    // Allow export if we are in edit mode or if fixes are applied
    const allowExport = isWord || viewMode === 'edit' || fixedCount > 0;

    if (!allowExport) {
      alert("Please fix (click 'Apply Fix') at least one issue or switch to 'Edit Text' mode before exporting.");
      return;
    }

    setIsExporting(true);
    try {
      // If we are in "Edit Mode" (Text Editor), we want to export the TEXT (even for PDF)
      // If we are in "Preview Mode" (PDF Viewer), we want to export the PDF with highlights (Server-side)
      // For Word docs, we usually want text export if edited.

      // If we are exporting to DOCX, PDF, or HTML, we generally want the client-side generator 
      // which uses the current edited content.
      const shouldUseClientExport =
        viewMode === 'edit' ||
        !analysis.analysisId ||
        format === 'docx' ||
        format === 'pdf' ||
        format === 'html';

      if (!shouldUseClientExport && analysis.analysisId) {
        const fixedIssueIds = issues.filter(i => i.isFixed).map(i => i.id);

        if (fixedIssueIds.length === 0) {
          alert("Please fix at least one issue before exporting.");
          setIsExporting(false);
          return;
        }

        await analysisApi.exportCorrected(analysis.analysisId, fixedIssueIds);
      } else {
        await runExportService(
          file.base64,
          issues,
          file.file.name,
          editedContent,
          file.mimeType,
          analysis.analysisId,
          format || exportFormat // Use the passed format (like 'docx' from button) or the dropdown state
        );
      }
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleEditorChange = (content: string) => {
    setEditedContent(content);
  };

  // AI Chat Handlers
  const handleAIChatMessage = async (message: string) => {
    setIsChatProcessing(true);
    try {
      // Get document content with multiple fallbacks
      let documentContent = editedContent || analysis.processedContent || file.textContent || '';

      // If still empty, try to get from editor directly
      if (!documentContent && editorRef.current) {
        documentContent = editorRef.current.getContent({ format: 'text' });
      }

      console.log('📄 Document content length:', documentContent.length);

      const context = {
        documentContent: documentContent,
        issues: issues.filter(i => !i.isFixed),
        analysisSummary: analysis.summary
      };
      const response = await analysisApi.chat(message, context);

      // Check if AI response contains corrected text
      if (response.correctedText) {
        // Apply the correction to the editor
        setEditedContent(response.correctedText);
        if (editorRef.current) {
          editorRef.current.setContent(response.correctedText);
        }

        // Notify user via chat
        window.dispatchEvent(new CustomEvent('ai-response', {
          detail: response.message || '✅ Document corrected! All changes have been applied to the editor.'
        }));
      } else {
        // Regular chat response
        window.dispatchEvent(new CustomEvent('ai-response', {
          detail: response.message || response.reply || 'Analysis complete!'
        }));
      }

    } catch (error) {
      console.error("Chat error", error);
      window.dispatchEvent(new CustomEvent('ai-response', { detail: "Sorry, I encountered an error connecting to the server." }));
    } finally {
      setIsChatProcessing(false);
    }
  };

  // PDF Highlighting Effect
  useEffect(() => {
    const generateHighlights = async () => {
      // If we already have a backend-corrected PDF, don't regenerate local highlights
      if (analysis.correctedPdfBase64 || !isPDFFile(file.mimeType) || isWord) return;

      try {
        // Fetch the PDF data
        // const pdfBytes = await fetch(file.previewUrl).then(res => res.arrayBuffer());
        // const pdfDoc = await PDFDocument.load(pdfBytes);
        // const pages = pdfDoc.getPages();

        // Filter active issues that have position data
        // IMPROVEMENT: Filter out suspiciously large boxes (e.g. >90% width AND height) which are usually hallucinations
        // const issuesToHighlight = issues.filter(i =>
        //   !i.isFixed && i.position && (i.position.width > 0 || i.position.height > 0) &&
        //   !(i.position.width > 95 && i.position.height > 95) // Ignore full-page boxes
        // );

        // issuesToHighlight.forEach(issue => {
        //   if (!issue.position) return;
        //   const pageIndex = (issue.pageNumber || 1) - 1;
        //   if (pageIndex < 0 || pageIndex >= pages.length) return;

        //   const page = pages[pageIndex];
        //   const { width, height } = page.getSize();
        //   const { top, left, width: w, height: h } = issue.position;

        //   // Determine color based on severity or type
        //   let color = rgb(1, 1, 0); // Yellow default
        //   if (issue.severity === 'Critical') color = rgb(1, 0, 0); // Red
        //   else if (issue.type === 'Margin') color = rgb(1, 0.5, 0); // Orange
        //   else if (issue.type === 'Typography') color = rgb(0.5, 0, 0.5); // Purple

        //   // Draw highlight rectangle (PDF coordinates are bottom-left origin usually, but pdf-lib handles it)
        //   // Note: HTML/CSS top is from top, PDF y is from bottom.
        //   page.drawRectangle({
        //     x: (left / 100) * width,
        //     y: height - ((top / 100) * height) - ((h / 100) * height),
        //     width: (w / 100) * width,
        //     height: (h / 100) * height,
        //     color: color,
        //     opacity: 0.2, // Faint fill
        //     borderColor: color, // Strong outline
        //     borderWidth: 2, // Visible border
        //   });
        // });

        // const base64Pdf = await pdfDoc.saveAsBase64({ dataUri: true });
        // setHighlightedPdfUrl(base64Pdf);
        setHighlightedPdfUrl(null); // Force no highlights
      } catch (error) {
        console.error("Error highlighting PDF:", error);
      }
    };

    generateHighlights();
  }, [file, issues, isWord]);

  // Handle Template Selection from Sidebar
  useEffect(() => {
    const handleTemplateSelect = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const templateName = customEvent.detail;

      console.log("Applying template:", templateName);
      setIsAnalyzing(true);

      try {
        // Re-analyze with the selected format type
        // Use the API to upload existing file content but with new format type
        // NOTE: We need the original file for re-upload. If we only have the blob from `file`, we use that.

        let fileToUpload = file.file;

        // If file.file is missing (e.g. page refresh), we might need to rely on what we have or show error
        if (!fileToUpload && file.base64) {
          // Convert base64 back to file if needed, or handle gracefully 
          // For now assuming file.file is available from props/state
        }

        if (!fileToUpload) {
          console.error("No file object available for re-analysis");
          return;
        }

        const response = await analysisApi.uploadFile(
          fileToUpload,
          analysis.userId || 'anonymous',
          templateName, // formatType
          undefined, // templateFile (none)
          '' // requirements (implicit in formatType)
        );

        if (response.success && response.data) {
          const newAnalysis = response.data;

          // CRITICAL: Update local state to reflect new scores and content
          setLocalAnalysis({
            ...analysis, // Keep original IDs etc
            ...newAnalysis, // Overwrite with new analysis data
            issues: newAnalysis.issues || [],
            totalScore: newAnalysis.totalScore,
            summary: newAnalysis.summary,
            formatType: templateName,
            correctedContent: newAnalysis.correctedContent,
            correctedPdfBase64: newAnalysis.correctedPdfBase64,
            metadata: newAnalysis.metadata
          });

          // Force update of issues state
          setIssues((newAnalysis.issues || []).map((issue: Issue) => ({
            ...issue,
            isFixed: false,
            customFormatIssue: issue.customFormatIssue || false
          })));

          // Show success message
          const baseMsg = `✅ Applied ${templateName.toUpperCase()} template. Score updated to ${newAnalysis.totalScore}/100.`;
          const largeDocMsg = newAnalysis.metadata?.isLargeDocument ? " ⚠️ Large document: Full auto-correction skipped." : "";

          window.dispatchEvent(new CustomEvent('ai-response', {
            detail: baseMsg + largeDocMsg
          }));

          // If we have corrected content, switch to it and show "Corrected" mode
          if (newAnalysis.correctedContent) {
            setEditedContent(newAnalysis.correctedContent);
            setViewMode('edit');
            // Show success message with explicit mention of full correction
            window.dispatchEvent(new CustomEvent('ai-response', {
              detail: `✅ Applied ${templateName.toUpperCase()} template. Full text correction loaded.`
            }));
          } else if (newAnalysis.metadata?.isLargeDocument) {
            // Large document case: No corrected content, but we should switch to edit mode anyway (showing original text)
            // and warn the user
            alert("⚠️ Large Document Detected\n\nFull AI text correction is disabled for large documents to prevent errors. You can still see issues and edit the text manually.");
            setEditedContent(file.textContent || "");
            setViewMode('edit');
          } else if (newAnalysis.correctedPdfBase64) {
            setHighlightedPdfUrl(`data:application/pdf;base64,${newAnalysis.correctedPdfBase64}`);
            setViewMode('edit');
          }
        }

      } catch (error: any) {
        console.error("Template application failed:", error);
        window.dispatchEvent(new CustomEvent('ai-response', {
          detail: `❌ Failed to apply template: ${error.message}`
        }));
      } finally {
        setIsAnalyzing(false);
      }
    };

    window.addEventListener('template-select', handleTemplateSelect);
    return () => window.removeEventListener('template-select', handleTemplateSelect);
  }, [file, localAnalysis, editedContent, highlightedPdfUrl]);

  const handleTemplateUpload = async (templateFile: File) => {
    console.log("Template Uploaded:", templateFile.name);
    setIsAnalyzing(true);
    try {
      // Re-analyze using the existing file and the new template
      const response = await analysisApi.uploadFile(
        file.file,
        analysis.userId || 'anonymous',
        'custom',
        templateFile,
        '' // optional text requirements
      );

      if (response.success && response.data) {
        // Update local analysis state to reflect new results
        const newAnalysis = response.data;
        // Map API response to DocumentAnalysis type if needed (or just cast if it matches)
        // We need to ensure we don't lose the ID or other metadata

        // Update local state
        setLocalAnalysis({
          ...localAnalysis,
          totalScore: newAnalysis.totalScore,
          issues: newAnalysis.issues,
          summary: newAnalysis.summary,
          formatType: 'custom',
          // preserve other fields
        });

        const largeDocMsg = newAnalysis.metadata?.isLargeDocument
          ? " ⚠️ Large document: Full auto-correction skipped."
          : "";
        alert(`Analysis updated using template: ${templateFile.name}.${largeDocMsg}`);

        // If we have corrected content, switch to it immediately
        if (newAnalysis.correctedContent) {
          setEditedContent(newAnalysis.correctedContent);
          setViewMode('edit');
        } else if (newAnalysis.metadata?.isLargeDocument) {
          setEditedContent(file.textContent || "");
          setViewMode('edit');
        }
      }
    } catch (error: any) {
      console.error("Template analysis failed:", error);
      alert(`Failed to analyze with template: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enhanced filtering
  const filteredIssues = issues.filter(i => {
    if (filter === 'CRITICAL') return i.severity === 'Critical';
    if (filter === 'TOPOLOGY') return ['Layout', 'Margin', 'Spacing', 'Alignment', 'Indentation'].includes(i.type);
    if (filter === 'SPACING') return i.type === 'Spacing';
    if (filter === 'TYPOGRAPHY') return i.type === 'Typography';
    if (filter === 'GRAMMAR') return ['Grammar', 'Spelling'].includes(i.type);
    if (filter === 'CUSTOM_FORMAT') return i.customFormatIssue || (
      (i.type === 'Typography' && hasFontRequirement) ||
      (i.type === 'Margin' && hasMarginRequirement) ||
      (i.type === 'Spacing' && hasSpacingRequirement)
    );
    return true;
  });

  const geminiModel = analysis.geminiModel || 'gemini-2.5-flash';
  const analysisType = analysis.analysisType || 'standard';

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center z-20 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {isWord ? <FileEdit className="w-5 h-5 text-blue-600" /> :
                isPDF ? <FileText className="w-5 h-5 text-red-600" /> :
                  <FileText className="w-5 h-5 text-indigo-600" />}
              {file.file.name}


            </h1>
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-500 font-medium">
                Document Score: <span className={localAnalysis.totalScore > 70 ? "text-green-600" : "text-orange-600"}>{localAnalysis.totalScore || 0}/100</span>
              </p>
              {isWord && (
                <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                  Editable Word Document
                </span>
              )}

              {/* SLIDING TOGGLE: Original vs Corrected */}
              <div className="relative flex bg-slate-100 rounded-lg p-1 ml-4 border border-slate-200 shadow-inner w-64">
                {/* Background Sliding Pill */}
                <div
                  className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[#159e8a] rounded-md shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${viewMode === 'edit'
                    ? 'translate-x-[100%]'
                    : 'translate-x-0'
                    }`}
                />

                {/* Original Button */}
                <button
                  onClick={() => {
                    if (isWord || viewMode === 'edit') {
                      // Switch to Original view
                      if (isWord) {
                        // Reset content to original
                        setEditedContent(file.textContent || '');
                      } else {
                        setHighlightedPdfUrl(null);
                      }
                      setViewMode('preview');
                    }
                  }}
                  className={`relative z-10 flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-300 ${viewMode !== 'edit'
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Original
                </button>

                {/* Corrected Button */}
                <button
                  onClick={() => {
                    if (viewMode !== 'edit') {
                      // Switch to Edit/Corrected view
                      if (analysis.correctedContent) {
                        setEditedContent(analysis.correctedContent);
                      }
                      if (isPDF && analysis.correctedPdfBase64) {
                        setHighlightedPdfUrl(`data:application/pdf;base64,${analysis.correctedPdfBase64}`);
                      }
                      setViewMode('edit');
                    }
                  }}
                  className={`relative z-10 flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-300 flex items-center justify-center gap-1.5 ${viewMode === 'edit'
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {viewMode === 'edit' ? (
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-[#159e8a]" />
                  )}
                  AI Corrected
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => handleExport('docx')}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#159e8a] text-white rounded-lg hover:bg-[#128a78] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileEdit className="w-4 h-4" />
            )}
            Open in Word
          </button>



          <button
            onClick={handleApplyAll}
            className="px-4 py-2 border border-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all"
          >
            {isWord ? "Apply All AI Fixes" : "Auto-Fix All"}
          </button>

        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      < div className="flex flex-1 overflow-hidden" >
        {/* Left Column: AI Chat Sidebar */}
        < div className="flex-shrink-0 z-10 h-full" >
          <AIChatSidebar
            onSendMessage={handleAIChatMessage}
            onUploadTemplate={handleTemplateUpload}
            isProcessing={isChatProcessing}
          />
        </div >

        {/* Center Column: Document Editor */}
        < div className="flex-1 bg-slate-100 p-6 overflow-hidden flex-col items-center flex" >
          {/* Toolbar Area (if external) or just spacing */}

          < div className="w-full max-w-4xl bg-white shadow-xl h-full flex flex-col rounded-lg overflow-hidden border border-slate-200" >
            {viewMode === 'edit' ? (
              <Editor
                apiKey="1z3mdsuht8wx9ofpy5jda5zlj725bnfa3n4vnzh6tdaa7dc6"
                onInit={(evt, editor) => editorRef.current = editor}
                initialValue={editedContent || (analysis.processedContent || file.textContent || "")}
                init={{
                  height: '100%',
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:14px; padding: 2rem; }',
                  branding: false,
                  statusbar: true,
                  promotion: false,
                }}
                onEditorChange={handleEditorChange}
              />
            ) : (
              <div className="flex-1 overflow-auto p-8 scroll-smooth overscroll-contain">
                {file.mimeType.startsWith('image/') ? (
                  <img src={file.previewUrl} alt="Preview" className="w-full h-auto" />
                ) : (
                  <object
                    data={file.previewUrl} // Always show original for now
                    type="application/pdf"
                    className="w-full h-full min-h-[800px]"
                  >
                    <iframe src={file.previewUrl} className="w-full h-full" title="pdf-viewer" />
                  </object>
                )}
              </div>
            )}
          </div >
        </div >

        {/* Right Column: Existing Analysis Sidebar */}
        < div className="w-[480px] bg-white border-l border-slate-200 flex flex-col h-full shadow-xl flex-shrink-0 z-10" >
          {/* Scrollable top section */}
          < div className="border-b border-slate-100 overflow-hidden flex-shrink-0" style={{ maxHeight: '40%' }}>
            <div className="h-full overflow-y-auto p-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs uppercase tracking-widest font-bold text-slate-400">
                  {isCustomFormat ? 'Custom Format Analysis' : 'Analysis Summary'}
                </h2>
              </div>

              {/* METADATA TABLE - NEW */}
              {analysis.metadata && (analysis.metadata.company || analysis.metadata.date || analysis.metadata.type) && (
                <div className="mb-4 bg-white rounded-lg border border-slate-200 overflow-hidden text-xs">
                  <div className="bg-slate-50 px-3 py-2 font-semibold border-b border-slate-200 text-slate-700">
                    Document Metadata
                  </div>
                  <div className="p-3 space-y-2">
                    {analysis.metadata.company && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Entity:</span>
                        <span className="font-medium text-slate-800">{analysis.metadata.company}</span>
                      </div>
                    )}
                    {analysis.metadata.date && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Date:</span>
                        <span className="font-medium text-slate-800">{analysis.metadata.date}</span>
                      </div>
                    )}
                    {analysis.metadata.type && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Type:</span>
                        <span className="font-medium text-slate-800">{analysis.metadata.type}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quality Score */}
              <div className="mb-4">
                <Stats issues={issues} score={analysis.totalScore || 0} isCustomFormat={isCustomFormat} />
              </div>

              {/* Enhanced AI Summary */}
              <div className={`rounded-lg p-3 border ${isCustomFormat ? 'bg-purple-50 border-purple-100' :
                analysisType.includes('topology') ? 'bg-amber-50 border-amber-100' :
                  'bg-indigo-50 border-indigo-100'
                }`}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3 h-3 text-indigo-700" />
                  <h3 className="text-xs font-bold text-indigo-900">AI Overview</h3>
                </div>
                <div className="overflow-y-auto max-h-32">
                  <p className="text-sm leading-relaxed text-indigo-800">
                    {analysis.summary || 'No summary available'}
                  </p>
                </div>
              </div>
            </div>
          </div >

          {/* Detailed Issues */}
          < div className="flex-1 overflow-hidden flex flex-col" >
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-white">
              <h2 className="font-bold text-slate-700 flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                Issues
                <span className="text-xs font-normal bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  {filteredIssues.length} found
                </span>
              </h2>
              <select
                className="text-sm border border-slate-200 rounded px-2 py-1 outline-none bg-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="ALL">All Issues</option>
                <option value="CRITICAL">Critical Only</option>
                {/* Add other filters as needed */}
              </select>
            </div>

            {/* Scrollable issues list */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-3">
                {filteredIssues.map(issue => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onApplyFix={handleApplyFix}
                    isWordFile={isWord}
                    isCustomFormat={isCustomFormat}
                    isTopologyIssue={['Layout', 'Margin', 'Spacing', 'Alignment', 'Indentation'].includes(issue.type)}
                    customFormatIssue={issue.customFormatIssue}
                  />
                ))}
              </div>
            </div>
          </div >
        </div >
      </div >
    </div >
  );
};

export default AnalysisView;