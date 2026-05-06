"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function PricingPage() {
  const headingRef = useRef(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.fromTo(
      headingRef.current,
      {
        opacity: 0,
        y: 30,
        filter: "blur(12px)",
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
        stagger: 0.12,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
      },
    );
  }, []);

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for casual editing and exploration.",
      features: [
        "Basic image editing",
        "Basic video trimming",
        "Frame extraction",
        "Up to 50MB uploads",
      ],
      cta: "Start Free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$12",
      description: "Advanced workflows for creators and professionals.",
      features: [
        "Unlimited exports",
        "Advanced compression",
        "Priority processing",
        "High-quality rendering",
        "Future AI tools access",
      ],
      cta: "Upgrade to Pro",
      highlight: true,
    },
    {
      name: "Studio",
      price: "$29",
      description: "Built for teams and intensive creative workflows.",
      features: [
        "Team collaboration",
        "Shared workspaces",
        "Batch processing",
        "Priority support",
        "Experimental features",
      ],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0b] text-white">
      {/* Ambient Lights */}
      <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[140px]" />
      <div className="absolute bottom-[-200px] right-[-100px] w-[450px] h-[450px] rounded-full bg-orange-400/10 blur-[140px]" />

      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24">
        {/* Hero */}
        <div ref={headingRef} className="max-w-3xl mx-auto text-center">
          <div
            className="
            inline-flex items-center gap-2
            px-4 py-2 rounded-full
            border border-white/10
            bg-white/[0.03]
            text-sm text-amber-300
            mb-6
          "
          >
            <Sparkles className="w-4 h-4" />
            Simple pricing
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Calm tools for
            <span className="block text-zinc-400">focused creativity.</span>
          </h1>

          <p className="mt-6 text-zinc-500 text-lg leading-relaxed">
            Transparent pricing designed for creators who value beautiful
            workflows, speed, and simplicity.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.25 }}
              className={`
                relative overflow-hidden
                rounded-3xl
                border
                backdrop-blur-xl
                p-8
                ${
                  plan.highlight
                    ? "border-amber-400/30 bg-gradient-to-b from-amber-400/[0.08] to-white/[0.03]"
                    : "border-white/10 bg-white/[0.03]"
                }
              `}
            >
              {/* Glow */}
              {plan.highlight && (
                <div className="absolute inset-0 bg-amber-400/[0.03]" />
              )}

              {/* Popular Badge */}
              {plan.highlight && (
                <div
                  className="
                  absolute top-5 right-5
                  px-3 py-1 rounded-full
                  text-xs font-medium
                  bg-amber-400 text-black
                "
                >
                  Most Popular
                </div>
              )}

              <div className="relative z-10">
                <h3 className="text-2xl font-bold tracking-tight">
                  {plan.name}
                </h3>

                <div className="mt-6 flex items-end gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-zinc-500 mb-1">/month</span>
                </div>

                <p className="mt-4 text-zinc-400 leading-relaxed text-sm">
                  {plan.description}
                </p>

                <div className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div
                        className="
                        mt-0.5
                        w-5 h-5 rounded-full
                        bg-white/[0.05]
                        border border-white/10
                        flex items-center justify-center
                      "
                      >
                        <Check className="w-3 h-3 text-amber-300" />
                      </div>

                      <p className="text-sm text-zinc-300">{feature}</p>
                    </div>
                  ))}
                </div>

                <button
                  className={`
                    mt-10 w-full
                    py-3 rounded-full
                    text-sm font-medium
                    transition-all duration-300
                    ${
                      plan.highlight
                        ? `
                          text-black
                          bg-gradient-to-r from-amber-300 to-amber-500
                          shadow-[0_10px_30px_rgba(245,158,11,0.35)]
                          hover:scale-[1.02]
                        `
                        : `
                          border border-white/10
                          text-zinc-300
                          hover:bg-white/[0.05]
                          hover:text-white
                        `
                    }
                  `}
                >
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-16">
          <p className="text-sm text-zinc-600">
            No hidden fees. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
