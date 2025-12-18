import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Header = ({ onNavigate, currentPage }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 text-blue-600">
        <ShieldCheck size={32} />
        <h1 className="text-xl font-bold tracking-tight text-slate-800">Peacekeeper<span className="text-blue-600">Bot</span> Control Room</h1>
      </div>
      <nav className="flex gap-4">
        <button 
          onClick={() => onNavigate('dashboard')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentPage === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => onNavigate('watcher')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentPage === 'watcher' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Safe Watcher
        </button>
      </nav>
    </header>
  );
};

export default Header;
