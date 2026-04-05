import { motion } from "framer-motion";
import React from "react";
const navLinks = ["Features", "How It Works", "Pricing", "Testimonials"];

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-20 backdrop-blur-xl border-b"
      style={{
        backgroundColor: "rgba(0,0,0,0.25)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="container mx-auto h-full flex items-center justify-between px-8">
        <span className="text-xl font-bold text-foreground tracking-tight">
          Pixeled
        </span>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s/g, "-")}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        <a
          href="#get-started"
          className="hidden md:inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold text-primary-foreground bg-gradient-to-b from-gold-soft to-gold transition-transform duration-200 hover:scale-105 hover:brightness-110 glow-gold"
        >
          Get Started
        </a>
      </div>
    </motion.nav>
  );
};

export default Navbar;
