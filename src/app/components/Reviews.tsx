"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

interface Review {
  id: string;
  rating: number;
  body: string;
  created_at: string;
  review_photos: { storage_path: string }[];
  author: {
    display_name: string;
    avatar_url: string;
  } | null;
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

  console.log('[Reviews] Component rendered:', {
    isLoading,
    hasSession: !!session,
    hasUser: !!user,
    userEmail: user?.email,
    pathname
  });

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      const res = await fetch(`/api/dives/${diveSiteSlug}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
      setLoadingReviews(false);
    };

    fetchReviews();
  }, [diveSiteSlug]);

  const handleReviewSubmit = async (
    rating: number,
    body: string,
    photos: File[]
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
          // continue to next photo
          continue;
        }
        uploadedPhotos.push({ storage_path: data.path });
      }
    }

    const res = await fetch(`/api/dives/${diveSiteSlug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, body, photos: uploadedPhotos }),
    });

    if (res.ok) {
      const newReview = await res.json();
      const newReviewWithAuthor = {
        ...newReview,
        review_photos: uploadedPhotos, // Add photos for immediate display
        author: {
          display_name: user?.user_metadata.display_name || "You",
          avatar_url: user?.user_metadata.avatar_url || "",
        },
      };

      setReviews([newReviewWithAuthor, ...reviews]);
    } else {
      console.error("Failed to submit review");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white antialiased">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Community Reviews
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
                    href={`/log-in?redirect=${pathname}`}
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
              <ReviewCard key={review.id} review={review} />
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
