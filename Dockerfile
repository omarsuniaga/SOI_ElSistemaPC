# ==============================================================================
# Dockerfile - Portal Académico/Financiero (PWA)
# Compilación multi-stage optimizada para producción en VPS.
# ==============================================================================

# Etapa 1: Compilación
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias primero para optimizar el cacheo de capas de Docker
COPY package*.json ./
RUN npm install

# Copiar el código fuente y compilar
COPY . .
RUN npm run build

# Etapa 2: Servido estático en producción
FROM nginx:stable-alpine

# Copiar el compilado de Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx para enrutamiento SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
