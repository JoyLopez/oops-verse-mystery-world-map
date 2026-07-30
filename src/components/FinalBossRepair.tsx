import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CaseData } from '../types';
import { Wrench, CheckCircle2, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/sound';

interface FinalBossRepairProps {
  caseData: CaseData;
  onCompleteRepair: () => void;
}

export const FinalBossRepair: React.FC<FinalBossRepairProps> = ({
  caseData,
  onCompleteRepair,
}) => {
  const repairInfo = caseData.repair;
  const [progress, setProgress] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHolding && progress < 100) {
      sounds.playPowerUp();
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalRef.current!);
            return 100;
          }
          return prev + 4;
        });
      }, 50);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHolding, progress]);

  useEffect(() => {
    if (progress >= 100) {
      sounds.playSuccess();
    }
  }, [progress]);

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 pb-12 font-sans flex flex-col justify-between max-w-xl mx-auto">
      <div>
        {/* Step Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-amber-500/30 rounded-2xl p-3 mb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
              Final Phase • World Repair Mechanic
            </span>
            <h2 className="text-base font-bold text-amber-100 font-sans">
              {repairInfo?.title || 'Repair Disaster Area'}
            </h2>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            <Wrench className="w-3.5 h-3.5" />
            <span>Interactive Tool</span>
          </div>
        </div>

        {/* Status Display Card */}
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 mb-6 text-center shadow-xl">
          <div className="text-7xl mb-4 transition-transform scale-110">
            {progress >= 100 ? repairInfo?.fixedEmoji : repairInfo?.brokenEmoji}
          </div>

          <h3 className="text-xl font-bold text-amber-200 font-sans mb-2">
            {progress >= 100 ? 'Area Successfully Repaired!' : repairInfo?.title}
          </h3>

          {/* Steps Checklist */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left my-4 space-y-2 text-xs">
            {repairInfo?.steps.map((stepStr, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-4 h-4 flex-shrink-0 ${
                    progress >= ((idx + 1) / repairInfo.steps.length) * 100
                      ? 'text-emerald-400'
                      : 'text-slate-700'
                  }`}
                />
                <span
                  className={
                    progress >= ((idx + 1) / repairInfo.steps.length) * 100
                      ? 'text-emerald-200 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  {stepStr}
                </span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 mb-2">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-amber-300">{progress}% Charged</span>
        </div>

        {/* Hold Button Mechanic */}
        {progress < 100 && (
          <div className="text-center">
            <button
              onMouseDown={() => setIsHolding(true)}
              onMouseUp={() => setIsHolding(false)}
              onTouchStart={() => setIsHolding(true)}
              onTouchEnd={() => setIsHolding(false)}
              className="w-full py-6 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-lg rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 select-none cursor-pointer"
            >
              <span>{repairInfo?.holdLabel || '🛠️ Hold to Perform Repair'}</span>
              <span className="text-[10px] font-mono text-slate-900 font-bold uppercase tracking-wider">
                Hold button until meter hits 100%
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Complete Button */}
      {progress >= 100 && (
        <button
          onClick={() => {
            sounds.playSuccess();
            onCompleteRepair();
          }}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/20 text-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <span>Complete Investigation</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
