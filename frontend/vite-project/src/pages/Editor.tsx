"use client";

import { motion } from "framer-motion";
import { Film, ImageIcon, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";

export default function EditorPage() {
  const headingRef = useRef(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.fromTo(
      headingRef.current,
      {
        opacity: 0,
        y: 30,
        filter: "blur(10px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1,
        ease: "power3.out",
      },
    );

    gsap.fromTo(
      cardsRef.current,
      {
        opacity: 0,
        y: 40,
        filter: "blur(12px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.15,
        duration: 1,
        ease: "power3.out",
        delay: 0.2,
      },
    );
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b0c] text-white">
      {/* Ambient Glow */}
      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-amber-500/10 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-200px] right-[-100px] w-[400px] h-[400px] bg-orange-400/10 blur-[120px] rounded-full" />

      {/* Grid Texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24">
        {/* Hero */}
        <div ref={headingRef} className="text-center max-w-3xl mx-auto">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-300/80 mb-5">
            Your Creative Workspace
          </p>

          <h1 className="text-5xl md:text-7xl font-extrabold font-ebr text-zinc-400 tracking-tight leading-[1.05]">
            Edit media with
            <span className="block text-white">
              <span className=" font-ebr">clarity </span>
              <span className="font-serif font-extrabold text-zinc-400">
                &{" "}
              </span>
              <span className=" font-ebr">passion.</span>
            </span>
          </h1>

          <p className="mt-6 text-zinc-500 text-lg leading-relaxed">
            Professional-grade browser tools for video and image editing —
            crafted with a calm, distraction-free workflow.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-20">
          {/* Video Editor */}
          <motion.div
            ref={(el) => {
              cardsRef.current[0] = el;
            }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="
              group relative overflow-hidden
              rounded-3xl
              border border-white/10
              bg-white/[0.03]
              backdrop-blur-xl
              p-8 md:p-10
            "
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />

            <div className="relative z-10">
              <div
                className="
                w-14 h-14 rounded-2xl
                bg-gradient-to-br from-amber-300 to-amber-500
                flex items-center justify-center
                shadow-[0_10px_30px_rgba(245,158,11,0.35)]
              "
              >
                <Film className="w-7 h-7 text-black" />
              </div>

              <h2 className="mt-8 text-3xl font-bold tracking-tight">
                Video Editor
              </h2>

              <p className="mt-4 text-zinc-400 leading-relaxed">
                Extract thumbnails, trim clips, compress videos, convert
                formats, and process media directly in your browser with
                FFmpeg-powered workflows.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  "Trim Video",
                  "Extract Frames",
                  "Compress",
                  "Convert Format",
                ].map((item) => (
                  <span
                    key={item}
                    className="
                      px-3 py-1 rounded-full
                      text-xs
                      border border-white/10
                      bg-white/[0.03]
                      text-zinc-400
                    "
                  >
                    {item}
                  </span>
                ))}
              </div>

              <Link to="/editor/video">
                <button
                  className="
                    mt-10
                    inline-flex items-center gap-2
                    px-5 py-3
                    rounded-full
                    text-sm font-medium
                    text-black
                    bg-gradient-to-r from-amber-300 to-amber-500
                    shadow-[0_8px_25px_rgba(245,158,11,0.35)]
                    hover:scale-[1.03]
                    transition-all duration-300
                  "
                >
                  Open Video Editor
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Image Editor */}
          <motion.div
            ref={(el) => {
              cardsRef.current[0] = el;
            }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="
              group relative overflow-hidden
              rounded-3xl
              border border-white/10
              bg-white/[0.03]
              backdrop-blur-xl
              p-8 md:p-10
            "
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />

            <div className="relative z-10">
              <div
                className="
                w-14 h-14 rounded-2xl
                bg-gradient-to-br from-orange-300 to-amber-500
                flex items-center justify-center
                shadow-[0_10px_30px_rgba(251,146,60,0.25)]
              "
              >
                <ImageIcon className="w-7 h-7 text-black" />
              </div>

              <h2 className="mt-8 text-3xl font-bold tracking-tight">
                Image Editor
              </h2>

              <p className="mt-4 text-zinc-400 leading-relaxed">
                Resize, rotate, enhance quality, and convert image formats with
                a minimal editing experience designed for speed and clarity.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {["Resize", "Rotate", "Enhance", "Format Convert"].map(
                  (item) => (
                    <span
                      key={item}
                      className="
                      px-3 py-1 rounded-full
                      text-xs
                      border border-white/10
                      bg-white/[0.03]
                      text-zinc-400
                    "
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>

              <Link to="/editor/image">
                <button
                  className="
                    mt-10
                    inline-flex items-center gap-2
                    px-5 py-3
                    rounded-full
                    text-sm font-medium
                    text-black
                    bg-gradient-to-r from-orange-300 to-amber-500
                    shadow-[0_8px_25px_rgba(251,146,60,0.25)]
                    hover:scale-[1.03]
                    transition-all duration-300
                  "
                >
                  Open Image Editor
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
