"use client";

import React, { useEffect, useRef, useState } from "react";

const Home: React.FC = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [emoji, setEmoji] = useState<string>("😁");
  const [emojiPosition, setEmojiPosition] = useState({ x: 50, y: 50 });
  const [emojiSize, setEmojiSize] = useState<number>(50);
  const [maxEmojiSize, setMaxEmojiSize] = useState<number>(100);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const emojiOptions = ["😁", "🥺", "😤", "😭", "😢", "🥲", "😡"];

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

  const canvasStyle = {
    maxWidth: "100%",
  };

  useEffect(() => {
    draw();
  }, [emoji, emojiSize, emojiPosition]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <div
        style={{ marginBottom: "16px", display: "flex", alignItems: "center" }}
      >
        <button
          onClick={handleButtonClick}
          style={{
            marginRight: "12px",
            padding: "8px 16px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Upload Image
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
      </div>
      <select
        value={emoji}
        onChange={(e) => {
          setEmoji(e.target.value);
          draw();
        }}
        style={{ marginBottom: "16px" }}
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
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setEmojiPosition({ x, y });
        }}
        style={canvasStyle}
      ></canvas>
      <br />
      <label>
        Emoji size:
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
        <a href={downloadUrl} download="emoji_image.png">
          Download Image
        </a>
      )}
    </div>
  );
};

export default Home;
