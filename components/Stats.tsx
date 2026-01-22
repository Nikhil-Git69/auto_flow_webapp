import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Issue, IssueSeverity } from '../types';

interface StatsProps {
  issues: Issue[];
  score: number;
}

const Stats: React.FC<StatsProps> = ({ issues, score }) => {
  // --- FIXED: Ensures 'issues' is treated as an array to prevent .filter error ---
  const safeIssues = (issues as Issue[]) || [];

  const severityCounts = [
    { 
      name: 'Critical', 
      value: safeIssues.filter(i => i?.severity === IssueSeverity.CRITICAL).length, 
      color: '#ef4444' 
    },
    { 
      name: 'Recommended', 
      value: safeIssues.filter(i => i?.severity === IssueSeverity.RECOMMENDED).length, 
      color: '#f59e0b' 
    },
    { 
      name: 'Cosmetic', 
      value: safeIssues.filter(i => i?.severity === IssueSeverity.COSMETIC).length, 
      color: '#3b82f6' 
    },
  ].filter(item => item.value > 0);

  const getScoreMessage = () => {
    if (score >= 80) return 'Great job! Document is well-structured.';
    if (score >= 50) return 'Needs some improvements.';
    return 'Needs attention. Several improvements available.';
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Score Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
             <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide mb-2">Quality Score</h3>
             <div className="flex items-end">
                <span className={`text-6xl font-bold ${getScoreColor()}`}>
                    {score}
                </span>
                <span className="text-2xl text-slate-400 mb-2 font-medium">/100</span>
             </div>
             <p className="text-sm text-slate-500 mt-2 text-center px-4">
                {getScoreMessage()}
             </p>
        </div>

        {/* Issue Breakdown */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="w-1/2 h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={severityCounts}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {severityCounts.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="w-1/2 pr-4">
                 <h3 className="text-slate-700 font-semibold mb-3">Issue Breakdown</h3>
                 <div className="space-y-2">
                    {severityCounts.length > 0 ? (
                      severityCounts.map((item) => (
                        <div key={item.name} className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-slate-600">
                                <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></span>
                                {item.name}
                            </span>
                            <span className="font-bold text-slate-800">{item.value}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-400 py-4">
                        No issues found
                      </div>
                    )}
                 </div>
            </div>
        </div>
    </div>
  );
};

export default Stats;