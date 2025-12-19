import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, Play, Loader2, MessageSquare, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const ActionCenter = ({ onScanComplete }) => {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    if (!url) return toast.warning("Paste a Facebook Link first");
    
    setScanning(true);
    try {
        const res = await api.post('/watcher/scan', {
            target_url: url,
            account_name: 'Default'
        });
        
        if (res.data.success) {
            toast.success(`Fetched ${res.data.count} comments.`);
            if (onScanComplete) onScanComplete(res.data.count); // Return count instead of data
        }
    } catch (e) {
        toast.error("Scan failed. Check the server console.");
        console.error(e);
    } finally {
        setScanning(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm dark:shadow-xl border border-slate-100 dark:border-slate-800 h-full flex flex-col transition-colors"
    >
       <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Command Center</h3>
          <div className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-xs font-bold border border-emerald-100 dark:border-emerald-500/20">READY</div>
       </div>

       <div className="flex-1 flex flex-col justify-center space-y-4">
           <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-400 ml-1">Target Post / Page</label>
              <div className="relative mt-1">
                  <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://facebook.com/..." 
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                     <Scan size={18} />
                  </div>
              </div>
           </div>

           <button
             onClick={handleScan}
             disabled={scanning}
             className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-3 transition-all ${
                scanning 
                ? 'bg-slate-800 scale-[0.99] opacity-80 cursor-wait' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-emerald-600 dark:to-teal-600 hover:scale-[1.02] dark:shadow-emerald-900/20'
             }`}
           >
             {scanning ? (
                 <>
                    <Loader2 className="animate-spin" />
                    <span>Fetching Comments...</span>
                 </>
             ) : (
                 <>
                    <Play fill="currentColor" />
                    <span>Fetch Comments</span>
                 </>
             )}
           </button>
       </div>
    </motion.div>
  );
};

export default ActionCenter;
