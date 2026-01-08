import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyService } from '../services';
import { basketKeys } from './useBasket';

export const historyKeys = {
  all: ['history'] as const,
  lists: () => [...historyKeys.all, 'list'] as const,
  recent: (limit: number) => [...historyKeys.all, 'recent', limit] as const,
};

export const useFullHistory = () => {
  return useQuery({
    queryKey: historyKeys.lists(),
    queryFn: () => historyService.getFullHistory(),
  });
};

export const useRecentOrders = (limit: number = 3) => {
  return useQuery({
    queryKey: historyKeys.recent(limit),
    queryFn: () => historyService.getRecentOrders(limit),
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => historyService.checkout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: historyKeys.all });
      queryClient.invalidateQueries({ queryKey: basketKeys.current() });
      queryClient.invalidateQueries({ queryKey: basketKeys.lists() });
    },
  });
};

