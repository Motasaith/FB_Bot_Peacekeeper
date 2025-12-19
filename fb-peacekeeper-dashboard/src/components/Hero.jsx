import React from 'react';
import { motion } from 'framer-motion';
import { Headset, Bot } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 mb-8 text-white min-h-[300px] flex items-center">
      <div className="absolute top-0 right-0 p-12 opacity-10">
        <Bot size={400} />
      </div>

      <div className="relative z-10 max-w-2xl">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-4 text-emerald-400 font-medium tracking-wider text-sm uppercase">
            <Headset size={18} />
            <span>Auto-Responder Active • System Online</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Turn every comment into a <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              loyal customer.
            </span>
          </h1>
          
          <p className="text-slate-300 text-lg leading-relaxed max-w-lg">
            I am your automated sales assistant. I engage leads, answer queries, and manage support so you can focus on growing your business.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
