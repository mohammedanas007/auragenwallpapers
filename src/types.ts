export type AIModelEngine = 
  | 'Gemini 3.1 Flash Image'
  | 'Gemini 3.1 Flash Lite Image'
  | 'Gemini 3 Pro Image'
  | 'Aura Creative Engine'
  | 'Aura Dream Catcher';

export type AspectRatio = '9:16' | '9:19.5' | '16:9' | '21:9';

export type SeasonalFX = 'none' | 'snow' | 'autumn' | 'cherry_blossoms' | 'neon_rain' | 'sunbeams';

export type CreationFX = 'none' | 'vaporwave' | 'synthwave' | 'cyberpunk' | 'watercolor' | 'oil_painting' | 'cosmic_nebula';

export type CompositionConstraint = 'center' | 'top_third' | 'bottom_third' | 'free';

export interface AISFXConfig {
  glowPortrait: boolean;
  faceRemix: boolean;
  animeStyle: boolean;
  seasonalFX: SeasonalFX;
  creationFX: CreationFX;
}

export interface WallpaperPreset {
  id: string;
  prompt: string;
  title: string;
}

export interface WallpaperCategory {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  presets: WallpaperPreset[];
}

export interface WallpaperItem {
  id: string;
  name: string;
  prompt: string;
  category: string;
  engine: AIModelEngine;
  aspectRatio: AspectRatio;
  sfx: AISFXConfig;
  composition: CompositionConstraint;
  imageUrl: string; // Can be base64 or generated url
  uploadedImage?: string | null; // For face remix or custom edits
  timestamp: string;
  isLive: boolean;
  seed: number;
  blueprint?: any;
}
