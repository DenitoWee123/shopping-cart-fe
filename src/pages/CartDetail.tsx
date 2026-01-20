import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Plus, Trash2, X, Package, Edit2, Check, Search,
  Lightbulb, ImageIcon, CheckCircle2, Calendar, History, Loader2,
  ArrowRight, TrendingDown, Square, CheckSquare
} from 'lucide-react';
import {
  useSelectBasket,
  useSearchProducts,
  useAddItemsBatch,
  useUpdateQuantity,
  useRemoveItem,
  useCheckout,
  useRecentOrders,
  useToggleItemPurchased,
  basketKeys,
} from '../api/hooks';
import { useQueryClient } from '@tanstack/react-query';
import type { ProductResponseDTO, BasketItem, PriceComparisonDto } from '../types/api.types';

interface Suggestion {
  originalItem: BasketItem;
  alternative: PriceComparisonDto;
  savings: number;
}

export default function CartDetail() {
  const { t } = useTranslation();
  const { cartId } = useParams<{ cartId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: basketData, isLoading: isSelectingBasket } = useSelectBasket(cartId || '');
  const { data: products = [], isLoading: isLoadingProducts } = useSearchProducts();
  const { data: recentOrders = [] } = useRecentOrders(5);
  const addItemsBatchMutation = useAddItemsBatch();
  const updateQuantityMutation = useUpdateQuantity();
  const removeItemMutation = useRemoveItem();
  const checkoutMutation = useCheckout();
  const toggleItemPurchasedMutation = useToggleItemPurchased();

  const refetchBasket = () => {
    if (cartId) {
      queryClient.invalidateQueries({ queryKey: basketKeys.detail(cartId) });
    }
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [tempItems, setTempItems] = useState<Map<string, number>>(new Map());
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState<string | null>(null);

  const currentBasket = basketData?.currentBasket;
  const currentItems = currentBasket?.items || [];
  const isEmpty = currentItems.length === 0;
  const totalItems = currentItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = currentBasket?.total || 0;
  const totalFromSuggestions = currentBasket?.totalFromSuggestions || totalPrice;

  const suggestions = useMemo<Suggestion[]>(() => {
    return currentItems
        .filter(item => item.lowerPriceItem)
        .map(item => ({
          originalItem: item,
          alternative: item.lowerPriceItem!,
          savings: (item.price - item.lowerPriceItem!.price) * item.quantity
        }))
        .sort((a, b) => b.savings - a.savings);
  }, [currentItems]);

  const totalPotentialSavings = suggestions.reduce((sum, s) => sum + s.savings, 0);

  const sortedProducts = useMemo(() => {
    return [...products]
        .filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.storeName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
  }, [products, searchQuery, sortOrder]);

  const addedProducts = sortedProducts.filter(p =>
      currentItems.some(item => item.productId === p.productId) || tempItems.has(p.productId)
  );
  const availableProducts = sortedProducts.filter(p =>
      !currentItems.some(item => item.productId === p.productId) && !tempItems.has(p.productId)
  );

  const handleAddToTemp = (product: ProductResponseDTO) => {
    const newMap = new Map(tempItems);
    const currentQty = newMap.get(product.productId) || 0;
    newMap.set(product.productId, currentQty + 1);
    setTempItems(newMap);
  };

  const handleUpdateTempQuantity = (productId: string, delta: number) => {
    const newMap = new Map(tempItems);
    const currentQty = newMap.get(productId) || 0;
    const newQty = currentQty + delta;

    if (newQty <= 0) {
      newMap.delete(productId);
    } else {
      newMap.set(productId, newQty);
    }
    setTempItems(newMap);
  };

  const handleRemoveFromTemp = (productId: string) => {
    const newMap = new Map(tempItems);
    newMap.delete(productId);
    setTempItems(newMap);
  };

  const handleDoneAddingProducts = async () => {
    if (!cartId || tempItems.size === 0) return;

    try {
      const items = Array.from(tempItems.entries()).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      await addItemsBatchMutation.mutateAsync({ cartId, items });
      setTempItems(new Map());
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to add items:', err);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!cartId) return;
    try {
      await removeItemMutation.mutateAsync({ productId, cartId });
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleUpdateQuantity = async (item: BasketItem, delta: number) => {
    if (!cartId) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) return;

    try {
      await updateQuantityMutation.mutateAsync({
        basketItemId: item.productId,
        quantity: newQuantity,
        cartId,
      });
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleApplySuggestion = async (suggestion: Suggestion) => {
    if (!cartId) return;

    setIsApplyingSuggestion(suggestion.originalItem.productId);

    try {
      await removeItemMutation.mutateAsync({
        productId: suggestion.originalItem.productId,
        cartId
      });

      await addItemsBatchMutation.mutateAsync({
        cartId,
        items: [{
          productId: suggestion.alternative.productId,
          quantity: suggestion.originalItem.quantity
        }]
      });
    } catch (err) {
      console.error('Failed to apply suggestion:', err);
    } finally {
      setIsApplyingSuggestion(null);
    }
  };

  const handleCheckout = async () => {
    try {
      await checkoutMutation.mutateAsync();
      refetchBasket();
      setIsEditMode(false);
    } catch (err) {
      console.error('Failed to checkout:', err);
    }
  };

  const handleTogglePurchased = async (item: BasketItem) => {
    if (!cartId) return;

    try {
      await toggleItemPurchasedMutation.mutateAsync({
        productId: item.productId,
        cartId,
        purchased: !item.purchased,
      });
    } catch (err) {
      console.error('Failed to toggle item purchase status:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isSelectingBasket) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
    );
  }

  if (!currentBasket) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('carts.cartNotFound')}</p>
            <button
                onClick={() => navigate('/carts')}
                className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              {t('common.back')}
            </button>
          </div>
        </div>
    );
  }

  const hasSuggestions = suggestions.length > 0;
  const showSuggestions = !isEmpty && hasSuggestions;

  const purchasedItems = currentItems.filter(item => item.purchased);
  const unpurchasedItems = currentItems.filter(item => !item.purchased);
  const totalPurchased = purchasedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalRemaining = unpurchasedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
      <div className="min-h-screen bg-gray-50">
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-8 ${showSuggestions ? 'max-w-7xl' : 'max-w-3xl'}`}>
          <div className={`grid gap-8 ${showSuggestions ? 'lg:grid-cols-3' : ''}`}>
            {/* Main Cart Section */}
            <div className={showSuggestions ? 'lg:col-span-2' : ''}>
              <div className="bg-white rounded-xl shadow-sm">
                {/* Cart Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary-100 rounded-xl">
                        <ShoppingCart className="h-8 w-8 text-primary-600" />
                      </div>
                      <div>
                        <h1 className="text-xl font-semibold text-gray-900">{currentBasket.name}</h1>
                        <p className="text-sm text-gray-500">
                          {totalItems} {t('carts.items')}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isEmpty && (
                        <div className="flex gap-2">
                          {isEditMode ? (
                              <>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
                                >
                                  <Plus className="h-5 w-5 mr-2" />
                                  {t('carts.addProduct')}
                                </button>
                                <button
                                    onClick={() => setIsEditMode(false)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <Check className="h-5 w-5 mr-2" />
                                  {t('common.done')}
                                </button>
                              </>
                          ) : (
                              <button
                                  onClick={() => setIsEditMode(true)}
                                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <Edit2 className="h-5 w-5 mr-2" />
                                {t('common.edit')}
                              </button>
                          )}
                        </div>
                    )}
                  </div>
                </div>

                {/* Cart Items */}
                <div className="p-6">
                  {isEmpty ? (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {t('carts.emptyCart')}
                        </h3>
                        <p className="text-gray-500 mb-6">{t('carts.emptyCartDesc')}</p>
                        <button
                            onClick={() => {
                              setIsEditMode(true);
                              setIsModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          {t('carts.addProduct')}
                        </button>
                      </div>
                  ) : (
                      <div className="space-y-6">
                        {/* Unpurchased Items */}
                        {unpurchasedItems.length > 0 && (
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Square className="h-5 w-5 text-gray-400" />
                                {t('carts.toBuy')} ({unpurchasedItems.length})
                              </h3>
                              <div className="space-y-3">
                                {unpurchasedItems.map((item, index) => {
                                  const hasCheaperOption = !!item.lowerPriceItem;
                                  return (
                                      <div
                                          key={`unpurchased-item-${item.productId}-${index}`}
                                          className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                                              hasCheaperOption
                                                  ? 'bg-yellow-50 border border-yellow-200'
                                                  : 'bg-gray-50 hover:bg-gray-100'
                                          }`}
                                      >
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => handleTogglePurchased(item)}
                                            disabled={toggleItemPurchasedMutation.isPending}
                                            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                                            title={t('carts.markAsBought')}
                                        >
                                          <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        </button>

                                        {/* Product Image */}
                                        <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center">
                                          <ImageIcon className="h-6 w-6 text-gray-400" />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-medium text-gray-900">{item.productName}</h4>
                                          <p className="text-sm text-gray-500">
                                            {item.storeName} • {item.price.toFixed(2)} лв
                                          </p>
                                          {hasCheaperOption && (
                                              <p className="text-xs text-yellow-700 mt-1 flex items-center gap-1">
                                                <TrendingDown className="h-3 w-3" />
                                                {t('carts.cheaperAt')} {item.lowerPriceItem!.storeName}: {item.lowerPriceItem!.price.toFixed(2)} лв
                                              </p>
                                          )}
                                        </div>
                                        {/* Quantity Controls */}
                                        {isEditMode ? (
                                            <div className="flex items-center gap-2">
                                              <button
                                                  onClick={() => handleUpdateQuantity(item, -1)}
                                                  disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
                                              >
                                                -
                                              </button>
                                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                                              <button
                                                  onClick={() => handleUpdateQuantity(item, 1)}
                                                  disabled={updateQuantityMutation.isPending}
                                                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                                              >
                                                +
                                              </button>
                                              <button
                                                  onClick={() => handleRemoveItem(item.productId)}
                                                  disabled={removeItemMutation.isPending}
                                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </button>
                                            </div>
                                        ) : (
                                            <>
                                              <span className="text-gray-600">x{item.quantity}</span>
                                              <span className="font-medium text-gray-900 w-20 text-right">
                                          {(item.price * item.quantity).toFixed(2)} лв
                                        </span>
                                            </>
                                        )}
                                      </div>
                                  );
                                })}
                              </div>
                            </div>
                        )}

                        {/* Purchased Items */}
                        {purchasedItems.length > 0 && (
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <CheckSquare className="h-5 w-5 text-green-500" />
                                {t('carts.bought')} ({purchasedItems.length})
                              </h3>
                              <div className="space-y-3">
                                {purchasedItems.map((item, index) => (
                                    <div
                                        key={`purchased-item-${item.productId}-${index}`}
                                        className="flex items-center gap-4 p-4 rounded-lg bg-green-50 border border-green-200 opacity-75"
                                    >
                                      {/* Checkbox */}
                                      <button
                                          onClick={() => handleTogglePurchased(item)}
                                          disabled={toggleItemPurchasedMutation.isPending}
                                          className="flex-shrink-0 p-1 hover:bg-green-100 rounded transition-colors"
                                          title={t('carts.markAsNotBought')}
                                      >
                                        <CheckSquare className="h-5 w-5 text-green-500 hover:text-green-600" />
                                      </button>

                                      {/* Product Image */}
                                      <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gray-200 flex items-center justify-center">
                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                      </div>

                                      {/* Product Info */}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-700 line-through">{item.productName}</h4>
                                        <p className="text-sm text-gray-500">
                                          {item.storeName} • {item.price.toFixed(2)} лв
                                        </p>
                                      </div>

                                      {/* Quantity and Price */}
                                      <span className="text-gray-500">x{item.quantity}</span>
                                      <span className="font-medium text-gray-700 w-20 text-right line-through">
                                    {(item.price * item.quantity).toFixed(2)} лв
                                  </span>
                                    </div>
                                ))}
                              </div>
                            </div>
                        )}
                      </div>
                  )}

                  {/* Total & Actions */}
                  {!isEmpty && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        {/* Show breakdown if there are purchased items */}
                        {purchasedItems.length > 0 && unpurchasedItems.length > 0 && (
                            <div className="space-y-2 mb-4 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">{t('carts.remaining')}:</span>
                                <span className="text-gray-900">{totalRemaining.toFixed(2)} лв</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-green-600">{t('carts.purchased')}:</span>
                                <span className="text-green-600 line-through">{totalPurchased.toFixed(2)} лв</span>
                              </div>
                              <div className="border-t pt-2">
                                <div className="flex justify-between font-medium">
                                  <span className="text-gray-700">{t('carts.originalTotal')}:</span>
                                  <span className="text-gray-900">{totalPrice.toFixed(2)} лв</span>
                                </div>
                              </div>
                            </div>
                        )}

                        {purchasedItems.length === 0 && (
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-lg font-medium text-gray-700">{t('carts.total')}</span>
                              <span className="text-2xl font-bold text-gray-900">{totalPrice.toFixed(2)} лв</span>
                            </div>
                        )}

                        {hasSuggestions && totalPotentialSavings > 0 && (
                            <div className="flex justify-between items-center mb-4 text-sm">
                            <span className="text-green-600 flex items-center gap-1">
                              <TrendingDown className="h-4 w-4" />
                              {t('carts.totalSavings')}
                            </span>
                              <span className="text-green-600 font-medium">
                              -{totalPotentialSavings.toFixed(2)} лв ({totalFromSuggestions.toFixed(2)} лв)
                            </span>
                            </div>
                        )}

                        {!isEditMode && (
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                  onClick={() => navigate('/carts')}
                                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                {t('carts.saveAndBack')}
                              </button>
                              <button
                                  onClick={handleCheckout}
                                  disabled={checkoutMutation.isPending}
                                  className="flex-1 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                              >
                                {checkoutMutation.isPending ? (
                                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                ) : (
                                    t('carts.moveToHistory')
                                )}
                              </button>
                            </div>
                        )}
                      </div>
                  )}
                </div>
              </div>

              {/* History Section */}
              <div className="mt-8 bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <History className="h-5 w-5 text-gray-500" />
                    {t('carts.orderHistory')}
                  </h2>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">{t('carts.noHistory')}</p>
                      <p className="text-sm text-gray-400 mt-1">{t('carts.noHistoryHint')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                      {recentOrders.map((order) => (
                          <div key={order.id} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                <span className="font-medium text-gray-900">
                            {order.basketName}
                          </span>
                              </div>
                              <span className="font-semibold text-gray-900">
                          {order.totalSpent.toFixed(2)} {order.currency}
                        </span>
                            </div>
                            <p className="text-sm text-gray-500">{formatDate(order.closedAt)}</p>

                            {order.items && order.items.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {order.items.map((item, itemIdx) => (
                                      <span key={`order-${order.id}-item-${itemIdx}`} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {item.productName} x{item.quantity}
                            </span>
                                  ))}
                                </div>
                            )}
                          </div>
                      ))}
                    </div>
                )}
              </div>
            </div>

            {/* Suggestions Sidebar */}
            {showSuggestions && (
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-sm sticky top-24">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Lightbulb className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            {t('carts.suggestions')}
                          </h2>
                          {hasSuggestions && (
                              <p className="text-sm text-green-600">
                                {t('carts.save')} {totalPotentialSavings.toFixed(2)} лв
                              </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      {hasSuggestions ? (
                          <div className="space-y-3">
                            {suggestions.map((suggestion, idx) => (
                                <div
                                    key={`suggestion-${suggestion.originalItem.productId}-${idx}`}
                                    className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 text-sm">
                                        {suggestion.originalItem.productName}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        x{suggestion.originalItem.quantity}
                                      </p>
                                    </div>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              -{suggestion.savings.toFixed(2)} лв
                            </span>
                                  </div>

                                  {/* Current vs Alternative */}
                                  <div className="flex items-center gap-2 text-sm mb-3">
                                    <div className="flex-1 p-2 bg-white rounded border border-gray-200">
                                      <p className="text-gray-500 text-xs">{suggestion.originalItem.storeName}</p>
                                      <p className="font-medium text-gray-900">{suggestion.originalItem.price.toFixed(2)} лв</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 p-2 bg-green-50 rounded border border-green-200">
                                      <p className="text-green-600 text-xs">{suggestion.alternative.storeName}</p>
                                      <p className="font-medium text-green-700">{suggestion.alternative.price.toFixed(2)} лв</p>
                                    </div>
                                  </div>

                                  <button
                                      onClick={() => handleApplySuggestion(suggestion)}
                                      disabled={isApplyingSuggestion === suggestion.originalItem.productId}
                                      className="w-full py-2 text-sm font-medium bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                                  >
                                    {isApplyingSuggestion === suggestion.originalItem.productId ? (
                                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                    ) : (
                                        t('carts.applySuggestion')
                                    )}
                                  </button>
                                </div>
                            ))}
                          </div>
                      ) : (
                          <div className="text-center py-6">
                            <Lightbulb className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">{t('carts.noSuggestions')}</p>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* Add Product Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />

              <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-xl">
                  <h3 className="text-lg font-semibold text-gray-900">{t('carts.addProduct')}</h3>
                  <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Search and Sort */}
                <div className="px-6 py-4 border-b border-gray-200 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder={t('common.search')}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                        onClick={() => setSortOrder('asc')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                            sortOrder === 'asc'
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {t('carts.priceLowHigh')}
                    </button>
                    <button
                        onClick={() => setSortOrder('desc')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                            sortOrder === 'desc'
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {t('carts.priceHighLow')}
                    </button>
                  </div>
                </div>

                {/* Products List */}
                <div className="flex-1 overflow-y-auto">
                  {isLoadingProducts ? (
                      <div className="p-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
                      </div>
                  ) : (
                      <>
                        {/* Already Added Section */}
                        {addedProducts.length > 0 && (
                            <div className="border-b border-gray-200">
                              <div className="px-6 py-3 bg-primary-50">
                                <p className="text-sm font-medium text-primary-700">
                                  {t('carts.alreadyAdded')} ({addedProducts.length})
                                </p>
                              </div>
                              <div className="p-4 space-y-2">
                                {addedProducts.map((product, productIdx) => {
                                  const inCart = currentItems.find(item => item.productId === product.productId);
                                  const tempQty = tempItems.get(product.productId) || 0;
                                  const totalQty = (inCart?.quantity || 0) + tempQty;

                                  return (
                                      <div
                                          key={`added-product-${product.productId}-${productIdx}`}
                                          className="flex items-center gap-4 p-4 rounded-lg border border-primary-200 bg-primary-50"
                                      >
                                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                          <ImageIcon className="h-6 w-6 text-gray-400" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                                          <p className="text-sm text-gray-500">{product.storeName}</p>
                                        </div>

                                        <div className="text-right mr-2">
                                          <p className="font-semibold text-gray-900">{product.price.toFixed(2)} лв</p>
                                          {inCart && (
                                              <p className="text-xs text-primary-600">{t('carts.inCart')}: {inCart.quantity}</p>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <button
                                              onClick={() => handleUpdateTempQuantity(product.productId, -1)}
                                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
                                          >
                                            -
                                          </button>
                                          <span className="w-8 text-center font-medium">{tempQty > 0 ? `+${tempQty}` : totalQty}</span>
                                          <button
                                              onClick={() => handleAddToTemp(product)}
                                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                                          >
                                            +
                                          </button>
                                          {tempQty > 0 && (
                                              <button
                                                  onClick={() => handleRemoveFromTemp(product.productId)}
                                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                              >
                                                <X className="h-4 w-4" />
                                              </button>
                                          )}
                                        </div>
                                      </div>
                                  );
                                })}
                              </div>
                            </div>
                        )}

                        {/* Available Products Section */}
                        <div className="p-4 space-y-2">
                          {availableProducts.length > 0 && (
                              <p className="text-sm font-medium text-gray-500 px-2 mb-2">
                                {t('carts.availableProducts')} ({availableProducts.length})
                              </p>
                          )}
                          {availableProducts.map((product, productIdx) => (
                              <div
                                  key={`available-product-${product.productId}-${productIdx}`}
                                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                              >
                                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                  <ImageIcon className="h-6 w-6 text-gray-400" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                                  <p className="text-sm text-gray-500">{product.storeName}</p>
                                </div>

                                <div className="text-right mr-2">
                                  <p className="font-semibold text-gray-900">{product.price.toFixed(2)} лв</p>
                                </div>

                                <button
                                    onClick={() => handleAddToTemp(product)}
                                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600 transition-colors"
                                >
                                  <Plus className="h-5 w-5" />
                                </button>
                              </div>
                          ))}
                        </div>
                      </>
                  )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl">
                  <button
                      onClick={() => {
                        setTempItems(new Map());
                        setIsModalOpen(false);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                      onClick={handleDoneAddingProducts}
                      disabled={tempItems.size === 0 || addItemsBatchMutation.isPending}
                      className="px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:bg-primary-300 transition-colors"
                  >
                    {addItemsBatchMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                          {t('common.done')} {tempItems.size > 0 && `(${tempItems.size})`}
                        </>
                    )}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}
