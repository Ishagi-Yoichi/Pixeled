import { motion } from "framer-motion";
import { Brain, Focus, CheckCircle } from "lucide-react";
import React from "react";

const features = [
  {
    icon: Brain,
    title: "AI Thought Structuring",
    description: "Convert chaos into structured clarity instantly.",
  },
  {
    icon: Focus,
    title: "Deep Focus Mode",
    description: "Distraction-free thinking environment.",
  },
  {
    icon: CheckCircle,
    title: "Execution Planning",
    description: "Turn ideas into actionable steps.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="relative z-20 py-32 px-6">
      <div className="container mx-auto grid gap-6 md:grid-cols-3 max-w-5xl">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.7,
              delay: i * 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            viewport={{ once: true }}
            className="rounded-2xl p-8 backdrop-blur-xl border"
            style={{
              background: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <f.icon className="w-7 h-7 text-gold-soft mb-5" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-foreground mb-2">
              {f.title}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(var(--text-muted))" }}
            >
              {f.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
