// ============================================================
// PizzaYA - TypeScript Type Definitions
// Mirrors backend Pydantic schemas
// ============================================================

// --- User ---
export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

// --- Product ---
export interface ProductCreate {
  name: string;
  slug: string;
  description?: string | null;
  price: number; // Decimal as number from JSON
  image_url?: string | null;
  category_id: string;
  is_available?: boolean;
  is_featured?: boolean;
}

export interface ProductUpdate {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
  category_id?: string | null;
  is_available?: boolean | null;
  is_featured?: boolean | null;
}

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string;
  is_available: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// --- Category ---
export interface CategoryCreate {
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order?: number;
}

export interface CategoryUpdate {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean | null;
  display_order?: number | null;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  products: ProductResponse[];
}

// --- Order / OrderItem ---
export interface OrderItemResponse {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderCreate {
  pickup_time?: string | null;
  notes?: string | null;
}

export interface OrderResponse {
  id: string;
  user_id: string;
  status: string;
  total: number;
  pickup_time: string | null;
  notes: string | null;
  payment_status: string;
  payment_id: string | null;
  items: OrderItemResponse[];
  created_at: string;
  updated_at: string;
}

// --- Cart ---
export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartData {
  items: CartItem[];
  total_items: number;
}

// --- Auth ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
}

export interface LoginResponse {
  user: UserResponse;
  access_token: string;
}

// --- Payment ---
export interface PaymentCreateRequest {
  order_id: string;
  currency?: string;
}

export interface PaymentCreateResponse {
  // dlocalgo redirect URL etc.
  id?: string;
  redirect_url?: string;
  status?: string;
}

// --- Dashboard Stats ---
export interface DashboardStats {
  orders_today: number;
  revenue_today: number;
  pending_orders: number;
}

// --- Generic API Response ---
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Order status display mapping
export const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmada', color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'Preparando', color: 'bg-orange-100 text-orange-800' },
  ready: { label: 'Listo', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Completada', color: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
};

export const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pago pendiente', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Pago fallido', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Reembolsado', color: 'bg-purple-100 text-purple-800' },
};
