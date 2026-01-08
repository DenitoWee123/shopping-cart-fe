# Shopping Cart Frontend

A modern React-based shopping cart application that allows users to manage shared shopping carts, compare prices across stores, and track purchase history.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| TypeScript | 5.9.3 | Type Safety |
| Vite | 7.2.4 | Build Tool & Dev Server |
| TanStack React Query | 5.90.12 | Server State Management |
| Axios | 1.13.2 | HTTP Client |
| React Router DOM | 7.10.1 | Client-Side Routing |
| Tailwind CSS | 4.1.18 | Styling |
| react-i18next | 16.5.0 | Internationalization (BG/EN) |
| Lucide React | 0.561.0 | Icons |
| Flowbite React | 0.12.14 | UI Components |

## Project Structure

```
src/
├── api/                    # API Layer
│   ├── client.ts           # Axios instance with interceptors
│   ├── services/           # Service modules (API calls)
│   │   ├── basket.service.ts
│   │   ├── history.service.ts
│   │   ├── product.service.ts
│   │   └── user.service.ts
│   └── hooks/              # React Query hooks
│       ├── useBasket.ts
│       ├── useHistory.ts
│       ├── useProduct.ts
│       └── useAuth.ts
├── components/             # Reusable UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── RequireAuth.tsx     # Protected route wrapper
│   └── RequireGuest.tsx    # Guest-only route wrapper
├── contexts/               # React Context providers
│   └── AuthContext.tsx     # Authentication state
├── layouts/                # Page layouts
│   └── AppLayout.tsx
├── locales/                # i18n translations
│   ├── en.json
│   └── bg.json
├── pages/                  # Route pages
│   ├── Home.tsx
│   ├── Carts.tsx
│   ├── CartDetail.tsx
│   ├── Profile.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── ...
├── routes/                 # Route definitions
│   └── index.tsx
├── types/                  # TypeScript type definitions
│   └── api.types.ts
└── utils/                  # Utility functions
    └── i18n.ts             # i18n configuration
```

## Architecture

### API Layer

The API layer follows a **Service Pattern** combined with **React Query** for efficient data fetching and caching.

#### 1. API Client (`api/client.ts`)

The `client.ts` file creates and configures a centralized Axios instance that all API calls go through:

```typescript
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});
```

**Key Responsibilities:**

- **Base Configuration**: Sets the API base URL, default headers, and timeout
- **Session Management**: Provides functions to get/set/clear the session ID from localStorage
- **Request Interceptor**: Automatically attaches the `Session-Id` header to every outgoing request
- **Response Interceptor**: Handles errors globally, including:
  - 401 Unauthorized → Forces logout and redirects to login
  - Session-related errors (5003, 5004, 5005) → Forces logout
  - Transforms error responses into a consistent `ApiError` format

**Why use a centralized client?**
- Single point of configuration for all HTTP requests
- Automatic authentication header injection
- Consistent error handling across the application
- Easy to modify behavior globally (e.g., add logging, retry logic)

#### 2. Services (`api/services/`)

Services are **pure functions that make HTTP calls** using the API client. They encapsulate the API endpoints and return typed responses.

**Example: `basket.service.ts`**

```typescript
export const basketService = {
  createBasket: async (name: string): Promise<void> => {
    await apiClient.post(`${BASKET_BASE_PATH}/create`, null, {
      params: { name },
    });
  },

  addItemsBatch: async (cartId: string, items: AddItemRequest[]): Promise<ShoppingBasketDto> => {
    const response = await apiClient.post<ShoppingBasketDto>(
      `${BASKET_BASE_PATH}/add`,
      items,
      { params: { cartId } }
    );
    return response.data;
  },
  // ... more methods
};
```

**What does `basket.service.ts` do?**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `createBasket` | POST `/api/basket/create` | Creates a new shopping cart |
| `addItem` | POST `/api/basket/add` | Adds a single item to cart |
| `addItemsBatch` | POST `/api/basket/add` | Adds multiple items at once |
| `getCurrentBasket` | GET `/api/basket/current` | Gets current basket items |
| `getUserCarts` | GET `/api/basket/get/user/carts` | Gets all user's carts |
| `selectBasket` | POST `/api/basket/select/cart` | Selects a cart to work with |
| `updateQuantity` | PATCH `/api/basket/quantity` | Updates item quantity |
| `removeItem` | DELETE `/api/basket/item/:id` | Removes item from cart |
| `joinCart` | POST `/api/basket/join` | Joins a shared cart via code |

**Why separate services from hooks?**
- **Separation of Concerns**: Services handle HTTP logic, hooks handle React state
- **Reusability**: Services can be used outside of React (e.g., in tests)
- **Testability**: Easy to mock services in unit tests
- **Type Safety**: Strong typing for request/response data

#### 3. React Query Hooks (`api/hooks/`)

Hooks wrap services with React Query for caching, automatic refetching, and optimistic updates.

```typescript
export const useUserCarts = () => {
  return useQuery({
    queryKey: basketKeys.lists(),
    queryFn: () => basketService.getUserCarts(),
  });
};

export const useAddItemsBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartId, items }) => basketService.addItemsBatch(cartId, items),
    onSuccess: (data, variables) => {
      updateBasketCache(queryClient, variables.cartId, data);
    },
  });
};
```

**Benefits of React Query:**
- Automatic caching and background refetching
- Loading and error states out of the box
- Optimistic updates for better UX
- Query invalidation for data consistency

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Component  │ ──▶ │    Hook     │ ──▶ │   Service   │ ──▶ │   Client    │
│             │     │ (useQuery)  │     │ (basket.ts) │     │ (Axios)     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                                       │
                           ▼                                       ▼
                    React Query Cache                      Backend API
```

## Authentication

The app uses **session-based authentication**:

1. User logs in with email/password
2. Backend returns a `sessionId`
3. Frontend stores `sessionId` in localStorage
4. API client attaches `Session-Id` header to all requests
5. On logout or session expiry, user is redirected to login

**AuthContext** manages:
- User state (id, email, username)
- Login/logout functions
- Password/username change
- Session validation via `/api/user/me` endpoint

## Internationalization (i18n)

The app supports **Bulgarian (bg)** and **English (en)** languages:

```
src/locales/
├── en.json    # English translations
└── bg.json    # Bulgarian translations
```

Language can be switched via the Navbar. Translations are accessed using:

```typescript
const { t } = useTranslation();
// Usage: t('carts.addProduct')
```

## Features

### Shopping Carts
- Create personal shopping carts
- Share carts with others via share code
- Add/remove products with quantity management
- View cart members

### Price Comparison
- Backend suggests cheaper alternatives from other stores
- Visual indicators for items with cheaper options
- One-click to apply suggestions and save money

### Order History
- Checkout moves cart to history
- View past orders with all items
- Track total spending

### User Profile
- Change username (requires password)
- Change password
- View account information

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend running on `http://localhost:8081`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8081
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run generate-types` | Generate types from Swagger |

## Type Generation

Types can be auto-generated from the backend's Swagger documentation:

```bash
npm run generate-types
```

This creates typed API models in `src/types/generated/api.generated.ts`.

## Project Conventions

### File Naming
- Components: `PascalCase.tsx` (e.g., `CartDetail.tsx`)
- Services: `kebab-case.service.ts` (e.g., `basket.service.ts`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useBasket.ts`)
- Types: `kebab-case.types.ts` (e.g., `api.types.ts`)

### Code Style
- Functional components with hooks
- TypeScript strict mode
- ESLint for linting
- Tailwind CSS for styling (utility-first)

### State Management
- **Server State**: React Query (caching, fetching)
- **Auth State**: React Context (AuthContext)
- **UI State**: Local component state (useState)

## License

Private project - All rights reserved.

