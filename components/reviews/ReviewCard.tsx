'use client';

import StarRating from './StarRating';
import { ThumbsUp, BadgeCheck } from 'lucide-react';
import { markReviewHelpful } from '@/lib/api';
import { useState } from 'react';

interface Review {
    review_id: string;
    rating: number;
    title?: string;
    body?: string;
    reviewer_name: string;
    is_verified_purchase?: boolean;
    helpful_count?: number;
    created_at: string;
}

interface ReviewCardProps {
    review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
    const [helpfulCount, setHelpfulCount] = useState(review.helpful_count ?? 0);
    const [marked, setMarked] = useState(false);

    const handleHelpful = async () => {
        if (marked) return;
        setMarked(true);
        setHelpfulCount(c => c + 1);
        await markReviewHelpful(review.review_id);
    };

    const dateStr = new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="border-b border-neutral-100 py-5 last:border-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <StarRating value={review.rating} size="sm" />
                    {review.title && (
                        <p className="mt-1.5 font-serif text-sm font-semibold text-neutral-800">
                            {review.title}
                        </p>
                    )}
                </div>
            </div>

            {/* Body */}
            {review.body && (
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                    {review.body}
                </p>
            )}

            {/* Footer */}
            <div className="mt-3 flex items-center gap-4 text-xs text-neutral-400">
                <span className="font-medium text-neutral-500">{review.reviewer_name}</span>
                <span>{dateStr}</span>

                {review.is_verified_purchase && (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <BadgeCheck size={13} />
                        Verified Purchase
                    </span>
                )}

                <button
                    onClick={handleHelpful}
                    disabled={marked}
                    className={`ml-auto flex items-center gap-1 transition-colors ${marked ? 'text-[#C5A46D]' : 'hover:text-[#C5A46D]'}`}
                >
                    <ThumbsUp size={13} />
                    Helpful{helpfulCount > 0 ? ` (${helpfulCount})` : ''}
                </button>
            </div>
        </div>
    );
}
