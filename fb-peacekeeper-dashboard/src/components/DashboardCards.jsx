import React from 'react';
import { motion } from 'framer-motion';
import { CloudDownload, BarChart2, MessageSquare, ArrowRight } from 'lucide-react';

const Card = ({ title, description, icon: Icon, color, onClick, delay }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            onClick={onClick}
            className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-8 cursor-pointer hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon size={120} />
            </div>
            
            <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${color} bg-opacity-20`}>
                    <Icon className={`w-7 h-7 text-white`} />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-100 mb-3">{title}</h3>
                <p className="text-slate-400 mb-8 leading-relaxed max-w-sm">{description}</p>
                
                <div className="flex items-center text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                    <span>Launch Tool</span>
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
            
             <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/50 pointer-events-none" />
        </motion.div>
    );
};

const DashboardCards = ({ onNavigate }) => {
    return (
        <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
                title="Fetch Comments"
                description="Connect to Facebook and scrape the latest comments from your selected post."
                icon={CloudDownload}
                color="bg-blue-500"
                delay={0.2}
                onClick={() => onNavigate('fetch')}
            />
            <Card 
                title="Sentiment AI"
                description="Run advanced AI analysis to categorize leads, support requests, and spam."
                icon={BarChart2}
                color="bg-purple-500"
                delay={0.4}
                onClick={() => onNavigate('sentiment')}
            />
             <Card 
                title="Auto-Replies"
                description="Review AI-generated drafts, approve responses, and engage with customers."
                icon={MessageSquare}
                color="bg-emerald-500"
                delay={0.6}
                onClick={() => onNavigate('replies')}
            />
        </div>
    );
};

export default DashboardCards;
