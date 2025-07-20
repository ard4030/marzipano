'use client';

import { useEffect, useRef, useState } from 'react';
import { buildHtml } from '../utils/buildHtml';

export default function PanoramaViewer() {
  const panoRef = useRef(null);
  const viewerRef = useRef(null);
  const currentViewRef = useRef(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [savedView, setSavedView] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/marzipano.js';
    script.onload = () => {
      if (window.Marzipano && panoRef.current) {
        viewerRef.current = new window.Marzipano.Viewer(panoRef.current);
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !viewerRef.current) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImageDataUrl(dataUrl);

      const source = window.Marzipano.ImageUrlSource.fromString(dataUrl);
      const geometry = new window.Marzipano.EquirectGeometry([{ width: 4000 }]);

      const view = new window.Marzipano.RectilinearView({
        yaw: 0,
        pitch: 0,
        fov: Math.PI / 2
      });

      currentViewRef.current = view;

      const scene = viewerRef.current.createScene({
        source,
        geometry,
        view,
        pinFirstLevel: true
      });

      scene.switchTo();
    };
    reader.readAsDataURL(file);
  };

  const handleSaveView = () => {
    const view = currentViewRef.current;
    if (!view) {
      alert('لطفاً ابتدا یک عکس پانوراما انتخاب کنید.');
      return;
    }

    const viewState = {
      yaw: view.yaw(),
      pitch: view.pitch(),
      fov: view.fov()
    };

    localStorage.setItem('sviw', JSON.stringify(viewState));
    setSavedView(viewState);

    alert(`نمای فعلی ذخیره شد:\nYaw: ${viewState.yaw.toFixed(3)}\nPitch: ${viewState.pitch.toFixed(3)}\nFOV: ${viewState.fov.toFixed(3)}`);
  };

  const handleExportHtml = () => {
    if (!imageDataUrl) {
      alert('لطفاً ابتدا یک عکس پانوراما انتخاب کنید.');
      return;
    }
    if (!savedView) {
      alert('لطفاً ابتدا نمای اولیه را ذخیره کنید.');
      return;
    }

    const html = buildHtml(savedView, imageDataUrl);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'panorama.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full h-full">
      <div style={{
        position: 'absolute', top: 10, right: 10, zIndex: 1000, display: 'flex', gap: 10
      }}>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <button onClick={handleSaveView} style={buttonStyle}>ذخیره نمای فعلی</button>
        <button onClick={handleExportHtml} style={{ ...buttonStyle, background: '#10b981' }}>ساخت فایل HTML</button>
      </div>
      <div id="pano" ref={panoRef} style={{ width: '100%', height: '100vh', background: 'black' }} />
    </div>
  );
}

const buttonStyle = {
  padding: '6px 12px',
  background: '#3b82f6',
  color: '#fff',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};
