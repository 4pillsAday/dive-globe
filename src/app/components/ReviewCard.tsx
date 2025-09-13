"use client";

import { useState } from "react";
import Image from "next/image";
import Rating from "./Rating";
import ReplyForm from "./ReplyForm";
import { useAuth } from "@/lib/auth/AuthContext";
import { HandThumbUpIcon, HandThumbDownIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid } from "@heroicons/react/24/solid";

interface Author {
  display_name: string;
  avatar_url: string;
  email: string;
}

interface Review {
  id: string;
  rating: number;
  body: string;
  created_at: string;
  parent_review_id?: string | null;
  thread_depth?: number;
  like_count?: number;
  dislike_count?: number;
  user_reaction?: 'like' | 'dislike' | null;
  review_photos: { storage_path: string }[];
  author: Author | null;
  replies?: Review[];
}

interface ReviewCardProps {
  review: Review;
  onReply: (body: string, parentReviewId: string) => Promise<void>;
  onReact: (reviewId: string, reaction: 'like' | 'dislike' | null) => Promise<void>;
  isNested?: boolean;
}

const ReviewCard = ({ review, onReply, onReact, isNested = false }: ReviewCardProps) => {
  const { rating, body, created_at, author, review_photos, like_count = 0, dislike_count = 0, user_reaction, replies = [] } = review;
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const { session } = useAuth();
  const user = session?.user;
  
  const authorName = author?.display_name || author?.email?.split("@")[0] || "Anonymous";
  const authorAvatar = author?.avatar_url;

  const getPublicUrl = (storagePath: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/review-photos/${storagePath}`;
  };

  const handleReplySubmit = async (body: string, parentId: string) => {
    if (!onReply) return;
    setIsSubmittingReply(true);
    try {
      await onReply(body, parentId);
      setShowReplyForm(false);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReaction = async (newReaction: 'like' | 'dislike') => {
    if (!onReact || !user) return;
    
    // If clicking the same reaction, remove it
    const reactionToSend = user_reaction === newReaction ? null : newReaction;
    await onReact(review.id, reactionToSend);
  };

  const isOwnReview = !!(user && author && user.email === author.email);

  return (
    <article className={`${isNested ? '' : 'mb-6'}`}>
      {/* Thread indicator for nested replies */}
      {isNested && (
        <div className="flex">
          <div className="w-12 flex justify-center">
            <div className="w-0.5 bg-gray-200 h-full"></div>
          </div>
          <div className="flex-1">
            {/* The actual review card */}
            <ReviewContent />
          </div>
        </div>
      )}
      {!isNested && <ReviewContent />}
      
      {/* Nested replies */}
      {replies.length > 0 && showReplies && (
        <div className="ml-12 mt-3 space-y-3">
          {replies.map((reply) => (
            <ReviewCard
              key={reply.id}
              review={reply}
              onReply={onReply}
              onReact={onReact}
              isNested={true}
            />
          ))}
        </div>
      )}
    </article>
  );

  function ReviewContent() {
    return (
      <div className={`p-6 bg-white ${isNested ? 'rounded-lg' : 'rounded-xl'} border border-gray-200 shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              {authorAvatar ? (
                <Image
                  src={authorAvatar}
                  alt={authorName}
                  width={isNested ? 36 : 40}
                  height={isNested ? 36 : 40}
                  className="rounded-full"
                />
              ) : (
                <div className={`${isNested ? 'w-9 h-9' : 'w-10 h-10'} bg-gray-200 rounded-full flex items-center justify-center`}>
                  <span className="text-gray-500 font-bold">
                    {authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {authorName}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
          {rating > 0 && (
            <div className="text-sm">
              <Rating rating={rating} />
            </div>
          )}
        </div>

        <p className={`${isNested ? 'text-sm' : ''} text-gray-700 mb-3`}>{body}</p>

        {/* Review photos */}
        {review_photos.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {review_photos.map((photo, index) => (
              <div key={index} className="overflow-hidden rounded-lg">
                <Image
                  src={getPublicUrl(photo.storage_path)}
                  alt={`review photo ${index + 1}`}
                  width={120}
                  height={120}
                  className="object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {/* Like button */}
            <button
              onClick={() => handleReaction('like')}
              disabled={!user || isOwnReview}
              className={`flex items-center space-x-1 text-sm ${
                user_reaction === 'like' 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-blue-600'
              } ${(!user || isOwnReview) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} transition-colors`}
            >
              {user_reaction === 'like' ? (
                <HandThumbUpSolid className="w-5 h-5" />
              ) : (
                <HandThumbUpIcon className="w-5 h-5" />
              )}
              <span className="font-medium">{like_count}</span>
            </button>

            {/* Dislike button */}
            <button
              onClick={() => handleReaction('dislike')}
              disabled={!user || isOwnReview}
              className={`flex items-center space-x-1 text-sm ${
                user_reaction === 'dislike' 
                  ? 'text-red-600' 
                  : 'text-gray-500 hover:text-red-600'
              } ${(!user || isOwnReview) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} transition-colors`}
            >
              {user_reaction === 'dislike' ? (
                <HandThumbDownSolid className="w-5 h-5" />
              ) : (
                <HandThumbDownIcon className="w-5 h-5" />
              )}
              <span className="font-medium">{dislike_count}</span>
            </button>

            {/* Reply button */}
            {(!isNested || (review.thread_depth !== undefined && review.thread_depth < 2)) && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <ChatBubbleLeftIcon className="w-5 h-5" />
                <span>Reply</span>
              </button>
            )}
          </div>

          {/* Toggle replies */}
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <ReplyForm
              parentReviewId={review.id}
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyForm(false)}
              isSubmitting={isSubmittingReply}
            />
          </div>
        )}
      </div>
    );
  }
};

export default ReviewCard;