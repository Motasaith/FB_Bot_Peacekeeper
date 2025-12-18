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

// Endpoint to trigger the watcher scan
router.post('/scan', (req, res) => {
  const { target_url, account_name } = req.body;

  if (!target_url) {
    return res.status(400).json({ error: 'target_url is required' });
  }
  
  if (!account_name) {
      return res.status(400).json({ error: 'account_name is required' });
  }

  const scriptPath = 'fb_watcher.py'; 
  const command = `python "${scriptPath}" --page_url "${target_url}" --account_name "${account_name}"`;

  console.log(`Executing: ${command}`);

  exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Execution error: ${error.message}`);
      return res.status(500).json({ error: 'Failed to execute watcher script', details: error.message });
    }
    
    if (stderr) {
       // console.warn(`Script stderr: ${stderr}`);
    }

    try {
      const jsonOutput = JSON.parse(stdout);
      // Check if python script returned an error object
      if (jsonOutput.error) {
           return res.status(500).json({ error: jsonOutput.error });
      }
      res.json({ success: true, data: jsonOutput });
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      res.status(500).json({ 
        error: 'Failed to parse watcher output', 
        raw_output: stdout 
      });
    }
  });
});

export default router;
