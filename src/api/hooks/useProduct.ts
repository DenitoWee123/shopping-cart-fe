import { useQuery } from '@tanstack/react-query';
import { productService } from '../services';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: string) => [...productKeys.lists(), { filters }] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (query: string) => [...productKeys.all, 'search', query] as const,
  offers: (groupId: string) => [...productKeys.all, 'offers', groupId] as const,
};

export const useCategories = () => {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => productService.getCategories(),
  });
};

export const useSearchProducts = (query?: string) => {
  return useQuery({
    queryKey: productKeys.search(query || ''),
    queryFn: () => productService.searchProducts(query),
  });
};

export const useStoreOffers = (groupId: string) => {
  return useQuery({
    queryKey: productKeys.offers(groupId),
    queryFn: () => productService.getStoreOffers(groupId),
    enabled: !!groupId,
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => productService.getProduct(productId),
    enabled: !!productId,
  });
};

