'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { createCart } from '@/lib/api';
import { ShieldCheck, User, Eye, Wine } from 'lucide-react';
import SocialLoginButtons from '@/components/SocialLoginButtons';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? 'YOUR_SITE_KEY';
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:4000';

type LoginMode = 'customer' | 'admin' | 'guest';

function LoginContent() {
    const router = useRouter();
    const { login, register, isAuthenticated, user, logout } = useAuth();
    const searchParams = useSearchParams();

    // Handle ?logout=true from Admin signout — clear Storefront auth state
    useEffect(() => {
        if (searchParams.get('logout') === 'true') {
            logout();
            // Clean up URL so the param doesn't persist on refresh
            router.replace('/login');
        }
    }, [searchParams, logout, router]);

    const [loginMode, setLoginMode] = useState<LoginMode>('customer');
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    // Prevents the isAuthenticated useEffect from redirecting to /account
    // when an admin login is in progress (avoids brief flash of Storefront UI)
    const isAdminRedirecting = useRef(false);

    // ── Turnstile state ──────────────────────────────────────────────
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const turnstileRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    /** Render (or re-render) the Turnstile widget */
    const renderTurnstile = useCallback(() => {
        // Remove previous widget if it exists
        if (widgetIdRef.current !== null) {
            try { window.turnstile?.remove(widgetIdRef.current); } catch { /* noop */ }
            widgetIdRef.current = null;
        }

        if (!turnstileRef.current || !window.turnstile) return;

        const id = window.turnstile.render(turnstileRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token: string) => setTurnstileToken(token),
            'expired-callback': () => setTurnstileToken(null),
            'error-callback': () => setTurnstileToken(null),
            theme: 'light',
        });

        widgetIdRef.current = id;
    }, []);

    // Render widget once the Turnstile script has loaded
    useEffect(() => {
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (window.turnstile) {
                clearInterval(interval);
                renderTurnstile();
            }
            if (attempts > 50) clearInterval(interval);
        }, 100);

        return () => {
            clearInterval(interval);
            if (widgetIdRef.current !== null) {
                try { window.turnstile?.remove(widgetIdRef.current); } catch { /* noop */ }
                widgetIdRef.current = null;
            }
        };
    }, [renderTurnstile]);

    // Re-render widget when toggling between login / register
    useEffect(() => {
        setTurnstileToken(null);
        renderTurnstile();
    }, [isRegister, renderTurnstile]);

    // ── Auth redirect ────────────────────────────────────────────────
    useEffect(() => {
        // Skip redirect if admin login is in progress (prevents UI flash)
        if (isAdminRedirecting.current) return;
        if (isAuthenticated && user) {
            router.push('/account');
        }
    }, [isAuthenticated, user, router]);

    if (isAuthenticated && !isAdminRedirecting.current || isRedirecting) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream/90 backdrop-blur-md animate-in fade-in duration-500">
                <div className="relative flex h-24 w-24 items-center justify-center">
                    {/* Outer spinning ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-burgundy border-r-burgundy/50 animate-spin" />
                    {/* Inner pulsing circle */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-burgundy/10 animate-pulse">
                        <Wine className="h-8 w-8 text-burgundy" />
                    </div>
                </div>
                <div className="mt-8 flex flex-col items-center space-y-2">
                    <h2 className="font-serif text-2xl font-bold text-charcoal tracking-tight animate-in slide-in-from-bottom-2 fade-in duration-700">
                        Securing your session
                    </h2>
                    <p className="text-sm font-medium text-warm-gray animate-pulse">
                        Please wait while we prepare your account...
                    </p>
                </div>
            </div>
        );
    }

    // ── Mode tabs config ─────────────────────────────────────────────
    const modes: { key: LoginMode; label: string; icon: React.ReactNode; desc: string }[] = [
        { key: 'customer', label: 'Customer', icon: <User className="w-4 h-4" />, desc: 'Shop & manage orders' },
        { key: 'admin', label: 'Admin', icon: <ShieldCheck className="w-4 h-4" />, desc: 'Manage your store' },
        { key: 'guest', label: 'Guest', icon: <Eye className="w-4 h-4" />, desc: 'Browse without account' },
    ];

    // ── Guest handler ────────────────────────────────────────────────
    const handleGuestBrowse = () => {
        toast.success('Welcome! Browsing as guest.');
        router.push('/');
    };

    // ── Submit handler ───────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Gate on Turnstile token
        if (!turnstileToken) {
            toast.error('Please complete the CAPTCHA verification.');
            return;
        }

        setLoading(true);

        try {
            if (isRegister) {
                // Register user
                const result = await register(form.name, form.email, form.password);

                if (result?.success) {
                    const customerId = result.customer?.customer_id;
                    if (customerId) {
                        await createCart(customerId);
                        console.log("✅ Cart created for:", customerId);
                    } else {
                        console.warn("⚠️ customer_id missing from register response");
                    }
                    toast.success('Account created! Please verify your email.');
                    setIsRedirecting(true);
                    // Add artificial delay to extend loader screen viewing as requested
                    setTimeout(() => {
                        router.push(`/verify-email?registered=true&email=${encodeURIComponent(form.email)}`);
                    }, 1500);
                } else {
                    toast.error(result?.error || 'Something went wrong');
                }
            } else {
                // 🔹 Login user
                const result = await login(form.email, form.password);

                if (result?.success) {
                    if (result.role === 'admin') {
                        // Set flag BEFORE AuthContext re-renders to prevent flash
                        isAdminRedirecting.current = true;
                        toast.success('Welcome, Admin! Redirecting to dashboard...');
                        // Build auto-login URL with user info for admin panel
                        // Read from the AuthContext localStorage key
                        let userName = form.email.split('@')[0];
                        let userId = '';
                        try {
                            const stored = localStorage.getItem('ksp_wines_user');
                            if (stored) {
                                const userData = JSON.parse(stored);
                                userName = userData.name || userName;
                                userId = userData.id || '';
                            }
                        } catch { /* noop */ }
                        const params = new URLSearchParams({
                            token: result.access_token || '',
                            email: form.email,
                            name: userName,
                            id: userId,
                        });
                        window.location.href = `${ADMIN_URL}/auto-login?${params.toString()}`;
                        return;
                    }
                    toast.success('Welcome back!');
                    setIsRedirecting(true);
                    router.push('/account');
                } else {
                    // If the user selected admin mode but has customer role
                    if (loginMode === 'admin' && result?.error) {
                        toast.error(result.error);
                    } else {
                        toast.error(result?.error || 'Something went wrong');
                    }
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            toast.error('Server error. Please try again.');
        } finally {
            setLoading(false);
            setTurnstileToken(null);
            renderTurnstile();
        }
    };

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <span className="text-4xl block mb-3">🍷</span>
                    <h1 className="font-serif text-3xl font-bold text-charcoal">
                        {loginMode === 'guest'
                            ? 'Browse as Guest'
                            : isRegister
                                ? 'Create Account'
                                : loginMode === 'admin'
                                    ? 'Admin Login'
                                    : 'Welcome Back'}
                    </h1>
                    <p className="mt-2 text-sm text-warm-gray">
                        {loginMode === 'guest'
                            ? 'Explore our collection without signing in'
                            : isRegister
                                ? 'Join the KSP Wines family'
                                : loginMode === 'admin'
                                    ? 'Sign in to manage your store'
                                    : 'Sign in to your account'}
                    </p>
                </div>

                {/* ── Role Selector Tabs ── */}
                <div className="flex gap-2 mb-6">
                    {modes.map(mode => (
                        <button
                            key={mode.key}
                            type="button"
                            onClick={() => {
                                setLoginMode(mode.key);
                                setIsRegister(false);
                                setForm({ name: '', email: '', password: '' });
                            }}
                            className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all duration-300 ${loginMode === mode.key
                                ? mode.key === 'admin'
                                    ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 text-amber-800 shadow-sm shadow-amber-100'
                                    : mode.key === 'guest'
                                        ? 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300 text-gray-700 shadow-sm shadow-gray-100'
                                        : 'bg-gradient-to-br from-rose-50 to-red-50 border-burgundy/40 text-burgundy shadow-sm shadow-rose-100'
                                : 'bg-white/60 border-light-border text-warm-gray hover:bg-white hover:border-gray-300'
                                }`}
                        >
                            <span className={`transition-transform duration-300 ${loginMode === mode.key ? 'scale-110' : ''}`}>
                                {mode.icon}
                            </span>
                            <span>{mode.label}</span>
                        </button>
                    ))}
                </div>

                {/* ── Guest Mode ── */}
                {loginMode === 'guest' ? (
                    <div className="rounded-2xl border border-light-border bg-white p-8 shadow-sm text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Eye className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="font-serif text-lg font-semibold text-charcoal mb-2">
                            Browse Without Signing In
                        </h3>
                        <p className="text-sm text-warm-gray mb-6">
                            Explore our entire wine collection, view product details, and discover new favorites — no account needed.
                        </p>
                        <button
                            onClick={handleGuestBrowse}
                            className="w-full rounded-lg bg-charcoal py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800"
                        >
                            Start Browsing
                        </button>
                        <p className="mt-4 text-xs text-warm-gray">
                            Want the full experience?{' '}
                            <button
                                type="button"
                                onClick={() => setLoginMode('customer')}
                                className="font-semibold text-burgundy hover:text-burgundy-dark"
                            >
                                Create an account
                            </button>
                        </p>
                    </div>
                ) : (
                    /* ── Login / Register Form ── */
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-2xl border border-light-border bg-white p-8 shadow-sm"
                    >
                        {loginMode === 'admin' && (
                            <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                                <ShieldCheck className="w-4 h-4 text-amber-600" />
                                <span className="text-xs font-medium text-amber-700">
                                    Admin credentials required
                                </span>
                            </div>
                        )}

                        {/* ── Social Login Buttons (customer mode only) ── */}
                        {loginMode === 'customer' && !isRegister && (
                            <>
                                <SocialLoginButtons disabled={loading} />
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-light-border" />
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="bg-white px-4 text-warm-gray font-medium">or sign in with email</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {isRegister && loginMode === 'customer' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-charcoal mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                                    placeholder="Your name"
                                    required
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-charcoal mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                                placeholder={loginMode === 'admin' ? 'admin@example.com' : 'you@example.com'}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-charcoal">
                                    Password
                                </label>
                                {!isRegister && loginMode === 'customer' && (
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs font-semibold text-burgundy hover:text-burgundy-dark transition-colors"
                                    >
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full rounded-lg border border-light-border px-4 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                                placeholder="••••••••"
                                required
                                minLength={3}
                            />
                        </div>

                        {/* ── Cloudflare Turnstile CAPTCHA ── */}
                        <div ref={turnstileRef} className="mb-4" />

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full rounded-lg py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 ${loginMode === 'admin'
                                ? 'bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 shadow-sm'
                                : 'bg-burgundy hover:bg-burgundy-dark'
                                }`}
                        >
                            {loading
                                ? 'Please wait...'
                                : isRegister
                                    ? 'Create Account'
                                    : loginMode === 'admin'
                                        ? '🔐 Sign In as Admin'
                                        : 'Sign In'}
                        </button>

                        {/* Toggle login/register (only for customer mode) */}
                        {loginMode === 'customer' && (
                            <p className="mt-4 text-center text-sm text-warm-gray">
                                {isRegister
                                    ? 'Already have an account?'
                                    : "Don't have an account?"}{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsRegister(!isRegister)}
                                    className="font-semibold text-burgundy hover:text-burgundy-dark"
                                >
                                    {isRegister ? 'Sign In' : 'Create Account'}
                                </button>
                            </p>
                        )}
                    </form>
                )}

                <p className="mt-6 text-center text-xs text-warm-gray">
                    By continuing, you agree to KSP Wines&apos; Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-cream flex items-center justify-center px-4">
                <div className="w-8 h-8 border-2 border-burgundy/30 border-t-burgundy rounded-full animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
