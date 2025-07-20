"use client";
import React, { useState, useContext, useEffect } from "react";
import { FileContext } from "@/context/FileContext";
import { UploadCloud, CheckCircle, XCircle } from "lucide-react";
import styles from "./upload.module.css";

const UploadFileMultiDrag = () => {
  const { setImage, setImages, image } = useContext(FileContext);
  const [files, setFiles] = useState([]);
  const [statusList, setStatusList] = useState([]); // success | error | loading

  const handleChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleFiles = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map((file) => ({
      file,
      progress: 0,
      status: "loading", // success | error
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    files.forEach((f, index) => {
      if (f.status === "loading") uploadFile(f.file, index);
    });
  }, [files]);

  const uploadFile = async (file, index) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/s3upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error("Upload failed");

      const finalImage = {
        active: false,
        url: `${process.env.NEXT_PUBLIC_LIARA_IMAGE_URL}${data.fileName}`,
        name: data.fileName,
        title:data.fileName,
        infoHotspots: [],
        infoLinks: [],
        initialView: null,
      };

      if (!image) setImage(finalImage);
      setImages((prev) => [...prev, finalImage]);

      updateFileStatus(index, "success");
    } catch (err) {
      updateFileStatus(index, "error");
      console.error(err.message);
    }
  };

  const updateFileStatus = (index, status) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status } : f))
    );
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="w-full max-w-xl mx-auto mt-6 p-6 border-2 border-dashed border-gray-300 rounded-2xl shadow-md bg-white"
    >
      <label className="flex flex-col items-center justify-center cursor-pointer">
        <UploadCloud className="w-10 h-10 text-blue-500 mb-2" />
        <span className="text-gray-500 text-sm">
          برای آپلود، فایل‌ها را انتخاب یا درگ کنید
        </span>
        <input onChange={handleChange} type="file" multiple className="hidden" />
      </label>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((f, idx) => (
            <div
              key={idx}
              className="p-2 rounded bg-gray-100 flex justify-between items-center text-sm"
            >
              <span className="truncate max-w-[200px]">{f.file.name}</span>
              {f.status === "loading" && <span className="text-blue-500">در حال آپلود...</span>}
              {f.status === "success" && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  موفق
                </span>
              )}
              {f.status === "error" && (
                <span className="flex items-center gap-1 text-red-500">
                  <XCircle className="w-4 h-4" />
                  خطا
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadFileMultiDrag;
