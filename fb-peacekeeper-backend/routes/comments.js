import express from 'express';
import axios from 'axios';
import Comment from '../models/Comment.js';

const router = express.Router();

// Helper for approval logic
const approveLogic = async (req, res, idFromParams = null) => {
  try {
    let { db_id, final_text, post_url } = req.body;
    let { text, url } = req.body; // Frontend variable names
    
    const id = idFromParams || db_id;
    const replyText = final_text || text;
    const pUrl = post_url || url;

    if (!id) return res.status(400).json({ message: 'Comment ID is required' });

    // Find and update
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.status = 'posted';
    comment.ai_suggested_reply = replyText;
    await comment.save();

    // Trigger N8N Webhook
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await axios.post(process.env.N8N_WEBHOOK_URL, {
          db_id: id,
          final_text: replyText,
          post_url: pUrl || comment.post_url
        });
        console.log('N8N Webhook triggered successfully');
      } catch (webhookError) {
        console.error('Failed to trigger N8N webhook:', webhookError.message);
      }
    }

    res.json({ message: 'Comment approved', comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/comments/pending
router.get('/pending', async (req, res) => {
  try {
    // 1. Fetch from DB
    const comments = await Comment.find({ status: 'pending_approval' })
      .sort({ created_at: -1 });

    // 2. Map DB fields to Frontend props (fix mismatch)
    const mappedComments = comments.map(c => ({
      _id: c._id,
      id: c._id,
      text: c.original_comment,       // Map original_comment -> text
      author: c.author_name,          // Map author_name -> author
      timestamp: c.created_at,        // Map created_at -> timestamp
      url: c.post_url,                // Map post_url -> url
      ai_reply_draft: c.ai_suggested_reply, // Map ai_suggested_reply -> ai_reply_draft
      status: c.status
    }));
    
    res.json(mappedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/comments/approve (Prompt compliance)
router.post('/approve', async (req, res) => {
    await approveLogic(req, res);
});

// POST /api/comments/:id/approve (Frontend compatibility)
router.post('/:id/approve', async (req, res) => {
    await approveLogic(req, res, req.params.id);
});

// POST /api/comments/:id/reject
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.status = 'rejected';
    await comment.save();

    res.json({ message: 'Comment rejected', comment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
