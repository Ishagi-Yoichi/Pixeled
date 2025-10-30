import React, { useState } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

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
    await ffmpeg.load();
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(inputFile));
    await ffmpeg.run('-i', 'input.mp4', 'output.webm');
    const data = ffmpeg.FS('readFile', 'output.webm');
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
