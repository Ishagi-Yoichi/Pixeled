# Pixeled — Image & Video Processing Made Simple

Pixeled is a lightweight, browser-based media processing tool that allows users to convert videos, extract frames, generate thumbnails, and perform various image/video transformations — all powered by FFmpeg WebAssembly running directly inside the browser.
No backend required. No uploads. Completely local.

 ## Features
🔹 Video Conversion

Convert videos (e.g., MP4 → WebM) directly in the browser using FFmpeg WASM.

🔹 Thumbnail Extraction

Generate image thumbnails from videos:

Extract a single frame

Extract thumbnails at regular intervals (e.g., every 3 seconds)

Low-resolution fast extraction for performance

🔹 100% Local Processing

All conversions happen inside your browser.
Your files never leave your computer.

🔹 Downloadable Output

Download generated WebM videos and extracted images with one click.

🔹 Modern UI

Clean, minimal UI built using React + Tailwind CSS.

## Tech Stack

React — UI and component structure

Vite — Lightning-fast development environment

Tailwind CSS — Utility-first styling

FFmpeg WebAssembly (@ffmpeg/ffmpeg) — Media processing

JavaScript / TypeScript (optional)

## Installation

Clone the repository:

git clone https://github.com/yourusername/pixeled.git
cd pixeled


Install dependencies:

npm install


Start the development server:

npm run dev


Make sure the project contains the following folder structure:

public/
   ffmpeg/
      ffmpeg-core.mjs
      ffmpeg-core.wasm
      ffmpeg-core.worker.mjs
src/
   components/
   ...


These FFmpeg files are required for WebAssembly to work correctly.

## How It Works

Pixeled uses WebAssembly to run a full FFmpeg binary inside the browser:

The user uploads a video

FFmpeg loads core WASM files

The video is written into FFmpeg's virtual file system

A conversion or frame-extraction command is executed

The output file is read from memory and displayed as a preview

The user downloads the processed file

All operations happen locally without any server involvement.

### Sample Commands Used
Convert MP4 → WebM
await ffmpeg.exec(["-i", "input.mp4", "output.webm"]);

Extract a Thumbnail
await ffmpeg.exec([
  "-i", "input.mp4",
  "-frames:v", "1",
  "-vf", "scale=320:-1",
  "thumb.jpg"
]);


## Why Pixeled?

No backend costs

No upload delays

Privacy-safe

Fast and efficient

Great for developers, editors, and creators who need quick transformations

## Security & Privacy

Pixeled never uploads or stores your files.
Everything happens in your browser using WebAssembly.
Refresh the tab → everything is wiped automatically.

## Contributing

Contributions are welcome!
To contribute:

Fork the repo

Make your changes

Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you like this project, consider giving it a ★ on GitHub — it motivates future updates!

## Problem Statement

https://roadmap.sh/projects/image-processing-service
https://roadmap.sh/projects/image-processing-servicehttps://roadmap.sh/projects/image-processing-service?fl=0
