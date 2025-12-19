import React, { useState, useEffect } from 'react';
import ActionCenter from '../components/ActionCenter';
import ProfileCard from '../components/ProfileCard';
import { ArrowLeft, Clock, MessageSquare, ArrowRight, Trash2 } from 'lucide-react';
import { fetchFetchedComments, clearFetchedComments } from '../services/api';
import api from '../services/api'; 
import { toast } from 'react-toastify';

const FetchPage = ({ onNavigate }) => {
    const [fetchedComments, setFetchedComments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial Load of fetched comments (to show what's already there)
    useEffect(() => {
        loadFetchedComments();
    }, []);

    const loadFetchedComments = async () => {
        try {
            const data = await fetchFetchedComments();
            setFetchedComments(data);
        } catch (e) {
            console.error("Failed to load fetched comments", e);
        }
    };

    const handleConnectAccount = async () => {
        try {
            toast.info("Opening secure login window...");
            await api.post('/watcher/connect', { account_name: 'Default' });
        } catch (e) {
            toast.error("Connection failed");
        }
    };

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to clear all fetched comments?")) return;
        try {
            await clearFetchedComments();
            setFetchedComments([]);
            toast.success("Cleared all recent comments");
        } catch (e) {
            toast.error("Failed to clear");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 mb-20">
             {/* Header */}
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Home</span>
                </button>
                <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Step 1: Fetch Comments</h1>
             </div>

             <div className="grid md:grid-cols-3 gap-6">
                {/* Left Col: Connect */}
                <div className="md:col-span-1">
                    <ProfileCard onConnect={handleConnectAccount} />
                    
                    {/* Status Summary */}
                    <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Current Batch</h3>
                        <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <MessageSquare size={18} />
                                <span className="font-semibold">Fetched</span>
                             </div>
                             <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{fetchedComments.length}</span>
                        </div>
                        {fetchedComments.length > 0 && (
                            <button 
                                onClick={() => onNavigate('sentiment')}
                                className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                            >
                                <span>Go to Analysis</span>
                                <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Col: Action & Feed */}
                <div className="md:col-span-2 space-y-6">
                    {/* Action Center - The Input Box */}
                    <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-1 rounded-3xl border border-blue-500/10">
                        <ActionCenter onScanComplete={(count) => {
                             loadFetchedComments(); // Refresh list immediately
                        }} />
                    </div>

                    {/* Fetched Results Preview */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Clock size={18} />
                                <span>Recent Fetched Comments</span>
                            </h3>
                            {fetchedComments.length > 0 && (
                                <button 
                                    onClick={handleClearAll}
                                    className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg transition-colors border border-red-100 dark:border-red-900/30"
                                >
                                    <Trash2 size={12} />
                                    <span>Clear All</span>
                                </button>
                            )}
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[200px]">
                            {fetchedComments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
                                    <p>No new comments fetched yet.</p>
                                    <p>Paste a URL above to start.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {fetchedComments.map((comment) => (
                                        <div key={comment._id} className="p-4 hover:bg-white dark:hover:bg-slate-900 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{comment.author || comment.author_name}</span>
                                                <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase">Raw</span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">{comment.text || comment.original_comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
};

export default FetchPage;
