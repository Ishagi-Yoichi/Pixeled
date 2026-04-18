import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import type { ImageState } from "../../src/pages/ImageEditor";
import React from "react";

interface ImageCanvasProps {
  image: ImageState;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const ImageCanvas = ({ image, canvasRef }: ImageCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);

  // Load & draw image whenever state changes
  useEffect(() => {
    if (!image.src || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      const rad = (image.rotation * Math.PI) / 180;
      const isRotated = image.rotation % 180 !== 0;
      const cw = isRotated ? image.height : image.width;
      const ch = isRotated ? image.width : image.height;

      canvas.width = cw;
      canvas.height = ch;

      ctx.clearRect(0, 0, cw, ch);
      ctx.save();
      ctx.translate(cw / 2, ch / 2);
      ctx.rotate(rad);
      ctx.drawImage(
        img,
        -image.width / 2,
        -image.height / 2,
        image.width,
        image.height,
      );
      ctx.restore();

      // Sharpening via unsharp mask approximation
      if (image.sharpness > 0) {
        const strength = image.sharpness / 100;
        const imageData = ctx.getImageData(0, 0, cw, ch);
        const data = imageData.data;
        const copy = new Uint8ClampedArray(data);
        const w = cw;

        for (let y = 1; y < ch - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const i = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) {
              const center = copy[i + c] * 5;
              const neighbors =
                copy[i - 4 + c] +
                copy[i + 4 + c] +
                copy[i - w * 4 + c] +
                copy[i + w * 4 + c];
              const sharp = center - neighbors;
              data[i + c] = Math.min(
                255,
                Math.max(0, copy[i + c] + sharp * strength * 0.3),
              );
            }
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // Fit zoom
      if (containerRef.current) {
        const cr = containerRef.current.getBoundingClientRect();
        const fit = Math.min((cr.width - 40) / cw, (cr.height - 40) / ch, 1);
        setFitZoom(fit);
        setZoom(fit);
      }
    };
    img.src = image.src;
  }, [
    image.src,
    image.rotation,
    image.width,
    image.height,
    image.sharpness,
    canvasRef,
  ]);

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col"
      style={{ backgroundColor: "hsl(0 0% 7%)" }}
    >
      {/* Canvas area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center",
            imageRendering: zoom > 2 ? "pixelated" : "auto",
          }}
          className="max-w-none shadow-2xl rounded"
        />
      </div>

      {/* Zoom controls */}
      <div className="h-18 flex items-center justify-center gap-2 border-t border-border/50 shrink-0">
        <button
          onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
        >
          <ZoomOut size={20} />
        </button>
        <span className="text-xs text-muted-foreground w-14 text-center font-mono">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(5, z + 0.1))}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => setZoom(fitZoom)}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Fit to view"
        >
          <Maximize size={20} />
        </button>
      </div>
    </div>
  );
};

export default ImageCanvas;
