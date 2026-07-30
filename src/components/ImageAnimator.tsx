import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  Film,
  Sparkles,
  Play,
  RefreshCw,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Wand2,
  X,
  Clapperboard,
  Tv,
  Smartphone,
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface ImageAnimatorProps {
  onBack?: () => void;
}

const PRESET_PROMPTS = [
  'Smooth cinematic camera zoom with subtle parallax',
  'Animated atmospheric mist and glowing ambient lighting',
  'Gentle breeze blowing through, creating natural motion',
  'Dramatic 3D motion effect with depth and realistic lighting',
  'Mysterious noir detective lens flare and slow movement',
];

const REASSURING_MESSAGES = [
  'Connecting to Veo 3.1 Fast Video AI Engine...',
  'Analyzing image keyframes and surface contours...',
  'Synthesizing fluid camera trajectory and depth map...',
  'Generating realistic motion vectors and lighting effects...',
  'Rendering high-frame video output...',
  'Polishing MP4 video stream and finalizing delivery...',
];

export const ImageAnimator: React.FC<ImageAnimatorProps> = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [prompt, setPrompt] = useState<string>(PRESET_PROMPTS[0]);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [statusMessageIndex, setStatusMessageIndex] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up Object URL on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (clockTimerRef.current) clearInterval(clockTimerRef.current);
    };
  }, [videoUrl]);

  // Handle file drop/upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size exceeds 10MB limit. Please select a smaller photo.');
      return;
    }

    setError(null);
    setMimeType(file.type || 'image/png');

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      sounds.playPop();
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Start Generation Process
  const handleStartGeneration = async () => {
    if (!selectedImage) {
      setError('Please upload an image to animate.');
      return;
    }

    sounds.playPop();
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setElapsedSeconds(0);
    setProgressPercent(5);
    setStatusMessageIndex(0);

    // Timer tick for clock & message cycling
    clockTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setProgressPercent((prev) => Math.min(95, prev + Math.floor(Math.random() * 3) + 1));
      setStatusMessageIndex((prev) => (prev + 1) % REASSURING_MESSAGES.length);
    }, 4000);

    try {
      // Step 1: Request video generation start
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim() || 'Animate this photo with realistic cinematic movement',
          imageBase64: selectedImage,
          mimeType,
          aspectRatio,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to start video generation.');
      }

      const opName = data.operationName;
      setOperationName(opName);

      // Step 2: Poll operation status every 4 seconds
      pollTimerRef.current = setInterval(() => {
        pollStatus(opName);
      }, 4000);
    } catch (err: any) {
      console.error('Generation init error:', err);
      setError(err.message || 'An error occurred while initiating generation.');
      stopTimers();
      setIsGenerating(false);
      sounds.playError();
    }
  };

  const stopTimers = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (clockTimerRef.current) {
      clearInterval(clockTimerRef.current);
      clockTimerRef.current = null;
    }
  };

  const pollStatus = async (opName: string) => {
    try {
      const statusRes = await fetch('/api/video-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });

      const statusData = await statusRes.json();

      if (!statusRes.ok || statusData.error) {
        throw new Error(statusData.error?.message || statusData.error || 'Failed to check status.');
      }

      if (statusData.done) {
        stopTimers();
        setProgressPercent(98);

        // Step 3: Download video stream
        const downloadRes = await fetch('/api/video-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        if (!downloadRes.ok) {
          const errBody = await downloadRes.json().catch(() => ({}));
          throw new Error(errBody.error || 'Failed to download final video stream.');
        }

        const blob = await downloadRes.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setProgressPercent(100);
        setIsGenerating(false);
        sounds.playSuccess();
      }
    } catch (err: any) {
      console.error('Polling error:', err);
      stopTimers();
      setError(err.message || 'An error occurred while generating video.');
      setIsGenerating(false);
      sounds.playError();
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    sounds.playPop();
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `veo-animated-video-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetAll = () => {
    sounds.playPop();
    stopTimers();
    setIsGenerating(false);
    setVideoUrl(null);
    setError(null);
    setSelectedImage(null);
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 lg:p-6 pb-24 relative font-sans">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-purple-400" />
                <span>Veo 3.1 Fast Video AI</span>
              </span>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full">
                veo-3.1-fast-generate-preview
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white font-sans flex items-center gap-3">
              <Clapperboard className="w-8 h-8 text-amber-400" />
              <span>Animate Photo into Video</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Transform any uploaded photo into an animated cinematic video. Select your camera prompt, choose landscape (<code className="text-amber-400 font-mono">16:9</code>) or portrait (<code className="text-amber-400 font-mono">9:16</code>) aspect ratio, and generate high-quality video using Google Veo AI.
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 shadow-lg"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-200">Video Generation Error</p>
              <p className="mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Main Content Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image Upload & Video Settings */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Upload Image */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs">1</span>
                  Select Photo to Animate
                </h2>
                {selectedImage && (
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Remove Photo
                  </button>
                )}
              </div>

              {!selectedImage ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-8 text-center cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-all group relative overflow-hidden"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-inner">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-200">
                    Click to upload or drag & drop a photo
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PNG, JPG, or WEBP (Max 10MB)
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-80 flex items-center justify-center group shadow-inner">
                  <img
                    src={selectedImage}
                    alt="Uploaded photo preview"
                    className="max-h-80 object-contain w-full"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-amber-300 hover:bg-slate-800 transition-colors shadow-lg"
                    >
                      Change Photo
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Step 2: Aspect Ratio & Animation Prompt */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <h2 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs">2</span>
                Video Configuration
              </h2>

              {/* Aspect Ratio Toggle (16:9 or 9:16) */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setAspectRatio('16:9');
                    }}
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all text-left ${
                      aspectRatio === '16:9'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Tv className={`w-5 h-5 ${aspectRatio === '16:9' ? 'text-amber-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span>16:9 Landscape</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">Widescreen</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Desktop & TV format</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setAspectRatio('9:16');
                    }}
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all text-left ${
                      aspectRatio === '9:16'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className={`w-5 h-5 ${aspectRatio === '9:16' ? 'text-amber-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span>9:16 Portrait</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">Mobile / Reel</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Vertical social format</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Motion & Animation Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the motion, camera move, or atmosphere..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/80 transition-colors font-sans resize-none"
                />

                {/* Preset Prompt Pills */}
                <div className="mt-3 space-y-1.5">
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    Quick Motion Presets:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          sounds.playPop();
                          setPrompt(p);
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-xl border transition-all text-left ${
                          prompt === p
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate CTA Button */}
              <button
                disabled={!selectedImage || isGenerating}
                onClick={handleStartGeneration}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                  !selectedImage || isGenerating
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:brightness-110 active:scale-98 shadow-amber-500/20 border border-amber-300'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                    <span>Generating Veo Video ({elapsedSeconds}s)...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>Animate Photo with Veo 3.1 AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Output Video Player & Live Status Monitor */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-full flex flex-col justify-between space-y-6">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center justify-between mb-4">
                  <span className="flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Video Preview Output
                  </span>
                  {videoUrl && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> READY
                    </span>
                  )}
                </h2>

                {/* Video Container State */}
                {isGenerating ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-5 my-auto py-12">
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                      <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-wider text-amber-300">
                        {REASSURING_MESSAGES[statusMessageIndex]}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Elapsed Time: {elapsedSeconds} seconds
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-amber-500 to-purple-500 h-full rounded-full"
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      Veo video generation typically takes 30-90 seconds. Please keep this screen open.
                    </p>
                  </div>
                ) : videoUrl ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 shadow-2xl">
                      <video
                        src={videoUrl}
                        controls
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Model:</span>
                        <span className="font-mono text-amber-300 font-bold">veo-3.1-fast-generate-preview</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Aspect Ratio:</span>
                        <span className="font-mono text-slate-200 font-bold">{aspectRatio}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Resolution:</span>
                        <span className="font-mono text-slate-200 font-bold">720p HD</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={handleDownload}
                        className="py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        Download MP4
                      </button>

                      <button
                        onClick={resetAll}
                        className="py-3 px-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Animate Another
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl p-10 text-center my-auto space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-600 flex items-center justify-center mx-auto">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <p className="text-xs font-bold text-slate-400">
                      No Video Generated Yet
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Upload a photo on the left and click "Animate Photo with Veo" to watch your picture come to life!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
