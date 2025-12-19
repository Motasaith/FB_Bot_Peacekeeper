import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Endpoint to get list of available accounts
router.get('/accounts', (req, res) => {
    const directoryPath = process.cwd();
    
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan directory', details: err.message });
        }
        
        // Filter files that match 'fb_auth_*.json'
        const accounts = files
            .filter(file => file.startsWith('fb_auth_') && file.endsWith('.json'))
            .map(file => {
                // Extract account name: fb_auth_NAME.json -> NAME
                return file.replace('fb_auth_', '').replace('.json', '');
            });
            
        res.json({ accounts });
    });
});

// Endpoint to delete an account
router.delete('/accounts/:name', (req, res) => {
    const accountName = req.params.name;
    const authFile = path.join(process.cwd(), `fb_auth_${accountName}.json`);
    const profileDir = path.join(process.cwd(), 'fb_profiles', accountName);

    console.log(`Deleting account: ${accountName}`);

    // Delete auth file
    if (fs.existsSync(authFile)) {
        try {
            fs.unlinkSync(authFile);
        } catch (e) {
            console.error(`Error deleting auth file: ${e.message}`);
        }
    }

    // Delete profile directory (recursive)
    if (fs.existsSync(profileDir)) {
        try {
            fs.rmSync(profileDir, { recursive: true, force: true });
        } catch (e) {
            console.error(`Error deleting profile dir: ${e.message}`);
        }
    }

    res.json({ success: true, message: `Account ${accountName} deleted` });
});

// Endpoint to trigger the manual login window
router.post('/connect', (req, res) => {
    const { account_name } = req.body;

    if (!account_name) {
        return res.status(400).json({ error: 'account_name is required' });
    }

    // CLEANUP: Wipe old data for this account before starting fresh login
    const authFile = path.join(process.cwd(), `fb_auth_${account_name}.json`);
    const profileDir = path.join(process.cwd(), 'fb_profiles', account_name);
    
    console.log(`Cleaning up old session for: ${account_name}`);
    
    try {
        if (fs.existsSync(authFile)) fs.unlinkSync(authFile);
        if (fs.existsSync(profileDir)) fs.rmSync(profileDir, { recursive: true, force: true });
    } catch (e) {
        console.error(`Cleanup warning: ${e.message}`);
    }

    const scriptPath = 'login_once.py'; 
    const command = `python "${scriptPath}" --account_name "${account_name}"`;

    console.log(`Starting login for: ${account_name}`);
    
    // We do NOT wait for this to finish, because it waits for user interaction (window close)
    // However, exec defaults to waiting? No, exec buffers, but callback is called on exit.
    // If we want to return response immediately, we shouldn't wait in the request handler?
    // Actually, user expects "Window Opened" response.
    
    // exec is async, but the callback triggers on exit.
    // exec is async, but the callback triggers on exit.
    // exec is async, but the callback triggers on exit.
    const childProcess = exec(command, { cwd: process.cwd() }); 

    childProcess.stdout.on('data', (data) => {
        console.log(`[Login Script]: ${data}`);
    });
    
    childProcess.stderr.on('data', (data) => {
        console.error(`[Login Script Error]: ${data}`);
    });

    // process.unref() // If we wanted to detach. But we might want to log output?
    
    // Just return success immediately saying window opened.
    res.json({ success: true, message: 'Login window opened. Please log in and close the browser window.' });
});

// Endpoint to trigger the watcher scan ONLY (Fetch Mode)
router.post('/scan', (req, res) => {
  const { target_url, account_name } = req.body;

  if (!target_url || !account_name) {
    return res.status(400).json({ error: 'target_url and account_name are required' });
  }

  const scriptPath = 'fb_watcher.py'; 
  const command = `python "${scriptPath}" --page_url "${target_url}" --account_name "${account_name}"`;

  console.log(`Executing Fetch: ${command}`);

  exec(command, { cwd: process.cwd() }, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Execution error: ${error.message}`);
      return res.status(500).json({ error: 'Failed to execute watcher script', details: error.message });
    }

    try {
      const jsonOutput = JSON.parse(stdout);
      if (jsonOutput.error) {
           return res.status(500).json({ error: jsonOutput.error });
      }

      console.log(`[Fetch] Scraped ${jsonOutput.length} comments.`);
      
      const Comment = (await import('../models/Comment.js')).default;
      let savedCount = 0;

      for (const rawComment of jsonOutput) {
          // Deduplication Check
          const exists = await Comment.findOne({ comment_id: rawComment.comment_id });
          if (!exists) {
              const newComment = new Comment({
                  comment_id: rawComment.comment_id,
                  author_name: rawComment.author,
                  original_comment: rawComment.text,
                  ai_suggested_reply: "Not Analyzed Yet",
                  post_url: rawComment.comment_url || target_url,
                  status: 'fetched', // NEW STATUS
                  category: null
              });
              await newComment.save();
              savedCount++;
          }
      }
      
      console.log(`[Fetch] Saved ${savedCount} new comments to 'fetched' status.`);

      // Return success with count of NEW fetched comments
      res.json({ success: true, count: savedCount, message: "Comments fetched successfully." });

    } catch (parseError) {
      console.error('Processing error:', parseError);
      res.status(500).json({ 
        error: 'Failed to process watcher output', 
        raw_output: stdout 
      });
    }
  });
});

// Endpoint to trigger AI Analysis on 'fetched' comments
router.post('/analyze', async (req, res) => {
    try {
        const Comment = (await import('../models/Comment.js')).default;
        const { analyzeComment } = await import('../services/aiService.js');

        // Find all 'fetched' comments
        const fetchedComments = await Comment.find({ status: 'fetched' });
        
        console.log(`[Analyze] Processing ${fetchedComments.length} fetched comments...`);
        
        if (fetchedComments.length === 0) {
            return res.json({ success: true, count: 0, message: "No fetched comments to analyze." });
        }

        const aiPromises = fetchedComments.map(async (comment) => {
            // AI Analysis
            const aiResult = await analyzeComment(comment.original_comment);
            
            // Update Comment
            comment.ai_suggested_reply = aiResult.reply || "No reply generated";
            comment.category = aiResult.category;
            
            // Logic: If IGNORE, reject or keep? Let's auto-reject SPAM/IGNORE
            if (aiResult.reply === 'IGNORE' || aiResult.category === 'SPAM/TROLL') {
                 comment.status = 'rejected';
            } else {
                 comment.status = 'pending_approval';
            }
            
            await comment.save();
            return comment;
        });

        const processed = await Promise.all(aiPromises);
        const approvedCount = processed.filter(c => c.status === 'pending_approval').length;

        console.log(`[Analyze] Analysis complete. ${approvedCount} moved to pending.`);

        res.json({ success: true, count: approvedCount, message: "Analysis complete." });

    } catch (e) {
        console.error("Analysis Failed:", e);
        res.status(500).json({ error: "Analysis failed", details: e.message });
    }
});

// Endpoint to get user profile metadata
router.get('/user-profile', (req, res) => {
    // We assume mostly 'Default' account for now as per previous simplification
    // But we can support query param ?account=Default
    const accountName = req.query.account || 'Default';
    const metaFile = path.join(process.cwd(), `user_metadata_${accountName}.json`);
    
    if (fs.existsSync(metaFile)) {
        try {
            const data = fs.readFileSync(metaFile, 'utf8');
            res.json(JSON.parse(data));
        } catch (e) {
            console.error("Failed to read metadata", e);
            res.status(500).json({ error: "Failed to read profile data" });
        }
    } else {
        res.status(404).json({ error: "Profile not found" });
    }
});

export default router;
