import { useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { FileVideo, Loader2, Download } from "lucide-react";

const FormatConvertor = ({ video, ffmpeg }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [convertedUrl, setConvertedUrl] = useState(null);
  const [targetFormat, setTargetFormat] = useState("webm");

  const formats = [
    { value: "webm", label: "WebM" },
    { value: "mp4", label: "MP4" },
    { value: "mov", label: "MOV" },
    { value: "avi", label: "AVI" },
  ];

  const getOutputFileName = () => {
    return `output.${targetFormat}`;
  };

  const getMimeType = () => {
    switch (targetFormat) {
      case "webm":
        return "video/webm";
      case "mp4":
        return "video/mp4";
      case "mov":
        return "video/quicktime";
      case "avi":
        return "video/x-msvideo";
      default:
        return "video/webm";
    }
  };

  const getCodecSettings = () => {
    switch (targetFormat) {
      case "webm":
        return {
          videoCodec: "libvpx",
          audioCodec: "libvorbis",
        };
      case "mp4":
        return {
          videoCodec: "libx264",
          audioCodec: "aac",
        };
      case "mov":
        return {
          videoCodec: "libx264",
          audioCodec: "aac",
        };
      case "avi":
        return {
          videoCodec: "libx264",
          audioCodec: "mp3",
        };
      default:
        return {
          videoCodec: "libvpx",
          audioCodec: "libvorbis",
        };
    }
  };

  const handleConvert = async () => {
    if (!video) return;

    // Check file size limit (50MB max for WASM memory)
    if (video.size > 50 * 1024 * 1024) {
      setStatus("Error: File too large. Please use a file smaller than 50MB.");
      return;
    }

    setLoading(true);
    setStatus("Initializing FFmpeg...");

    try {
      // Load FFmpeg core files from CDN if not already loaded
      if (!ffmpeg.loaded) {
        setStatus("Loading FFmpeg core...");
        const baseURL =
          "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";

        // Convert CDN URLs to blob URLs for cross-origin isolation
        const coreURL = await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        );
        const wasmURL = await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        );

        await ffmpeg.load({ coreURL, wasmURL });
      }

      // Write input file to FFmpeg virtual file system
      setStatus("Writing input file...");
      const inputData = await fetchFile(video);
      await ffmpeg.writeFile("input.mp4", inputData);

      // Get codec settings based on target format
      const { videoCodec, audioCodec } = getCodecSettings();
      const outputFileName = getOutputFileName();

      // Execute FFmpeg conversion command
      setStatus("Converting video...");
      await ffmpeg.exec([
        "-i",
        "input.mp4", // Input file
        "-c:v",
        videoCodec, // Video codec
        "-b:v",
        "1M", // Video bitrate
        "-c:a",
        audioCodec, // Audio codec
        outputFileName, // Output file
      ]);

      // Read converted file from virtual file system
      const data = await ffmpeg.readFile(outputFileName);

      // Create downloadable blob URL
      const url = URL.createObjectURL(
        new Blob([data.buffer], { type: getMimeType() })
      );
      setConvertedUrl(url);

      // Clean up temporary files from virtual file system
      try {
        await ffmpeg.deleteFile("input.mp4");
      } catch (e) {
        console.log("Cleanup error (ignorable):", e.message);
      }
      try {
        await ffmpeg.deleteFile(outputFileName);
      } catch (e) {
        console.log("Cleanup error (ignorable):", e.message);
      }

      setStatus("Conversion complete!");
    } catch (err) {
      console.error("FFmpeg error:", err);
      setStatus("Error: " + (err?.message || String(err)));

      // Clean up on error as well
      try {
        await ffmpeg.deleteFile("input.mp4");
      } catch (e) {
        console.log("Cleanup error (ignorable):", e.message);
      }
      try {
        await ffmpeg.deleteFile(getOutputFileName());
      } catch (e) {
        console.log("Cleanup error (ignorable):", e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (convertedUrl) {
      const a = document.createElement("a");
      a.href = convertedUrl;
      a.download = `converted.${targetFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (!video) return null;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
          <FileVideo className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Format Converter</h3>
          <p className="text-gray-400 text-sm">
            Convert your video to different formats
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Target Format
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {formats.map((format) => (
              <button
                key={format.value}
                onClick={() => setTargetFormat(format.value)}
                disabled={loading}
                className={`
                      px-4 py-3 rounded-lg font-medium transition-all
                      ${
                        targetFormat === format.value
                          ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }
                      ${loading ? "opacity-50 cursor-not-allowed" : ""}
                    `}
              >
                {format.label}
              </button>
            ))}
          </div>
        </div>

        {status && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">{status}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleConvert}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Converting...
              </>
            ) : (
              <>Convert to {targetFormat.toUpperCase()}</>
            )}
          </button>
        </div>

        {convertedUrl && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-400">Conversion Complete!</p>
                <p className="text-sm text-gray-400">
                  Your video is ready to download
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormatConvertor;
