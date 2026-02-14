'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Award, Star, Mail, Wine, Grape, Sparkles } from 'lucide-react';
import { getProducts } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { SkeletonProductGrid } from '@/components/Skeleton';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ limit: 8 }).then(products => {
      setFeaturedProducts(products);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-cream">
      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(45,41,38,0.5), rgba(45,41,38,0.7)), 
              url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920&q=80')`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:py-36 lg:py-44 text-center">
          <p className="animate-fade-in text-sm uppercase tracking-[0.3em] text-wine-gold-light font-medium mb-4">
            Premium Artisan Wines
          </p>
          <h1 className="animate-fade-in-up font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
            The Art of Fine Wine,<br />
            <span className="text-wine-gold">Perfected</span>
          </h1>
          <p className="animate-fade-in-up mt-6 mx-auto max-w-2xl text-base sm:text-lg text-cream-dark/90 leading-relaxed"
            style={{ animationDelay: '0.2s' }}>
            Discover exceptional wines crafted with passion and refined technique
            from the finest vineyards around the world.
          </p>
          <div className="animate-fade-in-up mt-8 flex flex-wrap justify-center gap-4" style={{ animationDelay: '0.4s' }}>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-burgundy px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-burgundy-dark hover:shadow-xl hover:-translate-y-0.5"
            >
              Shop Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURED COLLECTIONS ─── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              Featured Collections
            </h2>
            <p className="mt-3 text-warm-gray">Discover our finest curated collections</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: Wine, title: 'Red Wines', subtitle: 'Bold & Complex', color: 'from-red-900/20 to-red-800/10' },
              { icon: Sparkles, title: 'White Wines', subtitle: 'Crisp & Elegant', color: 'from-amber-100/60 to-yellow-50/40' },
              { icon: Grape, title: 'Sparkling', subtitle: 'Celebratory', color: 'from-pink-100/60 to-rose-50/40' },
            ].map((collection) => (
              <Link
                key={collection.title}
                href={`/products?category=${encodeURIComponent(collection.title.split(' ')[0])}`}
                className="group relative overflow-hidden rounded-2xl border border-light-border bg-white p-8 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${collection.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream-dark">
                    <collection.icon className="h-7 w-7 text-burgundy" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-charcoal">{collection.title}</h3>
                  <p className="mt-1 text-sm text-warm-gray">{collection.subtitle}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-burgundy">
                    Explore <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OUR STORY ─── */}
      <section className="py-20 px-4 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-wine-gold font-medium mb-3">Our Heritage</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal leading-tight">
                Our Story
              </h2>
              <p className="mt-6 text-warm-gray leading-relaxed">
                At KSP Wines, we believe every bottle tells a story. From sun-drenched hillside
                vineyards to lush coastal estates, we source and select only the finest grapes
                to craft wines of exceptional character and depth.
              </p>
              <p className="mt-4 text-warm-gray leading-relaxed">
                With over a decade of winemaking expertise, our artisans blend time-honored European
                techniques with bold, modern innovation — producing wines that are not just beverages,
                but experiences to be savored.
              </p>
              <Link
                href="/about"
                className="mt-6 inline-flex items-center gap-2 font-serif text-sm font-semibold text-burgundy hover:text-burgundy-dark transition-colors"
              >
                Read More <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-cream-dark to-cream overflow-hidden border border-light-border">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center p-8">
                    <span className="text-8xl block mb-4">🍇</span>
                    <p className="font-serif text-2xl text-charcoal font-semibold">KSP Wines</p>
                    <p className="text-sm text-warm-gray mt-1">Since 2015</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BEST SELLERS ─── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
                Best Sellers
              </h2>
              <p className="mt-2 text-warm-gray">Our most popular wines, loved by customers</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-burgundy hover:text-burgundy-dark transition-colors"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <SkeletonProductGrid count={4} />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.slice(0, 4).map(product => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-light-border bg-white py-16 text-center">
              <span className="text-5xl block mb-4">🍷</span>
              <p className="font-serif text-xl text-charcoal">Products coming soon</p>
              <p className="mt-2 text-sm text-warm-gray">Add products via the admin panel</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-burgundy">
              View All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── AWARDS & CERTIFICATIONS ─── */}
      <section className="py-20 px-4 bg-white">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Awards & Certifications
          </h2>
          <p className="mt-3 text-warm-gray">Recognition of our commitment to quality</p>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: Award, title: 'Gold Medal 2024', subtitle: 'International Wine Challenge', detail: 'VinoViet Classic Red' },
              { icon: Star, title: 'Best Vietnamese Wine', subtitle: 'Asia Wine Awards 2024', detail: 'Exceptional Quality' },
              { icon: Award, title: 'Sustainability Award', subtitle: 'Green Vineyards Initiative', detail: 'Eco-Friendly Production' },
            ].map((award, i) => (
              <div key={i} className="rounded-2xl border border-light-border bg-cream/50 p-8 transition-all hover:shadow-md">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-wine-gold/20">
                  <award.icon className="h-6 w-6 text-wine-gold" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-charcoal">{award.title}</h3>
                <p className="mt-1 text-sm text-warm-gray">{award.subtitle}</p>
                <p className="mt-2 text-xs text-burgundy font-medium">{award.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal text-center">
            What Our Customers Say
          </h2>
          <p className="mt-3 text-warm-gray text-center">Hear from wine lovers who trust KSP Wines</p>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                name: 'Emily Carter',
                role: 'Wine Enthusiast',
                text: 'KSP Wines delivers an extraordinary tasting experience. Every sip reveals new layers of complexity and refinement.',
                rating: 5,
              },
              {
                name: 'James Whitfield',
                role: 'Restaurant Owner',
                text: 'Consistently outstanding quality at a fair price. KSP Wines is the go-to choice for my restaurant\'s wine list.',
                rating: 5,
              },
              {
                name: 'Sofia Martínez',
                role: 'Sommelier',
                text: 'A hidden gem in the wine world. International-caliber quality with a distinctive character that stands apart.',
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="rounded-2xl border border-light-border bg-white p-6 transition-all hover:shadow-md"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-wine-gold text-wine-gold" />
                  ))}
                </div>
                <p className="text-sm text-warm-gray leading-relaxed italic">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-cream-dark flex items-center justify-center font-serif text-burgundy font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{testimonial.name}</p>
                    <p className="text-xs text-warm-gray">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section className="py-20 px-4 wine-gradient">
        <div className="mx-auto max-w-2xl text-center">
          <Mail className="mx-auto h-8 w-8 text-wine-gold mb-4" />
          <h2 className="font-serif text-3xl font-bold text-white">
            Join Our Newsletter
          </h2>
          <p className="mt-3 text-cream-dark/80 text-sm">
            Stay updated on new releases and exclusive offers
          </p>
          <form className="mt-8 flex flex-col sm:flex-row gap-3 justify-center" onSubmit={e => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address..."
              className="flex-1 rounded-lg bg-white/10 border border-white/20 px-5 py-3 text-sm text-white placeholder-white/50 focus:border-wine-gold focus:outline-none backdrop-blur-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-wine-gold px-8 py-3 text-sm font-semibold text-charcoal hover:bg-wine-gold-light transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
