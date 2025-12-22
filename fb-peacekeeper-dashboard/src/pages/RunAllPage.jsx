import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, Loader, Terminal, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { triggerAnalysis } from '../services/api';
import ProfileCard from '../components/ProfileCard';
import { toast } from 'react-toastify';

const RunAllPage = ({ onNavigate }) => {
    const [status, setStatus] = useState('idle'); // idle, fetching, analyzing, complete, error
    const [logs, setLogs] = useState([]);
    const [url, setUrl] = useState("https://www.facebook.com/TrendXPakistan"); // Default for demo

    const addLog = (msg) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const runAutoPilot = async () => {
        if (!url) {
            toast.error("Please enter a URL first");
            return;
        }

        setStatus('fetching');
        setLogs([]);
        addLog("Starting Auto-Pilot...");
        
        try {
            // Step 1: Fetch
            addLog(`init_fetch: Target ${url}`);
            addLog("Connecting to Facebook Watcher...");
            
            const fetchRes = await api.post('/watcher/scan', { 
                target_url: url,
                account_name: "Default" 
            });

            if (fetchRes.data.success) {
                addLog(`Fetch Success: Found ${fetchRes.data.count} new comments.`);
            } else {
                throw new Error("Fetch failed or no comments found.");
            }

            // Step 2: Analyze
            setStatus('analyzing');
            addLog("Initializing AI Analysis...");
            const analyzeRes = await triggerAnalysis();
            
            if (analyzeRes) { // Assuming it returns data or we verify logic
                 addLog("AI Analysis Complete.");
            }

            // Complete
            setStatus('complete');
            addLog("Auto-Pilot Finished Successfully.");
            toast.success("Workflow Complete!");

        } catch (error) {
            console.error(error);
            setStatus('error');
            addLog(`ERROR: ${error.message || "Unknown error occurred"}`);
            toast.error("Auto-Pilot Failed");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 mb-32">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Auto-Pilot Mode</h1>
                    <p className="text-slate-500 dark:text-slate-400">Run the entire workflow (Fetch → Analyze) in one click.</p>
                </div>
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                >
                    Exit
                </button>
            </div>

            {/* Config & status */}
            <div className="grid md:grid-cols-2 gap-8">
                
                {/* Control Panel */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-fit">
                    <h2 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <Play size={20} className="text-indigo-500" />
                        <span>Configuration</span>
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target URL</label>
                            <input 
                                type="text" 
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={status !== 'idle' && status !== 'error'}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
                            />
                        </div>

                        {status === 'idle' || status === 'error' ? (
                            <div className="space-y-3">
                                <button
                                    onClick={runAutoPilot}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                                >
                                    <Play size={20} fill="currentColor" />
                                    <span>Start Auto-Pilot</span>
                                </button>
                                <button
                                    onClick={() => onNavigate('replies')}
                                    className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 py-2 text-sm font-semibold transition flex items-center justify-center gap-2"
                                >
                                    <span>Skip to Results</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        ) : status === 'complete' ? (
                            <button
                                onClick={() => onNavigate('replies')}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all"
                            >
                                <span>View Results</span>
                                <ArrowRight size={20} />
                            </button>
                        ) : (
                            <div className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold py-4 rounded-xl flex items-center justify-center gap-3 cursor-not-allowed">
                                <Loader size={20} className="animate-spin" />
                                <span>Running...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Console */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 font-mono text-sm h-[400px] flex flex-col shadow-2xl">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                        <span className="text-slate-400 flex items-center gap-2">
                            <Terminal size={16} />
                            <span>System Logs</span>
                        </span>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                        {logs.length === 0 && (
                            <div className="text-slate-600 italic">Waiting to start...</div>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className="text-emerald-400/90 whitespace-pre-wrap font-light">
                                <span className="text-slate-600 mr-2">{'>'}</span>
                                {log}
                            </div>
                        ))}
                        {status === 'fetching' && (
                             <div className="text-indigo-400 animate-pulse">Running Fetch Module...</div>
                        )}
                        {status === 'analyzing' && (
                             <div className="text-purple-400 animate-pulse">Running AI Sentiment Engine...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunAllPage;
