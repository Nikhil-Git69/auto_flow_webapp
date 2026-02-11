import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Issue, IssueSeverity } from '../types';

interface StatsProps {
  issues: Issue[];
  score: number;
  isCustomFormat?: boolean;
}

const Stats: React.FC<StatsProps> = ({ issues, score, isCustomFormat }) => {
  // Ensure 'issues' is a valid array before processing
  const safeIssues = Array.isArray(issues) ? issues : [];

  // Mapping the breakdown using the imported IssueSeverity Enum
  const severityCounts = [
    {
      name: 'Critical',
      value: safeIssues.filter(i => i?.severity === IssueSeverity.CRITICAL).length,
      color: '#ef4444'
    },
    {
      name: 'Major',
      value: safeIssues.filter(i => i?.severity === IssueSeverity.MAJOR).length,
      color: '#f59e0b'
    },
    {
      name: 'Minor',
      value: safeIssues.filter(i => i?.severity === IssueSeverity.MINOR).length,
      color: '#3b82f6'
    },
  ].filter(item => item.value > 0);

  const getScoreMessage = () => {
    if (isCustomFormat) return score >= 80 ? 'Requirement Compliant' : 'Format Deviations Found';
    if (score >= 80) return 'Document is well-structured.';
    if (score >= 50) return 'Needs some improvements.';
    return 'Critical attention required.';
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  // Calculate Grade
  let grade = 'A';
  let gradeColor = 'bg-green-100 text-green-700';
  if (score < 50) { grade = 'D'; gradeColor = 'bg-red-100 text-red-700'; }
  else if (score < 70) { grade = 'C'; gradeColor = 'bg-orange-100 text-orange-700'; }
  else if (score < 90) { grade = 'B'; gradeColor = 'bg-blue-100 text-blue-700'; }

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Score Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full ${isCustomFormat ? 'bg-purple-500' : 'bg-indigo-500'}`}></div>

        <div className="flex flex-col">
          <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">
            {isCustomFormat ? 'Compliance Score' : 'Overall Quality'}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-black ${getScoreColor()}`}>
              {score}
            </span>
            <span className="text-sm text-slate-300 font-bold">/100</span>
          </div>
        </div>

        {/* NEW GRADE DISPLAY */}
        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg ${gradeColor}`}>
          <span className="text-2xl font-bold">{grade}</span>
          <span className="text-[9px] font-bold uppercase opacity-80">Grade</span>
        </div>
      </div>

      {/* Pie Chart & Legend */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center h-24">
        <div className="w-1/3 h-full overflow-hidden">
          <ResponsiveContainer width="99%" height="100%">
            <PieChart>
              <Pie
                data={severityCounts}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={35}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {severityCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: '10px', borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-2/3 pl-4 border-l border-slate-50 space-y-2">
          {severityCounts.length > 0 ? (
            severityCounts.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  {item.name}
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))
          ) : (
            <div className="text-[11px] text-slate-400 italic text-center">No issues detected</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;