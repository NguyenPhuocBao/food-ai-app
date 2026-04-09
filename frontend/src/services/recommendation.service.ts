import api from './api';
import type { Recommendation } from '../types';

export const getRecommendations = async (status: 'all' | 'new' | 'accepted' | 'rejected' = 'all') => {
  const response = await api.get(`/recommendations?status=${status}&limit=30`);
  return response.data.data as Recommendation[];
};

export const generateRecommendations = async (limit = 8) => {
  const response = await api.post('/recommendations/generate', { limit });
  return response.data.data as Recommendation[];
};

export const markRecommendationViewed = async (id: number) => {
  const response = await api.put(`/recommendations/${id}/viewed`);
  return response.data.data as Recommendation;
};

export const respondRecommendation = async (id: number, accepted: boolean) => {
  const response = await api.put(`/recommendations/${id}/respond`, { accepted });
  return response.data.data as Recommendation;
};

