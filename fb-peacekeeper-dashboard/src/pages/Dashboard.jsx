import React from 'react';
import Hero from '../components/Hero';
import WorkflowDiagram from '../components/WorkflowDiagram';
import DashboardCards from '../components/DashboardCards';

const Dashboard = ({ onNavigate }) => {
  return (
    <div className="space-y-8 pb-20">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Workflow Visualization */}
      <WorkflowDiagram />

      {/* 2.5 Auto-Pilot CTA */}
      <div className="flex flex-col items-center -mt-8 mb-8 relative z-20">
          <button 
            onClick={() => onNavigate('run-all')}
            className="group relative inline-flex items-center justify-center p-0.5 mb-3 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 scale-125 transition-transform shadow-xl shadow-purple-500/20"
          >
              <span className="relative px-8 py-3 transition-all ease-in duration-75 bg-white dark:bg-slate-900 rounded-md group-hover:bg-opacity-0 flex items-center gap-3 font-bold text-lg">
                <span>⚡ Run Auto-Pilot</span>
              </span>
          </button>
          
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700/50">
              <span>Fetch</span>
              <span className="text-slate-300">→</span>
              <span>Analyze</span>
              <span className="text-slate-300">→</span>
              <span>Review</span>
          </div>
      </div>

      {/* 3. Navigation Cards */}
      <div className="pt-8">
          <DashboardCards onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default Dashboard;
