# Tahap 1: Build aplikasi menggunakan Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json dan install dependensi
COPY package*.json ./
RUN npm ci

# Copy seluruh source code dan lakukan build
COPY . .

# Tangkap ENV dari menu Dokploy agar terbaca saat proses build Vite
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Tahap 2: Menjalankan aplikasi menggunakan Nginx
FROM nginx:alpine

# Salin konfigurasi custom Nginx untuk SPA (Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Salin hasil build dari tahap 1 ke folder publik Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80