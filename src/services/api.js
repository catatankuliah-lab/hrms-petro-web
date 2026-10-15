import axios from 'axios';

const api = axios.create({
  // Sesuai dengan konfigurasi di .env Anda
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
});

// Interceptor untuk menyisipkan token otomatis ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Otomatis logout jika token expired / unauthorized (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hapus seluruh penyimpanan lokal karena sesi sudah habis
      localStorage.clear();
      
      // Tendang ke halaman login jika belum berada di sana
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (path) => {
  if (!path) return '';
  let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  if (!base.startsWith('http')) base = `https://${base}`;
  base = base.replace(/\/api\/?$/, ''); // Hapus /api di akhir base URL
  let safePath = path.replace(/^\/?api\//, '/'); // Hapus /api di awal path jika dari backend terbawa
  if (!safePath.startsWith('/')) safePath = `/${safePath}`;
  return `${base}${safePath}`;
};

// PASTIKAN BARIS INI ADA DI PALING BAWAH
export default api;