import apiClient from '../client';
import type { ProductGroupEntity, ProductResponseDTO } from '../../types/api.types';

const PRODUCT_BASE_PATH = '/api/products';

export const productService = {
  getCategories: async (): Promise<ProductGroupEntity[]> => {
    const response = await apiClient.get<ProductGroupEntity[]>(
      `${PRODUCT_BASE_PATH}/categories`
    );
    return response.data;
  },

  getStoreOffers: async (groupId: string): Promise<ProductResponseDTO[]> => {
    const response = await apiClient.get<ProductResponseDTO[]>(
      `${PRODUCT_BASE_PATH}/compare/${groupId}`
    );
    return response.data;
  },

  searchProducts: async (query?: string): Promise<ProductResponseDTO[]> => {
    const response = await apiClient.get<ProductResponseDTO[]>(
      `${PRODUCT_BASE_PATH}/search`,
      {
        params: query ? { query } : undefined,
      }
    );
    return response.data;
  },

  getProduct: async (productId: string): Promise<ProductResponseDTO> => {
    const response = await apiClient.get<ProductResponseDTO>(
      `${PRODUCT_BASE_PATH}/${productId}`
    );
    return response.data;
  },
};

export default productService;

