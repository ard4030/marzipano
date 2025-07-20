"use client"
import EditImage from "@/components/home/EditImage";
import UploadFile from "@/components/home/UploadFile";
import { FileContext } from "@/context/FileContext";
import { useContext } from "react";

const HomePage = () => {
  const {image,setImage} = useContext(FileContext)

  return (
    <div className="m-auto text-center">
      {
        image?
        <EditImage />:
        <UploadFile />

      }
    </div>
  )
}

export default HomePage