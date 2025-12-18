import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchPendingComments, approveReply, rejectComment } from '../services/api';
import CommentCard from '../components/CommentCard';
import { toast } from 'react-toastify';
import { CheckCheck } from 'lucide-react';

const Dashboard = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial Fetch
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
      toast.error("Could not load pending comments. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, text, url) => {
    try {
      await approveReply(id, text, url);
      setComments((prev) => prev.filter((c) => c._id !== id));
      toast.success("Reply approved and queued for posting!");
    } catch (error) {
      // Error handled in component, but we could add extra logic here
      throw error;
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectComment(id);
      setComments((prev) => prev.filter((c) => c._id !== id));
      toast.info("Comment ignored.");
    } catch (error) {
      console.error("Failed to reject", error);
      toast.error("Failed to reject comment.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-200 h-48 w-full shadow-sm"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Pending Review</h2>
        <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
          {comments.length} Pending
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {comments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300"
          >
            <div className="bg-green-100 p-4 rounded-full mb-4 text-green-600">
              <CheckCheck size={48} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">All Caught Up! 🎉</h3>
            <p className="text-slate-500">No pending negative comments to review.</p>
            <button 
              onClick={loadComments} 
              className="mt-6 text-blue-600 font-medium hover:underline text-sm"
            >
              Refresh
            </button>
          </motion.div>
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
