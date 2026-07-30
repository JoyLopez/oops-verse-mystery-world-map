import React, { useState } from 'react';
import { CaseData, WorldId } from '../types';
import { Sparkles, Wand2, ArrowLeft, Play, RefreshCw } from 'lucide-react';
import { sounds } from '../utils/sound';

interface AIMysteryMakerProps {
  onBack: () => void;
  onPlayCustomCase: (caseData: CaseData) => void;
}

export const AIMysteryMaker: React.FC<AIMysteryMakerProps> = ({
  onBack,
  onPlayCustomCase,
}) => {
  const [prompt, setPrompt] = useState('');
  const [worldTheme, setWorldTheme] = useState<WorldId>('disaster-city');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    sounds.playPowerUp();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate-mystery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, worldId: worldTheme }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      setIsGenerating(false);
      sounds.playSuccess();
      onPlayCustomCase(data.caseData);
    } catch (err) {
      // Fallback generator if server API is unavailable
      setIsGenerating(false);
      sounds.playSuccess();

      const fallbackCase: CaseData = {
        id: `custom-${Date.now()}`,
        num: 'AI',
        worldId: worldTheme,
        title: prompt || 'The Custom AI Mystery',
        emoji: '🔮',
        desc: `AI Generated Investigation: ${prompt}`,
        mechanicType: 'standard',
        scene: {
          bgGradient: ['#0F172A', '#1E293B', '#334155'],
          mainEmoji: '🔮✨',
          decorEmojis: ['⭐', '🔍', '📜'],
        },
        clues: {
          c1: { id: 'c1', icon: '🔍', title: 'Mysterious Footprints', desc: 'Glowing energy tracks lead into the chamber.', note: 'Clue logged by AI.' },
          c2: { id: 'c2', icon: '📜', title: 'Encrypted Note', desc: 'Contains secret cipher code.', note: 'Decoded successfully.' },
          c3: { id: 'c3', icon: '🧪', title: 'Energy Residue', desc: 'Glowing purple dust on floor.', note: 'AI evidence.' },
          c4: { id: 'c4', icon: '⚙️', title: 'Strange Device', desc: 'Humming with unknown power.', note: 'Key evidence.' },
          secret: { id: 'secret', icon: '👑', title: 'AI Golden Relic', desc: 'Floating inside time rift.', note: 'Secret found!', isSecret: true },
        },
        hotspots: [
          { x: 30, y: 50, clueId: 'c1' },
          { x: 70, y: 70, clueId: 'c2' },
          { x: 20, y: 30, clueId: 'c3' },
          { x: 80, y: 25, clueId: 'c4' },
          { x: 85, y: 85, clueId: 'secret' },
        ],
        witness: {
          avatar: '🤖',
          name: 'AI Detective Assistant',
          quote: 'The temporal energy readings spiked right before the anomaly appeared!',
          footage: 'FOOTAGE: AI scanning energy anomaly in central chamber.',
        },
        timeline: {
          correctOrder: ['start', 'energy', 'spike', 'anomaly', 'solve'],
          cards: {
            start: 'Investigation initiated by AI Studio',
            energy: 'Energy levels began fluctuating',
            spike: 'Spike reached 10,000 gigawatts',
            anomaly: 'Temporal anomaly erupted in center',
            solve: 'Detective arrived to solve mystery',
          },
        },
        culprits: [
          { id: 'rogue', name: 'Rogue AI Glitch', emoji: '🤖', isCorrect: true },
          { id: 'hacker', name: 'Cyber Hacker', emoji: '💻', isCorrect: false, wrongMessage: 'Hacker was just writing code.' },
          { id: 'bot', name: 'Maintenance Bot', emoji: '🤖', isCorrect: false, wrongMessage: 'Bot was cleaning floors.' },
          { id: 'time', name: 'Time Drifter', emoji: '🕰️', isCorrect: false, wrongMessage: 'Drifter was passing through.' },
        ],
        repair: {
          title: 'Stabilize AI Energy Anomaly',
          brokenEmoji: '🔮⚡',
          fixedEmoji: '🔮✨',
          steps: ['Calibrate AI energy matrix', 'Absorb excess quantum particles', 'Seal temporal rift'],
          holdLabel: '🔮 Hold to Stabilize AI Anomaly',
        },
        badge: 'AI Master Detective',
        secretBadge: 'Quantum Sleuth',
        ending: {
          1: 'Custom AI anomaly stabilized cleanly.',
          2: 'Rogue glitch code patches applied to matrix.',
          3: 'OUTSTANDING SOLVE! AI Detective Assistant awards you Master Sleuth Badge.',
        },
      };

      onPlayCustomCase(fallbackCase);
    }
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 pb-12 max-w-xl mx-auto font-sans">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            sounds.playPop();
            onBack();
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-slate-900 border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/30">
          <Wand2 className="w-4 h-4" />
          <span>AI Case Lab</span>
        </div>
      </div>

      <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-purple-300 to-amber-500 font-sans mb-1">
        AI Mystery Studio
      </h2>
      <p className="text-xs text-slate-400 mb-6">
        Describe any mystery idea and Gemini AI will construct a 4-phase investigation case file!
      </p>

      {/* Input Box */}
      <div className="bg-slate-900 border-2 border-purple-500/40 rounded-3xl p-5 mb-6 shadow-xl">
        <label className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-2">
          1. Describe Your Mystery Idea
        </label>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A mystery where all coffee cups in a office building started floating..."
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 mb-4"
        />

        <label className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-2">
          2. Select World Dimension
        </label>
        <select
          value={worldTheme}
          onChange={(e) => setWorldTheme(e.target.value as WorldId)}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 mb-6"
        >
          <option value="disaster-city">🏙️ Disaster City</option>
          <option value="mystery-island">🏝️ Mystery Island</option>
          <option value="space-station">🚀 Space Station</option>
          <option value="fantasy-kingdom">🏰 Fantasy Kingdom</option>
          <option value="moon-base">🌙 Moon Base</option>
          <option value="time-dimension">⏳ Time Dimension</option>
        </select>

        <button
          disabled={!prompt.trim() || isGenerating}
          onClick={handleGenerate}
          className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
            prompt.trim() && !isGenerating
              ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 hover:from-purple-400 hover:to-amber-400 text-slate-950 shadow-purple-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating AI Case...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Investigation Case</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
