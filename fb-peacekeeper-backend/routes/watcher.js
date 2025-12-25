import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const router = express.Router();
// Helper pause
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    
    const childProcess = exec(command, { cwd: process.cwd() }); 

    childProcess.stdout.on('data', (data) => {
        console.log(`[Login Script]: ${data}`);
    });
    
    childProcess.stderr.on('data', (data) => {
        console.error(`[Login Script Error]: ${data}`);
    });
    
    // Just return success immediately saying window opened.
    res.json({ success: true, message: 'Login window opened. Please log in and close the browser window.' });
});

// 1. SCAN (Fetch Only)
router.post('/scan', (req, res) => {
  const { target_url, account_name } = req.body;
  if (!target_url || !account_name) return res.status(400).json({ error: 'Missing args' });

  const command = `python "fb_watcher.py" --page_url "${target_url}" --account_name "${account_name}"`;
  console.log(`Executing Fetch: ${command}`);

  exec(command, { cwd: process.cwd() }, async (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: 'Script failed', details: error.message });

    try {
      const jsonOutput = JSON.parse(stdout);
      if (jsonOutput.error) return res.status(500).json({ error: jsonOutput.error });

      const Comment = (await import('../models/Comment.js')).default;
      let savedCount = 0;

      for (const item of jsonOutput) {
          const exists = await Comment.findOne({ comment_id: item.comment_id });
          if (!exists) {
              await new Comment({
                  comment_id: item.comment_id,
                  author_name: item.author,
                  original_comment: item.text,
                  ai_suggested_reply: "Not Analyzed Yet",
                  post_url: item.post_url,
                  status: 'fetched',
                  is_main_post: item.is_main_post || false // SAVE THE FLAG
              }).save();
              savedCount++;
          }
      }
      res.json({ success: true, count: savedCount, message: "Fetch complete." });

    } catch (e) {
      console.error('Fetch Error:', e);
      res.status(500).json({ error: 'Parse error', raw: stdout });
    }
  });
});

// 2. ANALYZE (Process Fetched) - NOW WITH MODE
router.post('/analyze', async (req, res) => {
    try {
        // Read MODE from the request (sent by Dashboard)
        const { mode } = req.body; // 'business' or 'peacekeeper'
        const activeMode = mode || 'peacekeeper'; // Default

        const Comment = (await import('../models/Comment.js')).default;
        const { analyzeComment } = await import('../services/aiService.js');

        const fetchedComments = await Comment.find({ status: 'fetched' });
        console.log(`[Analyze] Mode: ${activeMode} | Count: ${fetchedComments.length}`);

        if (fetchedComments.length === 0) return res.json({ success: true, count: 0, message: "Nothing to analyze." });

        let approvedCount = 0;

        for (const comment of fetchedComments) {
            try {
                // Pass MODE and IS_MAIN_POST to AI
                const aiResult = await analyzeComment(
                    comment.original_comment, 
                    activeMode, 
                    comment.is_main_post
                );
                
                comment.ai_suggested_reply = aiResult.reply || "No reply";
                comment.category = aiResult.category;
                
                if (aiResult.reply === 'IGNORE' || aiResult.category === 'SPAM') {
                     comment.status = 'rejected';
                } else {
                     comment.status = 'pending_approval';
                     approvedCount++;
                }
                
                await comment.save();
                await delay(3000); // Rate Limit Protection

            } catch (err) {
                console.error(`[Analyze Error]: ${err.message}`);
            }
        }
        res.json({ success: true, count: approvedCount, message: "Analysis complete." });

    } catch (e) {
        res.status(500).json({ error: e.message });
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
