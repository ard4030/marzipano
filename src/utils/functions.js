// https://frontme.storage.c2.liara.space/marzipano.js


function generateMarzipanoHTML(data, baseurl) {

  const fixedData = data.map(scene => {
    const { initialView, ...rest } = scene;
    return {
      ...rest,
      initialViewParameters: initialView || {
        yaw: 0,
        pitch: 0,
        fov: 1.5707963267948966
      }
    };
  });

  const jsonData = JSON.stringify(fixedData, null, 2);

  return `
<!DOCTYPE html>
<html lang="fa">
<head>
  <meta charset="UTF-8" />
  <title>Marzipano Viewer</title>
  <style>
    html, body {
      margin: 0;
      height: 100%;
      font-family: 'Segoe UI', sans-serif;
      background: #111;
      color: #fff;
      direction: rtl;
    }
    #container { display: flex; height: 100%; }
    #sidebar {
      width: 10%;
      background-color: #1e1e1e;
      padding: 15px;
      overflow-y: auto;
      box-shadow: 2px 0 5px rgba(0,0,0,0.5);
    }
    #sidebar h2 {
      font-size: 18px;
      margin-bottom: 15px;
      border-bottom: 1px solid #444;
      padding-bottom: 5px;
      color: #ccc;
    }
    .thumb {
      margin-bottom: 10px;
      cursor: pointer;
      border-radius: 6px;
      overflow: hidden;
      transition: transform 0.3s ease;
      border: 2px solid transparent;
    }
    .thumb:hover {
      transform: scale(1.03);
      border-color: #4caf50;
    }
    .thumb.active {
      border-color: #4caf50;
    }
    .thumb img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 4px;
    }
    #pano { flex: 1; background: #000;width:90%;position:relative }
    .hotspot {
      background: rgba(0, 0, 0, 0.75);
      color: #fff;
      padding: 8px 10px;
      border-radius: 8px;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      max-width: 220px;
      line-height: 1.5;
    }
    .hotspot strong {
      display: block;
      margin-bottom: 5px;
      color: #4caf50;
    }
    .link-thumb {
      margin-top: 6px;
      max-width: 100%;
      border-radius: 4px;
      border: 1px solid #555;
    }
    .hotspot:hover {
      background: rgba(20, 20, 20, 0.85);
    }
  </style>
</head>
<body>
  <div id="container">
    <div id="sidebar">
      <h2>تصاویر پانوراما</h2>
      <div id="sceneList"></div>
    </div>
    <div id="pano"></div>
  </div>

  <script src="https://marzipano1.storage.c2.liara.space/marzipano.js"></script>
  <script>
    const data = ${jsonData};

    const viewer = new Marzipano.Viewer(document.getElementById("pano"));
    const scenes = {};
    const sceneListEl = document.getElementById("sceneList");

    data.forEach(sceneData => {
      sceneData.infoHotspots = Array.isArray(sceneData.infoHotspots) ? sceneData.infoHotspots : [];
      sceneData.linkHotspots = Array.isArray(sceneData.linkHotspots) ? sceneData.linkHotspots : [];

      const source = Marzipano.ImageUrlSource.fromString(sceneData.url);
      const geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);

      const limiter = Marzipano.util.compose(
        Marzipano.RectilinearView.limit.traditional(1024, 120 * Math.PI / 180),
        Marzipano.RectilinearView.limit.pitch(-Math.PI / 2, Math.PI / 2)
      );

      const initial = sceneData.initialViewParameters || {};
      const view = new Marzipano.RectilinearView({
        yaw: typeof initial.yaw === "number" ? initial.yaw : 0,
        pitch: typeof initial.pitch === "number" ? initial.pitch : 0,
        fov: typeof initial.fov === "number" ? initial.fov : 1.5707963267948966
      }, limiter);

      const scene = viewer.createScene({ source, geometry, view });

      // اسکرول فقط روی پانوراما
      document.addEventListener("wheel", function(event) {
        const pano = document.getElementById("pano");
        const rect = pano.getBoundingClientRect();
        if (
          event.clientX >= rect.left && event.clientX <= rect.right &&
          event.clientY >= rect.top && event.clientY <= rect.bottom
        ) {
          event.preventDefault();
          const currentFov = view.fov();
          const zoomSpeed = 0.05;
          const delta = event.deltaY;
          let newFov = currentFov + (delta > 0 ? zoomSpeed : -zoomSpeed);
          newFov = Math.max(0.3, Math.min(3.0, newFov));
          view.setFov(newFov);
        }
      }, { passive: false });

      // Info Hotspots
      sceneData.infoHotspots.forEach(hotspot => {
        const el = document.createElement("div");
        el.className = "hotspot";
        el.innerHTML = \`<strong>\${hotspot.title}</strong>\${hotspot.text}\`;
        scene.hotspotContainer().createHotspot(el, { yaw: hotspot.yaw, pitch: hotspot.pitch });
      });

      // Link Hotspots
      sceneData.linkHotspots.forEach(hotspot => {
        const targetScene = data.find(s => s.name === hotspot.target);
        const el = document.createElement("div");
        el.className = "hotspot";
        el.innerHTML = "➡️ رفتن به صحنه دیگر";

        if (targetScene) {
          const img = document.createElement("img");
          img.src = targetScene.url;
          img.className = "link-thumb";
          el.appendChild(img);
        }

        el.style.cursor = "pointer";
        el.onclick = () => switchScene(hotspot.target);
        scene.hotspotContainer().createHotspot(el, { yaw: hotspot.yaw, pitch: hotspot.pitch });
      });

      // ذخیره صحنه
      scenes[sceneData.name] = scene;

      // منو
      const thumbEl = document.createElement("div");
      thumbEl.className = "thumb";
      thumbEl.innerHTML = \`<img src="\${sceneData.url}" alt="\${sceneData.name}">\`;
      thumbEl.onclick = () => switchScene(sceneData.name);
      thumbEl.dataset.sceneId = sceneData.name;
      sceneListEl.appendChild(thumbEl);
    });

    function switchScene(name) {
      if (!scenes[name]) {
        console.warn("Scene not found:", name);
        return;
      }

      [...sceneListEl.children].forEach(el => {
        el.classList.toggle("active", el.dataset.sceneId === name);
      });

      scenes[name].switchTo();
    }

    // نمایش اولین صحنه
    if (data.length > 0) {
      switchScene(data[0].name);
    }
  </script>
</body>
</html>
  `.trim();
}

function createMarzipanoHTML(data, BASE_URL, projectName) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Marzipano Viewer</title>
  <style>
    html, body {
      margin: 0;
      height: 100%;
      overflow: hidden;
    }
    body {
      position: relative;
      font-family: sans-serif;
    }
    #pano {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      background: #000;
    }
    #sidebar {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 90px;
      max-height: 90%;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 0 8px rgba(0,0,0,0.2);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 10;
    }
    #sidebar img {
      width: 100%;
      height: auto;
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 6px;
      transition: border 0.3s;
    }
    #sidebar img:hover {
      border-color: #007bff;
    }

    .info-hotspot {
      position: relative;
      cursor: pointer;
      display: inline-block;
    }
    .info-icon {
      width: 32px;
      height: 32px;
      background: #007bff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      transition: background 0.3s;
    }
    .info-icon:hover {
      background: #0056b3;
    }
    .info-popup {
      position: absolute;
      top: -10px;
      left: 40px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 10px;
      font-size: 14px;
      color: #333;
      display: none;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      z-index: 999;
      line-height: 22px;
      width: max-content;
    }
    .info-hotspot:hover .info-popup {
      display: block;
    }

    .link-hotspot {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
    }
    .link-hotspot img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .prgname {
      z-index: 999;
      background: #ffffff45;
      text-align: center;
      padding: 13px;
      font-size: 18px;
      position: absolute;
      right: 0px;
      border-radius: 0px 0px 0px 12px;
    }

    .scene-title {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.7);
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 20px;
      font-weight: bold;
      z-index: 20;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="prgname">${projectName}</div>
  <div id="sidebar"></div>
  <div id="pano"></div>
  <div id="sceneTitle" class="scene-title"></div>

  <script src="https://marzipano1.storage.c2.liara.space/marzipano.js"></script>
  <script>
    const data = ${JSON.stringify(data)};
    const BASE_URL = "${BASE_URL}";
    const viewer = new Marzipano.Viewer(document.getElementById('pano'));
    const scenes = {};

    function updateSceneTitle(title) {
      document.getElementById('sceneTitle').textContent = title || '';
    }

    // ایجاد همه‌ی صحنه‌ها
    data.forEach(sceneData => {
      const url = BASE_URL + sceneData.name;
      const source = Marzipano.ImageUrlSource.fromString(url);
      const geometry = new Marzipano.EquirectGeometry([{ width: 4000 }]);
      const view = new Marzipano.RectilinearView(sceneData.initialView || { yaw: 0, pitch: 0, fov: Math.PI/2 });

      const scene = viewer.createScene({
        source,
        geometry,
        view,
        pinFirstLevel: true
      });

      scenes[sceneData.name] = { scene, data: sceneData };
    });

    // نمایش اولین صحنه
    const firstScene = scenes[data[0].name];
    firstScene.scene.switchTo();
    updateSceneTitle(firstScene.data.title);

    // ایجاد لیست تصاویر در سایدبار
    const sidebar = document.getElementById('sidebar');
    data.forEach(sceneData => {
      const thumb = document.createElement('img');
      thumb.src = BASE_URL + sceneData.name;
      thumb.alt = sceneData.name;
      thumb.addEventListener('click', () => {
        scenes[sceneData.name].scene.switchTo();
        updateSceneTitle(sceneData.title);
      });
      sidebar.appendChild(thumb);
    });

    // ایجاد هات‌اسپات‌ها
    data.forEach(sceneData => {
      const scene = scenes[sceneData.name].scene;

      // infoHotspots
      (sceneData.infoHotspots || []).forEach(hotspot => {
        const dom = document.createElement('div');
        dom.className = 'info-hotspot';

        const icon = document.createElement('div');
        icon.className = 'info-icon';
        icon.textContent = 'i';

        const popup = document.createElement('div');
        popup.className = 'info-popup';
        popup.innerHTML = '<strong>' + hotspot.title + '</strong><br>' + hotspot.text;

        dom.appendChild(icon);
        dom.appendChild(popup);

        scene.hotspotContainer().createHotspot(dom, { yaw: hotspot.yaw, pitch: hotspot.pitch });
      });

      // linkHotspots
      (sceneData.linkHotspots || []).forEach(link => {
        const targetScene = Object.values(scenes).find(s => s.data.name === link.target);
        if (!targetScene) return;

        const dom = document.createElement('div');
        dom.className = 'link-hotspot';

        const thumb = document.createElement('img');
        thumb.src = "https://marzipano1.storage.c2.liara.space/link.png";
        thumb.alt = 'link thumbnail';
        thumb.style.rotate = link.rotate + "deg";
        dom.appendChild(thumb);

        dom.addEventListener('click', () => {
          targetScene.scene.switchTo();
          updateSceneTitle(targetScene.data.title);
        });

        scene.hotspotContainer().createHotspot(dom, { yaw: link.yaw, pitch: link.pitch });
      });
    });
  </script>
</body>
</html>`;
  return html;
}



module.exports = {
  generateMarzipanoHTML,createMarzipanoHTML
};
