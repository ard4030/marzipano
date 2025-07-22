"use client";
import React,{ useState, useRef, useContext, useEffect } from "react";
import { FileContext } from "@/context/FileContext";
import axios from "axios";
import { MdFileUpload } from "react-icons/md";
import styles from "./uploadfiletool.module.css";

const UploadFileTool = () => {
  const { setImage, setImages, image } = useContext(FileContext);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);
  const hasActiveImage = React.useRef(false);
  

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    uploadFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;

    uploadFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const uploadFiles = async (files) => {
    setIsUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post("/api/s3upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const data = res.data;

      const isActive = hasActiveImage.current;

      const finalImage = {
        active: isActive,
        url: `${process.env.NEXT_PUBLIC_LIARA_IMAGE_URL}${data.fileName}`,
        name: data.fileName,
        title: data.fileName,
        infoHotspots: [],
        infoLinks: [],
        initialView: null,
      };

      if (!isActive && !image) {
        setImage(finalImage);
        hasActiveImage.current = true; // تنظیم می‌کنیم که تصویر فعال انتخاب شده
      }

      setImages((prev) => [...prev, finalImage]);
      } catch (error) {
        console.error("Upload error:", error.message);
      }
    }

    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className={styles.upd}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {!isUploading && (
        <label className={styles.uploadLabel}>
          <MdFileUpload /> &nbsp; Upload File
          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={handleChange}
            className={styles.input}
          />
        </label>
      )}

      {isUploading && <span className={styles.loadingText}>در حال آپلود...</span>}
    </div>
  );
};

export default UploadFileTool;
