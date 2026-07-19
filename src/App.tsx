import React, { useState, useEffect } from 'react';
import { WallpaperItem, AIModelEngine, AspectRatio, AISFXConfig, CompositionConstraint } from './types';
import LiveWallpaperPreview from './components/LiveWallpaperPreview';
import CategoryBoard from './components/CategoryBoard';
import WallpaperStudio from './components/WallpaperStudio';
import { 
  Sparkles, 
  Layers, 
  Heart, 
  Eye, 
  Download, 
  Info, 
  Plus, 
  Grid, 
  HelpCircle,
  AlertCircle,
  RefreshCw,
  Layout,
  Maximize2,
  X,
  Compass,
  Trash2
} from 'lucide-react';

// Gorgeous preloaded seeds for the initial dashboard experience
const INITIAL_SAVED_WALLPAPERS: WallpaperItem[] = [
  {
    id: 'seed_1',
    name: 'Enchanted Mushroom Forest',
    prompt: 'Enchanted forest with glowing mushrooms, fairy lights, and misty air, mystical atmosphere, soft focus, vibrant hues, magical details',
    category: 'dreamy_fantasy',
    engine: 'Gemini 3.1 Flash Image',
    aspectRatio: '9:16',
    sfx: {
      glowPortrait: false,
      faceRemix: false,
      animeStyle: false,
      seasonalFX: 'snow',
      creationFX: 'cosmic_nebula'
    },
    composition: 'top_third',
    imageUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=1200&auto=format&fit=crop',
    timestamp: 'Just now',
    isLive: true,
    seed: 4242,
    blueprint: {
      enhancedPrompt: 'Enchanted forest with glowing mushrooms, fairy lights, and misty air, mystical atmosphere, soft focus, vibrant hues, magical details',
      primaryColor: '#a78bfa',
      secondaryColor: '#f472b6',
      bgColor: '#080614',
      styleMood: 'glowing',
      safeZonePadding: 20,
      elementsToRender: ['glowing violet mushrooms', 'fairy dust swirls', 'misty canopy'],
      particleType: 'snow',
      particleColor: '#a78bfa',
      lightPosition: 'top'
    }
  },
  {
    id: 'seed_2',
    name: 'Cyberpunk Neon Skyline',
    prompt: 'Cyberpunk city skyline with neon lights, flying cars, and futuristic vibes, vibrant and moody, high contrast, surreal glow',
    category: 'space_scifi',
    engine: 'Aura Creative Engine',
    aspectRatio: '16:9',
    sfx: {
      glowPortrait: false,
      faceRemix: false,
      animeStyle: false,
      seasonalFX: 'neon_rain',
      creationFX: 'synthwave'
    },
    composition: 'center',
    imageUrl: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1200&auto=format&fit=crop',
    timestamp: '10 min ago',
    isLive: true,
    seed: 9091,
    blueprint: {
      enhancedPrompt: 'Cyberpunk city skyline with neon lights, flying cars, and futuristic vibes, vibrant and moody, high contrast, surreal glow',
      primaryColor: '#38bdf8',
      secondaryColor: '#ec4899',
      bgColor: '#09090b',
      styleMood: 'cosmic',
      safeZonePadding: 15,
      elementsToRender: ['neon billboards', 'hover vehicle lines', 'cyber grids'],
      particleType: 'rain',
      particleColor: '#ec4899',
      lightPosition: 'center'
    }
  },
  {
    id: 'seed_3',
    name: 'Soft Pastel Smooth Flow',
    prompt: 'Soft pastel gradient blending delicate colors, gentle tones, abstract, vibrant and soothing, high-resolution',
    category: 'minimalist_abstract',
    engine: 'Aura Dream Catcher',
    aspectRatio: '9:16',
    sfx: {
      glowPortrait: false,
      faceRemix: false,
      animeStyle: false,
      seasonalFX: 'sunbeams',
      creationFX: 'none'
    },
    composition: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop',
    timestamp: '2 hours ago',
    isLive: true,
    seed: 8871,
    blueprint: {
      enhancedPrompt: 'Soft pastel gradient blending delicate colors, gentle tones, abstract, vibrant and soothing, high-resolution',
      primaryColor: '#38bdf8',
      secondaryColor: '#f43f5e',
      bgColor: '#172554',
      styleMood: 'minimalist',
      safeZonePadding: 30,
      elementsToRender: ['ambient light gradients', 'soft rolling shadows'],
      particleType: 'dust',
      particleColor: '#fbbf24',
      lightPosition: 'top'
    }
  }
];

export default function App() {
  const [savedWallpapers, setSavedWallpapers] = useState<WallpaperItem[]>(() => {
    const cached = localStorage.getItem('aura_wallpapers');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse cached wallpapers:', e);
      }
    }
    return INITIAL_SAVED_WALLPAPERS;
  });

  const [activeWallpaper, setActiveWallpaper] = useState<WallpaperItem>(() => {
    return savedWallpapers[0] || INITIAL_SAVED_WALLPAPERS[0];
  });
  const [studioPrompt, setStudioPrompt] = useState<string>('Japanese cherry blossom park with koi pond, soft pastel shades, anime-style, gentle textures, dreamlike, serene');
  const [studioCategory, setStudioCategory] = useState<string>('anime_popart');
  const [activeTab, setActiveTab] = useState<'studio' | 'presets' | 'gallery'>('studio');
  
  // Custom non-blocking modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  
  // Interface Helper Toggles
  const [showSafeOverlay, setShowSafeOverlay] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // API Generating Sequence states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  // First-time onboarding states
  const [showTutorialHub, setShowTutorialHub] = useState<boolean>(() => {
    const completed = localStorage.getItem('aura_first_time_tutorial_completed');
    return completed !== 'true';
  });
  const [currentTourStep, setCurrentTourStep] = useState<number>(-1);

  const onboardingSteps = [
    {
      title: "🌌 Welcome to Aura Studio Onboarding",
      desc: "Welcome! Aura Studio leverages Gemini to auto-generate stunning 4K live wallpapers featuring real-time floating ambient weather, active particle physics, and icon-safe layouts.",
      badge: "Step 1 of 5 • Getting Started",
      elementId: "welcome-guide"
    },
    {
      title: "⚡ Custom AI Generation Studio",
      desc: "This is your design command center. Here you can write creative prompts, select the design category (Abstract, Space, Anime), choose aspect ratios (9:16 mobile or 16:9 desktop), specify negative space safe layout composition, and apply FX Style Remixers like Snow overlays.",
      badge: "Step 2 of 5 • Custom Controls",
      elementId: "wallpaper-studio-form"
    },
    {
      title: "📚 Interactive Presets Directory",
      desc: "Don't know what to prompt? Hop over to the 'Presets Directory' tab to discover 45+ premium, ready-to-run prompts across our 5 design channels. Tap any preset to instantly auto-populate the workbench settings!",
      badge: "Step 3 of 5 • Prompt Library",
      elementId: "presets-tab-trigger"
    },
    {
      title: "📂 My Saved Creations Canvas",
      desc: "All dynamic wallpapers you generate are preserved in your local portfolio gallery. Tap this tab anytime to load and preview your saved historical wallpaper masterpieces.",
      badge: "Step 4 of 5 • Canvas History",
      elementId: "gallery-tab-trigger"
    },
    {
      title: "🖼️ Live Wallpaper Previewer",
      desc: "This is where your dynamic artwork comes alive. Interact with it! Click to spawn wind ripples, watch beautiful particles slide across layers, and toggle 'Safe Zone' guides to see how your background accommodates phone clocks and desk widgets. Tap 'Download 4K Asset' to export any time!",
      badge: "Step 5 of 5 • Active Workbench",
      elementId: "wallpaper-workbench-panel"
    }
  ];

  const handleNextTourStep = () => {
    const nextStep = currentTourStep + 1;
    if (nextStep >= onboardingSteps.length) {
      setCurrentTourStep(-1);
      localStorage.setItem('aura_first_time_tutorial_completed', 'true');
    } else {
      setCurrentTourStep(nextStep);
      // Auto navigate tabs for outstanding UX!
      if (nextStep === 1) {
        setActiveTab('studio');
      } else if (nextStep === 2) {
        setActiveTab('presets');
      } else if (nextStep === 3) {
        setActiveTab('gallery');
      } else if (nextStep === 4) {
        setActiveTab('studio');
      }
    }
  };

  const handlePrevTourStep = () => {
    const prevStep = currentTourStep - 1;
    if (prevStep >= 0) {
      setCurrentTourStep(prevStep);
      // Auto navigate tabs for outstanding UX!
      if (prevStep === 1) {
        setActiveTab('studio');
      } else if (prevStep === 2) {
        setActiveTab('presets');
      } else if (prevStep === 3) {
        setActiveTab('gallery');
      } else if (prevStep === 4) {
        setActiveTab('studio');
      }
    }
  };

  // Progressive loading texts to show during long operations
  const loadingSteps = [
    'Scanning prompts for safety guidelines...',
    'Interpreting icon-safe layout coordinates...',
    'Generating AI Design Blueprint via Gemini...',
    'Consulting neural art models (Gemini, Aura)...',
    'Synthesizing glowing light portraits and layer masks...',
    'Finalizing 4K artwork and active particle systems...'
  ];

  // Save to localStorage whenever wallpapers list changes
  useEffect(() => {
    localStorage.setItem('aura_wallpapers', JSON.stringify(savedWallpapers));
  }, [savedWallpapers]);

  // Handle Preset Selection and redirect to Studio with populated prompt
  const handleSelectPreset = (prompt: string, categoryId: string) => {
    setStudioPrompt(prompt);
    setStudioCategory(categoryId);
    setActiveTab('studio');
  };

  // POST Request to secure Express API backend
  const handleGenerateWallpaper = async (config: {
    prompt: string;
    category: string;
    engine: AIModelEngine;
    aspectRatio: AspectRatio;
    sfx: AISFXConfig;
    composition: CompositionConstraint;
    uploadedImage: string | null;
  }) => {
    setIsGenerating(true);
    setErrorText(null);
    setFallbackNotice(null);
    setGenerationStep(loadingSteps[0]);

    // Fast interval ticker to cycle loading steps smoothly
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % loadingSteps.length;
      setGenerationStep(loadingSteps[stepIdx]);
    }, 2800);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server rejected generation. Please modify prompts and try again.');
      }

      // Add to beginning of active gallery
      setSavedWallpapers(prev => [data, ...prev]);
      setActiveWallpaper(data);
      if (data.fallbackActive) {
        setFallbackNotice('Aesthetic Sandbox Fallback Active: Due to temporary high traffic on the Gemini free tier, we have constructed a customized, procedurally enhanced live background matching your prompt keywords perfectly.');
      } else {
        setFallbackNotice(null);
      }
      setActiveTab('gallery');
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'The model was busy or rate-limited. Please adjust configuration details and try again.');
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleDeleteWallpaper = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId(id);
  };

  const confirmDeleteWallpaper = () => {
    if (!deleteTargetId) return;
    let remaining = savedWallpapers.filter(wp => wp.id !== deleteTargetId);
    if (remaining.length === 0) {
      remaining = INITIAL_SAVED_WALLPAPERS;
    }
    setSavedWallpapers(remaining);
    if (activeWallpaper?.id === deleteTargetId || !remaining.find(w => w.id === activeWallpaper?.id)) {
      setActiveWallpaper(remaining[0]);
    }
    setDeleteTargetId(null);
  };

  const handleResetGallery = () => {
    setShowResetConfirm(true);
  };

  const confirmResetGallery = () => {
    setSavedWallpapers(INITIAL_SAVED_WALLPAPERS);
    setActiveWallpaper(INITIAL_SAVED_WALLPAPERS[0]);
    setFallbackNotice(null);
    setShowResetConfirm(false);
  };

  const deleteTargetItem = savedWallpapers.find(wp => wp.id === deleteTargetId);

  return (
    <div className="min-h-screen bg-black/60 text-neutral-100 flex flex-col antialiased font-sans relative overflow-x-hidden">
      
      {/* Mesh Background */}
      <div className="mesh-bg"></div>

      {/* Background Ambience Orbs */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-20%] w-[60%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

      {/* Main Full-Screen Immersive Lightbox Modal */}
      {isFullscreen && (
        <div id="immersive-lightbox" className="fixed inset-0 bg-neutral-950 z-50 flex flex-col md:flex-row p-6 gap-6 animate-fade-in select-none">
          {/* Main Visual Frame */}
          <div className="flex-1 relative h-full flex items-center justify-center">
            <div className="w-full h-full max-w-5xl">
              <LiveWallpaperPreview 
                item={activeWallpaper} 
                isInteractive={true} 
                showSafeZoneOverlay={showSafeOverlay} 
              />
            </div>
            
            {/* Close Lightbox */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 p-3 bg-neutral-900/90 hover:bg-neutral-800 text-white rounded-full border border-neutral-800 shadow-2xl transition-transform active:scale-90 cursor-pointer z-20"
              title="Close Fullscreen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Side Controller bar */}
          <div className="w-full md:w-[320px] glass-panel rounded-3xl p-6 flex flex-col justify-between shrink-0">
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] text-violet-400 font-mono tracking-widest uppercase font-bold">Immersive Workbench</span>
                <h3 className="text-base font-semibold text-white mt-1">{activeWallpaper.name}</h3>
                <p className="text-xs text-neutral-400 italic mt-2 leading-relaxed">"{activeWallpaper.prompt}"</p>
              </div>

              <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Interface controls</span>
                
                {/* Safe zone helper toggle */}
                <button
                  onClick={() => setShowSafeOverlay(!showSafeOverlay)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-between border cursor-pointer transition-all ${
                    showSafeOverlay 
                      ? 'glass-panel-active text-sky-300' 
                      : 'btn-glass-secondary text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layout className="w-4 h-4" /> Icon-Safe Overlay Guidelines
                  </span>
                  <span className="text-[10px] uppercase font-mono">{showSafeOverlay ? 'On' : 'Off'}</span>
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 mb-2">
                <span>Category: {activeWallpaper.category}</span>
                <span>Seed: {activeWallpaper.seed}</span>
              </div>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `${activeWallpaper.name.replace(/\s+/g, '_').toLowerCase()}_immersive.png`;
                  link.href = activeWallpaper.imageUrl;
                  link.click();
                }}
                className="w-full py-3 btn-glass-primary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download 4K Asset
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="w-full py-2.5 btn-glass-secondary text-neutral-400 text-xs font-semibold rounded-xl hover:text-white transition-colors cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Top Navigation Header */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-xl shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-widest uppercase font-mono">Aura Studio</h1>
              <span className="text-[9px] bg-violet-950/50 text-violet-300 font-mono font-bold border border-violet-900/60 px-1.5 py-0.5 rounded-md">
                Live 2.0
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 font-mono mt-0.5 uppercase tracking-wide">
              Secure Full-Stack AI Wallpaper Generator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setShowTutorialHub(true);
              setCurrentTourStep(0);
            }}
            className="text-xs bg-violet-600/15 hover:bg-violet-600/30 text-violet-300 font-semibold px-3 py-1.5 rounded-xl border border-violet-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-violet-950/50"
            title="Start Interactive Tutorial Tour"
          >
            <HelpCircle className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span>Interactive Guide</span>
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 hover:text-white font-mono flex items-center gap-1.5 transition-colors"
          >
            <Compass className="w-4 h-4" /> GitHub Connection Live
          </a>
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" title="Always Live & Working" />
        </div>
      </header>

      {/* Central Interactive Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8">
        
        {/* First Time UX / Tutorial Hub */}
        {showTutorialHub ? (
          <div className="glass-panel p-6 rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/20 via-black/40 to-fuchsia-950/10 flex flex-col gap-6 relative overflow-hidden animate-fade-in shadow-xl shadow-violet-950/20">
            {/* Ambient gradients */}
            <div className="absolute top-[-20%] right-[-10%] w-[250px] h-[250px] rounded-full bg-violet-600/10 blur-[60px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[200px] h-[200px] rounded-full bg-fuchsia-600/10 blur-[60px] pointer-events-none" />
            
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-500/15 rounded-2xl border border-violet-500/30 text-violet-400">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest block">Interactive Quick-Start Guide</span>
                  <h2 className="text-lg md:text-xl font-bold text-white tracking-tight mt-0.5">Welcome to Aura AI 4K Wallpaper Studio!</h2>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowTutorialHub(false);
                  localStorage.setItem('aura_first_time_tutorial_completed', 'true');
                }}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Dismiss Guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300 max-w-3xl leading-relaxed relative z-10">
              This interactive studio lets you generate spectacular dynamic wallpapers with icon-safe layout rules. Watch floating particles, custom climate drafts, and soft ambient lights render seamlessly in real-time.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              {/* Option 1: Interactive Guided Tour */}
              <div className="bg-black/40 border border-white/5 hover:border-violet-500/30 p-4 rounded-2xl flex flex-col justify-between gap-4 transition-all hover:translate-y-[-2px] duration-300 group">
                <div>
                  <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider block mb-1">Recommended</span>
                  <h3 className="text-xs font-semibold text-white flex items-center gap-1.5 group-hover:text-violet-300 transition-colors">
                    <Compass className="w-4 h-4 text-violet-400" /> Start 5-Step Guided Tour
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                    Watch as we walk you through the Creation Studio, Presets Library, and dynamic live preview workbench step-by-step.
                  </p>
                </div>
                <button 
                  onClick={() => setCurrentTourStep(0)}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 text-center block"
                >
                  Start Interactive Tour 🚀
                </button>
              </div>

              {/* Option 2: Quick Start Mobile */}
              <div className="bg-black/40 border border-white/5 hover:border-amber-500/30 p-4 rounded-2xl flex flex-col justify-between gap-4 transition-all hover:translate-y-[-2px] duration-300 group">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">1-Tap Blueprint</span>
                  <h3 className="text-xs font-semibold text-white flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                    <Layout className="w-4 h-4 text-amber-400" /> Standard 9:16 Mobile
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                    Instantly load a pre-configured, beautiful Japanese Sakura pastel landscape designed specifically for smartphone ratios.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    handleSelectPreset(
                      "Serene Japanese cherry blossom garden with koi pond, slow pastel cherry blossom petals drifting, soft sunset gradient background, highly stylized anime look, clear safe zone in the center.",
                      "anime_popart"
                    );
                    setShowTutorialHub(false);
                  }}
                  className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs rounded-xl cursor-pointer transition-all active:scale-95 text-center block"
                >
                  Load Phone Blueprint 📱
                </button>
              </div>

              {/* Option 3: Quick Start Monitor */}
              <div className="bg-black/40 border border-white/5 hover:border-emerald-500/30 p-4 rounded-2xl flex flex-col justify-between gap-4 transition-all hover:translate-y-[-2px] duration-300 group">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">1-Tap Blueprint</span>
                  <h3 className="text-xs font-semibold text-white flex items-center gap-1.5 group-hover:text-emerald-300 transition-colors">
                    <Maximize2 className="w-4 h-4 text-emerald-400" /> Standard 16:9 Desktop
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                    Instantly load an abstract cyberpunk neon skyline perfect for high-resolution monitors or wide workstation screens.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    handleSelectPreset(
                      "Retro cyberpunk skyline at twilight, neon holographic wireframe grid reflecting off water, synthwave pink and electric cyan tones, clear top-third space for desktop clocks.",
                      "space_scifi"
                    );
                    setShowTutorialHub(false);
                  }}
                  className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-xs rounded-xl cursor-pointer transition-all active:scale-95 text-center block"
                >
                  Load Monitor Blueprint 💻
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Standard banner when dismissed */
          <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in relative overflow-hidden group">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-yellow-400 tracking-wider">Aesthetic Icon-Safe Blueprinting</span>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                Create Gorgeous 4K Wallpapers with Perfect Negative Space
              </h2>
              <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
                No watermarks. Formats tailored dynamically for mobile (9:16, 9:19.5) and desktops (16:9, 21:9). Toggles standard safe grids automatically to keep clock widgets and app icons readable.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTutorialHub(true)}
                className="px-4 py-2 bg-violet-600/25 hover:bg-violet-600/40 text-violet-300 border border-violet-500/35 rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                Show Help Guide
              </button>
              <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shadow-md">
                <span className="text-green-400">●</span> 45 Pre-styled categories
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT WING: Studio Workbench Settings & Controls (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Workbench Tab Selector */}
            <div className="flex bg-black/30 p-1 rounded-2xl border border-white/10 self-start backdrop-blur-md">
              <button
                id="studio-tab-trigger"
                onClick={() => { setActiveTab('studio'); setErrorText(null); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'studio' ? 'glass-panel-active text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Creation Studio
              </button>
              <button
                id="presets-tab-trigger"
                onClick={() => { setActiveTab('presets'); setErrorText(null); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'presets' ? 'glass-panel-active text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Layout className="w-3.5 h-3.5 text-violet-400" /> Presets Directory
              </button>
              <button
                id="gallery-tab-trigger"
                onClick={() => { setActiveTab('gallery'); setErrorText(null); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'gallery' ? 'glass-panel-active text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-violet-400" /> My Saved Creations ({savedWallpapers.length})
              </button>
            </div>

            {/* Error alerts rendering */}
            {errorText && (
              <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-2xl flex gap-3 text-red-200 text-xs leading-relaxed">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Generation Issue</span>
                  <p>{errorText}</p>
                </div>
              </div>
            )}

            {/* Fallback info alerts rendering */}
            {fallbackNotice && (
              <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl flex gap-3 text-amber-200 text-xs leading-relaxed animate-fade-in">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Creative Sandbox Active</span>
                  <p>{fallbackNotice}</p>
                </div>
              </div>
            )}

            {/* Studio active tab panels */}
            {activeTab === 'studio' && (
              <WallpaperStudio
                initialPrompt={studioPrompt}
                initialCategory={studioCategory}
                onGenerate={handleGenerateWallpaper}
                isGenerating={isGenerating}
              />
            )}

            {activeTab === 'presets' && (
              <CategoryBoard
                selectedCategoryId={studioCategory}
                onSelectPreset={handleSelectPreset}
              />
            )}

            {activeTab === 'gallery' && (
              <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-white tracking-tight">My Wallpaper Canvas Gallery</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">Select generated art files below to load into the active dynamic previewer</p>
                  </div>
                  <button
                    onClick={handleResetGallery}
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-red-400 border border-neutral-800 hover:border-red-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 active:scale-95"
                    title="Reset gallery to default seeds"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                  {savedWallpapers.length === 0 ? (
                    <div className="col-span-full py-12 px-6 flex flex-col items-center justify-center text-center bg-black/40 border border-dashed border-white/10 rounded-2xl">
                      <Layers className="w-8 h-8 text-violet-400 mb-3 animate-pulse" />
                      <h4 className="text-sm font-semibold text-white">Your Studio Gallery is Empty</h4>
                      <p className="text-xs text-neutral-400 mt-1.5 max-w-sm leading-relaxed">
                        Navigate to the "Creation Studio" tab to design your custom live 4K wallpapers, or tap below to restore default starter templates.
                      </p>
                      <div className="flex gap-2.5 mt-4">
                        <button
                          onClick={() => setActiveTab('studio')}
                          className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer active:scale-95 duration-150"
                        >
                          Go to Studio
                        </button>
                        <button
                          onClick={confirmResetGallery}
                          className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-white/5 active:scale-95 duration-150"
                        >
                          Restore Seeds
                        </button>
                      </div>
                    </div>
                  ) : (
                    savedWallpapers.map((wp) => {
                      const isActive = activeWallpaper.id === wp.id;
                      return (
                        <div
                          key={wp.id}
                          onClick={() => setActiveWallpaper(wp)}
                          className={`group relative rounded-2xl overflow-hidden cursor-pointer border aspect-[9/14] transition-all flex flex-col justify-end p-3 ${
                            isActive ? 'border-violet-500/70 shadow-lg shadow-violet-500/20' : 'border-white/10 hover:border-white/25'
                          }`}
                        >
                          <img
                            src={wp.imageUrl}
                            alt={wp.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent pointer-events-none" />
                          
                          {/* Interactive info overlay */}
                          <div className="relative z-10 flex flex-col min-w-0">
                            <span className="text-[10px] font-semibold text-white truncate">{wp.name}</span>
                            <span className="text-[8px] text-neutral-400 font-mono truncate mt-0.5">{wp.engine} • {wp.aspectRatio}</span>
                          </div>

                          {/* Clear Delete Button - styled for touch devices and hover desktop states */}
                          <button
                            onClick={(e) => handleDeleteWallpaper(wp.id, e)}
                            className="absolute top-2 right-2 p-1.5 bg-neutral-950/80 hover:bg-red-950 text-neutral-300 hover:text-red-400 border border-neutral-800/60 hover:border-red-500/30 rounded-xl transition-all z-20 cursor-pointer active:scale-90"
                            title="Delete Wallpaper from Gallery"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT WING: Dynamic Live Active Preview Workbench (5 Cols) */}
          <div id="wallpaper-workbench-panel" className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
            
            {/* Active Wallpaper Workbench title */}
            <div className="glass-panel rounded-3xl p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-mono text-violet-400 font-bold">Active Art File</span>
                  <h3 className="text-sm font-semibold text-white truncate max-w-[180px] md:max-w-xs">{activeWallpaper.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSafeOverlay(!showSafeOverlay)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border cursor-pointer transition-all ${
                      showSafeOverlay 
                        ? 'glass-panel-active text-sky-300' 
                        : 'btn-glass-secondary text-neutral-400 hover:text-white'
                    }`}
                    title="Toggle safe zone guide overlays"
                  >
                    <Grid className="w-4 h-4" /> <span className="hidden md:inline">Safe Zone</span>
                  </button>
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="p-2 btn-glass-secondary text-neutral-300 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5"
                    title="Immersive workbench full-screen"
                  >
                    <Maximize2 className="w-4 h-4" /> <span className="hidden md:inline">Fullscreen</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Immersive Preview Container frame */}
            <div className="relative h-[560px] md:h-[640px] flex items-center justify-center p-2 bg-neutral-950/40 rounded-3xl border border-neutral-800/80">
              
              {isGenerating ? (
                // Super detailed, premium reloading/generation sequence
                <div className="absolute inset-0 bg-neutral-950/95 z-30 rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-fade-in select-none">
                  <div className="relative mb-6">
                    {/* Ring rotate */}
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-violet-500 animate-spin duration-10000" />
                    <div className="p-5 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-full shadow-lg relative z-10 animate-bounce">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <span className="text-[10px] text-violet-400 uppercase tracking-widest font-mono font-bold">
                    Gemini Creative Orchestration
                  </span>
                  
                  <h3 className="text-sm font-semibold text-white mt-2 max-w-xs leading-relaxed">
                    Slicing 4K Layer Specifications
                  </h3>

                  <div className="w-full max-w-[200px] h-1 bg-neutral-900 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-progress" />
                  </div>

                  <p className="text-[11px] text-neutral-400 font-mono mt-3 h-8 animate-pulse italic leading-relaxed max-w-xs">
                    "{generationStep || 'Analyzing safety filters...'}"
                  </p>
                </div>
              ) : null}

              <LiveWallpaperPreview 
                item={activeWallpaper} 
                isInteractive={true} 
                showSafeZoneOverlay={showSafeOverlay} 
              />
            </div>

            {/* Blueprint and seed values card */}
            <div className="glass-panel rounded-3xl p-5 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">AI Design Blueprint</span>
              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 flex justify-between items-center">
                  <span className="text-neutral-400">Primary:</span>
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: activeWallpaper.blueprint?.primaryColor }} />
                    {activeWallpaper.blueprint?.primaryColor}
                  </span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 flex justify-between items-center">
                  <span className="text-neutral-400">Secondary:</span>
                  <span className="text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: activeWallpaper.blueprint?.secondaryColor }} />
                    {activeWallpaper.blueprint?.secondaryColor}
                  </span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 flex justify-between items-center">
                  <span className="text-neutral-400">Composition:</span>
                  <span className="text-violet-300 font-semibold">{activeWallpaper.composition}</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 flex justify-between items-center">
                  <span className="text-neutral-400">Engine:</span>
                  <span className="text-yellow-400 font-semibold">{activeWallpaper.engine}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Dynamic Guided Tour Walkthrough Overlay */}
      {currentTourStep >= 0 && currentTourStep < onboardingSteps.length && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop spotter highlighting the focused element */}
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-950/30 via-black/80 to-fuchsia-950/30" />
          
          <div className="relative glass-panel w-full max-w-lg rounded-3xl border border-violet-500/40 p-6 shadow-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-purple-950/40">
            {/* Top glowing indicators */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-600 text-white border border-violet-500/40 text-[10px] font-mono font-bold tracking-wider px-3 py-1 rounded-full uppercase flex items-center gap-1.5 shadow-lg shadow-violet-950/40 backdrop-blur-md whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-white animate-pulse" />
              <span>{onboardingSteps[currentTourStep].badge}</span>
            </div>

            <button 
              onClick={() => setCurrentTourStep(-1)}
              className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer border border-white/5"
              title="Close Walkthrough"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-400">
                  <Compass className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{onboardingSteps[currentTourStep].title}</h3>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mt-0.5">Aura Interactive Walkthrough</span>
                </div>
              </div>

              <div className="text-xs text-neutral-300 leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/5">
                {onboardingSteps[currentTourStep].desc}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setCurrentTourStep(-1)}
                  className="text-[11px] text-neutral-400 hover:text-white font-mono transition-colors cursor-pointer"
                >
                  Skip Tour
                </button>
                
                <div className="flex items-center gap-2">
                  {currentTourStep > 0 && (
                    <button
                      onClick={handlePrevTourStep}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                    >
                      ⟵ Back
                    </button>
                  )}
                  
                  <button
                    onClick={handleNextTourStep}
                    className="px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-md shadow-violet-900/30"
                  >
                    {currentTourStep === onboardingSteps.length - 1 ? "Finish Walkthrough 🎉" : "Next Step ⟶"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && deleteTargetItem && (
        <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative glass-panel w-full max-w-md rounded-3xl border border-red-500/20 p-6 shadow-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-red-950/20">
            <button 
              onClick={() => setDeleteTargetId(null)}
              className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer border border-white/5"
              title="Close Dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                  <Trash2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Delete Custom Wallpaper</h3>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mt-0.5">Confirm Canvas Removal</span>
                </div>
              </div>

              <div className="text-xs text-neutral-300 leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/5 flex gap-3 items-center">
                <img 
                  src={deleteTargetItem.imageUrl} 
                  alt={deleteTargetItem.name} 
                  className="w-12 h-16 object-cover rounded-xl border border-white/10 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-white text-xs truncate">{deleteTargetItem.name}</p>
                  <p className="text-[10px] text-neutral-400 mt-1 leading-normal">Are you sure you want to delete this custom wallpaper? This action is permanent and cannot be undone.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteWallpaper}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-md shadow-red-900/30"
                >
                  Yes, Delete Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Gallery Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative glass-panel w-full max-w-md rounded-3xl border border-violet-500/20 p-6 shadow-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-violet-950/20">
            <button 
              onClick={() => setShowResetConfirm(false)}
              className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer border border-white/5"
              title="Close Dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-400">
                  <RefreshCw className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Reset Wallpaper Gallery</h3>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mt-0.5">Restore Seed Presets</span>
                </div>
              </div>

              <div className="text-xs text-neutral-300 leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/5">
                Are you sure you want to reset your wallpaper gallery? This will clear all of your custom-designed creations and restore the initial default seed presets.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResetGallery}
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-md shadow-violet-900/30"
                >
                  Yes, Reset Gallery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer credits */}
      <footer className="border-t border-neutral-800/60 bg-neutral-950 py-8 px-6 text-center text-neutral-500 text-xs font-mono">
        <p>© 2026 Aura AI Wallpaper Studio. All rights reserved. Powered by Antigravity & Google GenAI</p>
      </footer>
    </div>
  );
}
