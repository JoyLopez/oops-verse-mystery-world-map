import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile } from '../types';
import {
  getLeaderboardEntries,
  LeaderboardEntry,
  LeaderboardSortMode,
  formatTimeSeconds,
} from '../utils/leaderboard';
import {
  Trophy,
  Star,
  Zap,
  CheckCircle2,
  Medal,
  RefreshCw,
  Search,
  ChevronRight,
  Shield,
  Sparkles,
  Info,
  X,
  Crown,
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface DetectiveLeaderboardProps {
  currentProfile: PlayerProfile;
}

export const DetectiveLeaderboard: React.FC<DetectiveLeaderboardProps> = ({ currentProfile }) => {
  const [sortMode, setSortMode] = useState<LeaderboardSortMode>('stars');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRival, setSelectedRival] = useState<LeaderboardEntry | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const entries = getLeaderboardEntries(currentProfile, sortMode);

  // Filter entries based on search query
  const filteredEntries = entries.filter(
    (e) =>
      e.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.badgeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentUserEntry = entries.find((e) => e.isCurrentUser);

  const handleRefresh = () => {
    sounds.playPop();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      sounds.playSuccess();
    }, 600);
  };

  // Top 3 Podium
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>HQ Detective Rankings</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Competitive global rankings updated live from Detective Headquarters.
          </p>
        </div>

        {/* Live Sync Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>HQ Sync</span>
          </button>
        </div>
      </div>

      {/* Sorting Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => {
            sounds.playPop();
            setSortMode('stars');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            sortMode === 'stars'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Total Stars</span>
        </button>

        <button
          onClick={() => {
            sounds.playPop();
            setSortMode('speed');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            sortMode === 'speed'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Solve Speed</span>
        </button>

        <button
          onClick={() => {
            sounds.playPop();
            setSortMode('cases');
          }}
          className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            sortMode === 'cases'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Cases Solved</span>
        </button>
      </div>

      {/* Current Detective Rank Summary Banner */}
      {currentUserEntry && (
        <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-cyan-500/15 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md flex-shrink-0">
              #{currentUserEntry.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  Your Current Standing
                </span>
              </div>
              <h4 className="text-base font-bold text-white leading-tight mt-0.5">
                {currentUserEntry.username} ({currentUserEntry.badgeId})
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentUserEntry.title} • {currentUserEntry.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono font-bold bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Stars</span>
              <span className="text-amber-400">⭐ {currentUserEntry.totalStars}</span>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Avg Speed</span>
              <span className="text-cyan-400">⚡ {formatTimeSeconds(currentUserEntry.avgSpeedSeconds)}</span>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Solved</span>
              <span className="text-emerald-400">📁 {currentUserEntry.casesSolved}</span>
            </div>
          </div>
        </div>
      )}

      {/* Podium Display (Top 3) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 pb-2 items-end">
        {/* #2 Silver */}
        {top2 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => {
              sounds.playPop();
              setSelectedRival(top2);
            }}
            className="relative bg-slate-900/90 border border-slate-400/30 rounded-2xl p-3 sm:p-4 text-center cursor-pointer hover:border-slate-300 transition-all shadow-md group"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-900 shadow-md">
              2
            </div>
            <div className="text-3xl sm:text-4xl mt-2 mb-1 group-hover:scale-110 transition-transform">
              {top2.avatar}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate">{top2.username}</h4>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{top2.badgeId}</p>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono font-bold text-slate-300">
              {sortMode === 'stars' && `⭐ ${top2.totalStars}`}
              {sortMode === 'speed' && `⚡ ${formatTimeSeconds(top2.avgSpeedSeconds)}`}
              {sortMode === 'cases' && `📁 ${top2.casesSolved}`}
            </div>
          </motion.div>
        )}

        {/* #1 Gold */}
        {top1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              sounds.playPop();
              setSelectedRival(top1);
            }}
            className="relative bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-900 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-5 text-center cursor-pointer hover:border-amber-400 transition-all shadow-xl shadow-amber-500/10 group -translate-y-2"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-slate-900 shadow-lg">
              <Crown className="w-4 h-4 text-slate-950" />
            </div>
            <div className="text-4xl sm:text-5xl mt-2 mb-1 group-hover:scale-110 transition-transform">
              {top1.avatar}
            </div>
            <div className="inline-block bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1">
              HQ Champion
            </div>
            <h4 className="text-sm sm:text-base font-black text-white truncate">{top1.username}</h4>
            <p className="text-[10px] text-amber-400 font-mono mt-0.5">{top1.badgeId}</p>
            <div className="mt-2 pt-2 border-t border-amber-500/30 text-xs font-mono font-black text-amber-300">
              {sortMode === 'stars' && `⭐ ${top1.totalStars} Stars`}
              {sortMode === 'speed' && `⚡ ${formatTimeSeconds(top1.avgSpeedSeconds)}`}
              {sortMode === 'cases' && `📁 ${top1.casesSolved} Solved`}
            </div>
          </motion.div>
        )}

        {/* #3 Bronze */}
        {top3 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => {
              sounds.playPop();
              setSelectedRival(top3);
            }}
            className="relative bg-slate-900/90 border border-amber-700/40 rounded-2xl p-3 sm:p-4 text-center cursor-pointer hover:border-amber-600 transition-all shadow-md group"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center border-2 border-slate-900 shadow-md">
              3
            </div>
            <div className="text-3xl sm:text-4xl mt-2 mb-1 group-hover:scale-110 transition-transform">
              {top3.avatar}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-200 truncate">{top3.username}</h4>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{top3.badgeId}</p>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-mono font-bold text-amber-500">
              {sortMode === 'stars' && `⭐ ${top3.totalStars}`}
              {sortMode === 'speed' && `⚡ ${formatTimeSeconds(top3.avgSpeedSeconds)}`}
              {sortMode === 'cases' && `📁 ${top3.casesSolved}`}
            </div>
          </motion.div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search detective callsing or Badge ID..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      {/* Rankings List */}
      <div className="space-y-2">
        {filteredEntries.map((entry) => {
          const isUser = entry.isCurrentUser;

          return (
            <motion.div
              key={entry.badgeId}
              layout
              onClick={() => {
                sounds.playPop();
                setSelectedRival(entry);
              }}
              className={`p-3 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                isUser
                  ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30'
                  : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank Number */}
                <div
                  className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center flex-shrink-0 ${
                    entry.rank === 1
                      ? 'bg-amber-400 text-slate-950'
                      : entry.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : entry.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  #{entry.rank}
                </div>

                {/* Avatar */}
                <div className="text-2xl flex-shrink-0">{entry.avatar}</div>

                {/* Detective Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-sm text-white truncate max-w-[140px] sm:max-w-[200px]">
                      {entry.username}
                    </span>
                    <span className="text-xs">{entry.country}</span>
                    {isUser && (
                      <span className="text-[9px] font-black uppercase bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                        YOU
                      </span>
                    )}
                    {entry.specialBadge && !isUser && (
                      <span className="text-[9px] font-bold uppercase bg-slate-800 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/20">
                        {entry.specialBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {entry.badgeId} • <span className="text-slate-300">{entry.title}</span>
                  </p>
                </div>
              </div>

              {/* Stats Badge */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right font-mono text-xs">
                  {sortMode === 'stars' && (
                    <div>
                      <span className="text-amber-400 font-bold block">⭐ {entry.totalStars}</span>
                      <span className="text-[10px] text-slate-500">{entry.casesSolved} Solved</span>
                    </div>
                  )}
                  {sortMode === 'speed' && (
                    <div>
                      <span className="text-cyan-400 font-bold block">
                        ⚡ {formatTimeSeconds(entry.avgSpeedSeconds)}
                      </span>
                      <span className="text-[10px] text-slate-500">⭐ {entry.totalStars} Stars</span>
                    </div>
                  )}
                  {sortMode === 'cases' && (
                    <div>
                      <span className="text-emerald-400 font-bold block">📁 {entry.casesSolved}</span>
                      <span className="text-[10px] text-slate-500">⭐ {entry.totalStars} Stars</span>
                    </div>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-600" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Rival Detective Detail Modal */}
      <AnimatePresence>
        {selectedRival && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center"
            >
              <button
                onClick={() => {
                  sounds.playPop();
                  setSelectedRival(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-5xl mb-3">{selectedRival.avatar}</div>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase">
                {selectedRival.badgeId}
              </span>
              <h3 className="text-xl font-black text-white mt-1">{selectedRival.username}</h3>
              <p className="text-xs text-slate-400">{selectedRival.title} • {selectedRival.country}</p>

              <div className="grid grid-cols-3 gap-2 my-5 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs font-mono font-bold">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Rank</span>
                  <span className="text-amber-400">#{selectedRival.rank}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Total Stars</span>
                  <span className="text-amber-300">⭐ {selectedRival.totalStars}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Avg Speed</span>
                  <span className="text-cyan-400">{formatTimeSeconds(selectedRival.avgSpeedSeconds)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playPop();
                  setSelectedRival(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider"
              >
                Close Profile
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
