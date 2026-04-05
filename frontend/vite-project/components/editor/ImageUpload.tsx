import { useState, useCallback } from "react";
import { Upload, AlertCircle } from "lucide-react";
import React from "react";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];
const MAX_SIZE = 50 * 1024 * 1024;

interface ImageUploadProps {
  onFileLoad: (file: File) => void;
}

const ImageUpload = ({ onFileLoad }: ImageUploadProps) => {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Only image files are supported (JPEG, PNG, WEBP, SVG).";
    }
    if (file.size > MAX_SIZE) {
      return "Please upload an image smaller than 50MB.";
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      onFileLoad(file);
    },
    [validate, onFileLoad],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="w-full max-w-lg">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-all duration-200 backdrop-blur-xl ${
          dragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/40 bg-card/40"
        }`}
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="text-primary" size={24} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Drop your image here or click to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPEG, PNG, WEBP, SVG · Max 50MB
          </p>
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={onInput}
          className="hidden"
        />
      </label>

      {error && (
        <div
          className="mt-3 flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
          style={{
            color: "#FCA5A5",
            backgroundColor: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
