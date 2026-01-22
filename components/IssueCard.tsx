// import React from 'react';
// import { AlertCircle, CheckCircle2, Type, Layout, Eye, Wand2 } from 'lucide-react';
// import { Issue, IssueSeverity, IssueType } from '../types';

// interface IssueCardProps {
//   issue: Issue;
//   onApplyFix: (id: string) => void;
// }

// const IssueCard: React.FC<IssueCardProps> = ({ issue, onApplyFix }) => {
//   const getSeverityColor = (severity: IssueSeverity) => {
//     switch (severity) {
//       case IssueSeverity.CRITICAL: return 'bg-red-50 border-red-200 text-red-700';
//       case IssueSeverity.RECOMMENDED: return 'bg-amber-50 border-amber-200 text-amber-700';
//       case IssueSeverity.COSMETIC: return 'bg-blue-50 border-blue-200 text-blue-700';
//     }
//   };

//   const getIcon = (type: IssueType) => {
//     switch (type) {
//         case IssueType.LAYOUT: return <Layout className="w-4 h-4" />;
//         case IssueType.GRAMMAR: return <Type className="w-4 h-4" />;
//         case IssueType.ACCESSIBILITY: return <Eye className="w-4 h-4" />;
//         default: return <AlertCircle className="w-4 h-4" />;
//     }
//   };

//   return (
//     <div className={`p-4 rounded-lg border mb-3 transition-all ${issue.isFixed ? 'opacity-60 bg-slate-50' : 'bg-white hover:shadow-md'}`}>
//       <div className="flex justify-between items-start mb-2">
//         <div className="flex gap-2 items-center">
//             <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border flex items-center gap-1 ${getSeverityColor(issue.severity)}`}>
//                 {getSeverityColor(issue.severity).includes('red') && <AlertCircle className="w-3 h-3" />}
//                 {issue.severity}
//             </span>
//             <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
//                 {getIcon(issue.type)}
//                 {issue.type}
//             </span>
//         </div>
//         {issue.location && <span className="text-xs text-slate-400">At {issue.location}</span>}
//       </div>

//       <h4 className="text-sm font-semibold text-slate-800 mb-1">{issue.description}</h4>
      
//       {issue.originalText && (
//          <div className="text-xs text-red-500/70 bg-red-50 p-2 rounded mb-2 line-through font-mono">
//             {issue.originalText}
//          </div>
//       )}

//       <p className="text-sm text-slate-600 mb-3 bg-slate-50 p-2 rounded-md border border-slate-100">
//         <span className="font-semibold text-slate-700 block text-xs mb-1">Suggestion:</span>
//         {issue.suggestion}
//       </p>

//       <div className="flex justify-end">
//         {issue.isFixed ? (
//              <button disabled className="flex items-center gap-1 text-green-600 text-sm font-medium px-3 py-1.5">
//                 <CheckCircle2 className="w-4 h-4" /> Fixed
//             </button>
//         ) : (
//             <button 
//                 onClick={() => onApplyFix(issue.id)}
//                 className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm"
//             >
//                 <Wand2 className="w-3.5 h-3.5" /> Apply Fix
//             </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default IssueCard;
import React from 'react';
import { 
  AlertCircle, CheckCircle2, Type, Layout, Eye, Wand2, 
  Ruler, Space, AlignLeft, FileText, MoveRight, AlertTriangle, 
  Shield, Info
} from 'lucide-react';
import { Issue, IssueSeverity, IssueType } from '../types';

interface IssueCardProps {
  issue: Issue;
  onApplyFix: (id: string, suggestedFix?: string) => void;
  isWordFile?: boolean;
  isCustomFormat?: boolean;
  isTopologyIssue?: boolean;
  customFormatIssue?: boolean; // Added this prop
}

const IssueCard: React.FC<IssueCardProps> = ({ 
  issue, 
  onApplyFix, 
  isWordFile = false,
  isCustomFormat = false,
  isTopologyIssue = false,
  customFormatIssue = false
}) => {
  const getSeverityColor = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.CRITICAL: return 'bg-red-50 border-red-200 text-red-700';
      case IssueSeverity.RECOMMENDED: return 'bg-amber-50 border-amber-200 text-amber-700';
      case IssueSeverity.COSMETIC: return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  // Enhanced icon mapping for topology issues
  const getIcon = (type: IssueType | string) => {
    switch (type) {
      case IssueType.LAYOUT: 
      case 'Layout': return <Layout className="w-4 h-4" />;
      case IssueType.GRAMMAR: 
      case 'Grammar': return <Type className="w-4 h-4" />;
      case IssueType.ACCESSIBILITY: 
      case 'Accessibility': return <Eye className="w-4 h-4" />;
      case 'Typography': return <Type className="w-4 h-4" />;
      case 'Margin': return <Ruler className="w-4 h-4" />;
      case 'Spacing': return <Space className="w-4 h-4" />;
      case 'Alignment': return <AlignLeft className="w-4 h-4" />;
      case 'Indentation': return <MoveRight className="w-4 h-4" />;
      case 'Formatting': return <FileText className="w-4 h-4" />;
      case 'Structure': return <Layout className="w-4 h-4" />;
      case 'Spelling': return <Type className="w-4 h-4" />;
      case 'Content': return <FileText className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Get topology-specific color
  const getTopologyColor = (type: string) => {
    if (isTopologyIssue || customFormatIssue) {
      switch (type) {
        case 'Margin': return 'border-l-4 border-l-amber-500';
        case 'Spacing': return 'border-l-4 border-l-blue-500';
        case 'Alignment': return 'border-l-4 border-l-indigo-500';
        case 'Typography': return 'border-l-4 border-l-purple-500';
        case 'Layout': return 'border-l-4 border-l-orange-500';
        default: return customFormatIssue ? 'border-l-4 border-l-purple-500' : '';
      }
    }
    return '';
  };

  // Handle apply fix with Word document support
  const handleApplyFix = () => {
    onApplyFix(issue.id, issue.correctedText);
  };

  // Check if this is a measurement issue
  const isMeasurementIssue = issue.measurement && issue.measurement.actual && issue.measurement.expected;
  
  // Check if this has visual evidence
  const hasVisualEvidence = issue.visualEvidence || (issue.type === 'Margin' || issue.type === 'Spacing' || issue.type === 'Alignment');

  // Check if this is a font mismatch issue
  const isFontMismatch = issue.description?.includes('FONT MISMATCH') || 
                         issue.description?.toLowerCase().includes('font mismatch') ||
                         (issue.type === 'Typography' && customFormatIssue);

  return (
    <div className={`p-4 rounded-lg border mb-3 transition-all ${issue.isFixed ? 'opacity-60 bg-slate-50' : 'bg-white hover:shadow-md'} ${getTopologyColor(issue.type)}`}>
      {/* Topology indicator badge */}
      {(isTopologyIssue || customFormatIssue) && (
        <div className="mb-2 flex items-center gap-2">
          {customFormatIssue ? (
            <div className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 rounded-md flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Format Compliance Issue
            </div>
          ) : isTopologyIssue && (
            <div className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 rounded-md flex items-center gap-1">
              <Layout className="w-3 h-3" />
              Topology Issue
            </div>
          )}
          {isCustomFormat && customFormatIssue && (
            <div className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-md">
              Format Check
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2 items-center">
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border flex items-center gap-1 ${getSeverityColor(issue.severity)}`}>
            {getSeverityColor(issue.severity).includes('red') && <AlertTriangle className="w-3 h-3" />}
            {customFormatIssue && issue.severity === 'Critical' && <Shield className="w-3 h-3" />}
            {issue.severity}
          </span>
          <span className={`text-xs font-medium flex items-center gap-1 ${customFormatIssue ? 'text-purple-700' : isTopologyIssue ? 'text-amber-700' : 'text-slate-500'}`}>
            {getIcon(issue.type)}
            {issue.type}
            {customFormatIssue && ' • Format'}
            {isTopologyIssue && !customFormatIssue && ' • Layout'}
          </span>
        </div>
        {issue.location && <span className="text-xs text-slate-400">At {issue.location}</span>}
      </div>

      <h4 className="text-sm font-semibold text-slate-800 mb-1 flex items-start gap-2">
        {customFormatIssue && isFontMismatch && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Font Violation
          </span>
        )}
        {issue.description}
        {/* Visual evidence indicator */}
        {hasVisualEvidence && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Visual
          </span>
        )}
      </h4>
      
      {/* Custom format violation warning */}
      {customFormatIssue && (
        <div className="mb-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded text-xs">
          <div className="flex items-center gap-2 text-purple-700">
            <Info className="w-3 h-3 flex-shrink-0" />
            <span className="font-medium">Format Requirement Violation:</span>
            <span className="text-purple-600">{issue.description}</span>
          </div>
        </div>
      )}

      {/* Measurement display for topology issues */}
      {isMeasurementIssue && issue.measurement && (
        <div className="mb-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500">Actual:</span>
              <span className="ml-2 font-semibold text-red-600">{issue.measurement.actual}</span>
            </div>
            <div>
              <span className="text-slate-500">Expected:</span>
              <span className="ml-2 font-semibold text-green-600">{issue.measurement.expected}</span>
            </div>
            {issue.measurement.unit && (
              <div className="text-slate-400">
                Unit: {issue.measurement.unit}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual evidence description */}
      {issue.visualEvidence && (
        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <div className="flex items-start gap-2">
            <Eye className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{issue.visualEvidence}</span>
          </div>
        </div>
      )}

      {/* Show original text for Word documents */}
      {isWordFile && issue.originalText && (
        <div className="text-xs text-red-500/70 bg-red-50 p-2 rounded mb-2 line-through font-mono border border-red-100">
          <div className="flex items-center gap-1 mb-1">
            <AlertCircle className="w-3 h-3" />
            <span className="font-medium text-red-600">Original Text:</span>
          </div>
          {issue.originalText.length > 100 
            ? `${issue.originalText.substring(0, 100)}...` 
            : issue.originalText}
        </div>
      )}

      {/* Show corrected text for Word documents */}
      {isWordFile && issue.correctedText && !issue.isFixed && (
        <div className="text-xs text-green-600/70 bg-green-50 p-2 rounded mb-2 font-mono border border-green-100">
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle2 className="w-3 h-3" />
            <span className="font-medium text-green-700">Corrected Text:</span>
          </div>
          {issue.correctedText.length > 100 
            ? `${issue.correctedText.substring(0, 100)}...` 
            : issue.correctedText}
        </div>
      )}

      {/* Position indicator for PDF issues */}
      {issue.position && !isWordFile && (
        <div className="mb-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-medium">Location on page {issue.pageNumber || 1}:</span>
            <span className="text-slate-500">
              Top: {issue.position.top}%, Left: {issue.position.left}%, 
              Size: {issue.position.width}% × {issue.position.height}%
            </span>
          </div>
          {issue.pageNumber && issue.pageNumber > 1 && (
            <div className="mt-1 text-slate-400">
              (Page {issue.pageNumber})
            </div>
          )}
        </div>
      )}

      <div className={`text-sm text-slate-600 mb-3 p-2 rounded-md border ${
        customFormatIssue ? 'bg-purple-50 border-purple-100' : 
        isTopologyIssue ? 'bg-amber-50 border-amber-100' : 
        'bg-slate-50 border-slate-100'
      }`}>
        <span className={`font-semibold block text-xs mb-1 ${
          customFormatIssue ? 'text-purple-800' : 
          isTopologyIssue ? 'text-amber-800' : 
          'text-slate-700'
        }`}>
          {customFormatIssue ? '🛡️ Format Compliance:' : 
           isTopologyIssue ? '📐 Layout Suggestion:' : 
           '💡 Suggestion:'}
        </span>
        {issue.suggestion}
      </div>

      <div className="flex justify-between items-center">
        <div>
          {/* Additional info for specific issue types */}
          {customFormatIssue && (
            <span className="text-xs text-purple-600 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Format Compliance Issue
            </span>
          )}
          {isTopologyIssue && !customFormatIssue && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <Ruler className="w-3 h-3" />
              Layout/Formatting Issue
            </span>
          )}
          {isWordFile && issue.originalText && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Text replacement available
            </span>
          )}
        </div>
        
        {issue.isFixed ? (
          <button disabled className="flex items-center gap-1 text-green-600 text-sm font-medium px-3 py-1.5">
            <CheckCircle2 className="w-4 h-4" /> Fixed
          </button>
        ) : (
          <button 
            onClick={handleApplyFix}
            className={`flex items-center gap-2 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm ${
              customFormatIssue 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                : isTopologyIssue 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" /> 
            {customFormatIssue ? 'Apply Format Fix' : 
             isWordFile ? 'Apply to Text' : 
             isTopologyIssue ? 'Apply Layout Fix' : 
             'Apply Fix'}
          </button>
        )}
      </div>
    </div>
  );
};

export default IssueCard;