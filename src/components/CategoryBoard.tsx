import React, { useState } from 'react';
import { WALLPAPER_CATEGORIES } from '../presets';
import { WallpaperCategory, WallpaperPreset } from '../types';
import * as Icons from 'lucide-react';

interface CategoryBoardProps {
  onSelectPreset: (prompt: string, categoryId: string) => void;
  selectedCategoryId: string;
}

export default function CategoryBoard({
  onSelectPreset,
  selectedCategoryId
}: CategoryBoardProps) {
  const [activeTab, setActiveTab] = useState<string>(selectedCategoryId || 'dreamy_fantasy');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentCategory = WALLPAPER_CATEGORIES.find(cat => cat.id === activeTab) || WALLPAPER_CATEGORIES[0];

  // Dynamically render Lucide Icon by string name safely
  const renderIcon = (iconName: string, className: string = "w-4 h-4") => {
    const IconComp = (Icons as any)[iconName];
    if (IconComp) {
      return <IconComp className={className} />;
    }
    return <Icons.Sparkles className={className} />;
  };

  // Filter preset list if user is searching
  const allPresets = WALLPAPER_CATEGORIES.flatMap(cat => 
    cat.presets.map(p => ({ ...p, categoryName: cat.name, categoryId: cat.id }))
  );

  const filteredSearch = searchQuery.trim() !== ''
    ? allPresets.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div id="category-board-container" className="glass-panel rounded-3xl p-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <Icons.Palette className="w-5 h-5 text-violet-400" /> Style Presets Directory
          </h2>
          <p className="text-xs text-neutral-400">
            Browse 45 premium curated prompt seeds for outstanding layout readability
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative max-w-xs w-full">
          <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 45 prompt presets..."
            className="w-full pl-9 pr-4 py-2 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors backdrop-blur-md"
          />
        </div>
      </div>

      {searchQuery.trim() !== '' ? (
        // Search Results View
        <div className="flex flex-col gap-3">
          <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Search Results ({filteredSearch.length})</span>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-violet-400 hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>
          {filteredSearch.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredSearch.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.prompt, preset.categoryId)}
                  className="glass-panel-interactive p-4 rounded-2xl cursor-pointer duration-200 group flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-white group-hover:text-violet-400 transition-colors">
                      {preset.title}
                    </span>
                    <span className="text-[9px] bg-violet-950/50 border border-violet-900 text-violet-300 px-2 py-0.5 rounded-full font-mono">
                      {preset.categoryName}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed italic">
                    "{preset.prompt}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-black/30 rounded-2xl border border-dashed border-white/10">
              <p className="text-xs text-neutral-500">No prompts found matching your search. Try another style keyword.</p>
            </div>
          )}
        </div>
      ) : (
        // Standard Categorized Tabbed Layout
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Navigation Rails for Categories */}
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-2 lg:pb-0 lg:w-[240px] border-b lg:border-b-0 lg:border-r border-white/10 pr-0 lg:pr-4 shrink-0 custom-scrollbar">
            {WALLPAPER_CATEGORIES.map((cat) => {
              const isActive = cat.id === activeTab;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-medium transition-all cursor-pointer whitespace-nowrap lg:whitespace-normal w-auto lg:w-full ${
                    isActive
                      ? 'glass-panel-active text-violet-300 shadow-md'
                      : 'btn-glass-secondary text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-violet-500/20 text-violet-400' : 'bg-black/40 text-neutral-500'}`}>
                    {renderIcon(cat.icon, "w-4 h-4")}
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="font-semibold tracking-tight leading-tight">{cat.name}</span>
                    <span className="text-[9px] text-neutral-500 truncate mt-0.5 max-w-[150px]">{cat.presets.length} presets</span>
                  </div>
                  <span className="lg:hidden">{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Category Presets Panel */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-mono tracking-widest text-violet-400 font-bold">
                Active Visual Tone
              </span>
              <h3 className="text-sm font-semibold text-white mt-1">
                {currentCategory.name}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                {currentCategory.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {currentCategory.presets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.prompt, currentCategory.id)}
                  className="glass-panel-interactive p-4 rounded-2xl cursor-pointer duration-200 group flex flex-col justify-between gap-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white group-hover:text-violet-400 transition-colors">
                        {preset.title}
                      </span>
                    </div>
                    <span className="text-[9px] bg-black/40 border border-white/10 text-neutral-400 p-1.5 rounded-lg group-hover:text-violet-400 group-hover:border-violet-500/20 transition-all">
                      <Icons.ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed italic pr-4">
                    "{preset.prompt}"
                  </p>
                  
                  {/* Accent bottom neon border */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
