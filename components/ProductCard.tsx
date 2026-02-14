'use client';

import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem } = useCart();
    const { isInWishlist, toggleItem } = useWishlist();
    const wishlisted = isInWishlist(product.product_id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
        toast.success(`${product.product_name} added to cart!`);
    };

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(product);
        toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    };

    const displayPrice = product.price ?? Math.floor(Math.random() * 500000 + 100000);

    return (
        <Link href={`/products/${product.product_id}`} className="group block">
            <div className="relative overflow-hidden rounded-xl bg-white border border-light-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Image */}
                <div className="relative aspect-square bg-gradient-to-br from-cream to-cream-dark p-6">
                    <div className="flex h-full items-center justify-center">
                        <span className="text-7xl transition-transform duration-300 group-hover:scale-110">🍷</span>
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleToggleWishlist}
                        className="absolute right-3 top-3 rounded-full bg-white/80 p-2 shadow-sm transition-all hover:bg-white hover:shadow-md"
                        aria-label="Toggle wishlist"
                    >
                        <Heart
                            className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-burgundy text-burgundy' : 'text-warm-gray'}`}
                        />
                    </button>

                    {/* Category Badge */}
                    {product.category && (
                        <span className="absolute left-3 top-3 rounded-full bg-burgundy/90 px-2.5 py-0.5 text-[10px] font-medium text-white uppercase tracking-wider">
                            {product.category}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-serif text-base font-semibold text-charcoal line-clamp-2 leading-snug">
                        {product.product_name}
                    </h3>

                    {product.brand && (
                        <p className="mt-0.5 text-xs text-warm-gray">{product.brand}</p>
                    )}

                    <p className="mt-2 font-serif text-lg font-bold text-burgundy">
                        ${displayPrice.toLocaleString('en-US')}
                    </p>

                    {/* Add to Cart */}
                    <button
                        onClick={handleAddToCart}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-burgundy py-2.5 text-sm font-medium text-white transition-all hover:bg-burgundy-dark active:scale-[0.98]"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                    </button>
                </div>
            </div>
        </Link>
    );
}
