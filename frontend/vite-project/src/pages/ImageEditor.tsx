import { useState, useRef, useCallback, useEffect, RefObject } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ImageUpload from "../../components/editor/ImageUpload";
import ImageCanvas from "../../components/editor/ImageCanvas";
import ToolsPanel from "../../components/editor/ToolsPanel";
import PropertiesPanel from "../../components/editor/PropertiesPanel";
import EditorHeader from "../../components/editor/EditorHeader";
import React from "react";

export interface ImageState {
  file: File | null;
  src: string | null;
  rotation: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  sharpness: number;
  exportFormat: string;
  exportQuality: number;
  aspectLocked: boolean;
}

const initialState: ImageState = {
  file: null,
  src: null,
  rotation: 0,
  width: 0,
  height: 0,
  originalWidth: 0,
  originalHeight: 0,
  sharpness: 0,
  exportFormat: "png",
  exportQuality: 92,
  aspectLocked: true,
};

const ImageEditor = () => {
  const [image, setImage] = useState<ImageState>(initialState);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleFileLoad = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImage({
        ...initialState,
        file,
        src: url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        originalWidth: img.naturalWidth,
        originalHeight: img.naturalHeight,
      });
    };
    img.src = url;
  }, []);

  const updateImage = useCallback((updates: Partial<ImageState>) => {
    setImage((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetToOriginal = useCallback(() => {
    setImage((prev) => ({
      ...prev,
      rotation: initialState.rotation,
      width: prev.originalWidth,
      height: prev.originalHeight,
      sharpness: initialState.sharpness,
      exportFormat: initialState.exportFormat,
      exportQuality: initialState.exportQuality,
      aspectLocked: initialState.aspectLocked,
    }));
  }, []);

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mime =
      image.exportFormat === "jpeg" || image.exportFormat === "jpg"
        ? "image/jpeg"
        : image.exportFormat === "webp"
          ? "image/webp"
          : "image/png";

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `pixeled-export.${image.exportFormat === "jpg" ? "jpg" : image.exportFormat}`;
        a.click();
        URL.revokeObjectURL(a.href);
      },
      mime,
      image.exportQuality / 100,
    );
  }, [image.exportFormat, image.exportQuality]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <EditorHeader onExport={image.src ? handleExport : undefined} />

      {!image.src ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <ImageUpload onFileLoad={handleFileLoad} />
        </div>
      ) : (
        <div className="flex-1 flex min-h-0">
          {/* Tools Panel */}
          <ToolsPanel
            image={image}
            updateImage={updateImage}
            onResetToOriginal={resetToOriginal}
          />

          {/* Canvas */}

          <div className="flex-1 min-w-0">
            <ImageCanvas
              image={image}
              canvasRef={canvasRef as RefObject<HTMLCanvasElement>}
            />
          </div>

          {/* Properties Panel */}
          <PropertiesPanel image={image} updateImage={updateImage} />
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
