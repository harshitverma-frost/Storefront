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
    const { addItem } = useCart();
    const { isInWishlist, toggleItem } = useWishlist();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            // Try detailed endpoint first, fallback to simple
            let data = await getProductDetails(id);
            if (!data) {
                const simple = await getProduct(id);
                if (simple) data = simple as ProductWithDetails;
            }
            setProduct(data);

            // Load related products
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

    if (!product) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="text-center">
                    <span className="text-6xl block mb-4">🍷</span>
                    <h1 className="font-serif text-2xl font-bold text-charcoal">Product Not Found</h1>
                    <p className="mt-2 text-warm-gray">The wine you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/products" className="mt-4 inline-block rounded-lg bg-burgundy px-6 py-2.5 text-sm font-medium text-white hover:bg-burgundy-dark transition-colors">
                        Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    const wishlisted = isInWishlist(product.product_id);
    const displayPrice = product.price ?? Math.floor(Math.random() * 500000 + 100000);
    const images = product.assets?.map(a => a.asset_url).filter(Boolean) || [];

    const handleAddToCart = () => {
        addItem(product, quantity);
        toast.success(`Added ${quantity} × ${product.product_name} to cart!`);
    };

    return (
        <div className="min-h-screen bg-cream">
            {/* Breadcrumb */}
            <div className="border-b border-light-border bg-white">
                <div className="mx-auto max-w-7xl px-4 py-3">
                    <nav className="flex items-center gap-2 text-sm text-warm-gray">
                        <Link href="/" className="hover:text-burgundy transition-colors">Home</Link>
                        <ChevronRight className="h-3 w-3" />
                        <Link href="/products" className="hover:text-burgundy transition-colors">Shop</Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="text-charcoal font-medium">{product.product_name}</span>
                    </nav>
                </div>
            </div>

            {/* Product */}
            <div className="mx-auto max-w-7xl px-4 py-10">
                <div className="grid gap-10 lg:grid-cols-2">
                    {/* Image Gallery */}
                    <div>
                        <div className="aspect-square rounded-2xl border border-light-border bg-white p-8 overflow-hidden">
                            <div className="flex h-full items-center justify-center">
                                {images.length > 0 ? (
                                    <img src={images[activeImageIndex] || ''} alt={product.product_name} className="h-full w-full object-contain" />
                                ) : (
                                    <span className="text-9xl">🍷</span>
                                )}
                            </div>
                        </div>
                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="mt-4 flex gap-3">
                                {images.slice(0, 4).map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImageIndex(i)}
                                        className={`h-20 w-20 rounded-lg border-2 overflow-hidden transition-all ${activeImageIndex === i ? 'border-burgundy' : 'border-light-border'
                                            }`}
                                    >
                                        <img src={img || ''} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        {product.category && (
                            <span className="inline-block rounded-full bg-burgundy/10 px-3 py-1 text-xs font-medium text-burgundy uppercase tracking-wider">
                                {product.category}
                            </span>
                        )}

                        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-charcoal leading-tight">
                            {product.product_name}
                        </h1>

                        {product.brand && (
                            <p className="text-warm-gray">{product.brand}</p>
                        )}

                        <p className="font-serif text-3xl font-bold text-burgundy">
                            ${displayPrice.toLocaleString('en-US')}
                        </p>

                        {product.description && (
                            <p className="text-warm-gray leading-relaxed">{product.description}</p>
                        )}

                        {/* Product Specs */}
                        <div className="rounded-xl border border-light-border bg-white p-5">
                            <h3 className="font-serif text-sm font-semibold text-charcoal mb-3">Technical Details</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-warm-gray">SKU</span>
                                    <span className="font-mono text-charcoal">{product.sku}</span>
                                </div>
                                {product.category && (
                                    <div className="flex justify-between">
                                        <span className="text-warm-gray">Type</span>
                                        <span className="text-charcoal">{product.category}</span>
                                    </div>
                                )}
                                {product.unit_of_measure && (
                                    <div className="flex justify-between">
                                        <span className="text-warm-gray">Volume</span>
                                        <span className="text-charcoal">{product.unit_of_measure}</span>
                                    </div>
                                )}
                                {product.specifications?.country_of_origin && (
                                    <div className="flex justify-between">
                                        <span className="text-warm-gray">Origin</span>
                                        <span className="text-charcoal">{product.specifications.country_of_origin}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quantity + Add to Cart */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center rounded-lg border border-light-border bg-white">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="px-3 py-2.5 text-warm-gray hover:text-charcoal transition-colors"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 text-center text-sm font-medium text-charcoal">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="px-3 py-2.5 text-warm-gray hover:text-charcoal transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-burgundy py-3 text-sm font-semibold text-white transition-all hover:bg-burgundy-dark active:scale-[0.98]"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                Add to Cart
                            </button>

                            <button
                                onClick={() => { toggleItem(product); toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }}
                                className={`rounded-lg border p-3 transition-all ${wishlisted ? 'border-burgundy bg-burgundy/5 text-burgundy' : 'border-light-border text-warm-gray hover:text-burgundy'
                                    }`}
                            >
                                <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        {/* Shipping info */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 rounded-lg bg-cream-dark/50 p-3">
                                <Truck className="h-4 w-4 text-burgundy" />
                                <span className="text-xs text-warm-gray">Free shipping over $50</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-cream-dark/50 p-3">
                                <RotateCcw className="h-4 w-4 text-burgundy" />
                                <span className="text-xs text-warm-gray">7-day return policy</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Section */}
                {product.description && (
                    <div className="mt-16 border-t border-light-border pt-10">
                        <h2 className="font-serif text-2xl font-bold text-charcoal">Flavor Profile & Description</h2>
                        <p className="mt-4 text-warm-gray leading-relaxed max-w-3xl">{product.description}</p>
                        {product.specifications && (
                            <div className="mt-6">
                                <h3 className="font-serif text-lg font-semibold text-charcoal mb-2">Specifications</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {product.specifications.material && (
                                        <div><span className="text-xs text-warm-gray">Material</span><p className="text-sm text-charcoal">{product.specifications.material}</p></div>
                                    )}
                                    {product.specifications.color && (
                                        <div><span className="text-xs text-warm-gray">Color</span><p className="text-sm text-charcoal">{product.specifications.color}</p></div>
                                    )}
                                    {product.specifications.grade && (
                                        <div><span className="text-xs text-warm-gray">Grade</span><p className="text-sm text-charcoal">{product.specifications.grade}</p></div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Customer Reviews (Static) */}
                <div className="mt-16 border-t border-light-border pt-10">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="font-serif text-2xl font-bold text-charcoal">Customer Reviews</h2>
                        <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-wine-gold text-wine-gold" />
                            <span className="text-lg font-semibold text-charcoal">4.7</span>
                            <span className="text-sm text-warm-gray">(5 reviews)</span>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { name: 'Emily Carter', date: '01/14/2026', text: 'Absolutely wonderful! Rich, well-balanced flavor with beautiful complexity. Will definitely order again!' },
                            { name: 'James Whitfield', date: '01/12/2026', text: 'Very pleasant wine at a great value. Carefully packaged and delivered right on schedule.' },
                            { name: 'Sofia Martínez', date: '01/10/2026', text: 'This wine is perfect for celebrations and dinner parties. Excellent quality and incredibly easy to enjoy.' },
                        ].map((review, i) => (
                            <div key={i} className="rounded-xl border border-light-border bg-white p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-charcoal">{review.name}</p>
                                    <p className="text-xs text-warm-gray">{review.date}</p>
                                </div>
                                <div className="flex gap-0.5 mb-2">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <Star key={j} className="h-3 w-3 fill-wine-gold text-wine-gold" />
                                    ))}
                                </div>
                                <p className="text-sm text-warm-gray">{review.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 border-t border-light-border pt-10">
                        <h2 className="font-serif text-2xl font-bold text-charcoal mb-6">You May Also Like</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
