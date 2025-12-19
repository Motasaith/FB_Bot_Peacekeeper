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

// Get Pending Comments
router.get('/pending', async (req, res) => {
  try {
    const comments = await Comment.find({ status: 'pending_approval' }).sort({ created_at: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all Fetched Comments
router.delete('/fetched', async (req, res) => {
    try {
        const result = await Comment.deleteMany({ status: 'fetched' });
        res.json({ success: true, count: result.deletedCount, message: "Cleared all fetched comments." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Fetched (Raw) Comments
router.get('/fetched', async (req, res) => {
    try {
      // Map DB to Frontend format
      const comments = await Comment.find({ status: 'fetched' }).sort({ created_at: -1 });
      const mapped = comments.map(c => ({
        _id: c._id,
        id: c._id,
        text: c.original_comment,
        author: c.author_name,
        timestamp: c.created_at,
        url: c.post_url,
        ai_reply_draft: c.ai_suggested_reply,
        status: c.status
      }));
      res.json(mapped);
    } catch (error) {
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
