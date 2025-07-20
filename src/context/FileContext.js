"use client"
import { createContext, useState } from "react";

export const FileContext = createContext();
export const FileProvider = ({children}) => {
    const [images,setImages] = useState([]);
    const [image,setImage] = useState(null);
    const [firstView,setFirstView] = useState(null);
    const [infoHotspotsData,setInfoHotspotData] = useState([
        // { yaw: 0, pitch: 0, title: "Title 1", text: "Text 1" },
        // { yaw: Math.PI / 4, pitch: 0.1, title: "Title 2", text: "Text 2" },
        // { yaw: -Math.PI / 6, pitch: -0.2, title: "Title 3", text: "Text 3" }
    ])
    console.log(images)

    return(
        <FileContext value={{
            image,setImage,
            firstView,setFirstView,
            images,setImages,
            infoHotspotsData,setInfoHotspotData
            }}>
            {children}
        </FileContext>
    )
}