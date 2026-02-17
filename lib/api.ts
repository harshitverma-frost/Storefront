/**
 * Storefront API Client
 * Consumes existing backend at https://ecommerce-backend-h23p.onrender.com
 * Backend response format: { success: boolean, message: string, data: T }
 */

import { Product, ProductWithDetails, ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ecommerce-backend-h23p.onrender.com';

// Log API URL on initialization (only in browser)
if (typeof window !== 'undefined') {
    console.log('[API] 🔗 Backend URL:', API_URL);
}

/* ─── Helper: Logged fetch wrapper ─── */
async function apiFetch(
    label: string,
    url: string,
    options?: RequestInit,
    body?: unknown,
): Promise<unknown> {
    const method = options?.method || 'GET';
    console.log(`[API] ➡️  ${method} ${url}`, body ? body : '');

    try {
        const res = await fetch(url, {
            ...options,
            credentials: 'include',
            ...(body ? { body: JSON.stringify(body) } : {}),
        });
        const json = await res.json();
        const icon = json.success !== false && res.ok ? '✅' : '❌';
        console.log(`[API] ${icon} ${label} — ${res.status}`, json);
        return json;
    } catch (error) {
        console.error(`[API] 💥 ${label} — Network error:`, error);
        throw error;
    }
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/* ─── Products ─── */

export async function getProducts(params?: {
    limit?: number;
    offset?: number;
    category?: string;
}): Promise<Product[]> {
    try {
        const searchParams = new URLSearchParams();
        if (params?.limit) searchParams.set('limit', String(params.limit));
        if (params?.offset) searchParams.set('offset', String(params.offset));
        if (params?.category) searchParams.set('category', params.category);

        const url = `${API_URL}/api/products${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        const json: ApiResponse<Product[]> = await apiFetch('getProducts', url);
        return json.success && json.data ? json.data : [];
    } catch {
        return [];
    }
}

export async function getProduct(id: string): Promise<Product | null> {
    try {
        const url = `${API_URL}/api/products/${id}`;
        const json: ApiResponse<Product> = await apiFetch('getProduct', url);
        return json.success && json.data ? json.data : null;
    } catch {
        return null;
    }
}

export async function getProductDetails(id: string): Promise<ProductWithDetails | null> {
    try {
        const url = `${API_URL}/api/products/${id}/details`;
        const json: ApiResponse<ProductWithDetails> = await apiFetch('getProductDetails', url);
        return json.success && json.data ? json.data : null;
    } catch {
        return null;
    }
}

export async function searchProducts(query: string): Promise<Product[]> {
    try {
        const url = `${API_URL}/api/products/search?q=${encodeURIComponent(query)}`;
        const json: ApiResponse<Product[]> = await apiFetch('searchProducts', url);
        return json.success && json.data ? json.data : [];
    } catch {
        return [];
    }
}

export async function checkApiHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/api/products?limit=1`);
        return res.ok;
    } catch {
        return false;
    }
}

/* ─── Auth ─── */

export async function loginUser(email: string, password: string) {
    return apiFetch('loginUser', `${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: JSON_HEADERS,
    }, { email, password });
}

export async function registerUser(full_name: string, email: string, password: string) {
    return apiFetch('registerUser', `${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: JSON_HEADERS,
    }, { full_name, email, password });
}

export async function logoutUser() {
    try {
        await apiFetch('logoutUser', `${API_URL}/api/auth/logout`, { method: 'POST' });
    } catch { /* silent */ }
}

export async function refreshAuthToken() {
    return apiFetch('refreshAuthToken', `${API_URL}/api/auth/refresh-token`, { method: 'POST' });
}

export async function getMe() {
    return apiFetch('getMe', `${API_URL}/api/auth/me`);
}

export async function changePassword(currentPassword: string, newPassword: string) {
    return apiFetch('changePassword', `${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: JSON_HEADERS,
    }, { current_password: currentPassword, new_password: newPassword });
}

/* ─── Cart ─── */

export async function createCart(customerId?: string) {
    return apiFetch('createCart', `${API_URL}/api/cart`, {
        method: 'POST',
        headers: JSON_HEADERS,
    }, { customer_id: customerId });
}

/**
 * Get cart — GET /api/cart (with cart_id in query or body)
 */
export async function getCart(params: { cart_id?: string; customer_id?: string }) {
    const searchParams = new URLSearchParams();
    if (params.cart_id) searchParams.set('cart_id', params.cart_id);
    if (params.customer_id) searchParams.set('customer_id', params.customer_id);
    return apiFetch('getCart', `${API_URL}/api/cart?${searchParams.toString()}`);
}

/**
 * Add item — POST /api/cart/items (FLAT endpoint)
 * Body: { cart_id, product_id?, variant_id?, quantity }
 * Backend now accepts EITHER product_id OR variant_id (or both)
 */
export async function addCartItem(
    cartId: string, 
    params: { product_id?: string; variant_id?: string }, 
    quantity: number
) {
    const body: Record<string, string | number> = { 
        cart_id: cartId, 
        quantity: quantity
    };
    
    // Always include product_id if available
    if (params.product_id) {
        body.product_id = params.product_id;
    }
    
    // Include variant_id if provided
    if (params.variant_id) {
        body.variant_id = params.variant_id;
    }
    
    console.log('[API] 📦 addCartItem body:', JSON.stringify(body, null, 2));
    
    return apiFetch('addCartItem', `${API_URL}/api/cart/items`, {
        method: 'POST',
        headers: JSON_HEADERS,
    }, body);
}

/**
 * Update item quantity — PATCH /api/cart/items/:itemId
 */
export async function updateCartItem(itemId: string, quantity: number) {
    return apiFetch('updateCartItem', `${API_URL}/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: JSON_HEADERS,
    }, { quantity });
}

/**
 * Remove item — DELETE /api/cart/items/:itemId
 */
export async function removeCartItem(itemId: string) {
    return apiFetch('removeCartItem', `${API_URL}/api/cart/items/${itemId}`, {
        method: 'DELETE',
    });
}

/* ─── Orders ─── */

/**
 * Direct checkout — POST /api/orders/direct
 */
export async function directCheckout(data: {
    customer_id?: string;
    customer_name?: string;
    customer_email?: string;
    items: Array<{ product_id: string; quantity: number; unit_price?: number }>;
    shipping_address?: Record<string, string>;
    payment_method?: string;
    order_notes?: string;
}) {
    return apiFetch('directCheckout', `${API_URL}/api/orders/direct`, {
        method: 'POST',
        headers: JSON_HEADERS,
    }, data);
}

/**
 * Cart-based checkout — POST /api/orders/checkout
 */
export async function checkoutOrder(data: {
    cart_id: string;
    customer_id: string;
    shipping_address_id?: string;
    payment_method?: string;
}) {
    return apiFetch('checkoutOrder', `${API_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: JSON_HEADERS,
    }, data);
}

export async function getMyOrders(customerId: string) {
    return apiFetch('getMyOrders', `${API_URL}/api/orders?customer_id=${customerId}`);
}

/* ─── Customers ─── */

export async function getCustomerProfile(id: string) {
    return apiFetch('getCustomerProfile', `${API_URL}/api/customers/${id}`);
}

export async function updateCustomerProfile(id: string, data: Record<string, unknown>) {
    return apiFetch('updateCustomerProfile', `${API_URL}/api/customers/${id}`, {
        method: 'PATCH',
        headers: JSON_HEADERS,
    }, data);
}

export async function verifyAge(customerId: string) {
    return apiFetch('verifyAge', `${API_URL}/api/customers/${customerId}/verify-age`, {
        method: 'POST',
    });
}

export async function getAddresses(customerId: string) {
    return apiFetch('getAddresses', `${API_URL}/api/customers/${customerId}/addresses`);
}

export async function addAddress(customerId: string, address: Record<string, string | boolean>) {
    return apiFetch('addAddress', `${API_URL}/api/customers/${customerId}/addresses`, {
        method: 'POST',
        headers: JSON_HEADERS,
    }, address);
}

export async function updateAddress(customerId: string, addressId: string, data: Record<string, string>) {
    return apiFetch('updateAddress', `${API_URL}/api/customers/${customerId}/addresses/${addressId}`, {
        method: 'PATCH',
        headers: JSON_HEADERS,
    }, data);
}

export async function deleteAddress(customerId: string, addressId: string) {
    return apiFetch('deleteAddress', `${API_URL}/api/customers/${customerId}/addresses/${addressId}`, {
        method: 'DELETE',
    });
}

/* ─── Reviews ─── */

export async function getProductReviews(productId: string, params?: { limit?: number; offset?: number; sort?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.sort) searchParams.set('sort', params.sort);
    const qs = searchParams.toString();
    return apiFetch('getProductReviews', `${API_URL}/api/reviews/product/${productId}${qs ? '?' + qs : ''}`);
}

export async function getRatingSummary(productId: string) {
    return apiFetch('getRatingSummary', `${API_URL}/api/reviews/product/${productId}/summary`);
}

export async function submitReview(data: { product_id: string; rating: number; title?: string; body?: string; order_id?: string }) {
    return apiFetch('submitReview', `${API_URL}/api/reviews`, {
        method: 'POST',
        headers: JSON_HEADERS,
    }, data);
}

export async function getMyReviews() {
    return apiFetch('getMyReviews', `${API_URL}/api/reviews/my`);
}

export async function deleteReview(reviewId: string) {
    return apiFetch('deleteReview', `${API_URL}/api/reviews/${reviewId}`, { method: 'DELETE' });
}

export async function markReviewHelpful(reviewId: string) {
    return apiFetch('markReviewHelpful', `${API_URL}/api/reviews/${reviewId}/helpful`, { method: 'POST' });
}

/* ─── Wishlist ─── */

export async function getWishlist() {
    return apiFetch('getWishlist', `${API_URL}/api/wishlist`);
}

export async function addToWishlist(productId: string, variantId?: string) {
    return apiFetch('addToWishlist', `${API_URL}/api/wishlist`, {
        method: 'POST',
        headers: JSON_HEADERS,
    }, { product_id: productId, variant_id: variantId });
}

export async function removeFromWishlist(productId: string) {
    return apiFetch('removeFromWishlist', `${API_URL}/api/wishlist/${productId}`, { method: 'DELETE' });
}

export async function checkInWishlist(productId: string) {
    return apiFetch('checkInWishlist', `${API_URL}/api/wishlist/check/${productId}`);
}

export async function clearWishlist() {
    return apiFetch('clearWishlist', `${API_URL}/api/wishlist`, { method: 'DELETE' });
}

/* ─── Categories ─── */

export async function getCategories(tree?: boolean) {
    const qs = tree ? '?tree=true' : '';
    const json: ApiResponse = await apiFetch('getCategories', `${API_URL}/api/categories${qs}`);
    return json.success && json.data ? json.data : [];
}

export async function getCategoryProducts(categoryId: string, params?: { limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    const qs = searchParams.toString();
    const json: ApiResponse<Product[]> = await apiFetch('getCategoryProducts', `${API_URL}/api/categories/${categoryId}/products${qs ? '?' + qs : ''}`);
    return json.success && json.data ? json.data : [];
}

