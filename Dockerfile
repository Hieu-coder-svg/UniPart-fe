# Step 1: Build ứng dụng React/Vite
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Dùng Nginx để phục vụ các file tĩnh sau khi build
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Sao chép file cấu hình custom của Nginx (nếu cần xử lý React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]