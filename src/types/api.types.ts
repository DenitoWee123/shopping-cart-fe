/**
 * API Types - Generated from backend models
 * These types mirror the Java DTOs and entities from the shopping-cart backend
 */

// ==================== Base Types ====================

export interface BaseResponse {
  errorCode?: number | null;
  message?: string | null;
}

// ==================== User Types ====================

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  location?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdatePasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  email: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangeUsernameRequest {
  email: string;
  currentPassword: string;
  newUsername: string;
}

export interface LoginUserResponse extends BaseResponse {
  sessionId?: string;
}

export interface RegisterUserAttemptResponse extends BaseResponse {
  uniqueCode?: string;
}

export interface UpdatePasswordResponse extends BaseResponse {}

export interface ChangeUsernameResponse extends BaseResponse {}

export interface UserResponseDto {
  id: string;
  email: string;
  username: string;
}

// ==================== Basket/Cart Types ====================

export interface PriceComparisonDto {
  productId: string;
  price: number;
  storeName: string;
}

export interface BasketItem {
  productId: string;
  productName: string;
  quantity: number;
  storeName: string;
  price: number;
  purchased?: boolean;
  lowerPriceItem?: PriceComparisonDto | null;
}

export interface ShoppingBasketDto {
  id: string;
  name: string;
  ownerId: string;
  shared: boolean;
  shareCode: string;
  items: BasketItem[];
  members: string[]; // Array of usernames
  total: number;
  totalFromSuggestions?: number;
}

export interface ShoppingBasketEntity {
  id: string;
  userId: string;
  name: string;
  isShared: boolean;
  ownerId: string;
  shareCode: string;
  members: string[];
  createdAt: string;
}

export interface BasketMember {
  basketId: string;
  userId: string;
  username: string;
  role: 'OWNER' | 'MEMBER';
}

export interface BasketItemEntity {
  id: string;
  basketId: string;
  productId: string;
  quantity: number;
  addedBy: string;
  addedAt: string;
  rawName: string;
  price: number;
  storeName: string;
}

export interface BasketSelectionResponse {
  message: string;
  currentBasket: ShoppingBasketDto;
  history: HistoryEntity[];
}

// ==================== Product Types ====================

export interface ProductGroupEntity {
  id: string;
  canonicalName: string;
  category: string;
  imageUrl: string;
}

export interface ProductResponseDTO {
  productId: string;
  priceId?: string;
  name: string;
  storeName: string;
  price: number;
  currency?: string;
  quantity?: number;
  totalLinePrice?: number;
}

// ==================== History Types ====================

export interface HistoryItemEntity {
  id: string;
  historyId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface HistoryEntity {
  id: string;
  userId: string;
  basketId: string;
  basketName: string;
  totalSpent: number;
  currency: string;
  closedAt: string;
  items: HistoryItemEntity[];
}

// ==================== Session Types ====================

export interface Session {
  sessionId: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

// ==================== API Error Types ====================

export interface ApiError {
  errorCode: number;
  message: string;
  timestamp?: string;
  path?: string;
}
