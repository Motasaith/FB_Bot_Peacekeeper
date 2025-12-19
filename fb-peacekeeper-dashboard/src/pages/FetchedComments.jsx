import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFetchedComments, triggerAnalysis, rejectComment } from '../services/api'; // reuse reject for deleting raw comments?
import { Loader2, Play, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

const FetchedComments = ({ onBack, onAnalysisComplete }) => {
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
                if (onAnalysisComplete) onAnalysisComplete();
            }
        } catch (e) {
            toast.error("Analysis failed");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleDelete = async (id) => {
        // We can reuse rejectComment or add a specific delete endpoint.
        // rejectComment sets status to 'rejected', which removes it from this list (status='fetched')
        // So it works for now.
        try {
            await rejectComment(id);
            setComments(prev => prev.filter(c => c._id !== id));
        } catch (e) {
            toast.error("Failed to delete");
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" size={40} /></div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>
                <div className="flex items-center gap-4">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full font-bold text-slate-600 dark:text-slate-300">
                        {comments.length} Raw Comments
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center mb-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">Review Fetched Data</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Review the comments below. Delete any spam manually, or click Analyze to let AI process them.
                </p>
                <button 
                    onClick={handleAnalyze}
                    disabled={analyzing || comments.length === 0}
                    className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 mx-auto transition-all ${
                        analyzing || comments.length === 0
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-emerald-600 dark:to-teal-600 hover:scale-105'
                    }`}
                >
                    {analyzing ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                    <span>{analyzing ? "Analyzing..." : "Analyze All with AI"}</span>
                </button>
            </div>

            <div className="space-y-4">
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
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-1">{comment.author_name}</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">{comment.original_comment}</p>
                            </div>
                            <button 
                                onClick={() => handleDelete(comment._id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {comments.length === 0 && !analyzing && (
                    <div className="text-center text-slate-400 py-10">No fetched comments found.</div>
                )}
            </div>
        </div>
    );
};

export default FetchedComments;
