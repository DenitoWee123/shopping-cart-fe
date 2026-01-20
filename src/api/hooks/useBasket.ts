import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { basketService, type AddItemRequest } from '../services/basket.service';
import type { BasketSelectionResponse, ShoppingBasketDto } from '../../types/api.types';

export const basketKeys = {
  all: ['baskets'] as const,
  lists: () => [...basketKeys.all, 'list'] as const,
  list: (filters: string) => [...basketKeys.lists(), { filters }] as const,
  details: () => [...basketKeys.all, 'detail'] as const,
  detail: (id: string) => [...basketKeys.details(), id] as const,
  current: () => [...basketKeys.all, 'current'] as const,
};

export const useUserCarts = () => {
  return useQuery({
    queryKey: basketKeys.lists(),
    queryFn: () => basketService.getUserCarts(),
  });
};

export const useCurrentBasket = () => {
  return useQuery({
    queryKey: basketKeys.current(),
    queryFn: () => basketService.getCurrentBasket(),
  });
};

export const useCreateBasket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => basketService.createBasket(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: basketKeys.lists() });
    },
  });
};

export const useSelectBasket = (basketId: string) => {
  return useQuery({
    queryKey: basketKeys.detail(basketId),
    queryFn: () => basketService.selectBasket(basketId),
    enabled: !!basketId,
  });
};

export const useSelectBasketMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (basketId: string) => basketService.selectBasket(basketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: basketKeys.current() });
    },
  });
};

const updateBasketCache = (
    queryClient: ReturnType<typeof useQueryClient>,
    cartId: string,
    enrichedBasket: ShoppingBasketDto
) => {
  queryClient.setQueryData<BasketSelectionResponse>(
      basketKeys.detail(cartId),
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          currentBasket: enrichedBasket,
        };
      }
  );
};

export const useAddItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
                   productId,
                   cartId,
                   quantity,
                 }: {
      productId: string;
      cartId: string;
      quantity: number;
    }) => basketService.addItem(productId, cartId, quantity),
    onSuccess: (data, variables) => {
      updateBasketCache(queryClient, variables.cartId, data);
      queryClient.invalidateQueries({ queryKey: basketKeys.lists() });
    },
  });
};

export const useAddItemsBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
                   cartId,
                   items,
                 }: {
      cartId: string;
      items: AddItemRequest[];
    }) => basketService.addItemsBatch(cartId, items),
    onSuccess: (data, variables) => {
      updateBasketCache(queryClient, variables.cartId, data);
      queryClient.invalidateQueries({ queryKey: basketKeys.lists() });
    },
  });
};

export const useUpdateQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
                   basketItemId,
                   quantity,
                 }: {
      basketItemId: string;
      quantity: number;
      cartId: string;
    }) => basketService.updateQuantity(basketItemId, quantity),
    onSuccess: (data, variables) => {
      if (data && variables.cartId) {
        updateBasketCache(queryClient, variables.cartId, data);
      }
    },
  });
};

export const useRemoveItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
                   productId,
                 }: {
      productId: string;
      cartId: string;
    }) => basketService.removeItem(productId),
    onSuccess: (data, variables) => {
      if (data && variables.cartId) {
        updateBasketCache(queryClient, variables.cartId, data);
      }
    },
  });
};

export const useJoinCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => basketService.joinCart(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: basketKeys.lists() });
    },
  });
};

export const useToggleItemPurchased = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
                   productId,
                   cartId,
                   purchased,
                 }: {
      productId: string;
      cartId: string;
      purchased: boolean;
    }) => basketService.toggleItemPurchased(productId, cartId, purchased),
    onSuccess: (data, variables) => {
      updateBasketCache(queryClient, variables.cartId, data);
    },
  });
};
