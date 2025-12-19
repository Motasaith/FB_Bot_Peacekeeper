import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CloudDownload, Activity, Send } from 'lucide-react';

const Step = ({ icon: Icon, title, description, delay, isLast }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="flex flex-col items-center flex-1 relative z-10"
        >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">{title}</h3>
            <p className="text-sm text-slate-400 text-center max-w-[200px]">{description}</p>
            
            {!isLast && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-[2px] bg-slate-800 -z-10 transform translate-x-1/2">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: delay + 0.3, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                     />
                </div>
            )}
        </motion.div>
    );
};

const WorkflowDiagram = () => {
    return (
        <div className="w-full max-w-6xl mx-auto py-12 px-4">
             <div className="text-center mb-12">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">How It Works</h2>
                <p className="text-slate-400 mt-2">Automate your business replies in 3 simple steps</p>
             </div>
             
             <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative">
                 <Step 
                    icon={CloudDownload} 
                    title="1. Fetch Comments" 
                    description="Paste your post URL to securely scrape new comments from Facebook."
                    delay={0}
                 />
                 <Step 
                    icon={Activity} 
                    title="2. Analyze Sentiment" 
                    description="AI scans comments to detect leads, questions, and spam."
                    delay={0.5}
                 />
                 <Step 
                    icon={Send} 
                    title="3. Review & Reply" 
                    description="Approve AI-drafted replies and post them instantly."
                    delay={1.0}
                    isLast
                 />
             </div>
        </div>
    );
};

export default WorkflowDiagram;
