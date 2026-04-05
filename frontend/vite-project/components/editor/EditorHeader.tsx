import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import React from "react";
interface EditorHeaderProps {
  onExport?: () => void;
  title?: string;
}

const EditorHeader = ({
  onExport,
  title = "Image Editor",
}: EditorHeaderProps) => {
  return (
    <header
      className="h-14 flex items-center justify-between px-4 border-b shrink-0"
      style={{
        backgroundColor: "rgba(0,0,0,0.4)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back</span>
        </Link>
        <div className="w-px h-5 bg-border" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>

      {onExport && (
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground bg-gradient-to-b from-gold-soft to-gold transition-transform duration-200 hover:scale-105 hover:brightness-110 glow-gold"
        >
          <Download size={14} />
          Download
        </button>
      )}
    </header>
  );
};

export default EditorHeader;
