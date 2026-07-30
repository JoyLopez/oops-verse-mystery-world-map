import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CaseData } from '../types';
import { Video, Play, Pause, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { sounds } from '../utils/sound';

interface WitnessInterviewProps {
  caseData: CaseData;
  onCompleteInterview: () => void;
}

export const WitnessInterview: React.FC<WitnessInterviewProps> = ({
  caseData,
  onCompleteInterview,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 pb-12 font-sans flex flex-col justify-between max-w-xl mx-auto">
      <div>
        {/* Step Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-amber-500/30 rounded-2xl p-3 mb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
              Phase 2 of 4 • Witness & Footage
            </span>
            <h2 className="text-base font-bold text-amber-100 font-sans">{caseData.title}</h2>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Interview Logged</span>
          </div>
        </div>

        {/* Witness Card */}
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 mb-4 shadow-xl">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl">
              {caseData.witness.avatar}
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-200 font-sans">
                {caseData.witness.name}
              </h3>
              <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">
                Key Eyewitness
              </span>
            </div>
          </div>

          <div className="bg-slate-950/80 border-l-4 border-amber-400 p-4 rounded-r-2xl text-sm italic text-amber-100 leading-relaxed mb-2">
            "{caseData.witness.quote}"
          </div>
        </div>

        {/* Security Footage Video Player */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 shadow-xl mb-4">
          <div className="flex items-center justify-between mb-3 text-xs font-mono font-bold text-slate-400">
            <span className="flex items-center gap-1 text-rose-400">
              <Video className="w-4 h-4 animate-pulse" /> SECURITY CAM #04 REPLAY
            </span>
            <span className="text-slate-500">1080P • HIGH SPEED</span>
          </div>

          <div className="bg-black border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[160px] text-center">
            {/* Scanlines Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

            <div className="relative z-10">
              <div className="text-4xl mb-2 animate-pulse">{caseData.emoji}</div>
              <p className="text-xs text-amber-200/90 font-mono leading-relaxed bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                {caseData.witness.footage}
              </p>
            </div>

            {/* Play Pause Controls */}
            <div className="mt-4 flex items-center gap-3 relative z-10">
              <button
                onClick={() => {
                  sounds.playPop();
                  setIsPlaying(!isPlaying);
                }}
                className="p-2 rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <motion.div
                  animate={{ x: isPlaying ? ['-100%', '100%'] : '0%' }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  className="w-12 h-full bg-amber-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Step Button */}
      <button
        onClick={() => {
          sounds.playSuccess();
          onCompleteInterview();
        }}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 text-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
      >
        <span>Reconstruct Timeline</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
