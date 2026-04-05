import React from "react";
const petals = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${10 + Math.random() * 80}%`,
  delay: `${i * 1.5}s`,
  size: 8 + Math.random() * 10,
  duration: `${10 + Math.random() * 6}s`,
}));

const FloatingPetals = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-petal-drift"
          style={{
            left: p.left,
            top: `-${p.size}px`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: "#FDBA74",
            opacity: 0,
            filter: "blur(1px)",
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingPetals;
