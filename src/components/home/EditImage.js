"use client";

import { FileContext } from "@/context/FileContext";
import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "./editimage.module.css";
import Image from "next/image";
import UploadFileTool from "./UploadFileTool";
import { createMarzipanoHTML, generateMarzipanoHTML } from "@/utils/functions";
import { MdFileUpload, MdOutlineLink } from "react-icons/md";
import { IoIosInformationCircle } from "react-icons/io";
import { FaRegEye } from "react-icons/fa";
import { PiExportFill } from "react-icons/pi";

const EditImage = () => {
  const { image, setFirstView, images, setImages, setImage } =
    useContext(FileContext);

  const panoRef = useRef(null);
  const viewerRef = useRef(null);
  const currentViewRef = useRef(null);
  const sceneRef = useRef(null);
  const hotspotsRef = useRef([]);

  const [refresh, setRefresh] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);

  const handleViewMarzipano = () => {
    if (!window.Marzipano || !viewerRef.current || !image) return;

    const prevView = currentViewRef.current;
    const prevYaw = prevView?.yaw?.() || 0;
    const prevPitch = prevView?.pitch?.() || 0;
    // const prevFov = prevView?.fov?.() || Math.PI / 2;

    // const prevView = currentViewRef.current;
    // const prevYaw = 0;
    // const prevPitch = 0;
    const prevFov = 1.5707963267948966;
    

    const source = window.Marzipano.ImageUrlSource.fromString(image.url);
    const geometry = new window.Marzipano.EquirectGeometry([{ width: 4000 }]);
    const view = new window.Marzipano.RectilinearView({
      yaw: prevYaw,
      pitch: prevPitch,
      fov: prevFov,
    });

    currentViewRef.current = view;
    sceneRef.current = viewerRef.current.createScene({
      source,
      geometry,
      view,
      pinFirstLevel: true,
    });
    sceneRef.current.switchTo();
  };

  const handleFirstView = () => {
    const view = currentViewRef.current;
    if (!view) return;

    const itemIndex = images.findIndex((item) => item.name === image.name);
    if (itemIndex === -1) return;

    const updatedImages = [...images];

    updatedImages[itemIndex]["initialView"] = {
      yaw: view.yaw(),
      pitch: view.pitch(),
      fov: view.fov(),
    };
    setImages(updatedImages);
    setImage({
      ...image,
      initialView: { yaw: view.yaw(), pitch: view.pitch(), fov: view.fov() },
    });

    alert("First View Is Set!");
  };

  const addInfoHotspot = (yaw, pitch, fov) => {
    updateHotspots("infoHotspots", {
      yaw,
      pitch,
      fov,
      title: "",
      text: "",
      id: Date.now(),
    });
  };

  const addLinkHotspot = (yaw, pitch, fov) => {
    updateHotspots("linkHotspots", {
      yaw,
      pitch,
      fov,
      target: image.name,
      id: Date.now(),
    });
  };

  const updateHotspots = (key, newHotspot) => {
    const itemIndex = images.findIndex((item) => item.name === image.name);
    if (itemIndex === -1) return;

    const updatedImages = [...images];
    const item = { ...updatedImages[itemIndex] };

    item[key] = [...(item[key] || []), newHotspot];
    updatedImages[itemIndex] = item;

    setImages(updatedImages);
    setImage(item);
    setRefresh((prev) => !prev);
  };

  const deleteHotspotItem = (id, type = "info") => {
    const itemIndex = images.findIndex((item) => item.name === image.name);
    if (itemIndex === -1) return;

    const updatedImages = [...images];
    const key = type === "info" ? "infoHotspots" : "linkHotspots";

    const filteredHotspots =
      updatedImages[itemIndex][key]?.filter((item) => item.id !== id) || [];

    updatedImages[itemIndex][key] = filteredHotspots;
    setImages(updatedImages);
    setImage({ ...image, [key]: filteredHotspots });
  };

  const clearHotspots = () => {
    hotspotsRef.current.forEach((hotspot) => {
      if (hotspot._domElement?.parentNode) {
        hotspot._domElement.parentNode.removeChild(hotspot._domElement);
      }
    });
    hotspotsRef.current = [];
  };

  const addInfoHotspotsFromArray = (dataArray) => {
    if (!sceneRef.current) return;
    clearHotspots();

    dataArray.forEach(({ yaw, pitch, title, text, id }, index) => {
      const hotspotElement = document.createElement("div");
      hotspotElement.className = styles.infoHotspot;

      hotspotElement.innerHTML = `
        <div class="${styles.infoBox}">
          <input placeholder="title" value="${title}" class="${styles.title}" />
          <input placeholder="text" value="${text}" class="${styles.text}" />
          <button class="${styles.deleteBtn}">🗑</button>
          
        </div>
      `;
      // <button class="${styles.info}">⠿</button>

      hotspotElement
        .querySelector(`.${styles.title}`)
        ?.addEventListener("input", (e) => {
          inputChange("title", index, e.target.value, "infoHotspots");
        });

      hotspotElement
        .querySelector(`.${styles.text}`)
        ?.addEventListener("input", (e) => {
          inputChange("text", index, e.target.value, "infoHotspots");
        });

      hotspotElement
        .querySelector(`.${styles.deleteBtn}`)
        ?.addEventListener("click", () => {
          hotspotElement.remove();
          deleteHotspotItem(id, "info");
        });

      const hotspot = sceneRef.current
        .hotspotContainer()
        .createHotspot(hotspotElement, { yaw, pitch });
      hotspotsRef.current.push(hotspot);
    });
  };

  const addLinkHotspotsFromArray = (dataArray) => {
    if (!sceneRef.current) return;

    dataArray.forEach(({ yaw, pitch, target, id }, index) => {
      const hotspotElement = document.createElement("div");
      hotspotElement.className = styles.linkHotspot;

      const optionsHTML = images
        .map(
          (item) => `
          <option value="${item.name}" ${
            item.name === target ? "selected" : ""
          }>
            ${item.name}
          </option>`
        )
        .join("");

      hotspotElement.innerHTML = `
        <div class="${styles.linkBox}">
          <img src="${process.env.NEXT_PUBLIC_LIARA_IMAGE_URL}/${target}" />
          <select class="mtselect ${styles.targetSelect}">
            ${optionsHTML}
          </select>
          <button class="${styles.deleteBtn}">🗑</button>
          <button class="${styles.linkIcon}">🔗</button>
        </div>
      `;

      hotspotElement
        .querySelector(`.${styles.targetSelect}`)
        ?.addEventListener("change", (e) => {
          inputChange("target", index, e.target.value, "linkHotspots");
        });

      hotspotElement
        .querySelector(`.${styles.deleteBtn}`)
        ?.addEventListener("click", () => {
          hotspotElement.remove();
          deleteHotspotItem(id, "link");
        });

      const hotspot = sceneRef.current
        .hotspotContainer()
        .createHotspot(hotspotElement, { yaw, pitch });
      hotspotsRef.current.push(hotspot);
    });
  };

  const inputChange = (name, index, value, key) => {
    const itemIndex = images.findIndex((item) => item.name === image.name);
    if (itemIndex === -1) return;

    const updatedImages = [...images];
    updatedImages[itemIndex][key][index][name] = value;
    setImages(updatedImages);
  };

  // ← ← ← این useEffect برای ساخت Viewer و غیرفعال کردن scroll zoom
  useEffect(() => {
    if (!image || !panoRef.current) return;

    if (!viewerRef.current) {
      viewerRef.current = new window.Marzipano.Viewer(panoRef.current, {
        controls: {
          scrollZoom: false,
        },
        mouseViewMode: "drag",
      });
    }

    if (!sceneRef.current) {
      handleViewMarzipano();
    }

    const panoElement = panoRef.current;

    const handleDoubleClick = (event) => {
      if (!currentViewRef.current) return;

      const rect = panoElement.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      const coords = currentViewRef.current.screenToCoordinates({
        x: clickX,
        y: clickY,
      });

      const fov = currentViewRef.current.fov();

      if (activeEvent === "infohotspot") {
        addInfoHotspot(coords.yaw, coords.pitch, fov);
      } else if (activeEvent === "linkhotspot") {
        addLinkHotspot(coords.yaw, coords.pitch, fov);
      }
    };

    panoElement.addEventListener("dblclick", handleDoubleClick);

    return () => {
      panoElement.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [image, activeEvent]);

  useEffect(() => {
    if (image?.infoHotspots?.length > 0) {
      addInfoHotspotsFromArray(image.infoHotspots);
    }
    if (image?.linkHotspots?.length > 0) {
      addLinkHotspotsFromArray(image.linkHotspots);
    }
    if (!image?.infoHotspots?.length && !image?.linkHotspots?.length) {
      clearHotspots();
    }
  }, [image]);

  useEffect(() => {
    if (image?.linkHotspots?.length > 0) {
      addLinkHotspotsFromArray(image.linkHotspots);
    }
  }, [images]);

  // const handleExport = () => {
  //   navigator.clipboard.writeText(JSON.stringify(images));
  //   // const htmlContent = generateMarzipanoHTML(images, "http://localhost:3000");
  //   const htmlContent = createMarzipanoHTML(images)

  //   const blob = new Blob([htmlContent], { type: "text/html" });
  //   const a = document.createElement("a");
  //   a.href = URL.createObjectURL(blob);
  //   a.download = "panorama.html";
  //   a.click();
  // };

  // const handleExport = async () => {
  //   const htmlContent = createMarzipanoHTML(images,`${process.env.NEXT_PUBLIC_LIARA_IMAGE_URL}`);

  //   // ارسال به API
  //   const res = await fetch('/api/save-html', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify({ html: htmlContent })
  //   });

  //   if (res.ok) {
  //     // باز کردن در تب جدید
  //     window.open('/generated/viewer.html', '_blank');
  //   } else {
  //     alert('خطا در ذخیره فایل HTML');
  //   }
  // };

  const handleExport = async () => {
    const htmlContent = createMarzipanoHTML(images,`${process.env.NEXT_PUBLIC_LIARA_IMAGE_URL}`);

    const file = new File([htmlContent], "viewer.html", {
      type: "text/html",
    });

    // ارسال به API
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/savehtml1", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    window.open(data.url, '_blank');
    console.log("آپلود شد:", data.url);
    // return data.url;

    // if (res.ok) {
    //   // باز کردن در تب جدید
    //   window.open('/generated/viewer.html', '_blank');
    // } else {
    //   alert('خطا در ذخیره فایل HTML');
    // }
  };
  return (
    <div className={styles.all}>

      <div className={styles.left}>
        <UploadFileTool />
        <div className={styles.imageList}>
          {images.map((item, index) => (
            <div
              title={item.name}
              key={index}
              className={`${styles.item} ${
                image.name === item.name ? styles.active : ""
              }`}
              onClick={() => {
                sceneRef.current = null;
                hotspotsRef.current = [];
                setImage(item);
              }}
            >
              <Image src={item.url} alt={item.name} width={70} height={70} />
              <span className={styles.name}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.contPano}>
          <div id="pano" ref={panoRef} className={styles.pano}></div>
          <div id="hotcont" className={styles.hotspotCont}></div>
        </div>

        <div className={styles.btns}>
          <button
            className={activeEvent === "infohotspot" ? styles.activEv : ""}
            onClick={() => {
              alert("Double click to view")
              setActiveEvent("infohotspot")
            }}
          >
            <IoIosInformationCircle /> &nbsp;
            Info Hotspot
          </button>

          <button
            className={activeEvent === "linkhotspot" ? styles.activEv : ""}
            onClick={() => {
              alert("Double click to view")
              setActiveEvent("linkhotspot")
            }}
          >
            <MdOutlineLink /> &nbsp;
            Link Hotspot
          </button>

          <button onClick={handleFirstView}>
            <FaRegEye />&nbsp;
            Set Initial
            </button>
          <button className={styles.export} onClick={handleExport}>
            <PiExportFill /> &nbsp;
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditImage;
