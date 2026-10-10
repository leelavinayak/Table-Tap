const KEY = 'tabletap_partners_v1';

export function getLocalPartners() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveLocalPartner({ name, image }) {
  if (!name) return [];
  const clean = { name: name.trim(), image: image || '' };
  const existing = getLocalPartners().filter(
    (p) => p.name.toLowerCase() !== clean.name.toLowerCase()
  );
  const updated = [clean, ...existing].slice(0, 50);
  try {
    localStorage.setItem(KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('tabletap:partners-updated', { detail: updated }));
  } catch {}
  return updated;
}

export function fileToDataUrl(file, maxSize = 1500) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          // downscale large logos for localStorage safety
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          if (scale >= 1) return resolve(reader.result);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } catch (e) {
          resolve(reader.result);
        }
      };
      img.onerror = () => resolve(reader.result);
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
