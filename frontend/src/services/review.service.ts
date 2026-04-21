import api from './api';
import type { FoodReview } from '../types';

export type AddReviewPayload = {
  rating: number;
  comment?: string;
  images?: string[];
};

export const addReview = async (foodId: number, payload: AddReviewPayload) => {
  const response = await api.post(`/reviews/foods/${foodId}`, payload);
  return response.data.data as FoodReview;
};

export const getFoodReviews = async (foodId: number, page = 1, limit = 20) => {
  const response = await api.get(`/reviews/foods/${foodId}?page=${page}&limit=${limit}`);
  return {
    reviews: (response.data.data || []) as FoodReview[],
    stats: response.data.stats as { averageRating: number; totalReviews: number },
    pagination: response.data.pagination as { page: number; limit: number; total: number; totalPages: number },
  };
};

export const addReviewReply = async (reviewId: number, content: string) => {
  const response = await api.post(`/reviews/${reviewId}/replies`, { content });
  return response.data.data as {
    id: number;
    content: string;
    createdAt: string;
    user: {
      id: number;
      name: string;
      role?: 'USER' | 'ADMIN' | 'MODERATOR';
      profile?: { avatar?: string };
    };
  };
};
