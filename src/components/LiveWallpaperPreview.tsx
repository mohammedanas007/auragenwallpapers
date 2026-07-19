import React, { useEffect, useRef, useState } from 'react';
import { WallpaperItem } from '../types';
import { Sparkles, Eye, Download, Info, RefreshCw } from 'lucide-react';
// @ts-ignore
import gifshot from 'gifshot';

interface LiveWallpaperPreviewProps {
  item: WallpaperItem;
  isInteractive?: boolean;
  showSafeZoneOverlay?: boolean;
}

export default function LiveWallpaperPreview({
  item,
  isInteractive = true,
  showSafeZoneOverlay = false
}: LiveWallpaperPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 360, height: 640 });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  // References for the animation loop
  const requestRef = useRef<number | null>(null);
  const particlesRef = useRef<any[]>([]);
  const frameRef = useRef<number>(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const faceImgRef = useRef<HTMLImageElement | null>(null);

  // Parse design blueprint variables
  const {
    primaryColor = '#a78bfa',
    secondaryColor = '#ec4899',
    bgColor = '#0b0f19',
    particleType = 'dust',
    particleColor = '#ffffff',
    elementsToRender = []
  } = item.blueprint || {};

  // Track image load states
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.src = item.imageUrl;
    img.onload = () => {
      imgRef.current = img;
    };

    if (item.uploadedImage) {
      const faceImg = new Image();
      faceImg.src = item.uploadedImage;
      faceImg.onload = () => {
        faceImgRef.current = faceImg;
      };
    } else {
      faceImgRef.current = null;
    }
  }, [item.imageUrl, item.uploadedImage]);

  // Handle dynamic container sizing
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      setDimensions({ width, height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update canvas sizing and re-initialize particle system when dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Initialize particles based on selected FX and category
    const pCount = item.sfx.seasonalFX !== 'none' ? 45 : 30;
    const particles = [];
    const cat = item.category || '';

    for (let i = 0; i < pCount; i++) {
      const p: any = {
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: item.sfx.seasonalFX === 'neon_rain' ? 4 + Math.random() * 4 : 0.3 + Math.random() * 1,
        size: Math.random() * (item.sfx.seasonalFX === 'snow' ? 4 : 3) + 1,
        alpha: Math.random() * 0.6 + 0.2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        color: item.sfx.seasonalFX === 'neon_rain' ? (Math.random() > 0.5 ? '#38bdf8' : '#ec4899') : particleColor
      };

      // Assign custom category hero elements to a subset of particles (first 8 particles)
      if (i < 8) {
        p.isHeroElement = true;
        p.vx = (Math.random() - 0.5) * 0.3;
        p.vy = 0.1 + Math.random() * 0.3; // drift slower
        p.alpha = Math.random() * 0.5 + 0.3;

        if (cat === 'surreal_conceptual') {
          p.heroType = i % 2 === 0 ? 'clock' : 'gear';
          p.size = Math.random() * 3 + 4; // Clock/gear size
        } else if (cat === 'dreamy_fantasy') {
          p.heroType = 'mushroom';
          p.size = Math.random() * 1.5 + 2;
        } else if (cat === 'minimalist_abstract') {
          p.heroType = 'shape';
          p.shapeType = i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'triangle' : 'square';
          p.size = Math.random() * 2 + 3;
          p.color = i % 2 === 0 ? primaryColor : secondaryColor;
        } else if (cat === 'artistic_whimsical') {
          p.heroType = 'watercolor_blob';
          p.size = Math.random() * 6 + 6; // huge artistic blobs
          p.color = i % 2 === 0 ? primaryColor : secondaryColor;
        } else if (cat === 'aesthetic_retro') {
          p.heroType = 'retro_star';
          p.size = Math.random() * 2 + 2;
          p.color = i % 2 === 0 ? '#fbbf24' : '#ec4899'; // Gold and neon pink retro stars
        } else if (cat === 'space_scifi') {
          p.heroType = 'planet';
          p.size = Math.random() * 2 + 3;
          p.color = i % 2 === 0 ? '#38bdf8' : '#ec4899';
        } else if (cat === 'anime_popart') {
          p.heroType = 'sakura_bloom';
          p.size = Math.random() * 2 + 2;
          p.color = '#f472b6'; // pastel pink
        } else if (cat === 'dark_moody') {
          p.heroType = 'ember';
          p.size = Math.random() * 1.5 + 1.5;
          p.color = i % 2 === 0 ? '#f97316' : '#ef4444'; // Orange/red glowing embers
        } else {
          // Default/Nature: leaves
          p.heroType = 'leaf';
          p.size = Math.random() * 1.5 + 2;
          p.color = i % 2 === 0 ? '#10b981' : '#f59e0b'; // Green/gold leaves
        }
      }

      particles.push(p);
    }
    particlesRef.current = particles;
  }, [dimensions, item.sfx.seasonalFX, particleColor, item.category, primaryColor, secondaryColor]);

  // Interactive mouse move response
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInteractive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / dimensions.width - 0.5;
    const y = (e.clientY - rect.top) / dimensions.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      frameRef.current += 1;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // --- BASE LAYER: Draw Wallpaper Image (Ken Burns Animated + Parallax Offset) ---
      const parallaxX = mousePos.x * 25;
      const parallaxY = mousePos.y * 25;
      
      // Majestic Ken Burns zoom rhythm
      const zoomFactor = 1.05 + Math.sin(frameRef.current * 0.002) * 0.03;
      const targetWidth = dimensions.width * zoomFactor;
      const targetHeight = dimensions.height * zoomFactor;
      const drawX = (dimensions.width - targetWidth) / 2 + parallaxX;
      const drawY = (dimensions.height - targetHeight) / 2 + parallaxY;

      if (imgRef.current) {
        ctx.drawImage(imgRef.current, drawX, drawY, targetWidth, targetHeight);
      } else {
        // Aesthetic Gradient Fallback while loading
        const grad = ctx.createLinearGradient(0, 0, 0, dimensions.height);
        grad.addColorStop(0, bgColor);
        grad.addColorStop(0.5, primaryColor + '44');
        grad.addColorStop(1, secondaryColor + '22');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      }

      // --- FX LAYER: Ambient Nebulae / Cosmic Fog (Creation FX) ---
      if (item.sfx.creationFX === 'cosmic_nebula') {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const nebulaGrad = ctx.createRadialGradient(
          dimensions.width / 2 + Math.sin(frameRef.current * 0.005) * 40,
          dimensions.height / 3 + Math.cos(frameRef.current * 0.003) * 40,
          10,
          dimensions.width / 2,
          dimensions.height / 3,
          dimensions.width * 0.7
        );
        nebulaGrad.addColorStop(0, primaryColor + '22');
        nebulaGrad.addColorStop(0.5, secondaryColor + '11');
        nebulaGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = nebulaGrad;
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);
        ctx.restore();
      }

      // --- FX LAYER: Synthwave Cyber Grid (Creation FX) ---
      if (item.sfx.creationFX === 'synthwave' || item.sfx.creationFX === 'vaporwave') {
        ctx.save();
        ctx.strokeStyle = '#ec489955';
        ctx.lineWidth = 1;
        const gridYStart = dimensions.height * 0.65;
        
        // Draw grid lines perspective
        const lineCount = 12;
        const horizonY = gridYStart;
        for (let i = 0; i <= lineCount; i++) {
          const ratio = i / lineCount;
          const startX = dimensions.width * ratio;
          const endX = dimensions.width / 2 + (startX - dimensions.width / 2) * 4;
          ctx.beginPath();
          ctx.moveTo(startX, horizonY);
          ctx.lineTo(endX, dimensions.height);
          ctx.stroke();
        }

        // Draw horizontal moving stripes
        const stripeCount = 8;
        const offset = (frameRef.current * 0.8) % 30;
        for (let i = 0; i < stripeCount; i++) {
          const y = horizonY + Math.pow(i / stripeCount, 2) * (dimensions.height - horizonY) + offset;
          if (y < dimensions.height) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(dimensions.width, y);
            ctx.stroke();
          }
        }

        // Draw Vaporwave sun in the center top third
        const sunRadius = dimensions.width * 0.16;
        const sunX = dimensions.width / 2;
        const sunY = dimensions.height * 0.35;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        const sunGrad = ctx.createLinearGradient(sunX, sunY - sunRadius, sunX, sunY + sunRadius);
        sunGrad.addColorStop(0, '#f43f5e');
        sunGrad.addColorStop(0.5, '#ec4899');
        sunGrad.addColorStop(1, '#eab308');
        ctx.fillStyle = sunGrad;
        ctx.fill();

        // Slice cuts in sun
        ctx.fillStyle = bgColor;
        for (let i = 1; i < 6; i++) {
          const cutHeight = 3 + i * 1.5;
          ctx.fillRect(sunX - sunRadius - 10, sunY + (i * 12) - 10, sunRadius * 2 + 20, cutHeight);
        }
        ctx.restore();
      }

      // --- FX LAYER: Glow Portrait & Face Remix Silhouettes ---
      if (item.sfx.glowPortrait || item.sfx.faceRemix) {
        ctx.save();
        // Compute composition coordinates
        let centerY = dimensions.height / 2;
        if (item.composition === 'top_third') centerY = dimensions.height * 0.3;
        else if (item.composition === 'bottom_third') centerY = dimensions.height * 0.7;

        const size = Math.min(dimensions.width * 0.5, 180);
        const centerX = dimensions.width / 2;

        if (faceImgRef.current) {
          // Draw user remix portrait
          ctx.shadowColor = primaryColor;
          ctx.shadowBlur = 25;
          
          // Render within a gorgeous luminous circular frame
          ctx.beginPath();
          ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
          ctx.clip();
          
          ctx.drawImage(faceImgRef.current, centerX - size / 2, centerY - size / 2, size, size);
          
          // Circle stroke
          ctx.beginPath();
          ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 4;
          ctx.stroke();
        } else {
          // Draw beautiful procedural Neon glowing guardian/avatar profile
          ctx.shadowColor = secondaryColor;
          ctx.shadowBlur = 30;
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 3;
          ctx.fillStyle = bgColor + 'aa';

          // Outer glowing loop
          ctx.beginPath();
          ctx.arc(centerX, centerY, size / 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Render futuristic silhouette vectors
          ctx.beginPath();
          ctx.arc(centerX, centerY - 15, size / 6, 0, Math.PI * 2); // Head
          ctx.moveTo(centerX - size / 4, centerY + 30);
          ctx.bezierCurveTo(centerX - size / 4, centerY + 10, centerX + size / 4, centerY + 10, centerX + size / 4, centerY + 30); // Shoulders
          ctx.strokeStyle = '#ffffffaa';
          ctx.stroke();

          // Halo crown rings
          ctx.beginPath();
          ctx.ellipse(centerX, centerY - 35, size / 4, size / 16, Math.sin(frameRef.current * 0.02) * 0.1, 0, Math.PI * 2);
          ctx.strokeStyle = '#f43f5e';
          ctx.stroke();
        }
        ctx.restore();
      }

      // --- FX LAYER: Seasonal FX Particles Engine ---
      if (item.sfx.seasonalFX !== 'none') {
        ctx.save();
        particlesRef.current.forEach(p => {
          // Move particles
          if (item.sfx.seasonalFX === 'neon_rain') {
            p.y += p.vy;
            p.x += Math.sin(frameRef.current * 0.01) * 0.2;
          } else if (item.sfx.seasonalFX === 'cherry_blossoms') {
            p.y += p.vy * 0.6;
            p.x += Math.sin(frameRef.current * 0.02 + p.angle) * 0.8 + 0.4; // wind drift
            p.angle += p.spin;
          } else {
            p.y += p.vy;
            p.x += p.vx + Math.sin(frameRef.current * 0.005 + p.angle) * 0.3;
          }

          // Reset when out of bounds
          if (p.y > dimensions.height) {
            p.y = -10;
            p.x = Math.random() * dimensions.width;
          }
          if (p.x > dimensions.width) p.x = 0;
          if (p.x < 0) p.x = dimensions.width;

          // Render particle types beautifully
          ctx.beginPath();
          if (item.sfx.seasonalFX === 'snow') {
            // Fluffy snow flakes
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 4;
            ctx.fill();
          } else if (item.sfx.seasonalFX === 'autumn') {
            // Twirling fall leaves
            ctx.ellipse(p.x, p.y, p.size * 2, p.size, p.angle, 0, Math.PI * 2);
            ctx.fillStyle = p.alpha > 0.5 ? '#f97316' : p.alpha > 0.3 ? '#ef4444' : '#eab308';
            ctx.fill();
          } else if (item.sfx.seasonalFX === 'cherry_blossoms') {
            // Elegant sakura petals
            ctx.ellipse(p.x, p.y, p.size * 1.5, p.size, p.angle, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(244, 114, 182, ${p.alpha})`;
            ctx.fill();
          } else if (item.sfx.seasonalFX === 'neon_rain') {
            // Cyberpunk luminous raindrops
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size / 2;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - 2, p.y + p.size * 5);
            ctx.stroke();

            // Ripple splash when near bottom
            if (p.y > dimensions.height - 30 && Math.random() > 0.95) {
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
              ctx.strokeStyle = p.color + '33';
              ctx.stroke();
            }
          } else if (item.sfx.seasonalFX === 'sunbeams') {
            // Floating dust motes illuminated by cosmic lightbeams
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha * 0.8})`;
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 6;
            ctx.fill();
          }
        });

        // Overlay light rays for 'sunbeams'
        if (item.sfx.seasonalFX === 'sunbeams') {
          const beamOffset = Math.sin(frameRef.current * 0.003) * 40;
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = 'rgba(251, 191, 36, 0.04)';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(dimensions.width * 0.4 + beamOffset, 0);
          ctx.lineTo(dimensions.width, dimensions.height * 0.8);
          ctx.lineTo(dimensions.width * 0.3, dimensions.height);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }

      // --- FX LAYER: Category-Specific Procedural Hero Elements ---
      ctx.save();
      particlesRef.current.forEach(p => {
        if (!p.isHeroElement) return;

        // Move hero elements down slowly
        p.y += p.vy * 0.4;
        p.x += p.vx * 0.4 + Math.sin(frameRef.current * 0.005 + p.angle) * 0.1;
        p.angle += p.spin * 0.5;

        // Interactive Parallax offset for hero elements based on mouse position
        const heroParallaxX = mousePos.x * 35;
        const heroParallaxY = mousePos.y * 35;
        const renderX = p.x + heroParallaxX;
        const renderY = p.y + heroParallaxY;

        // Reset when out of bounds
        if (p.y > dimensions.height) {
          p.y = -20;
          p.x = Math.random() * dimensions.width;
        }
        if (p.x > dimensions.width + 20) p.x = -20;
        if (p.x < -20) p.x = dimensions.width + 20;

        // Draw the specific hero type
        if (p.heroType === 'clock') {
          ctx.save();
          ctx.translate(renderX, renderY);
          ctx.shadowColor = primaryColor;
          ctx.shadowBlur = 15;
          
          // Clock Face
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
          ctx.strokeStyle = primaryColor + 'cc';
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          // Outer ring ticks
          ctx.strokeStyle = primaryColor + '66';
          ctx.lineWidth = 1;
          for (let j = 0; j < 4; j++) {
            ctx.beginPath();
            ctx.moveTo(0, -p.size * 3.5);
            ctx.lineTo(0, -p.size * 3);
            ctx.stroke();
            ctx.rotate(Math.PI / 2);
          }
          
          // Rotating Hands
          const hAngle = frameRef.current * 0.003 + p.angle;
          const mAngle = frameRef.current * 0.015 + p.angle * 2;
          
          // Hour hand
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(hAngle) * p.size * 1.8, Math.sin(hAngle) * p.size * 1.8);
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 2.5;
          ctx.stroke();
          
          // Minute hand
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(mAngle) * p.size * 2.8, Math.sin(mAngle) * p.size * 2.8);
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          ctx.restore();
        } else if (p.heroType === 'gear') {
          ctx.save();
          ctx.translate(renderX, renderY);
          ctx.rotate(frameRef.current * 0.004 + p.angle);
          ctx.shadowColor = secondaryColor;
          ctx.shadowBlur = 10;
          ctx.strokeStyle = secondaryColor + '99';
          ctx.lineWidth = 2;
          
          // Inner circle
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
          ctx.stroke();

          // Teeth
          const teeth = 8;
          ctx.fillStyle = secondaryColor + '55';
          for (let t = 0; t < teeth; t++) {
            ctx.rotate(Math.PI * 2 / teeth);
            ctx.fillRect(-p.size * 0.5, -p.size * 3, p.size, p.size);
          }
          ctx.restore();
        } else if (p.heroType === 'mushroom') {
          ctx.save();
          ctx.translate(renderX, renderY);
          ctx.shadowColor = primaryColor;
          ctx.shadowBlur = 18;
          
          // Mushroom Cap
          ctx.beginPath();
          ctx.arc(0, -2, p.size * 3.2, Math.PI, 0);
          ctx.fillStyle = secondaryColor;
          ctx.fill();
          
          // White Cap Spots
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-p.size, -p.size, p.size * 0.5, 0, Math.PI * 2);
          ctx.arc(p.size, -p.size, p.size * 0.5, 0, Math.PI * 2);
          ctx.arc(0, -p.size * 1.8, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          
          // Mushroom Stem
          ctx.beginPath();
          ctx.rect(-p.size * 0.7, -2, p.size * 1.4, p.size * 3);
          ctx.fillStyle = '#f8fafc';
          ctx.fill();
          ctx.restore();
        } else if (p.heroType === 'shape') {
          ctx.save();
          ctx.translate(renderX, renderY);
          ctx.rotate(p.angle + frameRef.current * 0.003);
          ctx.strokeStyle = p.color + 'cc';
          ctx.lineWidth = 1.5;
          ctx.fillStyle = p.color + '18';
          
          if (p.shapeType === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (p.shapeType === 'triangle') {
            ctx.beginPath();
            const r = p.size * 3;
            ctx.moveTo(0, -r);
            ctx.lineTo(r * 0.86, r * 0.5);
            ctx.lineTo(-r * 0.86, r * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else {
            // Square
            const s = p.size * 4.5;
            ctx.fillRect(-s/2, -s/2, s, s);
            ctx.strokeRect(-s/2, -s/2, s, s);
          }
          ctx.restore();
        } else if (p.heroType === 'watercolor_blob') {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const radGrad = ctx.createRadialGradient(renderX, renderY, 0, renderX, renderY, p.size * 6);
          radGrad.addColorStop(0, p.color + '26');
          radGrad.addColorStop(0.5, p.color + '0e');
          radGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(renderX, renderY, p.size * 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (p.heroType === 'retro_star') {
          ctx.save();
          ctx.translate(renderX, renderY);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.fillStyle = '#ffffff';
          
          ctx.beginPath();
          const r = p.size * 3.5;
          ctx.moveTo(0, -r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.quadraticCurveTo(0, 0, 0, r);
          ctx.quadraticCurveTo(0, 0, -r, 0);
          ctx.quadraticCurveTo(0, 0, 0, -r);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (p.heroType === 'planet') {
          ctx.save();
          ctx.translate(renderX, renderY);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          
          // Body
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          
          // Ring
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 4, p.size * 0.9, -Math.PI / 6, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();
        } else if (p.heroType === 'sakura_bloom') {
          ctx.save();
          ctx.translate(renderX, renderY);
          ctx.rotate(p.angle + frameRef.current * 0.01);
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#f472b6';
          ctx.shadowBlur = 8;
          
          // Simple 5-petal Sakura blossom vector drawing
          for (let petal = 0; petal < 5; petal++) {
            ctx.rotate(Math.PI * 2 / 5);
            ctx.beginPath();
            ctx.ellipse(0, -p.size * 1.5, p.size * 0.8, p.size * 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        } else if (p.heroType === 'ember') {
          ctx.save();
          ctx.translate(renderX, renderY);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fillStyle = p.color;
          
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (p.heroType === 'leaf') {
          ctx.save();
          ctx.translate(renderX, renderY);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 2, p.size * 0.9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      ctx.restore();

      // --- FX LAYER: Ambient Dust Particles ---
      if (item.sfx.seasonalFX === 'none') {
        ctx.save();
        particlesRef.current.forEach(p => {
          p.y += p.vy * 0.5;
          p.x += p.vx * 0.5;
          if (p.y > dimensions.height) p.y = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
          ctx.fillStyle = particleColor + '55';
          ctx.fill();
        });
        ctx.restore();
      }

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [dimensions, mousePos, item, bgColor, primaryColor, secondaryColor]);

  // Download high fidelity artwork trigger as animated GIF
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || isExporting) return;

    setIsExporting(true);
    setExportProgress('Recording...');

    const frames: string[] = [];
    const maxFrames = 20; // 20 frames is perfect for 2 seconds (10 fps)
    const intervalMs = 100; // Capture frame every 100ms
    let count = 0;

    const captureInterval = setInterval(() => {
      if (!canvas) {
        clearInterval(captureInterval);
        setIsExporting(false);
        return;
      }
      
      // Capture frame
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        frames.push(dataUrl);
      } catch (err) {
        console.error('Frame capture error:', err);
      }
      
      count++;
      setExportProgress(`Rec ${Math.round((count / maxFrames) * 100)}%`);

      if (count >= maxFrames) {
        clearInterval(captureInterval);
        setExportProgress('Compiling...');

        // Calculate optimized dimensions for GIF exporting to avoid performance bottlenecks
        let gifWidth = dimensions.width;
        let gifHeight = dimensions.height;
        const maxDimension = 360; // Max 360px for super fast processing and small file size
        if (gifWidth > maxDimension || gifHeight > maxDimension) {
          if (gifWidth > gifHeight) {
            gifHeight = Math.round((gifHeight * maxDimension) / gifWidth);
            gifWidth = maxDimension;
          } else {
            gifWidth = Math.round((gifWidth * maxDimension) / gifHeight);
            gifHeight = maxDimension;
          }
        }

        gifshot.createGIF({
          images: frames,
          gifWidth,
          gifHeight,
          interval: 0.1, // 100ms per frame
          numFrames: maxFrames,
          sampleInterval: 10,
          numWorkers: 2
        }, (obj: any) => {
          setIsExporting(false);
          setExportProgress('');

          if (!obj.error) {
            const link = document.createElement('a');
            link.download = `${item.name.replace(/\s+/g, '_').toLowerCase()}_live.gif`;
            link.href = obj.image;
            link.click();
          } else {
            console.error('GIF generation error:', obj.error);
            alert('GIF generation failed. Falling back to high-resolution snapshot.');
            
            // Fallback to static PNG
            const fallbackUrl = canvas.toDataURL('image/png');
            const fallbackLink = document.createElement('a');
            fallbackLink.download = `${item.name.replace(/\s+/g, '_').toLowerCase()}_4k.png`;
            fallbackLink.href = fallbackUrl;
            fallbackLink.click();
          }
        });
      }
    }, intervalMs);
  };

  return (
    <div
      ref={containerRef}
      id="live-wallpaper-container"
      className="relative w-full h-full overflow-hidden rounded-3xl bg-neutral-950 shadow-2xl transition-all duration-300 group"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        aspectRatio: item.aspectRatio === '9:16' ? '9/16' : item.aspectRatio === '9:19.5' ? '9/19.5' : item.aspectRatio === '16:9' ? '16/9' : '21/9'
      }}
    >
      {/* Interactive Wallpaper Canvas */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full object-cover rounded-3xl"
      />

      {/* Visual Icon-Safe Overlay Grid Helper */}
      {showSafeZoneOverlay && (
        <div id="icon-safe-overlay" className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10 animate-fade-in">
          {/* Top Third Safe Indicator */}
          <div className="border-2 border-dashed border-sky-400/50 bg-sky-500/10 rounded-2xl p-3 flex flex-col items-center justify-center h-[28%] backdrop-blur-[1px]">
            <span className="text-[10px] uppercase font-mono tracking-widest text-sky-200 font-semibold">
              Icon-Safe Top Third
            </span>
            <span className="text-[9px] text-sky-300 mt-1">Perfect for time & widgets</span>
          </div>

          {/* Middle Indicator */}
          <div className="border border-dashed border-neutral-500/30 rounded-2xl flex items-center justify-center h-[36%]">
            <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-400">
              {item.composition === 'center' ? '🌟 Focal Point Center' : 'Negative Art Space'}
            </span>
          </div>

          {/* Bottom Third Safe Indicator */}
          <div className="border-2 border-dashed border-sky-400/50 bg-sky-500/10 rounded-2xl p-3 flex flex-col items-center justify-center h-[24%] backdrop-blur-[1px]">
            <span className="text-[10px] uppercase font-mono tracking-widest text-sky-200 font-semibold">
              Icon-Safe Bottom Third
            </span>
            <span className="text-[9px] text-sky-300 mt-1">Reserved for dock & quick shortcuts</span>
          </div>
        </div>
      )}

      {/* Floating Interactive Badge Indicators */}
      <div className="absolute top-4 left-4 flex gap-2 pointer-events-none z-10 opacity-80 group-hover:opacity-100 transition-opacity">
        <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-mono tracking-wider text-yellow-400 border border-yellow-400/20 flex items-center gap-1 shadow-md">
          <Sparkles className="w-3 h-3" /> Live Active
        </span>
        <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-mono text-neutral-300 border border-neutral-700/30 flex items-center gap-1 shadow-md">
          {item.aspectRatio} ({item.aspectRatio.startsWith('9:') ? 'Mobile' : 'Desktop'})
        </span>
      </div>

      {/* Action Overlay controls shown on Hover */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-neutral-900/85 backdrop-blur-md p-3 rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-white truncate max-w-[140px] md:max-w-[180px]">
            {item.name}
          </span>
          <span className="text-[9px] text-neutral-400 font-mono flex items-center gap-1">
            Engine: {item.engine}
          </span>
        </div>
        
        <button
          disabled={isExporting}
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className={`px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer ${
            isExporting ? 'opacity-80 cursor-wait' : ''
          }`}
        >
          {isExporting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{isExporting ? exportProgress : 'Download GIF'}</span>
        </button>
      </div>

      {/* Live movement instruction tip */}
      {isHovered && isInteractive && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black/75 backdrop-blur-md py-1 px-3 rounded-full text-[9px] text-neutral-400 pointer-events-none border border-neutral-800/40 animate-pulse z-15">
          Move cursor to check parallax flow
        </div>
      )}
    </div>
  );
}
