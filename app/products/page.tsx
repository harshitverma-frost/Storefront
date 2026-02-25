'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getFilteredProducts, getFilterOptions, searchProducts as apiSearch } from '@/lib/api';
import { FilteredProduct, FilterMeta } from '@/types';
import ProductCard from '@/components/ProductCard';
import { SkeletonProductGrid } from '@/components/Skeleton';
import { SlidersHorizontal, Search, ChevronLeft, ChevronRight, X, Wine } from 'lucide-react';
import { useFilters } from '@/hooks/useFilters';
import { FILTER_CONFIGS, SORT_OPTIONS } from '@/lib/filterConfig';

// Filter components
import FilterSection from '@/components/filters/FilterSection';
import CheckboxGroup from '@/components/filters/CheckboxGroup';
import RangeSlider from '@/components/filters/RangeSlider';
import ToggleSwitch from '@/components/filters/ToggleSwitch';
import SortDropdown from '@/components/filters/SortDropdown';
import ActiveFilterChips from '@/components/filters/ActiveFilterChips';
import CountryDropdown from '@/components/filters/CountryDropdown';

const ITEMS_PER_PAGE = 12;

function ProductsContent() {
    const {
        filters,
        activeChips,
        setSearch,
        setBrands,
        setCountry,
        setRatings,
        setPriceRange,
        setAlcoholRange,
        setInStock,
        setBestSellers,
        setNewArrivals,
        setSort,
        removeFilter,
        clearAll,
    } = useFilters();

    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get('page') || '1');

    const [products, setProducts] = useState<FilteredProduct[]>([]);
    const [meta, setMeta] = useState<FilterMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Dynamic filter options (loaded from API)
    const [brandOptions, setBrandOptions] = useState<string[]>([]);
    const [countryOptions, setCountryOptions] = useState<string[]>([]);

    // Static wine-producing countries — always shown even before any products have country set
    const STATIC_COUNTRIES = [
        'Australia', 'Argentina', 'Chile', 'France',
        'Germany', 'India', 'Italy', 'Portugal',
        'South Africa', 'Spain', 'USA',
    ];

    // Merge static list with any countries already in the DB
    const displayCountryOptions = Array.from(
        new Set([...STATIC_COUNTRIES, ...countryOptions])
    ).sort();

    // Load dynamic filter options once
    useEffect(() => {
        getFilterOptions().then(opts => {
            setBrandOptions(opts.brands);
            setCountryOptions(opts.countries);
        });
    }, []);

    // Fetch products from backend filter endpoint whenever filters change
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);

            if (filters.search) {
                // Search uses a separate endpoint
                const data = await apiSearch(filters.search);
                setProducts(data as FilteredProduct[]);
                setMeta(null);
                setLoading(false);
                return;
            }

            // Build filter params for GET /api/products/filter
            const priceConfig = FILTER_CONFIGS.find(f => f.key === 'price');
            const alcConfig = FILTER_CONFIGS.find(f => f.key === 'alcohol');

            const params: Record<string, unknown> = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            };

            // Sort
            if (filters.sort) params.sort = filters.sort;

            // Category
            if (filters.category) params.category = filters.category;

            // Brand (comma-separated list → backend takes single brand ILIKE)
            if (filters.brands.length === 1) params.brand = filters.brands[0];

            // Price range
            const pMin = priceConfig?.min ?? 0;
            const pMax = priceConfig?.max ?? 500;
            if (filters.priceRange[0] !== pMin) params.min_price = filters.priceRange[0];
            if (filters.priceRange[1] !== pMax) params.max_price = filters.priceRange[1];

            // Alcohol % range
            const aMin = alcConfig?.min ?? 0;
            const aMax = alcConfig?.max ?? 100;
            if (filters.alcoholRange[0] !== aMin) params.min_abv = filters.alcoholRange[0];
            if (filters.alcoholRange[1] !== aMax) params.max_abv = filters.alcoholRange[1];

            // Country
            if (filters.country) params.country = filters.country;

            // Rating — extract numeric value from strings like '4★ & above'
            if (filters.ratings.length > 0) {
                const ratingValues = filters.ratings.map(r => parseInt(r)).filter(n => !isNaN(n));
                if (ratingValues.length > 0) params.min_rating = Math.min(...ratingValues);
            }

            // Availability
            if (filters.inStock) params.availability = 'in_stock';

            const result = await getFilteredProducts(params as any);
            setProducts(result.data);
            setMeta(result.meta);
            setLoading(false);
        };
        fetchProducts();
    }, [filters, currentPage]);

    const totalCount = meta?.total_count ?? products.length;
    const totalPages = meta?.total_pages ?? Math.ceil(products.length / ITEMS_PER_PAGE);

    // Close mobile drawer on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    // Lock body scroll when mobile drawer is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    /* ─── Sidebar content (shared between desktop & mobile) ─── */
    const sidebarContent = (
        <div className="space-y-0">
            {/* Search */}
            <div className="pb-4 border-b border-light-border/60">
                <label className="text-xs font-semibold uppercase tracking-[0.15em] text-charcoal/70 block mb-3">
                    Search
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm-gray/60" />
                    <input
                        type="text"
                        value={filters.search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search wines..."
                        className="w-full rounded-lg border border-light-border bg-cream/50 py-2.5 pl-10 pr-3 text-sm placeholder:text-warm-gray/50 focus:outline-none focus:border-burgundy focus:bg-white focus:ring-1 focus:ring-burgundy/10 transition-all"
                    />
                </div>
            </div>

            {/* Brands — dynamic from API */}
            {brandOptions.length > 0 && (
                <FilterSection title="Brand">
                    <CheckboxGroup
                        options={brandOptions}
                        selected={filters.brands}
                        onChange={setBrands}
                    />
                </FilterSection>
            )}

            {/* Price Range */}
            <FilterSection title="Price Range">
                <RangeSlider
                    min={FILTER_CONFIGS.find(f => f.key === 'price')?.min ?? 0}
                    max={FILTER_CONFIGS.find(f => f.key === 'price')?.max ?? 500}
                    step={FILTER_CONFIGS.find(f => f.key === 'price')?.step ?? 5}
                    value={filters.priceRange}
                    onChange={setPriceRange}
                    formatLabel={v => `$${v.toLocaleString()}`}
                />
            </FilterSection>

            {/* Alcohol % Range */}
            <FilterSection title="Alcohol %" defaultOpen={false}>
                <RangeSlider
                    min={FILTER_CONFIGS.find(f => f.key === 'alcohol')?.min ?? 0}
                    max={FILTER_CONFIGS.find(f => f.key === 'alcohol')?.max ?? 100}
                    step={FILTER_CONFIGS.find(f => f.key === 'alcohol')?.step ?? 1}
                    value={filters.alcoholRange}
                    onChange={setAlcoholRange}
                    formatLabel={v => `${v}%`}
                />
            </FilterSection>

            {/* Country — single-select dropdown (always shown) */}
            <CountryDropdown
                options={displayCountryOptions}
                selected={filters.country}
                onChange={setCountry}
            />

            {/* Rating */}
            <FilterSection title="Rating" defaultOpen={false}>
                <CheckboxGroup
                    options={FILTER_CONFIGS.find(f => f.key === 'rating')?.staticOptions ?? []}
                    selected={filters.ratings}
                    onChange={setRatings}
                />
            </FilterSection>

            {/* Toggles */}
            <FilterSection title="Availability">
                <div className="space-y-3">
                    <ToggleSwitch
                        label="In Stock Only"
                        checked={filters.inStock}
                        onChange={setInStock}
                    />
                    <ToggleSwitch
                        label="Best Sellers"
                        checked={filters.bestSellers}
                        onChange={setBestSellers}
                    />
                    <ToggleSwitch
                        label="New Arrivals"
                        checked={filters.newArrivals}
                        onChange={setNewArrivals}
                    />
                </div>
            </FilterSection>

            {/* Clear All */}
            {activeChips.length > 0 && (
                <div className="pt-4 border-t border-light-border/60">
                    <button
                        onClick={clearAll}
                        className="w-full rounded-lg border border-burgundy/20 py-2.5 text-sm font-semibold text-burgundy hover:bg-burgundy/5 transition-colors"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-cream">
            {/* Header */}
            <div className="border-b border-light-border bg-white">
                <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
                    <div className="flex items-end gap-3">
                        <Wine className="h-8 w-8 text-burgundy mb-0.5" />
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-charcoal tracking-tight">
                                Shop Wines
                            </h1>
                            <p className="mt-0.5 text-sm text-warm-gray">
                                Explore our curated collection of fine wines
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
                {/* Mobile Filter Button */}
                <button
                    onClick={() => setMobileOpen(true)}
                    className="mb-5 flex items-center gap-2 rounded-lg border border-light-border bg-white px-4 py-2.5 text-sm font-medium text-charcoal shadow-sm hover:shadow-md transition-shadow lg:hidden"
                >
                    <SlidersHorizontal className="h-4 w-4 text-burgundy" />
                    Filters
                    {activeChips.length > 0 && (
                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-burgundy text-[10px] font-bold text-white">
                            {activeChips.length}
                        </span>
                    )}
                </button>

                <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
                    {/* ─── Desktop Sidebar ─── */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-6 rounded-xl border border-light-border bg-white px-5 py-4 shadow-sm">
                            <h2 className="font-serif text-base font-semibold text-charcoal mb-1">Filters</h2>
                            <p className="text-xs text-warm-gray mb-4">
                                {totalCount} wine{totalCount !== 1 ? 's' : ''} found
                            </p>
                            {sidebarContent}
                        </div>
                    </aside>

                    {/* ─── Mobile Drawer ─── */}
                    {mobileOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 bg-black/40 animate-overlay-fade-in"
                                onClick={() => setMobileOpen(false)}
                            />
                            {/* Drawer */}
                            <div className="absolute left-0 top-0 bottom-0 w-[320px] max-w-[85vw] bg-white shadow-2xl animate-slide-in-right overflow-y-auto">
                                <div className="flex items-center justify-between border-b border-light-border px-5 py-4">
                                    <h2 className="font-serif text-lg font-semibold text-charcoal">Filters</h2>
                                    <button
                                        onClick={() => setMobileOpen(false)}
                                        className="rounded-full p-1.5 hover:bg-cream transition-colors"
                                    >
                                        <X className="h-5 w-5 text-warm-gray" />
                                    </button>
                                </div>
                                <div className="px-5 py-4">
                                    {sidebarContent}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── Product Grid ─── */}
                    <div className="min-w-0">
                        {/* Sort bar + Active chips */}
                        <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-warm-gray">
                                Showing <span className="font-semibold text-charcoal">{products.length}</span> of{' '}
                                <span className="font-semibold text-charcoal">{totalCount}</span> wines
                            </p>
                            <SortDropdown
                                value={filters.sort}
                                onChange={setSort}
                                options={SORT_OPTIONS}
                            />
                        </div>

                        <ActiveFilterChips
                            chips={activeChips}
                            onRemove={removeFilter}
                            onClearAll={clearAll}
                        />

                        {loading ? (
                            <SkeletonProductGrid count={12} />
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {products.map((product, i) => (
                                        <div
                                            key={product.product_id}
                                            className="animate-fade-in-up"
                                            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                                        >
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-12 flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams.toString());
                                                params.set('page', String(Math.max(1, currentPage - 1)));
                                                window.history.pushState(null, '', `?${params.toString()}`);
                                                window.dispatchEvent(new PopStateEvent('popstate'));
                                            }}
                                            disabled={currentPage === 1}
                                            className="flex items-center gap-1 rounded-lg border border-light-border px-3 py-2 text-sm text-warm-gray hover:text-charcoal hover:border-warm-gray/50 disabled:opacity-40 transition-all"
                                        >
                                            <ChevronLeft className="h-4 w-4" /> Previous
                                        </button>
                                        {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                                            let pageNum: number;
                                            if (totalPages <= 7) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 4) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 3) {
                                                pageNum = totalPages - 6 + i;
                                            } else {
                                                pageNum = currentPage - 3 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => {
                                                        const params = new URLSearchParams(searchParams.toString());
                                                        params.set('page', String(pageNum));
                                                        window.history.pushState(null, '', `?${params.toString()}`);
                                                        window.dispatchEvent(new PopStateEvent('popstate'));
                                                    }}
                                                    className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${currentPage === pageNum
                                                        ? 'bg-burgundy text-white shadow-sm'
                                                        : 'border border-light-border text-warm-gray hover:text-charcoal hover:border-warm-gray/50'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams.toString());
                                                params.set('page', String(Math.min(totalPages, currentPage + 1)));
                                                window.history.pushState(null, '', `?${params.toString()}`);
                                                window.dispatchEvent(new PopStateEvent('popstate'));
                                            }}
                                            disabled={currentPage === totalPages}
                                            className="flex items-center gap-1 rounded-lg border border-light-border px-3 py-2 text-sm text-warm-gray hover:text-charcoal hover:border-warm-gray/50 disabled:opacity-40 transition-all"
                                        >
                                            Next <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="rounded-xl border border-light-border bg-white py-20 text-center shadow-sm">
                                <Wine className="h-12 w-12 mx-auto text-warm-gray/30 mb-4" />
                                <p className="font-serif text-xl text-charcoal">No wines found</p>
                                <p className="mt-2 text-sm text-warm-gray">Try adjusting your filters or search</p>
                                {activeChips.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="mt-4 rounded-lg bg-burgundy px-5 py-2 text-sm font-medium text-white hover:bg-burgundy-dark transition-colors"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
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
        <Suspense fallback={<div className="min-h-screen bg-cream p-8"><SkeletonProductGrid count={12} /></div>}>
            <ProductsContent />
        </Suspense>
    );
}
