import React from 'react';

const Loading = () => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-xl transition-opacity duration-500">
            <div className="relative flex items-center justify-center">
                {/* Modern Spinning Rings */}
                <div className="absolute w-32 h-32 border-2 border-indigo-600/10 rounded-[3rem] animate-[spin_4s_linear_infinite]"></div>
                <div className="absolute w-28 h-28 border-2 border-cyan-400/20 rounded-[2.5rem] animate-[spin_3s_linear_infinite_reverse]"></div>
                <div className="absolute w-24 h-24 border-2 border-indigo-600/5 rounded-[2rem] animate-[spin_2s_linear_infinite]"></div>

                {/* Logo Container - Branded White/Indigo with Cyan Dot */}
                <div className="relative flex items-center justify-center scale-150">
                    <div className="flex items-center">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter">ATS</span>
                        <span className="text-4xl font-black text-cyan-400 ml-0.5">.</span>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default Loading;
