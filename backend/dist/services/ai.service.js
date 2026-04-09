"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeFoodImage = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
// Đọc URL của AI từ file .env, nếu không có thì lấy mặc định là localhost:8000
const AI_API_URL = process.env.AI_API_URL || 'http://localhost:8000';
const analyzeFoodImage = async (filePath) => {
    try {
        // 1. Gói bức ảnh vào một cái bưu kiện (FormData)
        const form = new form_data_1.default();
        form.append('file', fs_1.default.createReadStream(filePath));
        // 2. Phóng xe máy mang bưu kiện sang cổng 8000 đưa cho AI
        const response = await axios_1.default.post(`${AI_API_URL}/predict`, form, {
            headers: {
                ...form.getHeaders(),
            },
        });
        // 3. Cầm kết quả AI trả về đem về (VD: { class_name: "Bánh mì", confidence: 0.95 })
        return response.data;
    }
    catch (error) {
        console.error('❌ Lỗi khi gọi AI API:', error.message);
        throw new Error('Không thể kết nối với trạm AI nhận diện. Vui lòng thử lại sau!');
    }
};
exports.analyzeFoodImage = analyzeFoodImage;
