import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { ALL_WORLDS, getAllCasesFlat } from '../data/worlds';
import { BookOpen, Star, CheckCircle2, ArrowLeft, Search } from 'lucide-react';
import { sounds } from '../utils/sound';

interface CaseFilesProps {
  profile: PlayerProfile;
  onBack: () => void;
}

export const CaseFiles: React.FC<CaseFilesProps> = ({ profile, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorldFilter, setSelectedWorldFilter] = useState<string>('all');

  const allCases = getAllCasesFlat();
  const solvedCount = Object.keys(profile.solvedCases).length;

  const filteredCases = allCases.filter((c) => {
    const matchesWorld = selectedWorldFilter === 'all' || c.worldId === selectedWorldFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWorld && matchesSearch;
  });

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 pb-12 max-w-2xl mx-auto font-sans">
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

        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
          <BookOpen className="w-4 h-4" />
          <span>
            {solvedCount} / {allCases.length} Solved
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-black text-amber-200 font-sans mb-1">
        Detective Archives Notebook
      </h2>
      <p className="text-xs text-slate-400 mb-6">
        Review solved case files, evidence logs, and world badges.
      </p>

      {/* Search & World Filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search case files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedWorldFilter}
          onChange={(e) => setSelectedWorldFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Worlds</option>
          {ALL_WORLDS.map((w) => (
            <option key={w.id} value={w.id}>
              {w.emoji} {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Case List */}
      <div className="space-y-3">
        {filteredCases.map((c) => {
          const solvedRecord = profile.solvedCases[c.id];
          const isSolved = !!solvedRecord;

          return (
            <div
              key={c.id}
              className={`p-4 rounded-2xl border transition-all ${
                isSolved
                  ? 'bg-slate-900/90 border-amber-500/40'
                  : 'bg-slate-900/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl p-2 bg-slate-800 rounded-xl border border-slate-700">
                    {c.emoji}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                        #{c.num}
                      </span>
                      <h3 className="font-bold text-sm text-slate-100 font-sans">{c.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{c.desc}</p>
                  </div>
                </div>

                <div>
                  {isSolved ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Solved</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Unsolved</span>
                  )}
                </div>
              </div>

              {isSolved && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[1, 2, 3].map((starNum) => (
                      <Star
                        key={starNum}
                        className={`w-3.5 h-3.5 ${
                          starNum <= (solvedRecord.stars || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-amber-300">Badge: {c.badge}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
