# Sử dụng Node.js LTS (phiên bản 20) làm base image
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và package-lock.json để cài đặt dependencies trước
COPY package*.json ./

# Cài đặt các dependencies cần thiết cho production
RUN npm install --production

# Sao chép toàn bộ mã nguồn backend vào container
COPY . .

# Khởi tạo thư mục uploads nếu chưa tồn tại
RUN mkdir -p uploads

# Expose port mà ứng dụng Node.js chạy (5000)
EXPOSE 5000

# Lệnh khởi chạy ứng dụng
CMD ["npm", "start"]
