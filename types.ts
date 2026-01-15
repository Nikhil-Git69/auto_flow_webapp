export enum IssueSeverity {
  CRITICAL = 'Critical',
  RECOMMENDED = 'Recommended',
  COSMETIC = 'Cosmetic'
}

export enum IssueType {
  LAYOUT = 'Layout',
  GRAMMAR = 'Grammar',
  ACCESSIBILITY = 'Accessibility',
  STRUCTURE = 'Structure'
}

export interface Issue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  description: string;
  suggestion: string;
  location?: string; // e.g., "Page 3, Paragraph 2"
  originalText?: string;
  correctedText?: string;
  isFixed?: boolean;
}

export interface CorrectedDocument{
  originalFileName: string;
  correctedFileName: string;
  fileContent: string; // base64
  mimeType: string;
  fixesApplied: number;
  totalIssues: number;
}


export interface DocumentAnalysis {
  fileName: string;
  fileType: string;
  uploadDate: string;
  totalScore: number; // 0 to 100
  issues: Issue[];
  summary: string;
}

export interface UploadedFile {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export enum AppState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  ANALYSIS = 'ANALYSIS',
  SETTINGS = 'SETTINGS',
  HOME = 'home'
}


// ========== UPDATED USER INTERFACE ==========
export interface User {
  id: string;
  email: string;
  name: string;
  collegeName: string;
  logoUrl?: string; // Optional logo for the college
  
  // NEW: Optional properties for enhanced functionality
  role?: 'student' | 'teacher' | 'admin'; // For role-based access
  studentId?: string; // For students
  department?: string; // For teachers
  isActive?: boolean; // Account status
  lastLogin?: string; // Last login timestamp
  createdAt?: string; // Account creation date
  updatedAt?: string; // Last update date
  
  // Compatibility with backend _id (MongoDB)
  _id?: string;
}

// ========== NEW TYPE FOR BACKEND RESPONSES ==========
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: any;
}

// ========== NEW TYPE FOR AUTH RESPONSES ==========
export interface AuthResponse {
  user: User;
  token: string;
}

// ========== NEW TYPE FOR REGISTRATION ==========
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  collegeName: string;
  role?: 'student' | 'teacher' | 'admin';
  studentId?: string;
  department?: string;
  logoUrl?: string;
}

// ========== NEW TYPE FOR ANALYSIS STATISTICS ==========
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
}

// ========== NEW TYPE FOR PAGINATION ==========
export interface Pagination<T = any> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ========== NEW TYPE FOR FILTERING ==========
export interface AnalysisFilters {
  userId?: string;
  fileType?: string;
  minScore?: number;
  maxScore?: number;
  page?: number;
  limit?: number;
  search?: string;
}

// ========== HELPER TYPES FOR COMPATIBILITY ==========
// This ensures backward compatibility
export type UserWithRole = User & { role: 'student' | 'teacher' | 'admin' };
export type StudentUser = User & { role: 'student'; studentId: string };
export type TeacherUser = User & { role: 'teacher'; department: string };