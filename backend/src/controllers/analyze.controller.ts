import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const prisma = new PrismaClient();
const AI_API_URL = process.env.AI_API_URL || 'http://localhost:8000';

export const analyzeImage = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const imageUrl = `/uploads/${path.basename(imagePath)}`;

    // Gọi AI API (YOLOv8)
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));
    
    const aiResponse = await axios.post(`${AI_API_URL}/predict`, formData, {
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
  } catch (error: any) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: error.message });
  }
};