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
  fallback?: boolean;
}

export interface ScanHistoryItem {
  id: number;
  imageUrl?: string;
  result: any;
  confidence: number;
  isConfirmed: boolean;
  createdAt: string;
}

export interface ScanHistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ScanHistoryResponse {
  items: ScanHistoryItem[];
  pagination: ScanHistoryPagination | null;
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

export const getScanHistory = async (params?: {
  page?: number;
  limit?: number;
  confirmed?: boolean;
}): Promise<ScanHistoryResponse> => {
  const response = await api.get('/analyze/history', { params });
  const payload = response.data?.data;

  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: null,
    };
  }

  return {
    items: Array.isArray(payload?.items) ? payload.items : [],
    pagination: payload?.pagination || null,
  };
};

export const confirmScanFood = async (scanId: number, foodId: number): Promise<ScanFoodSuggestion> => {
  const response = await api.post(`/analyze/${scanId}/confirm`, { foodId });
  return response.data.data.foodItem;
};
