// components/HomePage.tsx
import React from 'react';
import { User } from '../types';
import { Home, FileText, LogOut, Search, TrendingUp, TrendingDown, Users, Link, BarChart3, Plus } from 'lucide-react';

interface HomePageProps {
  user: User;
  onBackToDashboard: () => void;
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, onBackToDashboard, onLogout }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased">
      <aside className="w-20 md:w-24 bg-white border-r border-slate-200 flex flex-col items-center py-8 gap-10 sticky top-0 h-screen">
        <div className="text-[#159e8a]">
          <div className="w-10 h-10 border-4 border-[#159e8a] rounded-lg flex items-center justify-center font-black text-xl">A</div>
        </div>
        <div className="flex flex-col gap-8 flex-1">
          <button 
            onClick={onBackToDashboard}
            className="p-3 bg-[#e8f6f4] text-[#159e8a] rounded-xl border-r-4 border-[#159e8a]"
          >
            <Home size={24} />
          </button>
          <button className="p-3 text-slate-400 hover:text-[#159e8a] transition-colors">
            <FileText size={24} />
          </button>
        </div>
        <button onClick={onLogout} className="p-3 text-slate-300 hover:text-red-500 transition-colors mb-4">
          <LogOut size={24} />
        </button>
      </aside>

      <main className="flex-1 p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Good morning,</h1>
          <div className="flex items-center justify-between mt-2">
            <h2 className="text-2xl font-bold text-slate-900">Hello, {user.name} from {user.collegeName}!</h2>
            
            <div className="flex items-center gap-4">
              <span className="text-slate-600">orely.co</span>
              <span className="text-slate-400">7</span>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                <Plus size={14} />
                Add Tag
              </button>
            </div>
          </div>
        </div>

        <hr className="my-6 border-slate-200" />

        {/* Overview Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Authority Score Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Authority Score</h3>
              <div className="flex items-center text-red-500 text-sm">
                <TrendingDown size={16} className="mr-1" />
                -2.4%
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">Orely SEO Rank</p>
            <div className="flex items-center text-green-500">
              <TrendingUp size={16} className="mr-1" />
              <span className="font-medium">+18.2%</span>
            </div>
          </div>

          {/* Paid Search Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Paid Search</h3>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp size={16} className="mr-1" />
                +10.4%
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">Keywords 1.8K</p>
            <div className="text-slate-600 text-sm">Performance metrics</div>
          </div>

          {/* Organic Traffic Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Organic Traffic</h3>
              <div className="flex items-center text-red-500 text-sm">
                <TrendingDown size={16} className="mr-1" />
                -2.4%
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">Keywords 1.8K</p>
            <div className="text-slate-600 text-sm">Search analytics</div>
          </div>

          {/* Backlinks Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Backlinks</h3>
              <div className="flex items-center text-green-500 text-sm">
                <TrendingUp size={16} className="mr-1" />
                +2.4%
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">Domains 129.3K</p>
            <div className="text-slate-600 text-sm">Link building progress</div>
          </div>
        </div>

        {/* Traffic Analytics Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
          <h3 className="font-semibold text-slate-800 mb-4">Traffic Analytics</h3>
          <div className="flex flex-wrap gap-4">
            {['Orely.co', 'Behance.com', 'Dribbble.com', 'LinkedIn.com'].map((site) => (
              <div key={site} className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-700 font-medium">{site}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout for Keywords and SEO Checker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Top Organic Keywords Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Top Organic Keywords</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Keyword</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Intent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pos.</th>
                    <th className="px6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Volume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">CPC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { keyword: 'illustration', intent: '>', pos: 100, volume: '200K', cpc: '1t' },
                    { keyword: 'ui design', intent: '>', pos: 95, volume: '140K', cpc: '1t' },
                    { keyword: 'orely', intent: '>', pos: 80, volume: '120K', cpc: '↑' },
                    { keyword: 'crop conex', intent: '>', pos: 70, volume: '110K', cpc: '↑' },
                    { keyword: 'kensho', intent: '>', pos: 48, volume: '100K', cpc: '2t' }
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.keyword}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.intent}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.pos}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.volume}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.cpc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* On Page SEO Checker */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-slate-800">On Page SEO Checker</h3>
              <span className="text-sm text-slate-500">Last update: 1</span>
            </div>
            
            {/* Main Stats */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-slate-900 mb-2">25Z</div>
              <div className="text-slate-600">ideas for 20 pages</div>
            </div>

            {/* SEO Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Content Ideas */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-blue-600 font-bold">Co</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">Content Ideas</div>
                    <div className="text-red-500 font-medium">-120</div>
                  </div>
                </div>
              </div>

              {/* Backlinks Ideas */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-purple-600 font-bold">Ba</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">Backlinks Ideas</div>
                    <div className="text-red-500 font-medium">-80</div>
                  </div>
                </div>
              </div>

              {/* Semantic Ideas */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-green-600 font-bold">Se</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">Semantic Ideas</div>
                    <div className="text-red-500 font-medium">-32</div>
                  </div>
                </div>
              </div>

              {/* Placeholder for future metrics */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-slate-600 font-bold">+</span>
                  </div>
                  <div className="text-slate-600">Add Metric</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Existing Welcome Section (Kept but moved to bottom) */}
     

            {/* <button 
              onClick={onBackToDashboard}
              className="px-6 py-3 bg-[#159e8a] text-white font-medium rounded-lg hover:bg-[#128577] transition-colors"
            >
              Go to Documents Dashboard →
            </button> */}
          
      </main>
    </div>
  );
};

export default HomePage;