import { WallpaperCategory } from './types';

export const WALLPAPER_CATEGORIES: WallpaperCategory[] = [
  {
    id: 'dreamy_fantasy',
    name: 'Dreamy & Fantasy',
    description: 'Enchanted realms, glowing mushrooms, and majestic moonlit castles',
    icon: 'Sparkles',
    presets: [
      {
        id: 'df_1',
        title: 'Enchanted Mushroom Forest',
        prompt: 'Enchanted forest with glowing mushrooms, fairy lights, and misty air, mystical atmosphere, soft focus, vibrant hues, magical details'
      },
      {
        id: 'df_2',
        title: 'Gothic Moonlit Castle',
        prompt: 'Fantasy castle on a hill under a full moon with swirling fog, gothic and majestic, dreamlike, moody lighting, slightly surreal'
      },
      {
        id: 'df_3',
        title: 'Glowing Underwater Coral',
        prompt: 'Underwater world with vibrant coral and whimsical sea creatures, dreamlike, soft textures, vibrant colors, aquatic glow'
      },
      {
        id: 'df_4',
        title: 'Ancient Jungle Ruins',
        prompt: 'Ancient ruins in a misty jungle with overgrown vines, lost world vibe, unreal engine, soft light rays, mystical details'
      }
    ]
  },
  {
    id: 'nature_adventure',
    name: 'Nature & Adventure',
    description: 'Golden hour sunflower fields, snow mountains, and celestial deserts',
    icon: 'Compass',
    presets: [
      {
        id: 'na_1',
        title: 'Golden Hour Sunflower Field',
        prompt: 'Golden hour in a sunflower field with a warm, glowing sunset, cinematic yet dreamy, unreal engine, high detail, gentle lighting'
      },
      {
        id: 'na_2',
        title: 'Serene Snow Mountains',
        prompt: 'Snow-capped mountains with a surreal, clear blue sky, calm and crisp, high contrast, slightly vibrant, serene atmosphere'
      },
      {
        id: 'na_3',
        title: 'Tranquil Lake Reflection',
        prompt: 'Tranquil lake with a rowboat and trees reflected in soft, misty water, dreamlike, gentle glow, artistic ambiance'
      },
      {
        id: 'na_4',
        title: 'Vibrant Autumn Forest',
        prompt: 'Vibrant autumn forest with rich red and orange leaves, warm glow, unreal engine, cinematic yet slightly dreamlike'
      },
      {
        id: 'na_5',
        title: 'Desert Under Starry Sky',
        prompt: 'Night sky full of stars over a calm desert, surreal glow, otherworldly, soft textures, high contrast, vibrant starlight'
      }
    ]
  },
  {
    id: 'minimalist_abstract',
    name: 'Minimalist & Abstract',
    description: 'Clean shapes, golden-veined marbles, and soft pastel gradients',
    icon: 'Layers',
    presets: [
      {
        id: 'ma_1',
        title: 'Soft Pastel Gradient',
        prompt: 'Soft pastel gradient blending delicate colors, gentle tones, abstract, vibrant and soothing, high-resolution'
      },
      {
        id: 'ma_2',
        title: 'Gold-Veined White Marble',
        prompt: 'White marble texture with veins of gold, ultra-clean and sleek, minimalistic, sharp detail, stylish finish'
      },
      {
        id: 'ma_3',
        title: 'Geometric Pastel Composition',
        prompt: 'Geometric shapes in muted, pastel tones with soft shadows, calming and balanced, abstract, high-resolution'
      },
      {
        id: 'ma_4',
        title: 'Monochrome Wave Flow',
        prompt: 'Monochrome wave pattern with fluid, calming flow, elegant and smooth, minimalist, slightly dreamlike'
      },
      {
        id: 'ma_5',
        title: 'Minimalist City Skyline',
        prompt: 'Minimalist city skyline with soft lighting, muted colors, dreamlike glow, stylized simplicity, calming'
      }
    ]
  },
  {
    id: 'anime_popart',
    name: 'Anime & Pop Art',
    description: 'Futuristic neon cities, cherry blossoms, and bold 80s aesthetics',
    icon: 'Palette',
    presets: [
      {
        id: 'ap_1',
        title: 'Anime Neon Sunset City',
        prompt: 'Anime sunset over a futuristic city, neon lights and pastel sky, vibrant and lively, unreal engine, cinematic glow, colorful atmosphere'
      },
      {
        id: 'ap_2',
        title: 'Cherry Blossom Pond',
        prompt: 'Japanese cherry blossom park with koi pond, soft pastel shades, anime-style, gentle textures, dreamlike, serene'
      },
      {
        id: 'ap_3',
        title: 'Retro 80s Anime Driver',
        prompt: 'Retro anime character driving a vintage car through neon cityscape, bright colors, slightly surreal, 80s vibe, dynamic'
      },
      {
        id: 'ap_4',
        title: 'Bold Pop Art Illustration',
        prompt: 'Bold pop art illustration with high contrast colors, comic book style, vibrant, retro, thick outlines'
      },
      {
        id: 'ap_5',
        title: 'Anime School Rooftop',
        prompt: 'Anime-style school rooftop at dusk, pastel skies with a soft breeze, dreamlike, vibrant tones, calming atmosphere'
      }
    ]
  },
  {
    id: 'space_scifi',
    name: 'Space & Sci-Fi',
    description: 'Floating astronauts, cyberpunk cities, and alien suns',
    icon: 'Orbit',
    presets: [
      {
        id: 'ss_1',
        title: 'Floating Cosmic Astronaut',
        prompt: 'Astronaut floating in space with Earth in the distance, vivid cosmic colors, ultra-realistic yet dreamlike, cinematic'
      },
      {
        id: 'ss_2',
        title: 'Cyberpunk Neon Skyline',
        prompt: 'Cyberpunk city skyline with neon lights, flying cars, and futuristic vibes, vibrant and moody, high contrast, surreal glow'
      },
      {
        id: 'ss_3',
        title: 'Alien Floating Islands',
        prompt: 'Alien planet with two suns and floating islands, dreamlike and otherworldly, high detail, unreal engine, colorful lighting'
      },
      {
        id: 'ss_4',
        title: 'Robotic Metallic Metropolis',
        prompt: 'High-tech robotic city with metallic skyscrapers, slightly dystopian, unreal engine, cinematic lights, detailed textures'
      },
      {
        id: 'ss_5',
        title: 'Spaceship Nebula Voyage',
        prompt: 'Spaceship navigating through a bright nebula with vibrant colors, space fantasy, dreamlike, high contrast'
      }
    ]
  },
  {
    id: 'dark_moody',
    name: 'Dark & Moody',
    description: 'Foggy castles, candlelit libraries, and rainy neon alleys',
    icon: 'Moon',
    presets: [
      {
        id: 'dm_1',
        title: 'Eerie Gothic Castle',
        prompt: 'Gothic castle on a fog-covered hill with bats in the sky, eerie and moody, dark tones, surreal lighting, slightly dreamlike'
      },
      {
        id: 'dm_2',
        title: 'Candlelit Antique Library',
        prompt: 'Dusty library lit by candlelight, antique books and vintage decor, warm yet mysterious, dreamlike glow, soft textures'
      },
      {
        id: 'dm_3',
        title: 'Rainy Neon-Lit Alleyway',
        prompt: 'Rainy neon-lit alleyway at night, reflections and glowing signs, slightly surreal, dark and moody, vibrant highlights'
      },
      {
        id: 'dm_4',
        title: 'Mysterious Misty Forest',
        prompt: 'Misty forest with dark shadows and tall trees, hidden secrets, slightly dreamlike, eerie ambiance'
      },
      {
        id: 'dm_5',
        title: 'Haunted Mansion flickering',
        prompt: 'Old mansion with cracked walls, flickering candlelight, haunted vibe, dark tones, high contrast, moody'
      }
    ]
  },
  {
    id: 'aesthetic_retro',
    name: 'Aesthetic & Retro',
    description: 'VHS overlays, vintage florals, and vaporwave skylines',
    icon: 'Film',
    presets: [
      {
        id: 'ar_1',
        title: '90s Nostalgic VHS Grain',
        prompt: '90s aesthetic with VHS overlay, neon highlights, and soft grain, nostalgic, vibrant, retro colors, slightly dreamlike'
      },
      {
        id: 'ar_2',
        title: 'Vintage Pastel Florals',
        prompt: 'Vintage floral wallpaper with soft pastel colors, delicate textures, whimsical, dreamlike, high-resolution'
      },
      {
        id: 'ar_3',
        title: 'Retro Beach Sunset Glow',
        prompt: 'Retro beach with umbrellas and soft sunset glow, nostalgic tones, slightly surreal, warm, high detail'
      },
      {
        id: 'ar_4',
        title: 'Vaporwave Palm Cityscape',
        prompt: 'Vaporwave cityscape with palm trees, neon lights, and 80s vibe, vibrant and colorful, slightly surreal glow'
      },
      {
        id: 'ar_5',
        title: 'Renaissance Brushstroke Portrait',
        prompt: 'Renaissance-style portrait with soft brushstrokes, classic yet dreamlike, vintage texture, high-resolution'
      }
    ]
  },
  {
    id: 'artistic_whimsical',
    name: 'Artistic & Whimsical',
    description: 'Watercolor mountains, floating cartoon islands, and hand-drawn maps',
    icon: 'PenTool',
    presets: [
      {
        id: 'aw_1',
        title: 'Watercolor Mountain Sunset',
        prompt: 'Watercolor sunset over a mountain range, vibrant colors, hand-painted feel, dreamlike texture, soft glow'
      },
      {
        id: 'aw_2',
        title: 'Floating Whimsical Cities',
        prompt: 'Floating islands with tiny whimsical cities, dreamlike and surreal, vivid colors, artistic style, soft lighting'
      },
      {
        id: 'aw_3',
        title: 'Impressionist Autumn Leaves',
        prompt: 'Impressionist-inspired autumn landscape, colorful leaves, brushstroke details, vibrant and slightly surreal'
      },
      {
        id: 'aw_4',
        title: 'Whimsical Cartoon Animal Forest',
        prompt: 'Whimsical cartoon forest with animals, smiling trees, and colorful tones, dreamlike, bright and cheerful'
      },
      {
        id: 'aw_5',
        title: 'Playful Hand-Drawn Map',
        prompt: 'Hand-drawn world map with vibrant colors and playful illustrations, vintage yet dreamlike, detailed textures'
      }
    ]
  },
  {
    id: 'surreal_conceptual',
    name: 'Surreal & Conceptual',
    description: 'Melting clocks, starlit paths, and cityscapes merging into nebulae',
    icon: 'Eye',
    presets: [
      {
        id: 'sc_1',
        title: 'Waterfall Floating Island',
        prompt: 'Floating island in a colorful sky, single tree and waterfall, magical and surreal, vivid colors, dreamlike atmosphere'
      },
      {
        id: 'sc_2',
        title: 'Cosmic Time-Warp Gears',
        prompt: 'Time-warped clocks and gears in a cosmic background, surreal with bright hues, high detail, otherworldly'
      },
      {
        id: 'sc_3',
        title: 'Cloud Path Under Purple Stars',
        prompt: 'Person walking on a cloud path under a purple, starlit sky, surreal and dreamlike, gentle glow, ethereal tones'
      },
      {
        id: 'sc_4',
        title: 'Dali Melting Clocks',
        prompt: 'Melting clock in a surreal landscape, inspired by Dali, vibrant colors, dreamlike, artistic textures'
      },
      {
        id: 'sc_5',
        title: 'Nebula Cityscape Merge',
        prompt: 'City skyline merging with a starlit night sky, cosmic and surreal, high detail, dreamlike colors, mystical tones'
      }
    ]
  }
];
