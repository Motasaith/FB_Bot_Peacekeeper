import React, { useState, useEffect } from 'react';
import { Play, LogIn, Loader2, Globe, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import CommentCard from '../CommentCard';

const WatcherPanel = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [scannedComments, setScannedComments] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Hardcoded single account
  const ACCOUNT_NAME = "Default";

  /* Persistence Logic */
  useEffect(() => {
      const saved = localStorage.getItem('watcher_scanned_comments');
      if (saved) {
          try {
              setScannedComments(JSON.parse(saved));
          } catch (e) {
              console.error("Failed to parse saved comments");
          }
      }
      checkConnection();
  }, []);

  const saveComments = (comments) => {
      setScannedComments(comments);
      localStorage.setItem('watcher_scanned_comments', JSON.stringify(comments));
  };

  const handleClearResults = () => {
      if(window.confirm("Are you sure you want to clear all scanned comments?")) {
          setScannedComments([]);
          localStorage.removeItem('watcher_scanned_comments');
          toast.info("Results cleared");
      }
  };

  const checkConnection = async () => {
    try {
      const response = await api.get('/watcher/accounts');
      const accounts = response.data.accounts || [];
      setIsConnected(accounts.includes(ACCOUNT_NAME));
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Connect call triggers the python script which opens the browser
      const response = await api.post('/watcher/connect', { account_name: ACCOUNT_NAME });
      toast.info(response.data.message);
      
      // Poll a few times to see if they logged in
      setTimeout(checkConnection, 5000); 
      setTimeout(checkConnection, 10000); 
      
    } catch (err) {
      toast.error("Failed to start login intent");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleScan = async () => {
    if (!targetUrl) {
        toast.warning("Please enter a Page URL");
        return;
    }
    
    // We don't block scan if !isConnected, usually, but warning is good
    if (!isConnected) {
        toast.warning("You might need to Connect Account first if you haven't logged in.");
    }

    setIsScanning(true);
    setScannedComments([]); 
    localStorage.removeItem('watcher_scanned_comments');

    try {
      const response = await api.post('/watcher/scan', {
        target_url: targetUrl,
        account_name: ACCOUNT_NAME
      });

      if (response.data.success) {
        saveComments(response.data.data);
        toast.success(`Scanned ${response.data.data.length} comments!`);
      } else {
        toast.error("Scan failed without specific error");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Safe Watcher</h1>
                <p className="text-slate-500 mt-1">Automated, stealthy Facebook comment monitoring.</p>
            </div>
            
            <div className="flex items-center gap-4">
                 {isConnected ? (
                     <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-100">
                         <CheckCircle2 size={16} />
                         <span>System Connected</span>
                     </div>
                 ) : (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full text-sm font-medium border border-amber-100">
                         <AlertCircle size={16} />
                         <span>Not Connected</span>
                     </div>
                 )}
                 
                 <button 
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm disabled:opacity-70"
                >
                    {isConnecting ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                    {isConnected ? "Reconnect Account" : "Connect Account"}
                </button>
            </div>
        </div>

        {/* Configurations - Full Width now since sidebar is gone */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Scanner Configuration</h2>
            
            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Page URL</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            placeholder="https://www.facebook.com/Nike"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="w-48">
                   <button
                        onClick={handleScan}
                        disabled={isScanning || !targetUrl}
                        className={`w-full py-3 rounded-lg font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                            isScanning 
                            ? 'bg-slate-400 cursor-not-allowed' 
                            : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
                        }`}
                    >
                        {isScanning ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <Play size={20} fill="currentColor" />
                                Start Scan
                            </>
                        )}
                    </button>
                </div>
            </div>
             <p className="text-xs text-slate-400 mt-4 flex items-center gap-1">
                <AlertCircle size={12} />
                <span>Random delays active (3-7s) to prevent bans. Browser will open and close automatically.</span>
            </p>
        </div>

        {/* Results Area */}
        {scannedComments.length > 0 && (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-slate-800">Scanned Results</h2>
                        <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">
                            {scannedComments.length} fetched
                        </span>
                    </div>
                    <button 
                        onClick={handleClearResults}
                        className="text-slate-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                        <Trash2 size={16} />
                        Clear Results
                    </button>
                </div>
                
                <div className="grid gap-3">
                    {scannedComments.map((comment, idx) => (
                        <CommentCard 
                            key={idx}
                            variant="scanned"
                            comment={{
                                ...comment,
                                sentiment: 'unknown', 
                                _id: comment.comment_id, 
                                original_text: comment.text, 
                                timestamp: new Date().toISOString()
                            }}
                            onRefresh={() => {}} 
                            onApprove={() => {}} 
                            onReject={() => {}}
                        />
                    ))}
                </div>
             </div>
        )}
    </div>
  );
};

export default WatcherPanel;
