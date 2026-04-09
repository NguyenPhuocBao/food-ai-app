import api from './api';

export interface ScanFoodSuggestion {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  imageUrl?: string;
  category: string;
}

export interface ScanAnalyzeResult {
  scanId: number;
  imageUrl: string;
  foodName: string;
  confidence: number;
  foodItem: ScanFoodSuggestion | null;
  suggestions: ScanFoodSuggestion[];
  prediction: any;
}

export interface ScanHistoryItem {
  id: number;
  imageUrl?: string;
  result: any;
  confidence: number;
  isConfirmed: boolean;
  createdAt: string;
}

export const analyzeFoodImage = async (file: File): Promise<ScanAnalyzeResult> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

export const getScanHistory = async (): Promise<ScanHistoryItem[]> => {
  const response = await api.get('/analyze/history');
  return response.data.data;
};

export const confirmScanFood = async (scanId: number, foodId: number): Promise<ScanFoodSuggestion> => {
  const response = await api.post(`/analyze/${scanId}/confirm`, { foodId });
  return response.data.data.foodItem;
};
