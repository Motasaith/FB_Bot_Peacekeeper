import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchPendingComments, approveReply, rejectComment } from '../services/api';
import CommentCard from '../components/CommentCard';
import { CheckCheck, ArrowLeft, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

const ReplyPage = ({ onNavigate }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await fetchPendingComments();
      setComments(data);
    } catch (error) {
      console.error("Failed to fetch comments", error);
      toast.error("Failed to load inbox");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4 mb-4">
            <button 
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Step 3: Auto-Replies</h1>
        </div>

      <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <MessageSquare size={24} />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Approval Inbox</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Review ai-drafted replies before posting.</p>
                 </div>
            </div>
            <span className="bg-emerald-50 text-emerald-600 font-bold px-4 py-2 rounded-full text-sm border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
            {comments.length} Pending
            </span>
      </div>

      <AnimatePresence mode="popLayout">
            {comments.length === 0 ? (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors"
                >
                <div className="bg-emerald-50 dark:bg-slate-800 p-6 rounded-full mb-6 text-emerald-500 dark:text-emerald-400">
                <CheckCheck size={64} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">All Caught Up!</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Your inbox is empty. Amazing work!
                </p>
                <button 
                onClick={loadComments} 
                className="mt-8 text-indigo-600 dark:text-emerald-400 font-bold hover:underline"
                >
                Check again
                </button>
            </motion.div>
            ) : (
            <div className="grid md:grid-cols-2 gap-6">
                {comments.map((comment) => (
                    <motion.div layout key={comment._id || comment.comment_id}> 
                        <CommentCard
                        comment={comment}
                        onApprove={async (id, text) => {
                             await approveReply(id, text);
                             setComments(p => p.filter(c => c._id !== id));
                        }}
                        onReject={async (id) => {
                             await rejectComment(id);
                             setComments(p => p.filter(c => c._id !== id));
                        }}
                        />
                    </motion.div>
                ))}
            </div>
            )}
      </AnimatePresence>
    </div>
  );
};

export default ReplyPage;
