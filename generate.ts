import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

// Curated pool of beautiful Unsplash seeds for fallback image generation, categorized by style
const FALLBACK_SEEDS: Record<string, string[]> = {
  dreamy_fantasy: [
    'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1200&auto=format&fit=crop'
  ],
  nature_adventure: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop'
  ],
  minimalist_abstract: [
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop'
  ],
  anime_popart: [
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'
  ],
  space_scifi: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?q=80&w=1200&auto=format&fit=crop'
  ],
  dark_moody: [
    'https://images.unsplash.com/photo-1501004318641-72ee04d2a047?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop'
  ],
  aesthetic_retro: [
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524169358666-79f22534bc6e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1490750967868-882d97a94341?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1200&auto=format&fit=crop'
  ],
  artistic_whimsical: [
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1200&auto=format&fit=crop'
  ],
  surreal_conceptual: [
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1200&auto=format&fit=crop'
  ]
};

const INAPPROPRIATE_WORDS = [
  'porn', 'nude', 'nsfw', 'sex', 'naked', 'gore', 'blood', 'kill', 'murder', 'dead',
  'drugs', 'cocaine', 'heroin', 'abuse', 'violence', 'hate', 'racist', 'terrorist',
  'hentai', 'xxx', 'vagina', 'penis', 'boobs', 'bastard', 'asshole', 'rape', 'suicide'
];

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
    }
  }
  return geminiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, category, engine, aspectRatio, sfx, composition, uploadedImage } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt input is required.' });
    }

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

    if (ai) {
      try {
        const blueprintResponse = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: `Create an artistic wallpaper design blueprint for the prompt: "${prompt}".
Categorized under "${category}". Aspect ratio requested is "${aspectRatio}".
Additional FX: Glow Portrait=${sfx?.glowPortrait}, Anime Style=${sfx?.animeStyle}, Seasonal FX=${sfx?.seasonalFX}, Creation FX=${sfx?.creationFX}.
Composition constraint is "${composition}".
You must return a raw JSON object matching the requested schema. Use these EXACT keys:
- "enhancedPrompt": string
- "primaryColor": string
- "secondaryColor": string
- "bgColor": string
- "styleMood": string (One of: "glowing", "cosmic", "minimalist", "retro", "nature", "dark", "watercolor", "anime")
- "safeZonePadding": number (0 to 40)
- "elementsToRender": array of strings (3 to 5 items)
- "particleType": string (One of: "stars", "bubbles", "leaves", "rain", "sakura", "embers", "dust")
- "particleColor": string
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
                elementsToRender: { type: Type.ARRAY, items: { type: Type.STRING } },
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
        console.warn('Failed to generate design blueprint via Gemini, using fallback template:', err);
      }
    }

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

    if (ai) {
      const imagePrompt = `${designBlueprint.enhancedPrompt}. Minimalist composition, clean negative space in the ${composition === 'top_third' ? 'bottom two-thirds' : composition === 'bottom_third' ? 'top two-thirds' : 'outer borders'} for widget and icon readability. No watermarks. 4K high quality, professional wallpaper design. ${sfx?.animeStyle ? 'Beautiful rich anime painting style.' : ''} ${sfx?.glowPortrait ? 'Glowing neon portrait luminescence.' : ''}`;
      let geminiRatio: '9:16' | '16:9' | '1:1' = '9:16';
      if (aspectRatio === '16:9' || aspectRatio === '21:9') geminiRatio = '16:9';

      try {
        const imageResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image',
          contents: { parts: [{ text: imagePrompt }] },
          config: { imageConfig: { aspectRatio: geminiRatio, imageSize: '1K' } }
        });
        for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData?.data) {
            generatedImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (err) {
        try {
          const liteResponse = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite-image',
            contents: { parts: [{ text: imagePrompt }] },
            config: { imageConfig: { aspectRatio: geminiRatio } }
          });
          for (const part of liteResponse.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData?.data) {
              generatedImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        } catch (liteErr) {
          console.log('Both image models failed, falling back to Unsplash.');
        }
      }
    }

    let fallbackActive = false;
    if (!generatedImageBase64) {
      fallbackActive = true;
      try {
        const cleanPrompt = prompt
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter((w: string) => w.length > 3 && !['with', 'glowing', 'wallpaper', 'background', 'aesthetic', 'scenic', 'beautiful', 'extremely', 'detailed', 'design', 'style', 'high', 'quality', 'definition', 'neon', 'hd', '4k'].includes(w));
        const themeKeywords = cleanPrompt.length > 0 ? cleanPrompt.slice(0, 4) : [category.replace('_', ' ')];
        const queryStr = encodeURIComponent(themeKeywords.join(','));
        const isLandscape = aspectRatio === '16:9' || aspectRatio === '21:9';
        const width = isLandscape ? 1920 : 1080;
        const height = isLandscape ? 1080 : 1920;
        const cacheBust = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const unsplashFeaturedUrl = `https://images.unsplash.com/featured/${width}x${height}/?${queryStr}&sig=${cacheBust}`;
        const fallbackRes = await fetch(unsplashFeaturedUrl, { method: 'GET', redirect: 'follow' });
        if (fallbackRes.ok && fallbackRes.url) {
          generatedImageBase64 = fallbackRes.url;
        }
      } catch (err) {
        console.warn('Failed to resolve dynamic Unsplash image, using static pool:', err);
      }

      if (!generatedImageBase64) {
        const seeds = FALLBACK_SEEDS[category] || FALLBACK_SEEDS['dreamy_fantasy'];
        generatedImageBase64 = seeds[Math.floor(Math.random() * seeds.length)];
      }
    }

    return res.status(200).json({
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
}
