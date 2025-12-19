import React from 'react';
import { AlertTriangle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsConditions = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 mb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-10 shadow-xl border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
                <FileText size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Terms & Conditions</h1>
                <p className="text-slate-500 dark:text-slate-400">Effective Date: {new Date().toLocaleDateString()}</p>
            </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-6">
            <section>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">1. Acceptance of Risk</h3>
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500 p-4 my-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-yellow-600 dark:text-yellow-500 mt-1 shrink-0" size={20} />
                         <p className="text-sm text-yellow-800 dark:text-yellow-200 m-0">
                            <strong>Critical Warning:</strong> Automating actions on Facebook (Meta) platforms is against their Terms of Service. By using this software, you acknowledge that you are doing so at your own risk.
                         </p>
                    </div>
                </div>
                <p>The developers of FB Automator Suite are not responsible for any account suspensions, bans, or restrictions imposed by Facebook/Meta as a result of using this tool.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">2. Intended Use</h3>
                <p>This software is provided for educational and administrative management purposes only. It is intended to help business owners and community managers streamline their workflow. It is NOT intended for spamming, harassment, or bulk unsolicited messaging.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">3. License & Distribution</h3>
                <p>This is open-source software. You are free to modify it for personal use. Redistribution or selling this software as a standalone product without permission is prohibited.</p>
            </section>

             <section>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">4. No Warranty</h3>
                <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.</p>
            </section>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsConditions;
