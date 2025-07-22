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
  const { image, setFirstView, images, setImages, setImage , projectName,setProjectName } =
    useContext(FileContext);

  const panoRef = useRef(null);
  const viewerRef = useRef(null);
  const currentViewRef = useRef(null);
  const sceneRef = useRef(null);
  const hotspotsRef = useRef([]);

  const [refresh, setRefresh] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);

  const [autoRotateEnabled, setAutoRotateEnabled] = useState(false);
  const autoRotateRef = useRef(null);

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
      rotate:0,
      title:""
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

  const renderAllHotspots = () => {
    clearHotspots();
    if (image?.infoHotspots?.length > 0) {
      addInfoHotspotsFromArray(image.infoHotspots);
    }
    if (image?.linkHotspots?.length > 0) {
      addLinkHotspotsFromArray(image.linkHotspots);
    }
  };

  const clearInfoHotspots = () => {
  hotspotsRef.current = hotspotsRef.current.filter((hotspot) => {
    const isInfo = hotspot._domElement?.classList.contains(styles.infoHotspot);
    if (isInfo && hotspot._domElement?.parentNode) {
      hotspot._domElement.parentNode.removeChild(hotspot._domElement);
    }
    return !isInfo; // حذفش کن از آرایه
  });
  };

  const clearLinkHotspots = () => {
    hotspotsRef.current = hotspotsRef.current.filter((hotspot) => {
      const isLink = hotspot._domElement?.classList.contains(styles.linkHotspot);
      if (isLink && hotspot._domElement?.parentNode) {
        hotspot._domElement.parentNode.removeChild(hotspot._domElement);
      }
      return !isLink;
    });
  };


  const addInfoHotspotsFromArray = (dataArray) => {
    if (!sceneRef.current) return;
    // renderAllHotspots();
    clearInfoHotspots();
    // clearHotspots();

    dataArray.forEach(({ yaw, pitch, title, text, id }, index) => {
      const hotspotElement = document.createElement("div");
      hotspotElement.className = styles.infoHotspot;

      hotspotElement.innerHTML = `
        <div class="${styles.infoBox}">
          <input placeholder="title" value="${title}" class="${styles.title}" />
          <input placeholder="text" value="${text}" class="${styles.text}" />
          <button class="${styles.info}">⠿</button>
          <button class="${styles.deleteBtn}">🗑</button>
        </div>
      `;

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

      let isDragging = false;

      hotspotElement.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        isDragging = true;
        document.body.style.cursor = "grabbing";

        if (viewerRef.current) {
          viewerRef.current.controls().disable();
        }
      });

      document.addEventListener("mouseup", (e) => {
        if (isDragging) {
          isDragging = false;
          document.body.style.cursor = "default";

          if (viewerRef.current) {
            viewerRef.current.controls().enable();
          }
        }
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging || !sceneRef.current) return;

        e.preventDefault();

        const rect = panoRef.current.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const coords = currentViewRef.current.screenToCoordinates({ x, y });

        hotspot.setPosition({ yaw: coords.yaw, pitch: coords.pitch });

        inputChange("yaw", index, coords.yaw, "infoHotspots");
        inputChange("pitch", index, coords.pitch, "infoHotspots");
      });

      const hotspot = sceneRef.current
        .hotspotContainer()
        .createHotspot(hotspotElement, { yaw, pitch });

      hotspotsRef.current.push(hotspot);
    });
  };

  const addLinkHotspotsFromArray = (dataArray) => {
    
    if (!sceneRef.current) return;

    clearLinkHotspots();

    dataArray.forEach(({ yaw, pitch, target, id }, index) => {
      const hotspotElement = document.createElement("div");
      hotspotElement.className = styles.linkHotspot;

      const optionsHTML = images
        .map(
          (item) => `
          <option value="${item.name}" ${
            item.name === target ? "selected" : ""
          }>
            ${item.title}
          </option>`
        )
        .join("");

      hotspotElement.innerHTML = `
        <div class="${styles.linkBox}">
          <img src="https://marzipano1.storage.c2.liara.space/link.png" />
          <select class="mtselect ${styles.targetSelect}">
            ${optionsHTML}
          </select>
          <button class="${styles.deleteBtn}">🗑</button>
          <button class="${styles.info}">⠿</button>
          <button class="${styles.linkIcon}"></button>
        </div>
      `;

      const selectEl = hotspotElement.querySelector(`.${styles.targetSelect}`);
      const deleteBtn = hotspotElement.querySelector(`.${styles.deleteBtn}`);
      const linkIconBtn = hotspotElement.querySelector(`.${styles.linkIcon}`);
      const imageEl = hotspotElement.querySelector("img");

      // مقدار چرخش از state (image)
      const matchedHotspot = image.linkHotspots.find((item) => item.id === id);
      let rotation = matchedHotspot?.rotate || 0;

      // اعمال چرخش اولیه روی DOM
      imageEl.style.transform = `rotate(${rotation}deg)`;
      imageEl.style.transition = "transform 0.3s ease";

      // تغییر مقصد لینک
      selectEl?.addEventListener("change", (e) => {
        inputChange("target", index, e.target.value, "linkHotspots");
      });

      // حذف هات‌اسپات
      deleteBtn?.addEventListener("click", () => {
        hotspotElement.remove();
        deleteHotspotItem(id, "link");
      });

      // کلیک برای چرخاندن آیکون
      linkIconBtn?.addEventListener("click", () => {
        rotation += 45;
        imageEl.style.transform = `rotate(${rotation}deg)`;
        imageEl.style.transition = "transform 0.3s ease";

        // ذخیره مقدار جدید چرخش در state اصلی
        setRotation(id, rotation);
      });

      // درگ کردن برای تغییر مکان
      let isDragging = false;

      hotspotElement.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        isDragging = true;
        document.body.style.cursor = "grabbing";

        if (viewerRef.current) {
          viewerRef.current.controls().disable();
        }
      });

      document.addEventListener("mouseup", () => {
        if (isDragging) {
          isDragging = false;
          document.body.style.cursor = "default";

          if (viewerRef.current) {
            viewerRef.current.controls().enable();
          }
        }
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging || !sceneRef.current) return;

        e.preventDefault();

        const rect = panoRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const coords = currentViewRef.current.screenToCoordinates({ x, y });

        hotspot.setPosition({ yaw: coords.yaw, pitch: coords.pitch });

        inputChange("yaw", index, coords.yaw, "linkHotspots");
        inputChange("pitch", index, coords.pitch, "linkHotspots");
      });

      const hotspot = sceneRef.current
        .hotspotContainer()
        .createHotspot(hotspotElement, { yaw, pitch });

      hotspotsRef.current.push(hotspot);
    });
  };


  const setRotation = (id, rotation) => {
    const copyItems = [...images];
    const index = copyItems.findIndex(item => item.name === image.name)

    const hotspotIndex = copyItems[index]?.linkHotspots?.findIndex(
      (item) => item.id === id
    );
    if (hotspotIndex === -1) return;

    // ست کردن چرخش جدید
    copyItems[index].linkHotspots[hotspotIndex].rotate = rotation;

    // ✅ این دو خط صحیح هستن
    setImages(copyItems);
    setImage(copyItems[index]); // فقط اگه می‌خوای تصویر فعال هم به‌روز بشه
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

    // const handleDoubleClick = (event) => {
    //   if (!currentViewRef.current) return;

    //   const rect = panoElement.getBoundingClientRect();
    //   const clickX = event.clientX - rect.left;
    //   const clickY = event.clientY - rect.top;

    //   const coords = currentViewRef.current.screenToCoordinates({
    //     x: clickX,
    //     y: clickY,
    //   });

    //   const fov = currentViewRef.current.fov();

    //   if (activeEvent === "infohotspot") {
    //     addInfoHotspot(coords.yaw, coords.pitch, fov);
    //   } else if (activeEvent === "linkhotspot") {
    //     addLinkHotspot(coords.yaw, coords.pitch, fov);
    //   }
    // };

    // panoElement.addEventListener("dblclick", handleDoubleClick);

    // return () => {
    //   panoElement.removeEventListener("dblclick", handleDoubleClick);
    // };
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

  useEffect(() => {
    renderAllHotspots();
  }, [image.infoHotspots, image.linkHotspots]);

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
    const htmlContent = createMarzipanoHTML(images,`${process.env.NEXT_PUBLIC_LIARA_IMAGE_URL}`,projectName);

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

  const updateLinkHotspotSelectOptions = () => {
  // تمام select هایی که کلاس مربوطه رو دارن بگیر
    const selects = document.querySelectorAll(`.${styles.targetSelect}`);

    selects.forEach((select) => {
      const currentValue = select.value;

      // ساختن option ها با استفاده از state فعلی تصاویر
      const newOptionsHTML = images
        .map(
          (item) => `
          <option value="${item.name}" ${
            item.name === currentValue ? "selected" : ""
          }>
            ${item.title}
          </option>
        `
        )
        .join("");

      // جایگزینی کل options در select
      select.innerHTML = newOptionsHTML;
    });
  };



  const changeImageTitle = (e, index) => {
    let copyImages = [...images];
    copyImages[index]["title"] = e.target.value;
    setImages(copyImages);

    if (image.name === copyImages[index].name) {
      setImage(copyImages[index]);
    }

    // آپدیت Select ها
    updateLinkHotspotSelectOptions();
  };


  const toggleAutoRotate = () => {
    if (!viewerRef.current) return;

    if (autoRotateEnabled) {
      viewerRef.current.stopMovement();
      setAutoRotateEnabled(false);
    } else {
      autoRotateRef.current = window.Marzipano.autorotate({
        yawSpeed: 0.1, // سرعت چرخش
        targetPitch: 0,
        targetFov: Math.PI / 2,
      });

      viewerRef.current.startMovement(autoRotateRef.current);
      setAutoRotateEnabled(true);
    }
  };

  return (
    <div className={styles.all}>

      <div className={styles.left}>

        <input 
        value={projectName}
        onChange={(e) => setProjectName(e.target.value) }
        className={styles.prjname} placeholder="Project Name" />

        <UploadFileTool />
        <div className={styles.imageList}>
          {images.map((item, index) => (
            <div
              title={item.title}
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
              <input onChange={(e) => changeImageTitle(e,index)} value={item.title ?? ""} className={styles.titleImage}/>
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
              // setActiveEvent("infohotspot");

              // اضافه کردن هات‌اسپات با موقعیت پیش‌فرض (مثلاً مرکز نمای فعلی)
              if (currentViewRef.current) {
                const yaw = currentViewRef.current.yaw();
                const pitch = currentViewRef.current.pitch();
                const fov = currentViewRef.current.fov();
                addInfoHotspot(yaw, pitch, fov);
              }
            }}
          >
            <IoIosInformationCircle /> &nbsp; Info Hotspot
          </button>

          <button
            className={activeEvent === "linkhotspot" ? styles.activEv : ""}
            onClick={() => {
              // setActiveEvent("linkhotspot");

              if (currentViewRef.current) {
                const yaw = currentViewRef.current.yaw();
                const pitch = currentViewRef.current.pitch();
                const fov = currentViewRef.current.fov();
                addLinkHotspot(yaw, pitch, fov);
              }
            }}
          >
            <MdOutlineLink /> &nbsp; Link Hotspot
          </button>


          <button onClick={handleFirstView}>
            <FaRegEye />&nbsp;
            Set Initial
            </button>
          <button className={styles.export} onClick={handleExport}>
            <PiExportFill /> &nbsp;
            Export
          </button>

          <button onClick={toggleAutoRotate} className={autoRotateEnabled ? styles.activEv : ""}>
            🔁 Autorotate {autoRotateEnabled ? "On" : "Off"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditImage;
