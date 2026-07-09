'use client';

import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Check } from 'lucide-react';

interface GenreBubble {
  id: string;
  slug: string;
  name: string;
  color: string;
}

const GENRES: GenreBubble[] = [
  { id: '1', slug: 'cng-ngh-lp-trnh', name: 'Công nghệ & Lập trình', color: 'from-blue-500 to-indigo-600' },
  { id: '2', slug: 'kinh-doanh-khi-nghip', name: 'Kinh doanh & Khởi nghiệp', color: 'from-amber-500 to-orange-600' },
  { id: '3', slug: 'khoa-hc-v-tr', name: 'Khoa học & Vũ trụ', color: 'from-emerald-500 to-teal-600' },
  { id: '4', slug: 'lch-s-trit-hc', name: 'Lịch sử & Triết học', color: 'from-rose-500 to-pink-600' },
];

interface BubbleGenreSelectorProps {
  onSelectionChange: (selectedSlugs: string[]) => void;
}

export default function BubbleGenreSelector({ onSelectionChange }: BubbleGenreSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Track selected category slugs
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const selectedSlugsRef = useRef<string[]>([]);

  // Refs for tracking MatterJS body positions to position DOM bubbles
  const bubbleElementsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const bodiesRef = useRef<{ id: string; body: Matter.Body }[]>([]);

  useEffect(() => {
    selectedSlugsRef.current = selectedSlugs;
    onSelectionChange(selectedSlugs);
  }, [selectedSlugs, onSelectionChange]);

  const toggleSelect = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = 450;

    // Matter-JS Modules
    const { Engine, World, Bodies, Mouse, MouseConstraint, Runner } = Matter;

    // Create physics engine
    const engine = Engine.create({
      gravity: { x: 0, y: 0, scale: 0 }, // Zero gravity to let bubbles float around freely
    });

    const world = engine.world;

    // Render configuration for canvas (used mostly for boundaries and mouse tracking)
    canvasRef.current.width = width;
    canvasRef.current.height = height;

    // Boundary walls (invisible but prevents bubbles from flying out)
    const wallOptions = { isStatic: true, render: { visible: false } };
    const floor = Bodies.rectangle(width / 2, height + 30, width * 2, 60, wallOptions);
    const ceiling = Bodies.rectangle(width / 2, -30, width * 2, 60, wallOptions);
    const leftWall = Bodies.rectangle(-30, height / 2, 60, height * 2, wallOptions);
    const rightWall = Bodies.rectangle(width + 30, height / 2, 60, height * 2, wallOptions);

    World.add(world, [floor, ceiling, leftWall, rightWall]);

    // Create a body circle for each category
    const radius = Math.min(width * 0.15, 85); // Dynamic size based on viewport width
    const bodies: { id: string; body: Matter.Body }[] = [];

    GENRES.forEach((genre, idx) => {
      // Position bubbles in a circle pattern initially
      const angle = (idx / GENRES.length) * Math.PI * 2;
      const x = width / 2 + Math.cos(angle) * (width * 0.25);
      const y = height / 2 + Math.sin(angle) * (height * 0.22);

      const circleBody = Bodies.circle(x, y, radius, {
        restitution: 0.7, // Nice elastic bounce
        frictionAir: 0.04, // Gentle friction to slow down over time
        friction: 0.1,
      });

      // Add category details to body metadata
      (circleBody as any).genreSlug = genre.slug;

      World.add(world, circleBody);
      bodies.push({ id: genre.slug, body: circleBody });
    });

    bodiesRef.current = bodies;

    // Mouse control to drag/throw bubbles
    const mouse = Mouse.create(canvasRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.1,
        render: { visible: false },
      },
    });

    World.add(world, mouseConstraint);

    // Keep the runner running
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Dynamic rendering loop: Sync Matter.js coordinates with React DOM elements (60fps)
    let animationFrameId: number;
    const syncDOM = () => {
      bodies.forEach(({ id, body }) => {
        const domEl = bubbleElementsRef.current[id];
        if (domEl) {
          const x = body.position.x - radius;
          const y = body.position.y - radius;
          
          // Apply position style via high-performance transform translate
          const isSelected = selectedSlugsRef.current.includes(id);
          const scale = isSelected ? 1.15 : 1.0;
          
          domEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
        }
      });

      // Apply a very gentle force toward the center of the viewport to keep bubbles aggregated
      bodies.forEach(({ body }) => {
        const centerForce = 0.00008;
        const dx = width / 2 - body.position.x;
        const dy = height / 2 - body.position.y;
        Matter.Body.applyForce(body, body.position, {
          x: dx * centerForce,
          y: dy * centerForce,
        });
      });

      animationFrameId = requestAnimationFrame(syncDOM);
    };

    syncDOM();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      Runner.stop(runner);
      Engine.clear(engine);
      World.clear(world, false);
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl bg-slate-900/5 backdrop-blur-xl border border-slate-100 p-2 shadow-inner overflow-hidden select-none">
      
      {/* Background grid texture */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

      {/* Touch/Mouse physical boundaries & constraints layer */}
      <div ref={containerRef} className="relative w-full h-[450px]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10 cursor-grab active:cursor-grabbing" />

        {/* Render HTML DOM Bubbles mapped on top of Physics Coordinates */}
        {GENRES.map((genre) => {
          const isSelected = selectedSlugs.includes(genre.slug);
          const size = 170; // 2 * radius (approx 85px radius)

          return (
            <div
              key={genre.slug}
              ref={(el) => {
                bubbleElementsRef.current[genre.slug] = el;
              }}
              onClick={() => toggleSelect(genre.slug)}
              className="absolute left-0 top-0 z-20 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 pointer-events-none"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                willChange: 'transform',
              }}
            >
              <div
                className={`relative w-4/5 h-4/5 rounded-full flex flex-col items-center justify-center p-4 shadow-lg border transition-all duration-300 pointer-events-auto hover:-translate-y-0.5 active:scale-95 ${
                  isSelected
                    ? `bg-gradient-to-br ${genre.color} text-white border-transparent ring-4 ring-offset-2 ring-slate-800/10`
                    : 'bg-white/80 backdrop-blur-md text-slate-700 border-slate-100 hover:bg-white hover:shadow-xl'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30 animate-pulse">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                )}
                
                <span className="font-extrabold text-xs leading-tight tracking-tight uppercase px-1">
                  {genre.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer Info */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-30">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Chạm hoặc kéo ném các bong bóng thể loại
        </span>
      </div>
    </div>
  );
}
