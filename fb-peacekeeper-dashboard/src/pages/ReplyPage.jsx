import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchPendingComments, approveReply, rejectComment, rejectAllComments, approveAllComments } from '../services/api';
import CommentCard from '../components/CommentCard';
import { CheckCheck, ArrowLeft, MessageSquare, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800"
            >
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-white font-bold shadow-lg transition-transform active:scale-95 ${
                            type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                    >
                        Confirm
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const ReplyPage = ({ onNavigate }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Confirmation State
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null, action: null });

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

  const executeRejectAll = async () => {
      setProcessing(true);
      setConfirmDialog({ ...confirmDialog, isOpen: false });
      try {
          await rejectAllComments();
          setComments([]);
          toast.success("All comments rejected");
      } catch (e) {
          toast.error("Failed to reject all");
      } finally {
          setProcessing(false);
      }
  };

  const executeApproveAll = async () => {
      setProcessing(true);
      setConfirmDialog({ ...confirmDialog, isOpen: false });
      try {
          await approveAllComments();
          setComments([]);
          toast.success("All comments approved & replied");
      } catch (e) {
          toast.error("Failed to approve all");
      } finally {
          setProcessing(false);
      }
  };

  const handleRejectAll = () => {
      setConfirmDialog({
          isOpen: true,
          title: "Reject All Comments?",
          message: "This will permanently reject all pending comments. This action cannot be undone.",
          type: 'danger',
          action: executeRejectAll
      });
  };

  const handleApproveAll = () => {
      setConfirmDialog({
          isOpen: true,
          title: "Approve All Comments?",
          message: "This will automatically reply to all pending comments with the AI suggested draft.",
          type: 'success',
          action: executeApproveAll
      });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 relative">
        <ConfirmationModal 
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            type={confirmDialog.type}
            onConfirm={confirmDialog.action}
            onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        />

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

      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <MessageSquare size={24} />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Approval Inbox</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Review ai-drafted replies before posting.</p>
                 </div>
            </div>
            
            <div className="flex items-center gap-3">
                {comments.length > 0 && (
                    <>
                        <button 
                            onClick={handleRejectAll}
                            disabled={processing}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={16} />
                            <span>Ignore All</span>
                        </button>
                        <button 
                            onClick={handleApproveAll}
                            disabled={processing}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                            <CheckCircle size={16} />
                            <span>Accept All</span>
                        </button>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    </>
                )}
                <span className="bg-emerald-50 text-emerald-600 font-bold px-4 py-2 rounded-full text-sm border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                {comments.length} Pending
                </span>
            </div>
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
