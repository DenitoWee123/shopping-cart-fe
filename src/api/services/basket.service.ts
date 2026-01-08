import apiClient from '../client';
import type {
  ShoppingBasketDto,
  ShoppingBasketEntity,
  BasketItemEntity,
  BasketSelectionResponse,
} from '../../types/api.types';

const BASKET_BASE_PATH = '/api/basket';

export interface AddItemRequest {
  productId: string;
  quantity: number;
}

export const basketService = {
  createBasket: async (name: string): Promise<void> => {
    await apiClient.post(`${BASKET_BASE_PATH}/create`, null, {
      params: { name },
    });
  },

  addItem: async (
    productId: string,
    cartId: string,
    quantity: number
  ): Promise<ShoppingBasketDto> => {
    const items: AddItemRequest[] = [{ productId, quantity }];
    const response = await apiClient.post<ShoppingBasketDto>(
      `${BASKET_BASE_PATH}/add`,
      items,
      {
        params: { cartId },
      }
    );
    return response.data;
  },

  addItemsBatch: async (
    cartId: string,
    items: AddItemRequest[]
  ): Promise<ShoppingBasketDto> => {
    const response = await apiClient.post<ShoppingBasketDto>(
      `${BASKET_BASE_PATH}/add`,
      items,
      {
        params: { cartId },
      }
    );
    return response.data;
  },

  getCurrentBasket: async (): Promise<BasketItemEntity[]> => {
    const response = await apiClient.get<BasketItemEntity[]>(
      `${BASKET_BASE_PATH}/current`
    );
    return response.data;
  },

  getUserCarts: async (): Promise<ShoppingBasketEntity[]> => {
    const response = await apiClient.get<ShoppingBasketEntity[]>(
      `${BASKET_BASE_PATH}/get/user/carts`
    );
    return response.data;
  },

  selectBasket: async (basketId: string): Promise<BasketSelectionResponse> => {
    const response = await apiClient.post<BasketSelectionResponse>(
      `${BASKET_BASE_PATH}/select/cart`,
      null,
      {
        params: { basketId },
      }
    );
    return response.data;
  },

  updateQuantity: async (
    basketItemId: string,
    quantity: number
  ): Promise<ShoppingBasketDto> => {
    const response = await apiClient.patch<ShoppingBasketDto>(
      `${BASKET_BASE_PATH}/quantity`,
      null,
      {
        params: { basketItemId, quantity },
      }
    );
    return response.data;
  },

  removeItem: async (productId: string): Promise<ShoppingBasketDto> => {
    const response = await apiClient.delete<ShoppingBasketDto>(
      `${BASKET_BASE_PATH}/item/${productId}`
    );
    return response.data;
  },

  joinCart: async (code: string): Promise<string> => {
    const response = await apiClient.post<string>(
      `${BASKET_BASE_PATH}/join`,
      null,
      {
        params: { code },
      }
    );
    return response.data;
  },
};

export default basketService;
