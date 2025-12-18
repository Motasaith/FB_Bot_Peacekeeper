import React, { useState, useEffect } from 'react';
import { Play, Plus, Loader2, User, Globe, AlertCircle, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import CommentCard from '../CommentCard';

const WatcherPanel = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [scannedComments, setScannedComments] = useState([]);
  const [showConnectModal, setShowConnectModal] = useState(false);

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

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/watcher/accounts');
      setAccounts(response.data.accounts);
      if (response.data.accounts.length > 0 && !selectedAccount) {
        setSelectedAccount(response.data.accounts[0]);
      } else if (response.data.accounts.length === 0) {
        setSelectedAccount('');
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
      toast.error("Failed to load accounts");
    }
  };

  const handleDeleteAccount = async (accountName) => {
      if (!window.confirm(`Are you sure you want to delete ${accountName}?`)) return;
      
      try {
          await api.delete(`/watcher/accounts/${accountName}`);
          toast.success("Account deleted");
          if (selectedAccount === accountName) setSelectedAccount('');
          fetchAccounts();
      } catch (err) {
          console.error(err);
          toast.error("Failed to delete account");
      }
  };

  const handleConnect = async () => {
    if (!newAccountName.trim()) {
        toast.warning("Please enter an account name");
        return;
    }
    
    setIsConnecting(true);
    try {
      // Connect call triggers the python script which opens the browser
      const response = await api.post('/watcher/connect', { account_name: newAccountName });
      toast.info(response.data.message);
      setShowConnectModal(false);
      
      // Since login is manual and outside the browser's control context (it waits for close),
      // we can polling or just ask user to refresh.
      // But actually, we should just assume user will do it.
      // We can reload accounts after a delay or let user do it.
      setTimeout(fetchAccounts, 5000); 
      
    } catch (err) {
      toast.error("Failed to start login intent");
    } finally {
      setIsConnecting(false);
      setNewAccountName('');
    }
  };

  const handleScan = async () => {
    if (!targetUrl) {
        toast.warning("Please enter a Page URL");
        return;
    }
    if (!selectedAccount) {
        toast.warning("Please select an account");
        return;
    }

    setIsScanning(true);
    // setScannedComments([]); // Don't clear immediately, maybe append? Or clear if user wants.
    // User requested persistence, but scan replaces usually. Let's replace for now but logic is persisted.
    // Actually, usually a new scan implies new results.
    setScannedComments([]); 
    localStorage.removeItem('watcher_scanned_comments');

    try {
      const response = await api.post('/watcher/scan', {
        target_url: targetUrl,
        account_name: selectedAccount
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
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Safe Watcher</h1>
                <p className="text-slate-500 mt-1">Automated, stealthy Facebook comment monitoring.</p>
            </div>
            <button 
                onClick={() => setShowConnectModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm"
            >
                <Plus size={20} />
                Connect New Account
            </button>
        </div>

        {/* Account Selection */}
        <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Select Identity</h2>
                        <button onClick={fetchAccounts} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">Refresh</button>
                    </div>
                    
                    {accounts.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <User size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No accounts connected</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {accounts.map(acc => (
                                <div
                                    key={acc}
                                    role="button"
                                    onClick={() => setSelectedAccount(acc)}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all cursor-pointer ${
                                        selectedAccount === acc 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium border' 
                                        : 'hover:bg-slate-50 border border-transparent text-slate-600'
                                    }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${selectedAccount === acc ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                                    <span className="flex-1 truncate">{acc}</span>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteAccount(acc);
                                        }}
                                        className="p-1 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded transition-colors"
                                        title="Delete Account"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Scanner Controls */}
            <div className="md:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Scanner Configuration</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Target Page URL</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    value={targetUrl}
                                    onChange={(e) => setTargetUrl(e.target.value)}
                                    placeholder="https://www.facebook.com/Nike"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                           <button
                                onClick={handleScan}
                                disabled={isScanning || !selectedAccount || !targetUrl}
                                className={`w-full py-3 rounded-lg font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                                    isScanning 
                                    ? 'bg-slate-400 cursor-not-allowed' 
                                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
                                }`}
                            >
                                {isScanning ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Scanning Globally... (Stealth Mode)
                                    </>
                                ) : (
                                    <>
                                        <Play size={20} fill="currentColor" />
                                        Start Watcher Scan
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
                                <AlertCircle size={12} />
                                Random delays active (3-7s) to prevent bans. Please be patient.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
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
                            // Passed functions are dummies since actions are disabled in scanned mode usually
                            onApprove={() => {}} 
                            onReject={() => {}}
                        />
                    ))}
                </div>
             </div>
        )}

        {/* Connect Modal */}
        {showConnectModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Connect Facebook Account</h3>
                    <p className="text-slate-500 text-sm mb-6">
                        Enter a label for this account (e.g., "Personal", "Work"). <br/>
                        A browser window will open on the server. <br/>
                        <strong>Log in manually. The window will close automatically when done.</strong>
                    </p>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Account Label</label>
                            <input 
                                type="text" 
                                autoFocus
                                value={newAccountName}
                                onChange={(e) => setNewAccountName(e.target.value)}
                                placeholder="my-fb-account"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                             <button 
                                onClick={() => setShowConnectModal(false)}
                                className="flex-1 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="flex-1 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2"
                            >
                                {isConnecting ? <Loader2 className="animate-spin" size={18}/> : 'Launch Browser'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default WatcherPanel;
