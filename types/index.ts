/* === Storefront Type Definitions === */
/* Maps to existing backend inventory.products schema */

export interface Product {
    product_id: string;
    sku: string;
    product_name: string;
    brand?: string;
    category?: string;
    sub_category?: string;
    description?: string;
    unit_of_measure?: string;
    intended_use?: string;
    created_at?: string;
    updated_at?: string;
    /* Extended fields (may not exist in all DB rows) */
    price?: number;
    variant?: any;
    quantity?: number;
    images?: string[];
}

/** Shape returned by GET /api/products/filter */
export interface FilteredProduct extends Product {
    alcohol_percentage?: number;
    country_of_origin?: string;
    avg_rating?: number;
    review_count?: number;
    total_stock?: number;
    thumbnail_url?: string;
}

export interface FilterMeta {
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
    filters_applied: Record<string, unknown>;
    sort: string;
    cache_hit: boolean;
}

export interface ProductWithDetails extends Product {
    specifications?: ProductSpecification | null;
    packaging?: ProductPackaging | null;
    variants?: ProductVariant[];
    compliance?: ProductCompliance | null;
    assets?: ProductAsset[];
}

export interface ProductSpecification {
    spec_id: string;
    product_id: string;
    material?: string;
    length_cm?: number;
    width_cm?: number;
    height_cm?: number;
    weight_kg?: number;
    color?: string;
    strength?: string;
    grade?: string;
    shelf_life_months?: number;
    country_of_origin?: string;
}

export interface ProductPackaging {
    packaging_id: string;
    product_id: string;
    packaging_type?: string;
    pack_size?: string;
    net_quantity?: number;
    gross_weight?: number;
    packaging_material?: string;
    carton_size?: string;
    units_per_carton?: number;
    barcode?: string;
}

export interface ProductVariant {
    variant_id: string;
    product_id: string;
    variant_name?: string;
    variant_type?: string;
    variant_value?: string;
    variant_sku?: string;
    status?: 'Active' | 'Inactive';
}

export interface ProductCompliance {
    compliance_id: string;
    product_id: string;
    manufacturer_name?: string;
    manufacturer_address?: string;
    regulatory_details?: string;
    storage_instructions?: string;
    handling_instructions?: string;
    warranty_details?: string;
    safety_warnings?: string;
    remarks?: string;
}

export interface ProductAsset {
    asset_id: string;
    product_id: string;
    asset_type?: string;
    asset_url?: string;
    created_at?: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}

/* ─── Cart (Backend-matching) ─── */

export interface BackendCartItem {
    cart_item_id: string;
    cart_id: string;
    variant_id?: string;
    product_id?: string;
    quantity: number;
    product_name?: string;
    price?: number;
    size_label?: string;
    sku?: string;
    image_url?: string;
}

export interface BackendCart {
    cart_id: string;
    customer_id?: string;
    items: BackendCartItem[];
    total_amount: number;
    total_items: number;
}

/** Legacy CartItem shape — kept for backward compat on ProductCard */
export interface CartItem {
    product: Product;
    quantity: number;
}

export interface WishlistItem {
    product_id: string;
    product: Product;
}

/* ─── Orders (Backend-matching) ─── */

export interface Order {
    order_id: string;
    customer_id?: string;
    customer_name?: string;
    customer_email?: string;
    total_amount: number;
    total_tax?: number;
    order_status: string;
    payment_status: string;
    payment_method?: string;
    order_notes?: string;
    items?: OrderItem[];
    created_at: string;
}

export interface OrderItem {
    order_item_id: string;
    product_id?: string;
    variant_id?: string;
    quantity: number;
    unit_price: number;
    product_name?: string;
}

/* ─── Address (Backend-matching) ─── */

export interface Address {
    address_id: string;
    customer_id: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
    phone?: string;
    is_default?: boolean;
    label?: string;
}
