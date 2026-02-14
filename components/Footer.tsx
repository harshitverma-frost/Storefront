import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-light-border bg-cream">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl">🍷</span>
                            <span className="font-serif text-lg font-bold text-burgundy">
                                KSP <span className="text-warm-gray">— WINES</span>
                            </span>
                        </Link>
                        <p className="mt-3 text-sm text-warm-gray leading-relaxed">
                            Experience the unique terroir of Vietnam,<br />
                            bottled with passion and tradition.
                        </p>
                        <div className="mt-4 flex gap-3">
                            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                                <a key={i} href="#" className="text-warm-gray hover:text-burgundy transition-colors">
                                    <Icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="font-serif text-sm font-semibold text-charcoal mb-4">Shop</h4>
                        <ul className="space-y-2">
                            {['Red Wines', 'White Wines', 'Limited Editions'].map(item => (
                                <li key={item}>
                                    <Link href="/products" className="text-sm text-warm-gray hover:text-burgundy transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-serif text-sm font-semibold text-charcoal mb-4">Company</h4>
                        <ul className="space-y-2">
                            {[
                                { label: 'Our Story', href: '/about' },
                                { label: 'Sustainability', href: '/about' },
                                { label: 'Awards', href: '/about' },
                            ].map(item => (
                                <li key={item.label}>
                                    <Link href={item.href} className="text-sm text-warm-gray hover:text-burgundy transition-colors">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-serif text-sm font-semibold text-charcoal mb-4">Support</h4>
                        <ul className="space-y-2">
                            {[
                                { label: 'FAQs', href: '/contact' },
                                { label: 'Shipping & Returns', href: '/contact' },
                                { label: 'Privacy Policy', href: '/contact' },
                            ].map(item => (
                                <li key={item.label}>
                                    <Link href={item.href} className="text-sm text-warm-gray hover:text-burgundy transition-colors">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-10 border-t border-light-border pt-6 text-center">
                    <p className="text-xs text-warm-gray">
                        © 2026 KSP Wines. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
