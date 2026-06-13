import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { compressImage } from './utils/imageCompressor'

// Intercept fetch to compress images before upload
const originalFetch = window.fetch;
window.fetch = async function (input, init) {
  if (typeof input === 'string' && input.includes('/api/upload') && init && init.body instanceof FormData) {
    const formData = init.body;
    const file = formData.get('file');
    if (file && file.type && file.type.startsWith('image/')) {
      try {
        const compressedFile = await compressImage(file);
        const newFormData = new FormData();
        for (const [key, value] of formData.entries()) {
          if (key === 'file') {
            newFormData.append('file', compressedFile);
          } else {
            newFormData.append(key, value);
          }
        }
        init.body = newFormData;
      } catch (err) {
        console.error('Image compression failed, uploading original file:', err);
      }
    }
  }
  return originalFetch.apply(this, arguments);
};

// Suppress Recharts resize observer warnings caused by rendering inside hidden tabs
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('The width(-1) and height(-1) of chart')) {
    return;
  }
  originalError(...args);
};

console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('The width(-1) and height(-1) of chart')) {
    return;
  }
  originalWarn(...args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
