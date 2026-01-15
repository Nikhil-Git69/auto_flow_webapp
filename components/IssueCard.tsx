import React from 'react';
import { AlertCircle, CheckCircle2, Type, Layout, Eye, Wand2 } from 'lucide-react';
import { Issue, IssueSeverity, IssueType } from '../types';

interface IssueCardProps {
  issue: Issue;
  onApplyFix: (id: string) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onApplyFix }) => {
  const getSeverityColor = (severity: IssueSeverity) => {
    switch (severity) {
      case IssueSeverity.CRITICAL: return 'bg-red-50 border-red-200 text-red-700';
      case IssueSeverity.RECOMMENDED: return 'bg-amber-50 border-amber-200 text-amber-700';
      case IssueSeverity.COSMETIC: return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const getIcon = (type: IssueType) => {
    switch (type) {
        case IssueType.LAYOUT: return <Layout className="w-4 h-4" />;
        case IssueType.GRAMMAR: return <Type className="w-4 h-4" />;
        case IssueType.ACCESSIBILITY: return <Eye className="w-4 h-4" />;
        default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg border mb-3 transition-all ${issue.isFixed ? 'opacity-60 bg-slate-50' : 'bg-white hover:shadow-md'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2 items-center">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border flex items-center gap-1 ${getSeverityColor(issue.severity)}`}>
                {getSeverityColor(issue.severity).includes('red') && <AlertCircle className="w-3 h-3" />}
                {issue.severity}
            </span>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                {getIcon(issue.type)}
                {issue.type}
            </span>
        </div>
        {issue.location && <span className="text-xs text-slate-400">At {issue.location}</span>}
      </div>

      <h4 className="text-sm font-semibold text-slate-800 mb-1">{issue.description}</h4>
      
      {issue.originalText && (
         <div className="text-xs text-red-500/70 bg-red-50 p-2 rounded mb-2 line-through font-mono">
            {issue.originalText}
         </div>
      )}

      <p className="text-sm text-slate-600 mb-3 bg-slate-50 p-2 rounded-md border border-slate-100">
        <span className="font-semibold text-slate-700 block text-xs mb-1">Suggestion:</span>
        {issue.suggestion}
      </p>

      <div className="flex justify-end">
        {issue.isFixed ? (
             <button disabled className="flex items-center gap-1 text-green-600 text-sm font-medium px-3 py-1.5">
                <CheckCircle2 className="w-4 h-4" /> Fixed
            </button>
        ) : (
            <button 
                onClick={() => onApplyFix(issue.id)}
                className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm"
            >
                <Wand2 className="w-3.5 h-3.5" /> Apply Fix
            </button>
        )}
      </div>
    </div>
  );
};

export default IssueCard;