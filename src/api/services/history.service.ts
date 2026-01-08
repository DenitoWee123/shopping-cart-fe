import apiClient from '../client';
import type { HistoryEntity } from '../../types/api.types';

const HISTORY_BASE_PATH = '/api/history';

export const historyService = {
  checkout: async (): Promise<string> => {
    const response = await apiClient.post<string>(`${HISTORY_BASE_PATH}/checkout`);
    return response.data;
  },

  getFullHistory: async (): Promise<HistoryEntity[]> => {
    const response = await apiClient.get<HistoryEntity[]>(
      `${HISTORY_BASE_PATH}/all`
    );
    return response.data;
  },

  getRecentOrders: async (limit: number = 3): Promise<HistoryEntity[]> => {
    const response = await apiClient.get<HistoryEntity[]>(
      `${HISTORY_BASE_PATH}/recent`,
      {
        params: { limit },
      }
    );
    return response.data;
  },
};

export default historyService;

