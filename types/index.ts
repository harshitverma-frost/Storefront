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
    quantity?: number;
    images?: string[];
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

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface WishlistItem {
    product_id: string;
    product: Product;
}

/* Mock order type for frontend since backend doesn't have orders API */
export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
    shipping_address: ShippingAddress;
    created_at: string;
}

export interface ShippingAddress {
    full_name: string;
    address_line: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    phone: string;
}
