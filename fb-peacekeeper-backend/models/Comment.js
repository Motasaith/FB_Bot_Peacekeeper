import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  comment_id: { type: String, required: true, unique: true },
  author_name: { type: String, required: true },
  original_comment: { type: String, required: true },
  ai_suggested_reply: { type: String, required: true },
  post_url: { type: String, required: true },
  status: { 
    type: String, 
    default: 'pending_approval', 
    enum: ['fetched', 'pending_approval', 'posted', 'rejected'] 
  },
  // NEW FIELDS
  is_main_post: { type: Boolean, default: false }, // True = The Post Caption
  category: { type: String }, // e.g., LEAD, HATE_SPEECH
  created_at: { type: Date, default: Date.now }
}, { collection: 'comments_queue' });

export default mongoose.model('Comment', CommentSchema);
