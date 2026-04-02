# Dùng base image Python siêu nhẹ
FROM python:3.10-slim

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Cài đặt các thư viện lõi của hệ điều hành
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

# Copy toàn bộ code và model vào container
COPY . /app/

# 🛑 BÍ KÍP Ở ĐÂY: Ép tải PyTorch bản CPU (chỉ khoảng 150MB thay vì 3GB) 🛑
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Sau đó mới cài YOLO và FastAPI (nó sẽ nhận diện là đã có Torch CPU rồi và không tải bản GPU nữa)
RUN pip install --no-cache-dir fastapi uvicorn python-multipart ultralytics pillow

# Mở cổng 8000 cho FastAPI
EXPOSE 8000

# Lệnh khởi động Server khi Container chạy
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]