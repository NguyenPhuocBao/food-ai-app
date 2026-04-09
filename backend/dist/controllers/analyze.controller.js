"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImage = void 0;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const form_data_1 = __importDefault(require("form-data"));
const prisma = new client_1.PrismaClient();
const AI_API_URL = process.env.AI_API_URL || 'http://localhost:8000';
const analyzeImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        const imagePath = req.file.path;
        const imageUrl = `/uploads/${path_1.default.basename(imagePath)}`;
        // Gọi AI API (YOLOv8)
        const formData = new form_data_1.default();
        formData.append('file', fs_1.default.createReadStream(imagePath));
        const aiResponse = await axios_1.default.post(`${AI_API_URL}/predict`, formData, {
            headers: { ...formData.getHeaders() },
            timeout: 30000,
        });
        const prediction = aiResponse.data;
        const foodName = prediction.top_prediction?.class_name || 'Không xác định';
        const confidence = prediction.top_prediction?.confidence || 0;
        // Tìm food item trong database
        const foodItem = await prisma.foodItem.findFirst({
            where: { name: { contains: foodName, mode: 'insensitive' } },
        });
        // Lưu scan history
        const scanHistory = await prisma.scanHistory.create({
            data: {
                userId: req.user.id,
                imageUrl,
                result: prediction,
                confidence,
                isConfirmed: confidence > 0.7,
            },
        });
        res.json({
            success: true,
            data: {
                scanId: scanHistory.id,
                foodName,
                confidence,
                foodItem: foodItem ? { id: foodItem.id, name: foodItem.name, calories: foodItem.calories } : null,
            },
        });
    }
    catch (error) {
        console.error('Analyze error:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.analyzeImage = analyzeImage;
