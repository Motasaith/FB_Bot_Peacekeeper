import React from 'react';
import { Shield, Briefcase } from 'lucide-react';

const ModeToggle = ({ mode, setMode }) => {
  return (
    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 mb-4">
      <button
        onClick={() => setMode('peacekeeper')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
          mode === 'peacekeeper'
            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Shield size={16} />
        <span>Peacekeeper</span>
      </button>
      <button
        onClick={() => setMode('business')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
          mode === 'business'
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Briefcase size={16} />
        <span>Business</span>
      </button>
    </div>
  );
};

export default ModeToggle;
