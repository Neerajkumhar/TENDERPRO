import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { compressImage } from './utils/imageCompressor'

// Intercept fetch to add authorization token and compress images before upload
const originalFetch = window.fetch;
window.fetch = async function (input, init) {
  const options = init || {};
  
  // Attach Authorization header if token exists
  const token = localStorage.getItem('token');
  if (token) {
    if (!options.headers) {
      options.headers = {};
    }
    
    if (options.headers instanceof Headers) {
      if (!options.headers.has('Authorization')) {
        options.headers.set('Authorization', `Bearer ${token}`);
      }
    } else if (Array.isArray(options.headers)) {
      const hasAuth = options.headers.some(([key]) => key.toLowerCase() === 'authorization');
      if (!hasAuth) {
        options.headers.push(['Authorization', `Bearer ${token}`]);
      }
    } else {
      if (!options.headers['Authorization'] && !options.headers['authorization']) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  if (typeof input === 'string' && input.includes('/api/upload') && options.body instanceof FormData) {
    const formData = options.body;
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
        options.body = newFormData;
      } catch (err) {
        console.error('Image compression failed, uploading original file:', err);
      }
    }
  }
  const response = await originalFetch.call(this, input, options);

  if (response.status === 401) {
    const urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    if (!urlStr.includes('/api/auth/login') && !urlStr.includes('/api/auth/register')) {
      const existingToken = localStorage.getItem('token');
      if (existingToken) {
        console.warn('Session expired or unauthorized (401). Clearing invalid session token...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
  }

  return response;
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
