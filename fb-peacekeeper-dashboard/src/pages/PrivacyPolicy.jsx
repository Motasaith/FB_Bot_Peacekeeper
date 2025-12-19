import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 mb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-10 shadow-xl border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <Lock size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Privacy Policy</h1>
                <p className="text-slate-500 dark:text-slate-400">Last Updated: {new Date().toLocaleDateString()}</p>
            </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-6">
            <section>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">1. Data Ownership</h3>
                <p>FB Automator Suite is a <strong>self-hosted</strong> application. All data scraped, analyzed, and generated resides locally on your machine or your own personal MongoDB database. We (the developers) do not have access to your cookies, Facebook credentials, or customer data.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">2. AI Processing</h3>
                <p>This tool uses third-party AI providers (e.g., OpenRouter, Google Gemini). When you click "Analyze", comment text is sent to these providers for processing. No personal identifiers are explicitly extracted by our code before sending, but the comment content itself is transmitted.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">3. Browser Automation</h3>
                <p>We use local browser automation (DrissionPage) to interact with Facebook. This operates entirely within your local network environment.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">4. Cookies & Session Data</h3>
                <p>Your Facebook session cookies are stored locally in your browser profile directory. This data is critical for the bot's operation and is never shared externally.</p>
            </section>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
