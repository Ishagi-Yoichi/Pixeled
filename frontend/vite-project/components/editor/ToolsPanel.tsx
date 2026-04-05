import {
  RotateCcw,
  RotateCw,
  Sparkles,
  Maximize2,
  FileDown,
} from "lucide-react";
import type { ImageState } from "../../src/pages/ImageEditor";
import React from "react";

interface ToolsPanelProps {
  image: ImageState;
  updateImage: (updates: Partial<ImageState>) => void;
}

const ToolsPanel = ({ image, updateImage }: ToolsPanelProps) => {
  return (
    <aside
      className="w-56 shrink-0 border-r overflow-y-auto"
      style={{
        backgroundColor: "rgba(0,0,0,0.35)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      {/* Transform */}
      <Section title="Transform">
        <div className="flex gap-2">
          <ToolButton
            icon={<RotateCcw size={16} />}
            label="Left"
            onClick={() =>
              updateImage({ rotation: (image.rotation - 90 + 360) % 360 })
            }
          />
          <ToolButton
            icon={<RotateCw size={16} />}
            label="Right"
            onClick={() =>
              updateImage({ rotation: (image.rotation + 90) % 360 })
            }
          />
        </div>
      </Section>

      {/* Enhancement */}
      <Section title="Enhance">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary shrink-0" />
          <input
            type="range"
            min={0}
            max={100}
            value={image.sharpness}
            onChange={(e) => updateImage({ sharpness: Number(e.target.value) })}
            className="flex-1 accent-primary h-1"
          />
          <span className="text-xs text-muted-foreground w-8 text-right font-mono">
            {image.sharpness}
          </span>
        </div>
      </Section>

      {/* Resize */}
      <Section title="Resize">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Maximize2 size={14} className="text-primary shrink-0" />
            <label className="text-xs text-muted-foreground flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={image.aspectLocked}
                onChange={(e) =>
                  updateImage({ aspectLocked: e.target.checked })
                }
                className="accent-primary"
              />
              Lock aspect
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <DimInput
              label="W"
              value={image.width}
              onChange={(w) => {
                if (image.aspectLocked && image.originalWidth > 0) {
                  const ratio = image.originalHeight / image.originalWidth;
                  updateImage({ width: w, height: Math.round(w * ratio) });
                } else {
                  updateImage({ width: w });
                }
              }}
            />
            <DimInput
              label="H"
              value={image.height}
              onChange={(h) => {
                if (image.aspectLocked && image.originalHeight > 0) {
                  const ratio = image.originalWidth / image.originalHeight;
                  updateImage({ height: h, width: Math.round(h * ratio) });
                } else {
                  updateImage({ height: h });
                }
              }}
            />
          </div>
          <button
            onClick={() =>
              updateImage({
                width: image.originalWidth,
                height: image.originalHeight,
              })
            }
            className="text-xs text-primary hover:underline"
          >
            Reset to original
          </button>
        </div>
      </Section>

      {/* Format */}
      <Section title="Format">
        <div className="flex items-center gap-2">
          <FileDown size={14} className="text-primary shrink-0" />
          <select
            value={image.exportFormat}
            onChange={(e) => updateImage({ exportFormat: e.target.value })}
            className="flex-1 bg-muted/40 text-foreground text-xs rounded px-2 py-1.5 border border-border focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WEBP</option>
          </select>
        </div>
        {(image.exportFormat === "jpeg" || image.exportFormat === "webp") && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Quality</span>
            <input
              type="range"
              min={10}
              max={100}
              value={image.exportQuality}
              onChange={(e) =>
                updateImage({ exportQuality: Number(e.target.value) })
              }
              className="flex-1 accent-primary h-1"
            />
            <span className="text-xs text-muted-foreground w-8 text-right font-mono">
              {image.exportQuality}
            </span>
          </div>
        )}
      </Section>
    </aside>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div
    className="p-3 border-b"
    style={{ borderColor: "rgba(255,255,255,0.06)" }}
  >
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
      {title}
    </h3>
    {children}
  </div>
);

const ToolButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg bg-muted/30 hover:bg-muted/60 text-foreground transition-colors"
  >
    {icon}
    <span className="text-[10px] text-muted-foreground">{label}</span>
  </button>
);

const DimInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center gap-1">
    <span className="text-[10px] text-muted-foreground">{label}</span>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
      className="w-full bg-muted/40 text-foreground text-xs rounded px-2 py-1 border border-border focus:ring-1 focus:ring-primary outline-none font-mono"
    />
  </div>
);

export default ToolsPanel;
