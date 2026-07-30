import React from 'react';
import { motion } from 'motion/react';
import { WorldData, CaseData, PlayerProfile } from '../types';
import { Star, CheckCircle2, Play, ArrowLeft, ShieldAlert } from 'lucide-react';
import { sounds } from '../utils/sound';

interface CaseSelectProps {
  world: WorldData;
  profile: PlayerProfile;
  onSelectCase: (caseData: CaseData) => void;
  onBackToMap: () => void;
}

export const CaseSelect: React.FC<CaseSelectProps> = ({
  world,
  profile,
  onSelectCase,
  onBackToMap,
}) => {
  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 lg:p-6 pb-20 relative font-sans">
      {/* Subtle Grid Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Navigation & World Dossier Header Bento Box */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-5">
            <button
              onClick={() => {
                sounds.playPop();
                onBackToMap();
              }}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-amber-400 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Map</span>
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
              {world.emoji}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  World Dossier
                </span>
                <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  Boss: {world.bossTitle}
                </span>
              </div>
              <h2 className="text-2xl font-black italic uppercase text-slate-100 font-sans">
                {world.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 max-w-md">{world.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-end">
            <div className="text-left md:text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Case Files
              </p>
              <p className="text-xl font-black text-amber-400 font-mono">10 / 10</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Status
              </p>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
          </div>
        </motion.div>

        {/* Case Files Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {world.cases.map((c, index) => {
            const solvedRecord = profile.solvedCases[c.id];
            const isSolved = !!solvedRecord;
            const stars = solvedRecord?.stars || 0;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.05 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sounds.playPop();
                  onSelectCase(c);
                }}
                className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  c.isBoss
                    ? 'bg-amber-500/15 border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : isSolved
                    ? 'bg-emerald-500/10 border-2 border-emerald-500/40 hover:border-emerald-400'
                    : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/50'
                }`}
              >
                {c.isBoss && (
                  <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>FINAL BOSS CASE</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest">
                      CASE #{c.num}
                    </span>

                    {isSolved && (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((starNum) => (
                          <Star
                            key={starNum}
                            className={`w-3.5 h-3.5 ${
                              starNum <= stars
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 my-2">
                    <span className="text-4xl flex-shrink-0">{c.emoji}</span>
                    <div>
                      <h3 className="font-bold text-base text-slate-100 font-sans leading-tight">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.desc}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  {isSolved ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" /> Solved
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1 uppercase tracking-wider">
                      <Play className="w-3.5 h-3.5" /> Start Case
                    </span>
                  )}

                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">
                    {c.badge}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

