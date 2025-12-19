import React from 'react';
import { Heart, Github, Shield } from 'lucide-react';

const Footer = ({ onNavigate }) => {
  return (
    <footer className="mt-auto py-12 bg-white dark:bg-slate-900 text-center text-slate-600 dark:text-slate-400 text-sm border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-300 opacity-80 hover:opacity-100 transition-opacity">
            <Shield size={16} className="text-blue-600 dark:text-emerald-400" />
            <span className="font-semibold tracking-widest uppercase text-xs">FB Automator Suite v2.0</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-600">
            &copy; {new Date().getFullYear()} FB Automator. All rights reserved.
            </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
            <p className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
            Designed & Developed by <span className="text-blue-600 dark:text-emerald-400 font-bold">Motasaith</span>
            </p>
            <div className="flex gap-6 text-xs text-slate-500">
            <button onClick={() => onNavigate('privacy')} className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors">Terms of Service</button>
            <a href="https://github.com/Motasaith" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-emerald-400 transition-colors">
                <Github size={12} />
                <span>GitHub</span>
            </a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
