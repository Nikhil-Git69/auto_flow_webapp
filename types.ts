// export enum IssueSeverity {
//   CRITICAL = 'Critical',
//   RECOMMENDED = 'Recommended',
//   COSMETIC = 'Cosmetic'
// }

// export enum IssueType {
//   LAYOUT = 'Layout',
//   GRAMMAR = 'Grammar',
//   ACCESSIBILITY = 'Accessibility',
//   STRUCTURE = 'Structure'
// }

// export interface Issue {
//   id: string;
//   type: IssueType;
//   severity: IssueSeverity;
//   description: string;
//   suggestion: string;
//   location?: string;
//   isFixed?: boolean;
//   // Make sure these match the names used in exportService
//   position?: {
//     top: number;
//     left: number;
//     width: number;
//     height: number;
//   };
// }

// export interface CorrectedDocument{
//   originalFileName: string;
//   correctedFileName: string;
//   fileContent: string; // base64
//   mimeType: string;
//   fixesApplied: number;
//   totalIssues: number;
// }


// export interface DocumentAnalysis {
//   fileName: string;
//   fileType: string;
//   uploadDate: string;
//   totalScore: number; // 0 to 100
//   issues: Issue[];
//   summary: string;
// }

// export interface UploadedFile {
//   file: File;
//   previewUrl: string;
//   base64: string;
//   mimeType: string;
// }

// export enum AppState {
//   LOGIN = 'LOGIN',
//   DASHBOARD = 'DASHBOARD',
//   ANALYSIS = 'ANALYSIS',
//   SETTINGS = 'SETTINGS',
//   HOME = 'home'
// }


// // ========== UPDATED USER INTERFACE ==========
// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   collegeName: string;
//   logoUrl?: string; // Optional logo for the college
  
//   // NEW: Optional properties for enhanced functionality
//   role?: 'student' | 'teacher' | 'admin'; // For role-based access
//   studentId?: string; // For students
//   department?: string; // For teachers
//   isActive?: boolean; // Account status
//   lastLogin?: string; // Last login timestamp
//   createdAt?: string; // Account creation date
//   updatedAt?: string; // Last update date
  
//   // Compatibility with backend _id (MongoDB)
//   _id?: string;
// }

// // ========== NEW TYPE FOR BACKEND RESPONSES ==========
// export interface ApiResponse<T = any> {
//   success: boolean;
//   message: string;
//   data?: T;
//   error?: string;
//   details?: any;
// }

// // ========== NEW TYPE FOR AUTH RESPONSES ==========
// export interface AuthResponse {
//   user: User;
//   token: string;
// }

// // ========== NEW TYPE FOR REGISTRATION ==========
// export interface RegisterData {
//   email: string;
//   password: string;
//   name: string;
//   collegeName: string;
//   role?: 'student' | 'teacher' | 'admin';
//   studentId?: string;
//   department?: string;
//   logoUrl?: string;
// }

// // ========== NEW TYPE FOR ANALYSIS STATISTICS ==========
// export interface AnalysisStats {
//   totalAnalyses: number;
//   averageScore: number;
//   highestScore: number;
//   lowestScore: number;
//   totalIssues: number;
//   fileTypeBreakdown: Array<{
//     fileType: string;
//     count: number;
//     avgScore: number;
//   }>;
// }

// // ========== NEW TYPE FOR PAGINATION ==========
// export interface Pagination<T = any> {
//   data: T[];
//   page: number;
//   limit: number;
//   total: number;
//   pages: number;
//   hasNext: boolean;
//   hasPrev: boolean;
// }

// // ========== NEW TYPE FOR FILTERING ==========
// export interface AnalysisFilters {
//   userId?: string;
//   fileType?: string;
//   minScore?: number;
//   maxScore?: number;
//   page?: number;
//   limit?: number;
//   search?: string;
// }

// // ========== HELPER TYPES FOR COMPATIBILITY ==========
// // This ensures backward compatibility
// export type UserWithRole = User & { role: 'student' | 'teacher' | 'admin' };
// export type StudentUser = User & { role: 'student'; studentId: string };
// export type TeacherUser = User & { role: 'teacher'; department: string };
// export enum IssueSeverity {
//   CRITICAL = 'Critical',
//   RECOMMENDED = 'Recommended',
//   COSMETIC = 'Cosmetic'
// }

// export enum IssueType {
//   LAYOUT = 'Layout',
//   GRAMMAR = 'Grammar',
//   ACCESSIBILITY = 'Accessibility',
//   STRUCTURE = 'Structure'
// }

// export interface Issue {
//   id: string;
//   type: IssueType;
//   severity: IssueSeverity;
//   description: string;
//   suggestion: string;
//   location?: string;
//   isFixed?: boolean;
//   position?: {
//     top: number;
//     left: number;
//     width: number;
//     height: number;
//   };
//   // NEW: For Word document editing
//   originalText?: string;
//   correctedText?: string;
//   context?: string;
//   startIndex?: number;
//   endIndex?: number;
// }

// export interface CorrectedDocument{
//   originalFileName: string;
//   correctedFileName: string;
//   fileContent: string; // base64
//   mimeType: string;
//   fixesApplied: number;
//   totalIssues: number;
// }

// export interface DocumentAnalysis {
//   analysisId: string;
//   fileName: string;
//   fileType: string;
//   uploadDate: string;
//   totalScore: number;
//   issues: AnalysisIssue[];
//   summary: string;
//   // Add these properties that you're trying to use:
//   formatType?: string; // Make it optional if it's not always present
//   processedContent?: string;
//   formatRequirements?: string;
//   // You might also want these from your API response:
//   correctedDocumentUrl?: string;
//   analyzedAt?: string;
//   wordCount?: number;
//   suggestions?: string[];
// }

// export interface UploadedFile {
//   file: File;
//   previewUrl: string;
//   base64: string;
//   mimeType: string;
//   // NEW: Properties for Word document support
//   textContent?: string;
//   rawData?: ArrayBuffer;
//   analysisId?: string; // NEW: To link with backend analysis
// }

// export enum AppState {
//   LOGIN = 'LOGIN',
//   DASHBOARD = 'DASHBOARD',
//   ANALYSIS = 'ANALYSIS',
//   SETTINGS = 'SETTINGS',
//   HOME = 'home'
// }

// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   collegeName: string;
//   logoUrl?: string;
//   role?: 'student' | 'teacher' | 'admin';
//   studentId?: string;
//   department?: string;
//   isActive?: boolean;
//   lastLogin?: string;
//   createdAt?: string;
//   updatedAt?: string;
//   _id?: string;
// }

// export interface ApiResponse<T = any> {
//   success: boolean;
//   message: string;
//   data?: T;
//   error?: string;
//   details?: any;
// }

// export interface AuthResponse {
//   user: User;
//   token: string;
// }

// export interface RegisterData {
//   email: string;
//   password: string;
//   name: string;
//   collegeName: string;
//   role?: 'student' | 'teacher' | 'admin';
//   studentId?: string;
//   department?: string;
//   logoUrl?: string;
// }

// export interface AnalysisStats {
//   totalAnalyses: number;
//   averageScore: number;
//   highestScore: number;
//   lowestScore: number;
//   totalIssues: number;
//   fileTypeBreakdown: Array<{
//     fileType: string;
//     count: number;
//     avgScore: number;
//   }>;
// }

// export interface Pagination<T = any> {
//   data: T[];
//   page: number;
//   limit: number;
//   total: number;
//   pages: number;
//   hasNext: boolean;
//   hasPrev: boolean;
// }

// export interface AnalysisFilters {
//   userId?: string;
//   fileType?: string;
//   minScore?: number;
//   maxScore?: number;
//   page?: number;
//   limit?: number;
//   search?: string;
// }

// export type UserWithRole = User & { role: 'student' | 'teacher' | 'admin' };
// export type StudentUser = User & { role: 'student'; studentId: string };
// export type TeacherUser = User & { role: 'teacher'; department: string };

// // ========== NEW TYPES FOR WORD DOCUMENT SUPPORT ==========
// export enum ExportFormat {
//   PDF = 'pdf',
//   DOCX = 'docx',
//   DOC = 'doc',
//   TXT = 'txt'
// }

// export interface DocumentExportOptions {
//   format: ExportFormat;
//   includeTrackChanges?: boolean;
//   preserveFormatting?: boolean;
//   includeSummary?: boolean;
//   fileName: string;
// }

// export interface WordDocumentContent {
//   html: string;
//   plainText: string;
//   paragraphs: Array<{
//     text: string;
//     style?: string;
//     isHeading?: boolean;
//   }>;
//   metadata: {
//     wordCount: number;
//     pageCount?: number;
//     language: string;
//     author?: string;
//   };
// }

// export interface DocumentEdit {
//   issueId: string;
//   originalText: string;
//   newText: string;
//   timestamp: string;
//   appliedBy: 'user' | 'ai';
//   location?: {
//     paragraphIndex: number;
//     startIndex: number;
//     endIndex: number;
//   };
// }

// export interface FileProcessingResult {
//   success: boolean;
//   fileType: 'pdf' | 'docx' | 'doc' | 'txt' | 'image';
//   content: WordDocumentContent | string;
//   metadata: {
//     size: number;
//     pages?: number;
//     wordCount?: number;
//     language?: string;
//   };
//   error?: string;
// }

// export interface ExportServiceRequest {
//   fileData: string | ArrayBuffer;
//   issues: Issue[];
//   fileName: string;
//   mimeType: string;
//   exportFormat?: ExportFormat;
//   editedContent?: string;
//   includeTrackChanges?: boolean;
//   analysisId?: string; // NEW: Added for backend export
// }

// export interface ExportServiceResponse {
//   success: boolean;
//   downloadUrl: string;
//   fileName: string;
//   fileSize: number;
//   mimeType: string;
//   message?: string;
// }

// // Type guards for checking file types
// export function isWordFile(mimeType: string): boolean {
//   return mimeType.includes('word') || 
//          mimeType.includes('document') ||
//          mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
//          mimeType.includes('application/msword');
// }

// export function isPDFFile(mimeType: string): boolean {
//   return mimeType.includes('pdf') || mimeType.includes('application/pdf');
// }

// export function isEditableFile(mimeType: string): boolean {
//   return isWordFile(mimeType) || 
//          mimeType.includes('text/plain') || 
//          mimeType.includes('text/html');
// }

// export function getFileExtension(filename: string): string {
//   return filename.split('.').pop()?.toLowerCase() || '';
// }

// export function canPreviewInline(mimeType: string): boolean {
//   return isPDFFile(mimeType) || 
//          mimeType.startsWith('image/') || 
//          mimeType.includes('text/');
// }
export enum IssueSeverity {
  CRITICAL = 'Critical',
  MAJOR = 'Major', // ADDED: For topology/alignment issues
  MINOR = 'Minor', // ADDED: For minor spacing/formatting issues
  RECOMMENDED = 'Recommended',
  COSMETIC = 'Cosmetic'
}

export enum IssueType {
  LAYOUT = 'Layout',
  GRAMMAR = 'Grammar',
  ACCESSIBILITY = 'Accessibility',
  STRUCTURE = 'Structure',
  SPELLING = 'Spelling',
  FORMATTING = 'Formatting',
  TYPOGRAPHY = 'Typography',
  CONTENT = 'Content',
  // Add new topology types:
  MARGIN = "Margin",
  SPACING = "Spacing",
  ALIGNMENT = "Alignment",
  INDENTATION = "Indentation",
  FONT_CONSISTENCY = "Font Consistency", // ADDED
  LINE_SPACING = "Line Spacing", // ADDED
  PARAGRAPH_SPACING = "Paragraph Spacing", // ADDED
  BULLET_ALIGNMENT = "Bullet Alignment", // ADDED
  HEADER_FORMATTING = "Header Formatting" // ADDED
}

// Add customFormatIssue to the Issue interface
export interface Issue {
  id: string;
  type: "Layout" | "Typography" | "Grammar" | "Accessibility" | "Content" | "Formatting" | "Spelling" | "Structure" | "Margin" | "Spacing" | "Alignment" | "Indentation";
  severity: "Critical" | "Major" | "Minor";
  description: string;
  suggestion: string;
  location: string;
  pageNumber: number;
  position?: { top: number; left: number; width: number; height: number };
  originalText?: string;
  correctedText?: string;
  visualEvidence?: string;
  measurement?: {
    expected: string;
    actual: string;
    unit: 'px' | 'pt' | 'mm' | 'in' | '%';
  };
  isFixed?: boolean; // If you don't have this already
  customFormatIssue?: boolean; // Add this
}
// AnalysisIssue extends Issue with additional properties
export type AnalysisIssue = Issue & {
  confidence?: number;
  ruleId?: string;
  category?: string;
  suggestedFix?: string;
  // ADDED: Gemini-specific fields
  geminiAnalysis?: boolean;
  visualPosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

// FIXED: DocumentAnalysis interface with proper optional/required fields
export interface DocumentAnalysis {
  analysisId?: string; // Made optional since it might come from backend
  fileName: string;
  fileType: string;
  uploadDate: string;
  totalScore: number;
  issues: AnalysisIssue[];
  summary: string;
  formatType?: string;
  processedContent?: string;
  formatRequirements?: string;
  correctedDocumentUrl?: string;
  analyzedAt?: string;
  wordCount?: number;
  suggestions?: string[];
  fileSize?: number;
  fileData?: any;
  status?: string;
  userId?: string;
  
  // ADDED: Topology analysis fields
  analysisType?: 'standard' | 'topology_focused' | 'visual_analysis' | 'programmatic_fallback';
  geminiModel?: string; 
  pdfStructure?: {
    margins?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    lineSpacingStats?: {
      average: number;
      min: number;
      max: number;
      variance: number;
    };
    paragraphSpacingStats?: {
      average: number;
      min: number;
      max: number;
    };
    textBlocks?: number;
    pagesAnalyzed?: number;
    detectedFont?: string;
  };
  structureAnalysis?: {
    marginCompliance?: number; // 0-100%
    spacingConsistency?: number; // 0-100%
    alignmentScore?: number; // 0-100%
    typographyScore?: number; // 0-100%
    overallTopologyScore?: number; // 0-100%
  };
  visualAnalysisPerformed?: boolean;
  // Add backend properties that might come from API
  _id?: string; // MongoDB ID
  createdAt?: string;
  updatedAt?: string;
}

// NEW: Better match for backend API response
export interface AnalysisApiResponse {
  analysisId: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  totalScore: number;
  issues: AnalysisIssue[];
  summary: string;
  formatType?: string;
  processedContent?: string;
  analyzedAt?: string;
  wordCount?: number;
  fileSize?: number;
  status?: string;
  // ADDED: Topology fields for API response
  analysisType?: string;
  geminiModel?: string;
  pdfStructure?: any;
  structureAnalysis?: any;
}

export interface UploadedFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
  textContent?: string;
  rawData?: ArrayBuffer;
  analysisId?: string;
  // ADDED: For topology analysis
  fileStructure?: {
    isPDF?: boolean;
    isWord?: boolean;
    hasVisualLayout?: boolean;
    estimatedPages?: number;
  };
}

export enum AppState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  ANALYSIS = 'ANALYSIS',
  SETTINGS = 'SETTINGS',
  HOME = 'home'
}

export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  collegeName: string;
  logoUrl?: string;
  role?: 'student' | 'teacher' | 'admin';
  studentId?: string;
  department?: string;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  // ADDED: User preferences for topology analysis
  preferences?: {
    defaultFormatRequirements?: string;
    enableTopologyAnalysis?: boolean;
    preferredFont?: string;
    defaultSpacing?: string;
    defaultMargins?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  collegeName: string;
  role?: 'student' | 'teacher' | 'admin';
  studentId?: string;
  department?: string;
  logoUrl?: string;
  // ADDED: Format preferences during registration
  defaultFormatRequirements?: string;
}

export interface AnalysisStats {
  totalAnalyses: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  totalIssues: number;
  fileTypeBreakdown: Array<{
    fileType: string;
    count: number;
    avgScore: number;
  }>;
  // ADDED: Topology-specific stats
  topologyIssues?: number;
  spacingIssues?: number;
  alignmentIssues?: number;
  marginIssues?: number;
  typographyIssues?: number;
}

export interface Pagination<T = any> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AnalysisFilters {
  userId?: string;
  fileType?: string;
  minScore?: number;
  maxScore?: number;
  page?: number;
  limit?: number;
  search?: string;
  // ADDED: Filter by analysis type
  analysisType?: string;
  issueType?: IssueType | string;
  severity?: IssueSeverity;
}

export type UserWithRole = User & { role: 'student' | 'teacher' | 'admin' };
export type StudentUser = User & { role: 'student'; studentId: string };
export type TeacherUser = User & { role: 'teacher'; department: string };

// ========== NEW TYPES FOR WORD DOCUMENT SUPPORT ==========
export enum ExportFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  DOC = 'doc',
  TXT = 'txt',
  HTML = 'html' // ADDED
}

export interface DocumentExportOptions {
  format: ExportFormat;
  includeTrackChanges?: boolean;
  preserveFormatting?: boolean;
  includeSummary?: boolean;
  fileName: string;
  // ADDED: Topology export options
  highlightTopologyIssues?: boolean;
  includeStructureReport?: boolean;
  preserveLayout?: boolean;
}

export interface WordDocumentContent {
  html: string;
  plainText: string;
  paragraphs: Array<{
    text: string;
    style?: string;
    isHeading?: boolean;
    // ADDED: Topology properties for paragraphs
    alignment?: 'left' | 'right' | 'center' | 'justify';
    indent?: number;
    lineSpacing?: number;
    spacingBefore?: number;
    spacingAfter?: number;
  }>;
  metadata: {
    wordCount: number;
    pageCount?: number;
    language: string;
    author?: string;
    // ADDED: Document structure metadata
    defaultFont?: string;
    defaultFontSize?: number;
    margins?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    lineSpacing?: number;
  };
}

export interface DocumentEdit {
  issueId: string;
  originalText: string;
  newText: string;
  timestamp: string;
  appliedBy: 'user' | 'ai';
  location?: {
    paragraphIndex: number;
    startIndex: number;
    endIndex: number;
  };
  // ADDED: For topology edits
  editType?: 'text' | 'formatting' | 'layout';
  formattingChanges?: {
    font?: string;
    size?: number;
    alignment?: string;
    spacing?: number;
    indent?: number;
  };
}

export interface FileProcessingResult {
  success: boolean;
  fileType: 'pdf' | 'docx' | 'doc' | 'txt' | 'image';
  content: WordDocumentContent | string;
  metadata: {
    size: number;
    pages?: number;
    wordCount?: number;
    language?: string;
    // ADDED: Structure metadata
    detectedFont?: string;
    estimatedMargins?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    lineSpacing?: number;
    paragraphCount?: number;
  };
  error?: string;
  // ADDED: For topology analysis
  structureData?: any;
}

export interface ExportServiceRequest {
  fileData: string | ArrayBuffer;
  issues: Issue[];
  fileName: string;
  mimeType: string;
  exportFormat?: ExportFormat;
  editedContent?: string;
  includeTrackChanges?: boolean;
  analysisId?: string;
  // ADDED: For topology-aware export
  highlightTopologyIssues?: boolean;
  includeStructureReport?: boolean;
  preserveLayout?: boolean;
  appliedFixes?: string[]; // IDs of applied fixes
}

export interface ExportServiceResponse {
  success: boolean;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  message?: string;
  // ADDED: Export metadata
  exportType?: 'corrected' | 'annotated' | 'report';
  includedIssues?: number;
  fixedIssues?: number;
}

// Type guards for checking file types
export function isWordFile(mimeType: string): boolean {
  return mimeType.includes('word') || 
         mimeType.includes('document') ||
         mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
         mimeType.includes('application/msword');
}

export function isPDFFile(mimeType: string): boolean {
  return mimeType.includes('pdf') || mimeType.includes('application/pdf');
}

export function isEditableFile(mimeType: string): boolean {
  return isWordFile(mimeType) || 
         mimeType.includes('text/plain') || 
         mimeType.includes('text/html');
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function canPreviewInline(mimeType: string): boolean {
  return isPDFFile(mimeType) || 
         mimeType.startsWith('image/') || 
         mimeType.includes('text/');
}

// ADDED: Check if file supports topology analysis
export function supportsTopologyAnalysis(mimeType: string): boolean {
  return isPDFFile(mimeType) || isWordFile(mimeType);
}

// ADDED: Check if issue is topology-related
export function isTopologyIssue(issue: Issue): boolean {
  const topologyTypes = [
    IssueType.LAYOUT,
    IssueType.MARGIN,
    IssueType.SPACING,
    IssueType.ALIGNMENT,
    IssueType.INDENTATION,
    IssueType.FONT_CONSISTENCY,
    IssueType.LINE_SPACING,
    IssueType.PARAGRAPH_SPACING,
    IssueType.BULLET_ALIGNMENT,
    IssueType.HEADER_FORMATTING
  ];
  return topologyTypes.includes(issue.type as IssueType);
}

// ADDED: Get topology issue category
export function getTopologyCategory(issueType: IssueType | string): string {
  const categories: Record<string, string> = {
    [IssueType.MARGIN]: 'Margins',
    [IssueType.SPACING]: 'Spacing',
    [IssueType.LINE_SPACING]: 'Spacing',
    [IssueType.PARAGRAPH_SPACING]: 'Spacing',
    [IssueType.ALIGNMENT]: 'Alignment',
    [IssueType.INDENTATION]: 'Indentation',
    [IssueType.BULLET_ALIGNMENT]: 'Alignment',
    [IssueType.TYPOGRAPHY]: 'Typography',
    [IssueType.FONT_CONSISTENCY]: 'Typography',
    [IssueType.HEADER_FORMATTING]: 'Formatting',
    [IssueType.FORMATTING]: 'Formatting',
    [IssueType.LAYOUT]: 'Layout',
    [IssueType.STRUCTURE]: 'Structure'
  };
  return categories[issueType] || 'General';
}

// ADDITIONAL TYPES THAT MIGHT BE NEEDED
export interface UploadFileResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    analysisId: string; // ← This comes from backend
    fileName: string;
    fileType: string;
    analyzedAt?: string;
    totalScore: number;
    issues: AnalysisIssue[];
    summary: string;
    formatType?: string;
    processedContent?: string;
    correctedDocumentUrl?: string;
    wordCount?: number;
    suggestions?: string[];
    uploadDate?: string; // ← Add this if backend returns it
    // ADDED: Topology analysis data
    analysisType?: string;
    geminiModel?: string;
    pdfStructure?: any;
    structureAnalysis?: any;
    visualAnalysisPerformed?: boolean;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: AuthResponse;
  error?: string;
  details?: any;
}

// NEW: Interface for format requirements
export interface FormatRequirements {
  font?: string;
  fontSize?: number;
  lineSpacing?: number | 'single' | '1.5' | 'double';
  paragraphSpacing?: number;
  margins?: {
    top: number | string;
    bottom: number | string;
    left: number | string;
    right: number | string;
  };
  alignment?: 'left' | 'right' | 'center' | 'justify';
  headerFormat?: string;
  citationStyle?: string;
  pageNumbers?: boolean;
  additionalRequirements?: string;
}

// NEW: Helper function to convert API response to DocumentAnalysis
export function convertApiResponseToAnalysis(apiData: any): DocumentAnalysis {
  return {
    analysisId: apiData.analysisId || apiData._id,
    fileName: apiData.fileName,
    fileType: apiData.fileType,
    uploadDate: apiData.uploadDate || apiData.analyzedAt || new Date().toISOString(),
    totalScore: apiData.totalScore,
    issues: apiData.issues || [],
    summary: apiData.summary || '',
    formatType: apiData.formatType,
    processedContent: apiData.processedContent,
    formatRequirements: apiData.formatRequirements,
    analyzedAt: apiData.analyzedAt,
    wordCount: apiData.wordCount,
    fileSize: apiData.fileSize,
    status: apiData.status,
    userId: apiData.userId,
    // ADDED: Topology fields
    analysisType: apiData.analysisType,
    geminiModel: apiData.geminiModel,
    pdfStructure: apiData.pdfStructure,
    structureAnalysis: apiData.structureAnalysis,
    visualAnalysisPerformed: apiData.visualAnalysisPerformed,
    // Backend fields
    _id: apiData._id,
    createdAt: apiData.createdAt,
    updatedAt: apiData.updatedAt
  };
}

// NEW: Create a temporary analysis while waiting for backend
export function createTempAnalysis(file: File, data?: any): DocumentAnalysis {
  const timestamp = new Date().toISOString();
  return {
    analysisId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fileName: file.name,
    fileType: file.type,
    uploadDate: timestamp,
    totalScore: data?.totalScore || 0,
    issues: data?.issues || [],
    summary: data?.summary || 'Analysis in progress...',
    formatType: data?.formatType,
    processedContent: data?.processedContent,
    formatRequirements: data?.formatRequirements,
    // ADDED: Default topology fields
    analysisType: 'standard',
    geminiModel: 'gemini-2.5-flash'
  };
}

// NEW: Interface for topology metrics
export interface TopologyMetrics {
  marginScore: number;
  spacingConsistency: number;
  alignmentScore: number;
  typographyScore: number;
  overallTopologyScore: number;
  issuesByCategory: Record<string, number>;
}

// NEW: Structure analysis result
export interface StructureAnalysis {
  detectedFont?: string;
  pageDimensions?: Array<{width: number; height: number}>;
  margins?: {top: number; bottom: number; left: number; right: number};
  lineSpacing?: number[];
  paragraphSpacing?: number[];
  textBlocks?: any[];
  estimatedWordCount?: number;
}

// NEW: Custom format template
export interface FormatTemplate {
  id: string;
  name: string;
  requirements: FormatRequirements;
  description?: string;
  isDefault?: boolean;
  createdBy?: string;
  createdAt?: string;
}

// NEW: Analysis configuration
export interface AnalysisConfig {
  enableTopologyAnalysis: boolean;
  enableVisualAnalysis: boolean;
  maxIssuesPerCategory: number;
  minimumConfidence: number;
  includeSpellingChecks: boolean;
  includeGrammarChecks: boolean;
  includeFormattingChecks: boolean;
  includeTopologyChecks: boolean;
  customRequirements?: FormatRequirements;
}