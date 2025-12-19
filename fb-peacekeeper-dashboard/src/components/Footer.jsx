import React from 'react';
import { Heart, Github, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto py-12 bg-slate-900 text-center text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-slate-300 opacity-80 hover:opacity-100 transition-opacity">
            <Shield size={16} />
            <span className="font-semibold tracking-widest uppercase text-xs">BizReply Automation v2.0</span>
            </div>
            <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} BizReply AI. All rights reserved.
            </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
            <p className="flex items-center gap-1.5 text-slate-300 font-medium">
            Designed & Developed by <span className="text-emerald-400 font-bold">Abdul Rauf Azhar</span>
            </p>
            <div className="flex gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
            <a href="#" className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
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
