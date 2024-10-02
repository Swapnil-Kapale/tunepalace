import React, { useRef, useState } from 'react';

const AudioPlayer = ({ audioSrc }
  : { audioSrc: string }
) => {
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      <div className="controls">
        <button onClick={togglePlayPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <div className="time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
      <style jsx>{`
        .audio-player {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f3f4f6;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .controls {
          display: flex;
          align-items: center;
          margin-top: 5px;
        }
        button {
          margin-right: 10px;
          padding: 5px 25px;
          border: none;
          border-radius: 5px;
          background: #030303;
          color: white;
          cursor: pointer;
          
        }
        button:hover {
          background: #333333;
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;