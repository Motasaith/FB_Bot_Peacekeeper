import React, { useEffect, useState } from 'react';
import { fetchFetchedComments, triggerAnalysis, rejectComment } from '../services/api'; 
import { Loader2, Play, Trash2, ArrowLeft, ArrowRight, BarChart2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const SentimentPage = ({ onNavigate }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        setLoading(true);
        try {
            const data = await fetchFetchedComments();
            setComments(data);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load fetched comments");
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (comments.length === 0) return;
        setAnalyzing(true);
        try {
            toast.info("AI Analysis Started...");
            const res = await triggerAnalysis();
            if (res.success) {
                toast.success(`Analysis Complete! ${res.count} comments moved to Inbox.`);
                // Refresh list (should be empty now)
                loadComments();
                // Maybe navigate to Replies?
                // onNavigate('replies'); 
            }
        } catch (e) {
            toast.error("Analysis failed");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await rejectComment(id);
            setComments(prev => prev.filter(c => c._id !== id));
        } catch (e) {
            toast.error("Failed to delete");
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" size={40} /></div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex items-center gap-4 mb-4">
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Home</span>
                </button>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Step 2: Sentiment Analysis</h1>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600 dark:text-purple-400">
                    <BarChart2 size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">Review & Analyze</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-lg mx-auto">
                    You have <strong>{comments.length}</strong> raw comments ready for processing. <br/>
                    Run the AI to detect leads, support issues, and spam.
                </p>
                
                <button 
                    onClick={handleAnalyze}
                    disabled={analyzing || comments.length === 0}
                    className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 mx-auto transition-all ${
                        analyzing || comments.length === 0
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105'
                    }`}
                >
                    {analyzing ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                    <span>{analyzing ? "Analyzing Sentiment..." : "Run AI Analysis"}</span>
                </button>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Raw Comments Queue</h3>
                <AnimatePresence>
                    {comments.map(comment => (
                        <motion.div 
                            key={comment._id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-start"
                        >
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-1">{comment.author || comment.author_name}</h4>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">{comment.text || comment.original_comment}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(comment._id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Delete / Ignore"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {comments.length === 0 && !analyzing && (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center gap-4">
                        <p className="text-slate-500 dark:text-slate-400">No new comments to analyze.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => onNavigate('fetch')}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Back to Fetch
                            </button>
                            <button 
                                onClick={() => onNavigate('replies')}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                            >
                                <span>Go to Inbox</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SentimentPage;
