import Image from "next/image";
import Rating from "./Rating";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    body: string;
    created_at: string;
    review_photos: { storage_path: string }[];
    author: {
      display_name: string;
      avatar_url: string;
    } | null;
  };
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const { rating, body, created_at, author, review_photos } = review;
  const authorName = author?.display_name || "Anonymous";
  const authorAvatar = author?.avatar_url;

  const getPublicUrl = (storagePath: string) => {
    // This is a simplified approach, assuming a consistent public URL structure.
    // For production, you might want a more robust way to get this URL.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/review-photos/${storagePath}`;
  };

  return (
    <article className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3">
            {authorAvatar ? (
              <Image
                src={authorAvatar}
                alt={authorName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500 font-bold">
                  {authorName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="text-sm inline-flex items-center font-semibold text-gray-900">
            {authorName}
          </div>
        </div>
        <span className="text-xs text-gray-600">
          {new Date(created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
      <div className="mb-4">
        <Rating rating={rating} />
      </div>
      <p className="mb-2 font-light text-gray-600">{body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
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
    </article>
  );
};

export default ReviewCard;
