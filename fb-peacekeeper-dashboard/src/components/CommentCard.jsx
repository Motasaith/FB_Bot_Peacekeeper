import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Check, X, Loader2, MessageSquareWarning, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

const CommentCard = ({ comment, onApprove, onReject, variant = 'review' }) => {
  const [replyText, setReplyText] = useState(comment.ai_reply_draft || '');
  const [isApproving, setIsApproving] = useState(false);

  const isScanned = variant === 'scanned';

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(comment._id, replyText, comment.url);
    } catch (error) {
      console.error("Failed to approve", error);
      toast.error("Failed to approve comment.");
      setIsApproving(false);
    }
  };

  const handleReject = () => {
    onReject(comment._id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 200, transition: { duration: 0.2 } }}
      className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border overflow-hidden mb-4 ${
          isScanned ? 'border-indigo-100 dark:border-slate-800' : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className={`grid grid-cols-1 ${isScanned ? '' : 'md:grid-cols-2'} divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800`}>
        
        {/* Left Side: Comment Content */}
        <div className={`p-6 ${
            isScanned ? 'bg-white dark:bg-slate-900' : 'bg-red-50/30 dark:bg-red-900/10 border-l-4 border-red-400'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center gap-2 ${isScanned ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>
              {isScanned ? <MessageSquareWarning size={18} className="text-indigo-500" /> : <MessageSquareWarning size={18} />}
              <span className="text-xs font-bold uppercase tracking-wider">
                  {isScanned ? 'Fetched Comment' : 'Negative Comment'}
              </span>
            </div>
            {comment.post_url && (
                 <a 
                  href={comment.post_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-1 text-xs"
                >
                  View on FB <ExternalLink size={12} />
                </a>
            )}
           
          </div>
          
          <p className="text-slate-800 dark:text-slate-200 font-medium text-lg leading-relaxed mb-4">
            "{comment.text}"
          </p>
          
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">{comment.author}</span>
            <span>•</span>
            <span>{comment.timestamp ? new Date(comment.timestamp).toLocaleString() : 'Just now'}</span>
          </div>
        </div>

        {/* Right Side: AI Draft & Actions (Only in Review Mode) */}
        {!isScanned && (
            <div className="p-6 flex flex-col h-full bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-slate-800/50">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-3">
                <Sparkles size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">AI Suggested Reply</span>
            </div>

            <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full flex-grow min-h-[100px] p-3 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none transition-all text-base mb-4 shadow-sm"
                placeholder="Edit the ai reply..."
            />

            <div className="flex items-center justify-end gap-3 mt-auto">
                <button
                onClick={handleReject}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium text-sm"
                >
                <X size={18} />
                Ignore
                </button>
                <button
                onClick={handleApprove}
                disabled={isApproving}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                {isApproving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Approve & Post
                </button>
            </div>
            </div>
        )}
      </div>
    </motion.div>
  );
};

export default CommentCard;
