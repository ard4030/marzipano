"use client"
import { FileContext } from '@/context/FileContext'
import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import styles from "./uploadfiletool.module.css"
import { MdFileUpload } from 'react-icons/md'

const UploadFileTool = () => {
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
    <div className={styles.upd}>
        {
            progress && progress > 0 ?
        <span>{progress}</span>:
        <span>
            <MdFileUpload /> &nbsp;
            Upload File
        </span>
        }

        <input onChange={handleChange} type='file' />
    </div>
  )
}

export default UploadFileTool