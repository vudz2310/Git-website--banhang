# Hướng dẫn sử dụng Docker cho Backend EliteMart

Tài liệu này hướng dẫn cách chạy, quản lý và kiểm tra dự án backend bằng Docker và Docker Compose.

---

## 📋 Điều kiện tiên quyết
Bạn cần cài đặt sẵn:
- **Docker Desktop** (Đã bao gồm Docker Compose). Tải về tại: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

---

## 🚀 Các lệnh cơ bản để khởi chạy

### 1. Khởi chạy toàn bộ hệ thống (Backend + MongoDB)
Di chuyển terminal vào thư mục `backend/` và chạy lệnh sau:
```bash
docker compose up -d --build
```
*Ý nghĩa các tham số:*
- `-d` (detached mode): Chạy ngầm ứng dụng dưới nền, giải phóng terminal của bạn.
- `--build`: Tự động build lại Docker image từ mã nguồn mới nhất (rất cần thiết khi bạn vừa sửa code backend).

### 2. Kiểm tra trạng thái các container đang chạy
```bash
docker compose ps
```

### 3. Xem nhật ký hoạt động (Logs)
- Xem log của tất cả container:
  ```bash
  docker compose logs -f
  ```
- Chỉ xem log của container backend:
  ```bash
  docker compose logs -f backend
  ```

---

## 🛑 Dừng và quản trị hệ thống

### 1. Dừng container (giữ nguyên dữ liệu database)
```bash
docker compose down
```

### 2. Dừng container và xóa sạch dữ liệu database (Reset Database)
```bash
docker compose down -v
```
*Lưu ý: Lệnh này sẽ xóa toàn bộ dữ liệu trong MongoDB.*

---

## 🌐 Các cổng kết nối mặc định
Khi Docker đang chạy, bạn có thể truy cập các đường dẫn sau:
- **API Backend**: `http://localhost:5000`
- **Tài liệu API Swagger**: `http://localhost:5000/swagger`
- **Địa chỉ kết nối MongoDB**: `mongodb://localhost:27017` (bạn có thể dùng các tool như MongoDB Compass để kết nối và quản lý data).

---

## 📂 Cơ chế lưu trữ dữ liệu (Persistence)
Cấu hình Docker Compose đã được tối ưu hóa để không làm mất dữ liệu của bạn:
1. **Dữ liệu Database**: Được lưu trữ tại volume ảo `elitemart_db_data`.
2. **Hình ảnh/File upload**: Thư mục `/uploads` trong container được đồng bộ (mount) trực tiếp với thư mục `backend/uploads` trên máy của bạn. Khi bạn upload file qua API, các file sẽ xuất hiện ngay ở thư mục gốc ngoài đời thực của bạn.
