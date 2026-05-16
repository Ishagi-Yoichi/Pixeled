import { useState, useRef, useCallback, RefObject } from "react";
import ImageUpload from "../../components/editor/ImageUpload";
import ImageCanvas from "../../components/editor/ImageCanvas";
import ToolsPanel from "../../components/editor/ToolsPanel";
import PropertiesPanel from "../../components/editor/PropertiesPanel";
import EditorHeader from "../../components/editor/EditorHeader";

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
  grayscale: boolean;
  blur: number;
  brightness: number;
  contrast: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
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
  grayscale: false,
  blur: 0,
  brightness: 100,
  contrast: 100,
  flipHorizontal: false,
  flipVertical: false,
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 80;

const ImageEditor = () => {
  const [image, setImage] = useState<ImageState>(initialState);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
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
      grayscale: initialState.grayscale,
      blur: initialState.blur,
      brightness: initialState.brightness,
      contrast: initialState.contrast,
      flipHorizontal: initialState.flipHorizontal,
      flipVertical: initialState.flipVertical,
    }));
  }, []);

  const waitForDownloadUrl = useCallback(async (imageId: string) => {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const response = await fetch(`${API_BASE_URL}/image/status/${imageId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not read image status");
      }

      setExportStatus(`Status: ${String(data.status).toLowerCase()}`);

      if (data.status === "COMPLETED" && data.downloadUrl) {
        return data;
      }

      if (data.status === "FAILED") {
        throw new Error("Image processing failed on the server");
      }
    }

    throw new Error(
      "Processing is still pending. Try again after RabbitMQ and the worker are running.",
    );
  }, []);

  const handleExport = useCallback(async () => {
    if (!image.file || isExporting) return;

    setIsExporting(true);
    setExportStatus("Uploading edit job...");

    try {
      const formData = new FormData();
      formData.append("image", image.file);
      formData.append("width", String(image.width));
      formData.append("height", String(image.height));
      formData.append("rotation", String(image.rotation));
      formData.append("sharpness", String(image.sharpness));
      formData.append("exportFormat", image.exportFormat);
      formData.append("exportQuality", String(image.exportQuality));
      formData.append("grayscale", String(image.grayscale));
      formData.append("blur", String(image.blur));
      formData.append("brightness", String(image.brightness));
      formData.append("contrast", String(image.contrast));
      formData.append("flipHorizontal", String(image.flipHorizontal));
      formData.append("flipVertical", String(image.flipVertical));

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const upload = await response.json();

      if (!response.ok) {
        throw new Error(upload.details || upload.error || "Upload failed");
      }

      if (!upload.queued) {
        throw new Error(upload.message);
      }

      setExportStatus("Processing with Sharp...");
      const result = await waitForDownloadUrl(upload.imageId);

      const a = document.createElement("a");
      a.href = result.downloadUrl;
      a.download = `pixeled-export.${image.exportFormat === "jpeg" ? "jpg" : image.exportFormat}`;
      a.rel = "noopener noreferrer";
      a.click();
      setExportStatus("Download ready");
    } catch (error) {
      setExportStatus(error instanceof Error ? error.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  }, [image, isExporting, waitForDownloadUrl]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <EditorHeader
        onExport={image.src ? handleExport : undefined}
        isExporting={isExporting}
      />

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
            {exportStatus && (
              <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded bg-black/80 px-4 py-2 text-xs text-white shadow-lg">
                {exportStatus}
              </div>
            )}
          </div>

          {/* Properties Panel */}
          <PropertiesPanel image={image} updateImage={updateImage} />
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
