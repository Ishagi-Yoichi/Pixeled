import React, { useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

function VideoConverter() {
  const [inputFile, setInputFile] = useState(null);
  const [outputUrl, setOutputUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setInputFile(e.target.files?.[0] || null);
    setOutputUrl('');
  };

  const convertVideo = async () => {
    setLoading(true);
    if (!ffmpeg.loaded) {
      await ffmpeg.load({
        coreURL: await toBlobURL("/ffmpeg-core.mjs", "application/javascript"),
        workerURL: await toBlobURL("/ffmpeg-core.worker.mjs", "application/javascript"),
        wasmURL: await toBlobURL("/ffmpeg-core.wasm", "application/wasm"),
      });
      
      
      
    }
    await ffmpeg.writeFile('input.mp4', await fetchFile(inputFile));
    await ffmpeg.exec(['-i', 'input.mp4', 'output.webm']);
    const data = await ffmpeg.readFile('output.webm');
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/webm' }));
    setOutputUrl(url);
    setLoading(false);
  };

  return (
    <div>
      <h1>Video Converter (MP4 to WebM)</h1>
      <input type="file" accept="video/mp4,video/*" onChange={handleFileChange} />
      <button onClick={convertVideo} disabled={!inputFile || loading}>
        Convert
      </button>
      {loading && <p>Processing...</p>}
      {outputUrl && (
        <video src={outputUrl} controls width="400" />
      )}
    </div>
  );
}

export default VideoConverter;


