import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// Đọc URL của AI từ file .env, nếu không có thì lấy mặc định là localhost:8000
const AI_API_URL = process.env.AI_API_URL || 'http://localhost:8000';

export const analyzeFoodImage = async (filePath: string) => {
    try {
        // 1. Gói bức ảnh vào một cái bưu kiện (FormData)
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        // 2. Phóng xe máy mang bưu kiện sang cổng 8000 đưa cho AI
        const response = await axios.post(`${AI_API_URL}/predict`, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        // 3. Cầm kết quả AI trả về đem về (VD: { class_name: "Bánh mì", confidence: 0.95 })
        return response.data;
        
    } catch (error: any) {
        console.error('❌ Lỗi khi gọi AI API:', error.message);
        throw new Error('Không thể kết nối với trạm AI nhận diện. Vui lòng thử lại sau!');
    }
};