"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

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

interface ReviewsProps {
  diveSiteSlug: string;
}

const Reviews = ({ diveSiteSlug }: ReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const { session, isLoading } = useAuth(); // Use session from context
  const user = session?.user ?? null; // Derive user from session
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      const res = await fetch(`/app/api/dives/${diveSiteSlug}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        console.error("[Reviews] Failed to fetch reviews:", res.status, res.statusText);
      }
      setLoadingReviews(false);
    };

    fetchReviews();
  }, [diveSiteSlug]);

  const handleReviewSubmit = async (
    rating: number,
    body: string,
    photos: File[],
    parentReviewId?: string
  ) => {
    setIsSubmitting(true);

    const uploadedPhotos: { storage_path: string }[] = [];

    if (photos.length > 0 && window.supabase) {
      for (const photo of photos) {
        const fileName = `${user!.id}/${Date.now()}-${photo.name}`;
        const { data, error } = await window.supabase.storage
          .from("review-photos")
          .upload(fileName, photo);

        if (error) {
          console.error("Error uploading photo:", error);
          continue;
        }
        uploadedPhotos.push({ storage_path: data.path });
      }
    }

    console.log('[handleReviewSubmit] Submitting:', { rating, body, parentReviewId });

    try {
      const res = await fetch(`/app/api/dives/${diveSiteSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, body, photos: uploadedPhotos, parentReviewId }),
      });

      const responseData = await res.json();
      console.log('[handleReviewSubmit] Response:', res.status, responseData);

      if (res.ok) {
        const newReviewWithPhotos = {
          ...responseData,
          review_photos: uploadedPhotos,
        };

        if (parentReviewId) {
          // Add reply to the parent review
          setReviews(reviews.map(review => {
            if (review.id === parentReviewId) {
              return {
                ...review,
                replies: [...(review.replies || []), newReviewWithPhotos]
              };
            }
            return review;
          }));
        } else {
          // Add new top-level review
          setReviews([newReviewWithPhotos, ...reviews]);
        }
        
        // Stats will be updated via database trigger
      } else {
        console.error("[handleReviewSubmit] Error:", responseData);
        alert(`Failed to submit: ${responseData.message || 'Unknown error'}\n\nDetails: ${JSON.stringify(responseData.error || {})}`);
      }
    } catch (error) {
      console.error("[handleReviewSubmit] Caught error:", error);
      alert('Failed to submit. Please check the console for details.');
    }
    setIsSubmitting(false);
  };

  const handleReply = async (body: string, parentReviewId: string) => {
    // For replies, we use rating=0 as they don't have ratings
    await handleReviewSubmit(0, body, [], parentReviewId);
  };

  const handleReaction = async (reviewId: string, reaction: 'like' | 'dislike' | null) => {
    if (!user) return;

    const url = `/app/api/dives/${diveSiteSlug}/reviews/${reviewId}/react`;
    
    try {
      let res;
      if (reaction === null) {
        // Remove reaction
        res = await fetch(url, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
      } else {
        // Add or update reaction
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reaction }),
        });
      }

      if (res.ok) {
        const { counts } = await res.json();
        
        // Update the review with new reaction counts
        const updateReviewReaction = (reviews: Review[]): Review[] => {
          return reviews.map(review => {
            if (review.id === reviewId) {
              return {
                ...review,
                user_reaction: reaction,
                like_count: counts.like_count,
                dislike_count: counts.dislike_count,
              };
            }
            // Also check nested replies
            if (review.replies) {
              return {
                ...review,
                replies: updateReviewReaction(review.replies)
              };
            }
            return review;
          });
        };

        setReviews(updateReviewReaction(reviews));
      }
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  return (
    <div className="bg-white antialiased rounded-xl">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-black">
            Site Reviews
          </h2>
        </div>

        {isLoading ? (
          // Show a simple loading state while session is being determined
          <div className="text-center p-8">
            <p>Loading...</p>
          </div>
        ) : user ? (
          <ReviewForm onSubmit={handleReviewSubmit} isSubmitting={isSubmitting} />
        ) : (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 rounded-r-lg">
            <div className="flex">
              <div className="py-1">
                <svg
                  className="w-6 h-6 text-blue-500 mr-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold text-blue-800">
                  Want to share your experience?
                </p>
                <p className="text-sm text-blue-700">
                  <a
                    href={`/log-in?redirect=/app${pathname}`}
                    className="font-semibold underline"
                  >
                    Log in
                  </a>{" "}
                  to leave a review and help other divers.
                </p>
              </div>
            </div>
          </div>
        )}

        {loadingReviews ? (
          <div className="text-center p-8">
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="mt-8 space-y-6">
            {reviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onReply={handleReply}
                onReact={handleReaction}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-6 bg-gray-50 rounded-lg mt-6">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              ></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No reviews yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Be the first to share your thoughts on this dive site!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
