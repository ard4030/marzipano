"use client";
import { FileContext } from '@/context/FileContext';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { UploadCloud, CheckCircle, XCircle } from 'lucide-react';
import { S3 } from '@aws-sdk/client-s3';


const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const { setImage, setImages, image } = useContext(FileContext);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setStatus(null);
  };

  useEffect(() => {
    if (file) {
      // upload();
      uploadWithS3()
    }
  }, [file]);

  const upload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        },
      });

      if (res.status === 200) {
        const finalImage = {
          active: false,
          // url: `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${res.data.data}`,
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${res.data.data}`,
          name: res.data.data,
          infoHotspots: [],
          infoLinks: [],
          initialView: null,
        };
        if (!image) {
          setImage(finalImage);
        }
        setImages((prev) => [...prev, finalImage]);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const uploadWithS3 = async () => {
    setLoading(true)
    try {
      const fileUrl = await uploadLiara(file)
      console.log(`${process.env.NEXT_PUBLIC_LIARA_IMAGE_URL}${fileUrl.data}`)
      if(fileUrl.success){
        const finalImage = {
          active: false,
          // url: `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${res.data.data}`,
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${res.data.data}`,
          name: res.data.data,
          infoHotspots: [],
          infoLinks: [],
          initialView: null,
        };
        if (!image) {
          setImage(finalImage);
        }
        setImages((prev) => [...prev, finalImage]);
        setStatus('success');
      }else{

      }
      console.log(fileUrl)
    
    } catch (error) {
      console.log(error.message)
    }
    setLoading(false)
  }

  const uploadLiara = async () => {
    try {
      const formData = new FormData();
      formData.append("file",file);
      const res = await fetch("/api/s3upload",{
        method:"POST",

        body:formData
      })
      const data = await res.json()
      const finalImage = {
        active: false,
        // url: `${process.env.NEXT_PUBLIC_BASE_URL}/uploads/${res.data.data}`,
        url: `${process.env.NEXT_PUBLIC_LIARA_IMAGE_URL}${data.fileName}`,
        name: data.fileName,
        infoHotspots: [],
        infoLinks: [],
        initialView: null,
      };
      if (!image) {
        setImage(finalImage);
      }
      setImages((prev) => [...prev, finalImage]);
      setStatus('success');
      console.log(data)
    } catch (error) {
      setStatus('error');
      console.log(error.message)
    }
  }



  return (
    <div className="w-full max-w-md mx-auto mt-6 p-6 border border-gray-200 rounded-2xl shadow-lg bg-white space-y-4">
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-400 transition">
        <UploadCloud className="w-10 h-10 text-blue-500 mb-2" />
        <span className="text-gray-500 text-sm">برای آپلود، فایل را انتخاب کنید</span>
        <input onChange={handleChange} type="file" className="hidden" />
      </label>

      {file && (
        <div className="text-sm text-gray-700 text-center">{file.name}</div>
      )}

      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {progress === 100 && status === 'success' && (
        <div className="flex items-center text-green-600 text-sm gap-2 justify-center">
          <CheckCircle className="w-5 h-5" />
          آپلود با موفقیت انجام شد!
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center text-red-500 text-sm gap-2 justify-center">
          <XCircle className="w-5 h-5" />
          خطا در آپلود فایل. دوباره تلاش کنید.
        </div>
      )}
    </div>
  );
};

export default UploadFile;
