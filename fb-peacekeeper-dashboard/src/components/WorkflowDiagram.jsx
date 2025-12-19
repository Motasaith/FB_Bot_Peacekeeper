import React from 'react';
import { motion } from 'framer-motion';
import { CloudDownload, Activity, Send } from 'lucide-react';

const StepParams = [
    { 
        icon: CloudDownload, 
        title: "1. Fetch Comments", 
        description: "Paste your post URL to securely scrape new comments for analysis." 
    },
    { 
        icon: Activity, 
        title: "2. Analyze Sentiment", 
        description: "AI scans text to detect leads, questions, hate speech, and spam." 
    },
    { 
        icon: Send, 
        title: "3. Review & Reply", 
        description: "Approve AI-drafted replies and post them back to Facebook instantly." 
    }
];

const WorkflowDiagram = () => {
    return (
        <div className="w-full max-w-6xl mx-auto py-12 px-4">
             <div className="text-center mb-16">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">How It Works</h2>
                <p className="text-slate-400 mt-2">Automate your business replies in 3 simple steps</p>
             </div>
             
             {/* Desktop/Tablet Flex View */}
             <div className="hidden md:flex justify-between items-start relative">
                {/* Connecting Line Layer - Absolute to ensure it goes behind */}
                <div className="absolute top-8 left-0 w-full px-16 h-[2px] -z-10 flex items-center">
                    <div className="w-full h-full bg-slate-800 relative">
                        <motion.div 
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 origin-left"
                        />
                    </div>
                </div>

                {StepParams.map((step, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.3 }}
                        className="flex flex-col items-center flex-1"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 shadow-xl relative z-20 group hover:border-indigo-500 transition-colors duration-300">
                             <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                             <step.icon className="w-8 h-8 text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">{step.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-500 text-center max-w-[250px] leading-relaxed">
                            {step.description}
                        </p>
                    </motion.div>
                ))}
             </div>

             {/* Mobile Stack View */}
             <div className="md:hidden flex flex-col gap-12">
                {StepParams.map((step, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                             <step.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{step.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 text-center px-6">
                            {step.description}
                        </p>
                        {index < StepParams.length - 1 && (
                            <div className="w-[2px] h-8 bg-slate-200 dark:bg-slate-800 my-4" />
                        )}
                    </div>
                ))}
             </div>
        </div>
    );
};

export default WorkflowDiagram;
