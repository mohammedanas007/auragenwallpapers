import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const isESM = typeof import.meta !== 'undefined' && typeof import.meta.url !== 'undefined';
const resolvedFilename = isESM ? fileURLToPath(import.meta.url) : '';
const resolvedDirname = isESM ? path.dirname(resolvedFilename) : '';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Curated pool of beautiful Unsplash seeds for fallback image generation, categorized by style to match user choices
const FALLBACK_SEEDS: Record<string, string[]> = {
  dreamy_fantasy: [
    'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=1200&auto=format&fit=crop', // Glowing enchanted forest
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop', // Surreal moonlit night
    'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1200&auto=format&fit=crop', // Celestial space fantasy
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop'  // Deep magical underwater coral
  ],
  nature_adventure: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop', // Golden hour hills
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop', // Snow peaks blue sky
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop', // Forest paths
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop'  // Sunset desert stars
  ],
  minimalist_abstract: [
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop', // Soft pastel smooth gradient
    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1200&auto=format&fit=crop', // Elegant gold white marble
    'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?q=80&w=1200&auto=format&fit=crop', // Abstract waves fluid
    'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop'  // Clean geometric shadow setup
  ],
  anime_popart: [
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop', // Retro anime city skyline
    'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1200&auto=format&fit=crop', // Sakura blossoms pond
    'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop', // Synthwave pink/purple grid
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'  // Bright pop art colorful splash
  ],
  space_scifi: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop', // Blue cyber cosmic background
    'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop', // Bright nebula galaxy
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop', // Orbit earth view
    'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=1200&auto=format&fit=crop'  // Deep cosmic sci-fi glow
  ],
  dark_moody: [
    'https://images.unsplash.com/photo-1501004318641-72ee04d2a047?q=80&w=1200&auto=format&fit=crop', // Moody forest dark fog
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1200&auto=format&fit=crop', // Candlelit old library
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200&auto=format&fit=crop', // Neon rain alleyway
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop'  // Dark eerie castle architecture
  ],
  aesthetic_retro: [
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop', // Retro neon sunset palm
    'https://images.unsplash.com/photo-1524169358666-79f22534bc6e?q=80&w=1200&auto=format&fit=crop', // Nostalgic warm film grain
    'https://images.unsplash.com/photo-1490750967868-882d97a94341?q=80&w=1200&auto=format&fit=crop', // Vintage floral pastel wallpaper
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop'  // Golden sunset beach nostalgia
  ],
  artistic_whimsical: [
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop', // Artistic colorful watercolor landscape
    'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=1200&auto=format&fit=crop', // Floating magical cities cartoon
    'https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=1200&auto=format&fit=crop', // Impressionist brushstrokes trees
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1200&auto=format&fit=crop'  // Whimsical child-like celestial sketch
  ],
  surreal_conceptual: [
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=1200&auto=format&fit=crop', // Dali style melting cloud sky
    'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?q=80&w=1200&auto=format&fit=crop', // Cosmic watch clocks gears merge
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1200&auto=format&fit=crop', // Purple starry cloud walkway
    'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1200&auto=format&fit=crop'  // Dreamy city merging with nebula dust
  ]
};

// Inappropriate prompt content screening list
const INAPPROPRIATE_WORDS = [
  'porn', 'nude', 'nsfw', 'sex', 'naked', 'gore', 'blood', 'kill', 'murder', 'dead',
  'drugs', 'cocaine', 'heroin', 'abuse', 'violence', 'hate', 'racist', 'terrorist',
  'hentai', 'xxx', 'vagina', 'penis', 'boobs', 'bastard', 'asshole', 'rape', 'suicide'
];

// Initialize Gemini SDK lazily to avoid crashing if process.env.GEMINI_API_KEY is missing
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return geminiClient;
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Post Generate Wallpaper API Route
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, category, engine, aspectRatio, sfx, composition, uploadedImage } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt input is required.' });
    }

    // 1. Content Moderation Check
    const lowerPrompt = prompt.toLowerCase();
    const isSafe = !INAPPROPRIATE_WORDS.some(word => lowerPrompt.includes(word));
    if (!isSafe) {
      return res.status(400).json({
        error: 'Safety Alert: The entered prompt contains words that do not comply with our community guidelines. Please adjust your text to keep it family-safe and try again.'
      });
    }

    const ai = getGeminiClient();
    let designBlueprint: any = null;
    let generatedImageBase64: string | null = null;

    // 2. Step 1: Query gemini-3.5-flash to get the "AI Design Blueprint"
    if (ai) {
      try {
        const blueprintResponse = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Create an artistic wallpaper design blueprint for the prompt: "${prompt}".
Categorized under "${category}". Aspect ratio requested is "${aspectRatio}". 
Additional FX: Glow Portrait=${sfx?.glowPortrait}, Anime Style=${sfx?.animeStyle}, Seasonal FX=${sfx?.seasonalFX}, Creation FX=${sfx?.creationFX}. 
Composition constraint is "${composition}".

You must return a raw JSON object matching the requested schema. Use these EXACT keys:
- "enhancedPrompt": string (An incredibly poetic, detailed, high-detail description for 4K rendering matching the prompt, keeping negative space and icon-safe zone guidelines in mind)
- "primaryColor": string (A beautiful hex color code that fits the prompt)
- "secondaryColor": string (A complementing hex color code)
- "bgColor": string (A deep, elegant dark/ambient background hex color code)
- "styleMood": string (One of: "glowing", "cosmic", "minimalist", "retro", "nature", "dark", "watercolor", "anime")
- "safeZonePadding": number (Recommended percentage padding from 0 to 40 to leave empty space for icons and widgets)
- "elementsToRender": array of strings (3 to 5 prominent visual concepts to draw, e.g. ["swirling golden galaxies", "neon cherry petals", "glowing mushrooms"])
- "particleType": string (One of: "stars", "bubbles", "leaves", "rain", "sakura", "embers", "dust")
- "particleColor": string (A hex color code for particles)
- "lightPosition": string (One of: "top", "center", "bottom", "none")

Return ONLY JSON, no markdown formatting blocks, no extra text.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                enhancedPrompt: { type: Type.STRING },
                primaryColor: { type: Type.STRING },
                secondaryColor: { type: Type.STRING },
                bgColor: { type: Type.STRING },
                styleMood: { type: Type.STRING },
                safeZonePadding: { type: Type.NUMBER },
                elementsToRender: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                particleType: { type: Type.STRING },
                particleColor: { type: Type.STRING },
                lightPosition: { type: Type.STRING }
              },
              required: ['enhancedPrompt', 'primaryColor', 'secondaryColor', 'bgColor', 'styleMood', 'safeZonePadding', 'elementsToRender', 'particleType', 'particleColor', 'lightPosition']
            }
          }
        });

        if (blueprintResponse.text) {
          designBlueprint = JSON.parse(blueprintResponse.text.trim());
        }
      } catch (err) {
        console.warn('Failed to generate design blueprint via Gemini, using dynamic procedural template:', err);
      }
    }

    // Default Fallback Blueprint if Gemini is missing or failed
    if (!designBlueprint) {
      const isDark = ['dark_moody', 'space_scifi', 'surreal_conceptual'].includes(category);
      designBlueprint = {
        enhancedPrompt: `${prompt}, stylized 4k, digital art, highly detailed, safe composition with elegant negative space`,
        primaryColor: category === 'dreamy_fantasy' ? '#a78bfa' : category === 'nature_adventure' ? '#fbbf24' : '#38bdf8',
        secondaryColor: '#ec4899',
        bgColor: isDark ? '#0b0f19' : '#f8fafc',
        styleMood: category === 'minimalist_abstract' ? 'minimalist' : category === 'anime_popart' ? 'anime' : 'glowing',
        safeZonePadding: 25,
        elementsToRender: [category, 'mystic visual shapes', 'ambient rays of light'],
        particleType: category === 'space_scifi' ? 'stars' : category === 'anime_popart' ? 'sakura' : 'dust',
        particleColor: '#ffffff',
        lightPosition: 'top'
      };
    }

    // 3. Step 2: Attempt high-fidelity image generation via gemini-3.1-flash-image
    if (ai) {
      try {
        const imagePrompt = `${designBlueprint.enhancedPrompt}. Minimalist composition, clean negative space in the ${composition === 'top_third' ? 'bottom two-thirds' : composition === 'bottom_third' ? 'top two-thirds' : 'outer borders'} for widget and icon readability. No watermarks. 4K high quality, professional wallpaper design. ${sfx?.animeStyle ? 'Beautiful rich anime painting style.' : ''} ${sfx?.glowPortrait ? 'Glowing neon portrait luminescence.' : ''}`;
        
        // Map UI aspect ratio to Gemini's supported aspect ratios: "1:1", "3:4", "4:3", "9:16", "16:9"
        let geminiRatio: '9:16' | '16:9' | '1:1' = '9:16';
        if (aspectRatio === '16:9' || aspectRatio === '21:9') {
          geminiRatio = '16:9';
        }

        console.log(`Calling gemini-3.1-flash-image with aspect ratio: ${geminiRatio}`);
        const imageResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image',
          contents: {
            parts: [{ text: imagePrompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: geminiRatio,
              imageSize: '1K'
            }
          }
        });

        if (imageResponse.candidates?.[0]?.content?.parts) {
          for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData?.data) {
              generatedImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        }
      } catch (err: any) {
        console.log(`[Imagen Service Info] Primary gemini-3.1-flash-image model rate-limited or busy (429/Quota). Trying gemini-3.1-flash-lite-image fallback...`);
        try {
          let geminiRatio: '9:16' | '16:9' | '1:1' = '9:16';
          if (aspectRatio === '16:9' || aspectRatio === '21:9') {
            geminiRatio = '16:9';
          }
          const imagePrompt = `${designBlueprint.enhancedPrompt}. Minimalist composition, clean negative space in the ${composition === 'top_third' ? 'bottom two-thirds' : composition === 'bottom_third' ? 'top two-thirds' : 'outer borders'} for widget and icon readability. No watermarks. 4K high quality, professional wallpaper design. ${sfx?.animeStyle ? 'Beautiful rich anime painting style.' : ''} ${sfx?.glowPortrait ? 'Glowing neon portrait luminescence.' : ''}`;
          
          const liteResponse = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: {
              parts: [{ text: imagePrompt }]
            },
            config: {
              imageConfig: {
                aspectRatio: geminiRatio,
              }
            }
          });

          if (liteResponse.candidates?.[0]?.content?.parts) {
            for (const part of liteResponse.candidates[0].content.parts) {
              if (part.inlineData?.data) {
                generatedImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
                console.log(`[Imagen Service Success] Successfully generated fallback wallpaper via gemini-3.1-flash-lite-image.`);
                break;
              }
            }
          }
        } catch (liteErr) {
          console.log(`[Imagen Service Info] Dual-stage model fallback exhausted. Proceeding to procedurally-enhanced dynamic design engine.`);
        }
      }
    }

    // 4. Fallback Image selection if Imagen generation is not available
    let fallbackActive = false;
    if (!generatedImageBase64) {
      fallbackActive = true;
      try {
        // Dynamically extract meaningful keywords from prompt for beautiful, high-quality Unsplash match
        const cleanPrompt = prompt
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 3 && !['with', 'glowing', 'wallpaper', 'background', 'aesthetic', 'scenic', 'beautiful', 'extremely', 'detailed', 'design', 'style', 'high', 'quality', 'definition', 'neon', 'glowing', 'hd', '4k'].includes(w));
        
        const themeKeywords = cleanPrompt.length > 0 ? cleanPrompt.slice(0, 4) : [category.replace('_', ' ')];
        const queryStr = encodeURIComponent(themeKeywords.join(','));
        
        // Set dimension matching aspect ratio
        const isLandscape = aspectRatio === '16:9' || aspectRatio === '21:9';
        const width = isLandscape ? 1920 : 1080;
        const height = isLandscape ? 1080 : 1920;
        
        const cacheBust = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const unsplashFeaturedUrl = `https://images.unsplash.com/featured/${width}x${height}/?${queryStr}&sig=${cacheBust}`;
        
        console.log(`[Backup Image System] Resolving dynamic image for keywords: "${themeKeywords.join(', ')}"`);
        const fallbackRes = await fetch(unsplashFeaturedUrl, { method: 'GET', redirect: 'follow' });
        if (fallbackRes.ok && fallbackRes.url) {
          generatedImageBase64 = fallbackRes.url;
          console.log(`[Backup Image System] Resolved direct CORS-safe Unsplash CDN URL: ${generatedImageBase64}`);
        }
      } catch (err) {
        console.warn(`[Backup Image System] Failed to resolve dynamic Unsplash image, using static pool:`, err);
      }

      if (!generatedImageBase64) {
        // Retrieve direct, CORS-safe pre-vetted image pool matching the requested category
        const seeds = FALLBACK_SEEDS[category] || FALLBACK_SEEDS['dreamy_fantasy'];
        const randomIndex = Math.floor(Math.random() * seeds.length);
        generatedImageBase64 = seeds[randomIndex];
        console.log(`[Backup Image System] Loaded direct, CORS-safe, high-fidelity seed image for category "${category}". URL: ${generatedImageBase64}`);
      }
    }

    // Return the wallpaper configuration to the client
    return res.json({
      id: `wp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: prompt.split(',')[0].slice(0, 30) + ' Wallpaper',
      prompt,
      category,
      engine: engine || 'Aura Creative Engine',
      aspectRatio,
      sfx: {
        glowPortrait: sfx?.glowPortrait || false,
        faceRemix: sfx?.faceRemix || false,
        animeStyle: sfx?.animeStyle || false,
        seasonalFX: sfx?.seasonalFX || 'none',
        creationFX: sfx?.creationFX || 'none'
      },
      composition,
      imageUrl: generatedImageBase64,
      uploadedImage: uploadedImage || null,
      blueprint: designBlueprint,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLive: true,
      seed: Math.floor(Math.random() * 100000),
      fallbackActive
    });

  } catch (error: any) {
    console.error('Error generating wallpaper:', error);
    return res.status(500).json({ error: error.message || 'An internal server error occurred while processing your wallpaper generation request.' });
  }
});

// Configure Vite or Static Files serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = typeof __dirname !== 'undefined' ? __dirname : path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
