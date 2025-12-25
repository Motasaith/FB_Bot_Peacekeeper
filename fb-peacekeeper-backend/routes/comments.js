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
    
    // Map to Frontend format (Same as fetched)
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

// POST /api/comments/reject-all
router.post('/reject-all', async (req, res) => {
    try {
        const result = await Comment.updateMany(
            { status: 'pending_approval' },
            { $set: { status: 'rejected' } }
        );
        res.json({ success: true, count: result.modifiedCount, message: "All pending comments rejected." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/comments/approve-all
router.post('/approve-all', async (req, res) => {
    try {
        const comments = await Comment.find({ status: 'pending_approval' });
        
        const results = await Promise.all(comments.map(async (comment) => {
            comment.status = 'posted';
            await comment.save();

            // Trigger N8N
            if (process.env.N8N_WEBHOOK_URL) {
                try {
                    await axios.post(process.env.N8N_WEBHOOK_URL, {
                        db_id: comment._id,
                        final_text: comment.ai_suggested_reply,
                        post_url: comment.post_url
                    });
                } catch (e) {
                    console.error(`Failed webhook for ${comment._id}`);
                }
            }
            return comment._id;
        }));

        res.json({ success: true, count: results.length, message: "All pending comments approved." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
