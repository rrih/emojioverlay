"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const emojiOptions = ["😁", "🥺", "😤", "😭", "😢", "🥲", "😡"];

const Home: React.FC = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [emoji, setEmoji] = useState<string>("😁");
  const [emojiPosition, setEmojiPosition] = useState({ x: 50, y: 50 });
  const [emojiSize, setEmojiSize] = useState<number>(50);
  const [maxEmojiSize, setMaxEmojiSize] = useState<number>(100);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setMaxEmojiSize(img.height);
        draw();
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      updateEmojiPosition(e.clientX, e.clientY, e.currentTarget);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const touch = e.touches[0];
      updateEmojiPosition(touch.clientX, touch.clientY, e.currentTarget);
    }
  };

  const updateEmojiPosition = (
    clientX: number,
    clientY: number,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setEmojiPosition({ x, y });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 画像が存在する場合のみ描画
    if (image) {
      // 画像のアスペクト比を維持しながら、キャンバスにフィットするようにリサイズ
      const aspectRatio = image.width / image.height;
      const canvasWidth = Math.min(window.innerWidth, 600); // window.innerWidthまたは600pxの小さい方
      const canvasHeight = canvasWidth / aspectRatio;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    ctx.font = `${emojiSize}px Arial`;
    ctx.fillText(emoji, emojiPosition.x, emojiPosition.y);

    // ダウンロード用URLを更新
    setDownloadUrl(canvas.toDataURL());
  };

  useEffect(() => {
    draw();
  }, [emoji, emojiSize, emojiPosition]);

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-4 flex items-center">
        <button
          onClick={handleButtonClick}
          className="mr-3 py-2 px-4 bg-blue-500 text-white rounded"
        >
          Upload Image
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
      <select
        value={emoji}
        onChange={(e) => {
          setEmoji(e.target.value);
          draw();
        }}
        className="mb-4"
      >
        {emojiOptions.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className="max-w-full"
      ></canvas>
      <br />
      <label>
        size:
        <input
          type="range"
          min="10"
          max={maxEmojiSize}
          value={emojiSize}
          onChange={(e) => {
            setEmojiSize(Number(e.target.value));
          }}
        />
      </label>
      <br />
      {downloadUrl && (
        <a
          href={downloadUrl}
          download="emoji_image.png"
          className="text-blue-600"
        >
          画像をダウンロードする
        </a>
      )}
    </div>
  );
};

export default Home;
