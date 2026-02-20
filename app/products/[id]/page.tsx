'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getProduct, getProductDetails, getProducts } from '@/lib/api';
import { Product, ProductWithDetails } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { SkeletonLine } from '@/components/Skeleton';
import { Heart, ShoppingCart, Minus, Plus, Star, Truck, RotateCcw, ChevronRight } from 'lucide-react';
import ReviewSection from '@/components/reviews/ReviewSection';
import toast from 'react-hot-toast';

interface Props {
    params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: Props) {
    const { id } = use(params);

    const [product, setProduct] = useState<ProductWithDetails | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // ✅ NEW: variant state
    const [variants, setVariants] = useState<any[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);

    const { addItem } = useCart();
    const { isInWishlist, toggleItem } = useWishlist();

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            let data = await getProductDetails(id);
            if (!data) {
                const simple = await getProduct(id);
                if (simple) data = simple as ProductWithDetails;
            }

            setProduct(data);

            // ✅ store variants
            if (data?.variants?.length) {
                setVariants(data.variants);
                setSelectedVariant(data.variants[0]); // default selected
            }

            // related products
            const all = await getProducts({ limit: 4 });
            setRelatedProducts(all.filter(p => p.product_id !== id).slice(0, 4));

            setLoading(false);
        };

        load();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-cream">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="grid gap-10 lg:grid-cols-2">
                        <div className="aspect-square rounded-2xl animate-shimmer" />
                        <div className="space-y-4">
                            <SkeletonLine className="h-6 w-1/3" />
                            <SkeletonLine className="h-8 w-2/3" />
                            <SkeletonLine className="h-6 w-1/4" />
                            <SkeletonLine className="h-20 w-full" />
                            <SkeletonLine className="h-12 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const wishlisted = isInWishlist(product.product_id);

    const displayPrice =
        selectedVariant?.price ??
        product.price ??
        Math.floor(Math.random() * 500000 + 100000);

    const images = product.assets?.map(a => a.asset_url).filter(Boolean) || [];

    const handleAddToCart = () => {
        if (!product) return;

        addItem(
            product.product_id,
            selectedVariant?.variant_id || null,
            quantity
        );

        toast.success(`Added ${quantity} x ${product.product_name} to cart!`);
    };

    return (
        <div className="min-h-screen bg-cream">
            {/* Breadcrumb */}
            <div className="border-b border-light-border bg-white">
                <div className="mx-auto max-w-7xl px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-warm-gray">
                        <Link href="/">Home</Link>
                        <ChevronRight className="h-3 w-3" />
                        <Link href="/products">Shop</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-charcoal font-medium">{product.product_name}</span>
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-10">
                <div className="grid gap-10 lg:grid-cols-2">
                    {/* IMAGE */}
                    <div>
                        <div className="aspect-square rounded-2xl border bg-white p-8 flex items-center justify-center">
                            {images.length > 0 ? (
                                <img src={images[activeImageIndex]} className="object-contain h-full w-full" />
                            ) : (
                                <img src="/card-drink.webp" alt="" />
                            )}
                        </div>
                    </div>

                    {/* DETAILS */}
                    <div className="space-y-6">
                        <h1 className="font-serif text-3xl font-bold">
                            {product.product_name}
                        </h1>

                        {product.brand && (
                            <p className="text-warm-gray">{product.brand}</p>
                        )}

                        {/* Product metadata tags */}
                        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                            {product.category && (
                                <span className="flex items-center gap-1.5">
                                    <span className="text-warm-gray/60 font-medium">Category:</span>
                                    <span className="text-charcoal">{product.category}</span>
                                </span>
                            )}
                            {product.country_of_origin && (
                                <span className="flex items-center gap-1.5">
                                    <span className="text-warm-gray/60 font-medium">Country of Origin:</span>
                                    <span className="text-burgundy/80 font-semibold">{product.country_of_origin}</span>
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <span className="text-warm-gray/60 font-medium">Alcohol:</span>
                                <span className="text-burgundy/80 font-semibold">
                                    {product.alcohol_percentage != null ? `${product.alcohol_percentage}% ABV` : '—'}
                                </span>
                            </span>
                            {product.unit_of_measure && (
                                <span className="flex items-center gap-1.5">
                                    <span className="text-warm-gray/60 font-medium">Unit:</span>
                                    <span className="text-charcoal">{product.unit_of_measure}</span>
                                </span>
                            )}
                        </div>

                        {/* PRICE */}
                        <p className="text-3xl font-bold text-burgundy">
                            ${displayPrice}
                        </p>

                        {/* ✅ VARIANT SELECTOR */}
                        {variants.length > 0 && (
                            <div>
                                <p className="text-sm font-semibold mb-2">
                                    Choose Size:
                                </p>

                                <div className="flex gap-2 flex-wrap">
                                    {variants.map((variant) => (
                                        <button
                                            key={variant.variant_id}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition
                                                ${selectedVariant?.variant_id === variant.variant_id
                                                    ? "bg-burgundy text-white border-burgundy"
                                                    : "border-light-border hover:border-burgundy"
                                                }`}
                                        >
                                            {variant.size_label}
                                        </button>
                                    ))}
                                </div>

                                <p className="text-xs text-warm-gray mt-2">
                                    Stock: {selectedVariant?.stock_quantity}
                                </p>
                            </div>
                        )}

                        {/* QUANTITY + CART */}
                        <div className="flex gap-4">
                            <div className="flex border rounded-lg">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3">
                                    <Minus size={16} />
                                </button>
                                <span className="px-4 py-2">{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)} className="px-3">
                                    <Plus size={16} />
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-burgundy text-white rounded-lg py-3 flex justify-center items-center gap-2"
                            >
                                <ShoppingCart size={16} />
                                Add to Cart
                            </button>

                            <button
                                onClick={() => toggleItem(product)}
                                className="border rounded-lg px-3"
                            >
                                <Heart className={wishlisted ? "fill-current text-burgundy" : ""} />
                            </button>
                        </div>

                        {/* SHIPPING */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-xs">
                                <Truck size={16} /> Free shipping over $50
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <RotateCcw size={16} /> 7-day returns
                            </div>
                        </div>
                    </div>
                </div>

                {/* REVIEWS SECTION */}
                <ReviewSection productId={id} />

                {/* RELATED */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(p => (
                                <ProductCard key={p.product_id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
