'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyEmail } from '@/lib/api';
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
    const [message, setMessage] = useState('');
    const verificationAttempted = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus('idle');
            return;
        }

        if (verificationAttempted.current) return;
        verificationAttempted.current = true;

        const performVerification = async () => {
            setStatus('loading');
            try {
                const result = await verifyEmail(token);
                if (result?.success) {
                    setStatus('success');
                    setMessage('Your email has been successfully verified!');
                } else {
                    setStatus('error');
                    setMessage(result?.error || result?.message || 'Verification failed');
                }
            } catch (error) {
                console.error('Email verification error:', error);
                setStatus('error');
                setMessage('Server error. Please try again later.');
            }
        };

        performVerification();
    }, [token]);

    return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-md text-center">

                {status === 'idle' && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-burgundy/10 flex items-center justify-center">
                            <Mail className="w-10 h-10 text-burgundy" />
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-charcoal mb-4">
                            Check Your Email
                        </h1>
                        <p className="text-sm text-warm-gray mb-8">
                            We've sent a verification link to your email address. Please click the link to verify your account.
                        </p>
                        <Link
                            href="/account"
                            className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-charcoal py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800"
                        >
                            Go to My Account
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </>
                )}

                {status === 'loading' && (
                    <>
                        <Loader2 className="w-16 h-16 mx-auto mb-6 text-burgundy animate-spin" />
                        <h1 className="font-serif text-2xl font-bold text-charcoal mb-4">
                            Verifying Email...
                        </h1>
                        <p className="text-sm text-warm-gray">
                            Please wait while we verify your email address.
                        </p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-charcoal mb-4">
                            Verified!
                        </h1>
                        <p className="text-sm text-warm-gray mb-8">
                            {message}
                        </p>
                        <Link
                            href="/account"
                            className="inline-flex items-center justify-center w-full rounded-lg bg-burgundy py-3 text-sm font-semibold text-white transition-all hover:bg-burgundy-dark"
                        >
                            Continue to My Account
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-charcoal mb-4">
                            Verification Failed
                        </h1>
                        <p className="text-sm text-warm-gray mb-8">
                            {message}
                        </p>
                        <Link
                            href="/account"
                            className="inline-flex items-center justify-center w-full rounded-lg bg-charcoal py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800"
                        >
                            Go to My Account to Request New Link
                        </Link>
                    </>
                )}

            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-cream flex items-center justify-center px-4">
                <div className="w-8 h-8 border-2 border-burgundy/30 border-t-burgundy rounded-full animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
