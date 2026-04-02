from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import os

# 1. Khởi tạo ứng dụng FastAPI
app = FastAPI(title="Vietnam Food Classifier API", version="1.0")

# Thêm CORS middleware để frontend có thể gọi
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Đánh thức "bộ não" 
MODEL_PATH = "./checkpoints/best_30vnfood_cls.pt"

try:
    model = YOLO(MODEL_PATH)
    print("🚀 Đã load AI YOLOv8 thành công! Sẵn sàng nhận diện món ăn.")
except Exception as e:
    print(f"❌ Lỗi load model: {e}")
    model = None

# 3. Endpoint root (kiểm tra API đang chạy)
@app.get("/")
async def root():
    return {
        "message": "Vietnam Food Classifier API is running!",
        "version": "1.0",
        "status": "active",
        "model_loaded": model is not None,
        "endpoints": {
            "/": "GET - Thông tin API",
            "/health": "GET - Kiểm tra sức khỏe",
            "/predict/": "POST - Nhận diện món ăn từ ảnh"
        }
    }

# 4. Endpoint health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "vietnam-food-classifier",
        "model_loaded": model is not None,
        "version": "1.0"
    }

# 5. Endpoint predict - nhận diện món ăn
@app.post("/predict/")
async def predict_food(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Kiểm tra xem file gửi lên có phải là ảnh không
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File gửi lên không phải là hình ảnh!")

    try:
        # Đọc dữ liệu ảnh người dùng gửi lên
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))

        # Nhờ AI dự đoán
        results = model(image)

        # Trích xuất kết quả tốt nhất (Top 1)
        top_class_idx = results[0].probs.top1
        confidence = results[0].probs.top1conf.item()
        
        # Lấy tên món ăn (YOLO tự động lưu tên trong model.names)
        food_name = results[0].names[top_class_idx]

        # Lọc món lạ hoặc ảnh không rõ ràng
        if confidence < 0.7:
            return {
                "success": False,
                "data": {
                    "food_name": "Không xác định",
                    "confidence": round(confidence * 100, 2),
                },
                "message": "AI không nhận diện được món ăn này"
            }

        # Trả kết quả
        return {
            "success": True,
            "data": {
                "food_name": food_name,
                "confidence": round(confidence * 100, 2),
            },
            "message": f"Đây là món {food_name} với độ tự tin {round(confidence * 100, 2)}%"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi trong quá trình xử lý ảnh: {str(e)}")