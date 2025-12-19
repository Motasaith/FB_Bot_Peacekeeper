import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, LogIn, Loader2, RefreshCw } from 'lucide-react';
import api from '../services/api';

const ProfileCard = ({ onConnect }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/watcher/user-profile');
      setProfile(res.data);
    } catch (e) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm dark:shadow-xl border border-slate-100 dark:border-slate-800 h-full flex flex-col justify-between transition-colors"
    >
      <div>
        <h3 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Active Identity</h3>
        
        {loading ? (
           <div className="flex items-center gap-3 animate-pulse">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
           </div>
        ) : profile ? (
          <div className="flex items-center gap-4">
             <div className="relative">
                {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 dark:border-emerald-500/20 shadow-sm" />
                ) : (
                    <div className="w-16 h-16 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 dark:text-emerald-500">
                        <User size={32} />
                    </div>
                )}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{profile.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Connected via Facebook</p>
             </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 opacity-50">
             <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                <User size={32} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Anonymous</h2>
                <p className="text-sm text-slate-500 text-slate-500 dark:text-slate-500">No active session</p>
             </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-2">
         {profile ? (
            <button 
                onClick={onConnect}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
                Switch Account
            </button>
         ) : (
             <button 
                onClick={onConnect}
                className="w-full py-3 bg-indigo-600 dark:bg-emerald-600 hover:bg-indigo-700 dark:hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md dark:shadow-lg shadow-indigo-200 dark:shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
                <LogIn size={18} />
                Connect Facebook
            </button>
         )}
         <button onClick={fetchProfile} className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-white rounded-lg">
             <RefreshCw size={18} />
         </button>
      </div>
    </motion.div>
  );
};

export default ProfileCard;
