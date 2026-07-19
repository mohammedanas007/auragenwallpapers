import React, { useState, useRef } from 'react';
import { 
  AIModelEngine, 
  AspectRatio, 
  CompositionConstraint, 
  AISFXConfig, 
  SeasonalFX, 
  CreationFX 
} from '../types';
import { 
  Smartphone, 
  Monitor, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  Sliders, 
  Grid,
  Trash2,
  Check,
  EyeOff
} from 'lucide-react';

interface WallpaperStudioProps {
  initialPrompt: string;
  initialCategory: string;
  onGenerate: (config: {
    prompt: string;
    category: string;
    engine: AIModelEngine;
    aspectRatio: AspectRatio;
    sfx: AISFXConfig;
    composition: CompositionConstraint;
    uploadedImage: string | null;
  }) => void;
  isGenerating: boolean;
}

export default function WallpaperStudio({
  initialPrompt,
  initialCategory,
  onGenerate,
  isGenerating
}: WallpaperStudioProps) {
  const [prompt, setPrompt] = useState<string>(initialPrompt || '');
  const [category, setCategory] = useState<string>(initialCategory || 'dreamy_fantasy');
  const [engine, setEngine] = useState<AIModelEngine>('Gemini 3.1 Flash Image');
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [composition, setComposition] = useState<CompositionConstraint>('top_third');
  
  // AI FX Style config states
  const [glowPortrait, setGlowPortrait] = useState<boolean>(false);
  const [faceRemix, setFaceRemix] = useState<boolean>(false);
  const [animeStyle, setAnimeStyle] = useState<boolean>(false);
  const [seasonalFX, setSeasonalFX] = useState<SeasonalFX>('none');
  const [creationFX, setCreationFX] = useState<CreationFX>('none');

  // Custom uploaded image state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state if preset selection changes prompt/category externally
  React.useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialPrompt, initialCategory]);

  // Handle device toggling
  const handleDeviceChange = (dev: 'mobile' | 'desktop') => {
    setDevice(dev);
    if (dev === 'mobile') {
      setAspectRatio('9:16');
    } else {
      setAspectRatio('16:9');
    }
  };

  // Handle local file uploads (Base64)
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Community Alert: Please select a valid image file format.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadedImage(e.target.result as string);
        // Automatically activate Face Remix and Glow Portrait if we uploaded a selfie
        setFaceRemix(true);
        setGlowPortrait(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Drag and Drop helpers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    setFaceRemix(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit wallpaper config
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    onGenerate({
      prompt: prompt.trim(),
      category,
      engine,
      aspectRatio,
      sfx: {
        glowPortrait,
        faceRemix,
        animeStyle,
        seasonalFX,
        creationFX
      },
      composition,
      uploadedImage
    });
  };

  return (
    <form id="wallpaper-studio-form" onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-violet-400" /> AI Generation Studio
        </h2>
        <p className="text-xs text-neutral-400">
          Tune your aspect ratio, composition, custom portraits, and dynamic overlays
        </p>
      </div>

      {/* Main Prompt Input Area */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-neutral-300 flex justify-between items-center">
          <span>Artistic Wallpaper Prompt Input</span>
          <span className="text-[10px] text-neutral-500 font-mono">No Watermarks • 4K Resolving</span>
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your ideal celestial workspace, enchanted cyber forest, or sunset gradient scene. Add specifics for safe zones and composition..."
          rows={3}
          className="w-full bg-black/30 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none resize-none transition-all backdrop-blur-md"
        />
        <div className="flex flex-wrap gap-1.5 mt-1">
          <span className="text-[9px] text-neutral-400 font-mono flex items-center gap-1 bg-black/40 px-2 py-1 rounded-md border border-white/10">
            <Check className="w-2.5 h-2.5 text-green-400" /> Safety Filter Active
          </span>
          <span className="text-[9px] text-neutral-400 font-mono flex items-center gap-1 bg-black/40 px-2 py-1 rounded-md border border-white/10">
            <Check className="w-2.5 h-2.5 text-green-400" /> Dynamic Live Engine Enabled
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aspect Ratio & Device bounds */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              1. Format & Safe Aspect Ratio
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDeviceChange('mobile')}
                className={`py-3 px-4 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                  device === 'mobile'
                    ? 'glass-panel-active text-violet-300'
                    : 'btn-glass-secondary text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Smartphone className="w-4 h-4" /> Phone Wallpaper
              </button>
              <button
                type="button"
                onClick={() => handleDeviceChange('desktop')}
                className={`py-3 px-4 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                  device === 'desktop'
                    ? 'glass-panel-active text-violet-300'
                    : 'btn-glass-secondary text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Monitor className="w-4 h-4" /> Desktop Wallpaper
              </button>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400 block mb-1.5">Resolution Preset:</span>
            <div className="grid grid-cols-2 gap-2">
              {device === 'mobile' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`p-2 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                      aspectRatio === '9:16' ? 'glass-panel-active text-white' : 'btn-glass-secondary text-neutral-500'
                    }`}
                  >
                    9:16 (Standard Phone)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:19.5')}
                    className={`p-2 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                      aspectRatio === '9:19.5' ? 'glass-panel-active text-white' : 'btn-glass-secondary text-neutral-500'
                    }`}
                  >
                    9:19.5 (Wide Mobile)
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`p-2 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                      aspectRatio === '16:9' ? 'glass-panel-active text-white' : 'btn-glass-secondary text-neutral-500'
                    }`}
                  >
                    16:9 (Standard Monitor)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('21:9')}
                    className={`p-2 rounded-lg text-xs font-mono border cursor-pointer transition-all ${
                      aspectRatio === '21:9' ? 'glass-panel-active text-white' : 'btn-glass-secondary text-neutral-500'
                    }`}
                  >
                    21:9 (Ultrawide)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Focal Composition Zone */}
          <div>
            <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-violet-400" /> 2. Icon-Safe Composition
            </h3>
            <p className="text-[10px] text-neutral-500 mb-2 leading-relaxed">
              Guarantees clean negative space in specific zones for widgets and system icons
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setComposition('top_third')}
                className={`py-2 px-1 rounded-lg text-[10px] font-medium border cursor-pointer transition-all ${
                  composition === 'top_third' ? 'glass-panel-active text-white' : 'btn-glass-secondary text-neutral-400'
                }`}
              >
                Top-Third Clean
              </button>
              <button
                type="button"
                onClick={() => setComposition('center')}
                className={`py-2 px-1 rounded-lg text-[10px] font-medium border cursor-pointer transition-all ${
                  composition === 'center' ? 'glass-panel-active text-white' : 'btn-glass-secondary text-neutral-400'
                }`}
              >
                Centered Focal
              </button>
              <button
                type="button"
                onClick={() => setComposition('free')}
                className={`py-2 px-1 rounded-lg text-[10px] font-medium border cursor-pointer transition-all ${
                  composition === 'free' ? 'glass-panel-active text-white' : 'btn-glass-secondary text-neutral-400'
                }`}
              >
                Free Composition
              </button>
            </div>
          </div>
        </div>

        {/* AI Art Models Selection */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              3. Target AI Model Engine
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(['Gemini 3.1 Flash Image', 'Gemini 3.1 Flash Lite Image', 'Gemini 3 Pro Image', 'Aura Creative Engine', 'Aura Dream Catcher'] as AIModelEngine[]).map((eng) => (
                <button
                  key={eng}
                  type="button"
                  onClick={() => setEngine(eng)}
                  className={`p-2.5 rounded-xl text-left border cursor-pointer transition-all flex flex-col justify-between h-[52px] ${
                    engine === eng
                      ? 'glass-panel-active text-violet-200'
                      : 'btn-glass-secondary text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span className="text-[11px] font-semibold">{eng}</span>
                  <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-mono">
                    {eng.includes('Lite') ? 'Lite Photoreal' : eng.includes('Flash') ? 'Fast Photoreal' : eng.includes('Pro') ? 'Ultra Quality' : eng.includes('Creative') ? 'Luminous' : eng.includes('Catcher') ? 'Surrealism' : 'Dynamic'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Photo upload / Face Remix Section */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              4. Portrait Upload / Face Remix
            </h3>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 h-[80px] relative ${
                isDragging 
                  ? 'border-violet-500 bg-violet-500/10' 
                  : uploadedImage 
                    ? 'border-green-500/40 bg-green-500/5' 
                    : 'border-white/10 hover:border-violet-500/50 bg-white/5'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {uploadedImage ? (
                <div className="flex items-center gap-3 w-full justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src={uploadedImage} 
                      alt="Thumbnail upload" 
                      className="w-10 h-10 object-cover rounded-lg border border-green-500/30"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left">
                      <span className="text-[10px] text-green-400 font-semibold block">Face Remix Engaged</span>
                      <span className="text-[9px] text-neutral-500 font-mono">Ready for AI Glow remix</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearUploadedImage();
                    }}
                    className="p-1.5 bg-black/40 hover:bg-black/60 text-neutral-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer border border-white/5"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-neutral-500" />
                  <span className="text-[10px] text-neutral-400 font-medium">
                    Upload selfie or face photo to remix
                  </span>
                  <span className="text-[8px] text-neutral-600">
                    Drag & Drop or Click to browse
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FX Style Remix Panel */}
      <div className="border-t border-white/10 pt-5 flex flex-col gap-4">
        <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" /> 5. AI Creation FX Style Remixers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Toggles */}
          <div className="flex flex-col gap-2.5 bg-white/5 p-4 rounded-2xl border border-white/10">
            <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={glowPortrait}
                onChange={(e) => {
                  setGlowPortrait(e.target.checked);
                  if (e.target.checked) setFaceRemix(true);
                }}
                className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="font-semibold">Glow Portrait</span>
                <span className="text-[9px] text-neutral-500">Soft luminous face outlines</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={faceRemix}
                onChange={(e) => setFaceRemix(e.target.checked)}
                className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="font-semibold">Face Remix</span>
                <span className="text-[9px] text-neutral-500">Style portraits into wallpaper layers</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={animeStyle}
                onChange={(e) => setAnimeStyle(e.target.checked)}
                className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="font-semibold">Anime Style</span>
                <span className="text-[9px] text-neutral-500">Rich hand-drawn cell shades</span>
              </div>
            </label>
          </div>

          {/* Seasonal FX Select */}
          <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
              Seasonal FX Overlay
            </span>
            <p className="text-[9px] text-neutral-500 leading-relaxed mb-1">
              Add interactive, live falling particles and ambient overlays
            </p>
            <select
              value={seasonalFX}
              onChange={(e) => setSeasonalFX(e.target.value as SeasonalFX)}
              className="w-full bg-black/40 border border-white/10 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="none">None (Standard)</option>
              <option value="snow">Snow (Winter Drift)</option>
              <option value="autumn">Autumn (Whirling Leaves)</option>
              <option value="cherry_blossoms">Cherry Blossoms (Sakura)</option>
              <option value="neon_rain">Neon Rain (Cyber Ripple)</option>
              <option value="sunbeams">Sunbeams (Light Ray FX)</option>
            </select>
          </div>

          {/* Creation FX Select */}
          <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
              AI Creation Art Filter
            </span>
            <p className="text-[9px] text-neutral-500 leading-relaxed mb-1">
              Inject thematic neon grids or watercolor textures
            </p>
            <select
              value={creationFX}
              onChange={(e) => setCreationFX(e.target.value as CreationFX)}
              className="w-full bg-black/40 border border-white/10 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="none">None (Standard)</option>
              <option value="vaporwave">Vaporwave (Sunset Grid)</option>
              <option value="synthwave">Synthwave (Cosmic Grid)</option>
              <option value="cyberpunk">Cyberpunk (Neon Edge)</option>
              <option value="watercolor">Watercolor Splash</option>
              <option value="oil_painting">Oil Canvas Texture</option>
              <option value="cosmic_nebula">Cosmic Nebula Gas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generate Action Button */}
      <button
        type="submit"
        disabled={isGenerating || !prompt.trim()}
        className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${
          isGenerating || !prompt.trim()
            ? 'bg-white/5 text-neutral-500 border border-white/5 cursor-not-allowed'
            : 'btn-glass-primary text-white border-none'
        }`}
      >
        <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
        {isGenerating ? 'Enhancing & Generating AI Art...' : 'Generate 4K Live Wallpaper'}
      </button>
    </form>
  );
}
