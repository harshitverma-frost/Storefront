'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, searchProducts as apiSearch } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { SkeletonProductGrid } from '@/components/Skeleton';
import { SlidersHorizontal, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const wineTypes = ['All', 'Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified'];
const ITEMS_PER_PAGE = 9;

function ProductsContent() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('search') || '';
    const initialCategory = searchParams.get('category') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [filtered, setFiltered] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [selectedType, setSelectedType] = useState(initialCategory || 'All');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            let data: Product[];
            if (initialSearch) {
                data = await apiSearch(initialSearch);
            } else {
                data = await getProducts({ limit: 100 });
            }
            setProducts(data);
            setLoading(false);
        };
        loadProducts();
    }, [initialSearch]);

    /* Filter logic */
    useEffect(() => {
        let result = [...products];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                p =>
                    p.product_name.toLowerCase().includes(q) ||
                    p.brand?.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q)
            );
        }

        // Type/Category filter
        if (selectedType !== 'All') {
            result = result.filter(
                p =>
                    p.category?.toLowerCase().includes(selectedType.toLowerCase()) ||
                    p.sub_category?.toLowerCase().includes(selectedType.toLowerCase())
            );
        }

        setFiltered(result);
        setCurrentPage(1);
    }, [products, searchQuery, selectedType, priceRange]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedProducts = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen bg-cream">
            {/* Header */}
            <div className="border-b border-light-border bg-white px-4 py-6">
                <div className="mx-auto max-w-7xl">
                    <h1 className="font-serif text-3xl font-bold text-charcoal">Shop Wines</h1>
                    <p className="mt-1 text-sm text-warm-gray">
                        Showing {paginatedProducts.length} of {filtered.length} products
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
                    {/* Mobile filter toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="mb-4 flex items-center gap-2 rounded-lg border border-light-border bg-white px-4 py-2 text-sm font-medium text-charcoal lg:hidden"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                    </button>

                    {/* Sidebar Filters */}
                    <aside className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6 mb-6 lg:mb-0`}>
                        {/* Search */}
                        <div className="rounded-xl border border-light-border bg-white p-5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search wines..."
                                    className="w-full rounded-lg border border-light-border bg-cream/50 py-2.5 pl-10 pr-4 text-sm focus:border-burgundy focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Wine Type */}
                        <div className="rounded-xl border border-light-border bg-white p-5">
                            <h3 className="font-serif text-sm font-semibold text-charcoal mb-3">Wine Type</h3>
                            <div className="space-y-2">
                                {wineTypes.map(type => (
                                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="wineType"
                                            checked={selectedType === type}
                                            onChange={() => setSelectedType(type)}
                                            className="h-4 w-4 accent-burgundy"
                                        />
                                        <span className="text-sm text-warm-gray group-hover:text-charcoal transition-colors">
                                            {type}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="rounded-xl border border-light-border bg-white p-5">
                            <h3 className="font-serif text-sm font-semibold text-charcoal mb-3">Price Range</h3>
                            <input
                                type="range"
                                min="0"
                                max="1000000"
                                step="10000"
                                value={priceRange[1]}
                                onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                className="w-full accent-burgundy"
                            />
                            <div className="mt-2 flex justify-between text-xs text-warm-gray">
                                <span>${priceRange[0].toLocaleString('en-US')}</span>
                                <span>${priceRange[1].toLocaleString('en-US')}</span>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div>
                        {/* Sort bar */}
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm text-warm-gray">
                                {filtered.length} wines found
                            </p>
                            <select className="rounded-lg border border-light-border bg-white px-3 py-2 text-sm text-charcoal focus:border-burgundy focus:outline-none">
                                <option>Sort: Default</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Newest First</option>
                            </select>
                        </div>

                        {loading ? (
                            <SkeletonProductGrid count={9} />
                        ) : paginatedProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {paginatedProducts.map(product => (
                                        <ProductCard key={product.product_id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-10 flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="flex items-center gap-1 rounded-lg border border-light-border px-3 py-2 text-sm text-warm-gray hover:text-charcoal disabled:opacity-40"
                                        >
                                            <ChevronLeft className="h-4 w-4" /> Previous
                                        </button>
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                                                    ? 'bg-burgundy text-white'
                                                    : 'border border-light-border text-warm-gray hover:text-charcoal'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="flex items-center gap-1 rounded-lg border border-light-border px-3 py-2 text-sm text-warm-gray hover:text-charcoal disabled:opacity-40"
                                        >
                                            Next <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="rounded-2xl border border-light-border bg-white py-20 text-center">
                                <span className="text-5xl block mb-4">🔍</span>
                                <p className="font-serif text-xl text-charcoal">No wines found</p>
                                <p className="mt-2 text-sm text-warm-gray">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-cream p-8"><SkeletonProductGrid count={9} /></div>}>
            <ProductsContent />
        </Suspense>
    );
}
