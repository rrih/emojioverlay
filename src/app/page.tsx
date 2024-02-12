"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

// const emojiOptions = [
//   "😁",
//   "🥺",
//   "😤",
//   "😭",
//   "😢",
//   "🥲",
//   "😡",
//   "https://emoji-img.s3.ap-northeast-1.amazonaws.com/svg/1f601.svg",
// ];
// 画像とテキストを含むオプションの配列
const emojiOptions = [
  { label: "😁", value: "😁" },
  { label: "🥺", value: "🥺" },
  { label: "😤", value: "😤" },
  { label: "😭", value: "😭" },
  { label: "😢", value: "😢" },
  { label: "🥲", value: "🥲" },
  { label: "😡", value: "😡" },
  {
    label: "😁（いにしえの姿）",
    value: "https://emoji-img.s3.ap-northeast-1.amazonaws.com/svg/1f601.svg",
  },
];

const Home: React.FC = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [emoji, setEmoji] = useState<string>("😁");
  const [emojiPosition, setEmojiPosition] = useState({ x: 50, y: 50 });
  const [emojiSize, setEmojiSize] = useState<number>(50);
  const [maxEmojiSize, setMaxEmojiSize] = useState<number>(100);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(emojiOptions[0]);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // カスタムドロップダウンの項目をクリックしたときのハンドラ
  const handleSelectEmoji = (value: string) => {
    setSelectedEmoji(value);
    // ここで他の処理（例えば、キャンバスに絵文字/画像を描画）も行う
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

    // 選択されたオプションがSVG画像のURLかどうかを判断
    if (emoji.startsWith("http")) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(
          img,
          emojiPosition.x,
          emojiPosition.y,
          emojiSize,
          emojiSize
        );
      };
      img.src = emoji;
    } else {
      ctx.font = `${emojiSize}px Arial`;
      ctx.fillText(emoji, emojiPosition.x, emojiPosition.y);
    }

    // ダウンロード用URLを更新
    setDownloadUrl(canvas.toDataURL());
  };

  useEffect(() => {
    draw();
  }, [emoji, emojiSize, emojiPosition]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <>
      <h1 className="text-4xl font-bold text-center p-4">emojioverlay</h1>
      <div ref={dropdownRef} className="relative">
        <button onClick={() => setIsOpen(!isOpen)} className="button">
          {selectedEmoji.value.startsWith("http") ? (
            <img
              src={selectedEmoji.value}
              alt="Selected emoji"
              style={{ width: 30, height: 30 }}
            />
          ) : (
            <span>{selectedEmoji.label}</span>
          )}
          <span>▼</span>
        </button>
        {isOpen && (
          <div className="dropdown-menu absolute z-10">
            {emojiOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedEmoji(option);
                  setIsOpen(false);
                }}
                className="dropdown-item flex items-center cursor-pointer"
              >
                {option.value.startsWith("http") ? (
                  <img
                    src={option.value}
                    alt={option.label}
                    style={{ width: 30, height: 30, marginRight: 8 }}
                  />
                ) : (
                  <span style={{ marginRight: 8 }}>{option.label}</span>
                )}
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
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
      {downloadUrl && (
        <a
          href={downloadUrl}
          download="emoji_image.png"
          className="text-blue-600"
        >
          画像をダウンロードする
        </a>
      )}
      {/* </div> */}
      <footer className="text-center">
        <Link href={`https://github.com/rrih`}>@rrih</Link>
      </footer>
    </>
  );
};

export default Home;
