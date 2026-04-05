import type { ImageState } from "../../src/pages/ImageEditor";
import React from "react";

interface PropertiesPanelProps {
  image: ImageState;
  updateImage: (updates: Partial<ImageState>) => void;
}

const PropertiesPanel = ({ image, updateImage }: PropertiesPanelProps) => {
  const fileSize = image.file
    ? (image.file.size / 1024).toFixed(1) + " KB"
    : "—";
  const fileType = image.file?.type.split("/")[1]?.toUpperCase() || "—";

  return (
    <aside
      className="w-52 shrink-0 border-l overflow-y-auto hidden lg:block"
      style={{
        backgroundColor: "rgba(0,0,0,0.35)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="p-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
          Properties
        </h3>
        <div className="space-y-2 text-xs">
          <Row label="File" value={image.file?.name.slice(0, 20) || "—"} />
          <Row label="Type" value={fileType} />
          <Row label="Size" value={fileSize} />
          <Row
            label="Original"
            value={`${image.originalWidth} × ${image.originalHeight}`}
          />
          <Row label="Current" value={`${image.width} × ${image.height}`} />
          <Row label="Rotation" value={`${image.rotation}°`} />
          <Row label="Format" value={image.exportFormat.toUpperCase()} />
        </div>
      </div>
    </aside>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-mono truncate ml-2">{value}</span>
  </div>
);

export default PropertiesPanel;
