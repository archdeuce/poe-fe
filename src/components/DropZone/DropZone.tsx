import "./DropZone.style.scss";

import React, { useCallback, useEffect, useState } from "react";

import { useDropzone } from "react-dropzone";

interface DropZoneProps {
  onDrop: (file: File) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onDrop }) => {
  const [isPasting, setIsPasting] = useState(false);

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onDrop(acceptedFiles[0]);
      }
    },
    [onDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropAccepted,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif", ".bmp", ".webp"],
    },
    noClick: false,
    noKeyboard: true,
  });

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        const items = Array.from(e.clipboardData.items);

        for (const item of items) {
          if (item.type.indexOf("image") !== -1) {
            const file = item.getAsFile();

            if (file) {
              onDrop(file);
              setIsPasting(true);
              setTimeout(() => setIsPasting(false), 100);
              break;
            }
          }
        }
      }
    },
    [onDrop],
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);

  return (
    <div
      {...getRootProps()}
      className={`drop-zone ${isDragActive ? "dragging" : ""} ${
        isPasting ? "pasting" : ""
      }`}
    >
      <input {...getInputProps()} />

      {isDragActive ? (
        <p>Отпустите изображение здесь</p>
      ) : (
        <p>
          Перетащите изображение сюда, нажмите для выбора файла или вставьте
          комбинацией <code>Ctrl+V</code>
        </p>
      )}
    </div>
  );
};

export default DropZone;
