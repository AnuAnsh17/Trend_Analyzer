import React from 'react';
import { TrendingUp, ArrowRight, BarChart2, Activity } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-50 animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50 animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full py-12">
        
        {/* Header / Project Badge */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-semibold text-indigo-600 mb-6 tracking-wide uppercase">
            <BarChart2 className="w-4 h-4" />
            Group 14 • Maths Mini Project
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Stock Market <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Trend Analyzer</span>
          </h1>
          
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Module 5: Statistical Method
          </p>
        </div>

        {/* Members Cards */}
        <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 md:p-10 mb-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 px-6 py-2 rounded-full shadow-sm">
            <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Project Team</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center mt-4">
            {[
              { name: 'Anurag Yadav', roll: 'C57' },
              { name: 'Aman Yadav', roll: 'C56' },
              { name: 'Premdayal Yadav', roll: 'C58' },
              { name: 'Pritam Yadav', roll: 'C59' },
              { name: 'Riddhi Mirjulkar', roll: 'C68' },
            ].map((member, idx) => (
              <div key={idx} className="flex flex-col items-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg mb-3 shadow-inner">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm">{member.name}</h3>
                <span className="text-xs font-mono text-slate-500 mt-0.5">{member.roll}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:ring-offset-slate-50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative flex items-center gap-2">
            Enter Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </button>

      </div>
      
      {/* Footer minimal */}
      <div className="py-6 text-center text-xs text-slate-400 z-10 relative">
        <p>Mathematical Modeling • Real-time Data • NIFTY 50 Analysis</p>
      </div>

    </div>
  );
};
