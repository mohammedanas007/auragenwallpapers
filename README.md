# Aura: AI Live Wallpaper Studio 🌌🎨

 
### 🚀 Live Application Access [https://ais-pre-yz24gixuyrtyshdno7nduf-411440095121.asia-east1.run.app](https://ais-pre-yz24gixuyrtyshdno7nduf-411440095121.asia-east1.run.app)

 

 Aura is a full-stack, state-of-the-art interactive **AI Live Wallpaper Studio** built on **React 18**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Node.js/Express**. Powered by the **Gemini API** (Aura Creative Engine), Aura allows users to generate breathtaking, high-fidelity 4K wallpapers tailored for mobile or desktop devices.


---

## ✨ Features

### 🛠️ 1. Creation Studio
* **Prompt-to-Art Engine:** Instantly generate bespoke wallpaper themes using natural language descriptions, guided by advanced prompt enhancements.
* **Custom Aspect Ratios:** Choose standard aspect ratios designed for all primary screens (`16:9` widescreen, `9:16` mobile portrait, `21:9` ultra-wide).
* **Direct Image Uploads:** Import your own local photos directly into the canvas to preview and customize them with visual effects.

### 🌟 2. Interactive Live FX & Visual Overlays
* **Safe-Zone Previews:** Toggle overlay grids (App Icon grid overlays, time/date placements, and status rails) to verify visual clarity under real-world conditions.
* **Ambient SFX Filters:** Enhance your wallpapers with premium visual post-processing toggles:
  * **Glow Portrait:** Enhanced central focus lighting.
  * **Dynamic Particle Engine:** Soft, drifting ambient dust motes.
  * **Seasonal FX:** Gentle seasonal drift overlays (e.g., cherry blossoms, snowflakes).

### 📖 3. Presets & Local Gallery
* **Curated Themes:** Browse and apply beautifully curated starter presets (Anime Pop Art, Dreamy Fantasy, Synthwave Cyberpunk, Minimalist Nordic).
* **Local Persistence:** Save, manage, and delete custom wallpapers in your private Studio Gallery using local browser state.
* **Intelligent Seed Restore:** Instantly restore default pre-vetted starter wallpapers if the gallery is cleared.

### ⚡ 4. Intelligent Fallback System
* **Dynamic Photo Discovery:** When offline or when limits are reached, the background server extracts semantic keywords from your custom prompts to fetch matching high-resolution backdrops dynamically from a curated, CORS-safe Unsplash CDN.
* **Static Fallback Pools:** Pre-vetted high-fidelity imagery acts as an immediate safety net, ensuring the application remains robust and responsive at all times.

---

## 🛠️ Technology Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide React (Icons), Motion (Animations)
* **Backend:** Node.js, Express, Fetch API
* **AI Engine:** Gemini API (`@google/genai` Integration)
* **Styling & Fonts:** Inter & JetBrains Mono typography, custom glassmorphism components

---

## 💻 Local Development

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** or **bun** package manager

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch on [http://localhost:3000](http://localhost:3000).

### 4. Build for Production
```bash
npm run build
```
This builds both the client assets into `dist/` and compiles the backend server into a production-ready bundled file (`dist/server.cjs`).

---

## 🐙 Exporting to GitHub

To push this codebase to your personal GitHub repository directly from the Google AI Studio environment:

1. Click on the **Settings Menu** (gear icon) in the upper right-hand corner of the AI Studio interface.
2. Select **Export to GitHub** or **Download ZIP**.
3. Authenticate with your GitHub account, select your target repository name, and finalize the export.
4. Copy-paste this `README.md` or use it directly as your repository's landing page!
