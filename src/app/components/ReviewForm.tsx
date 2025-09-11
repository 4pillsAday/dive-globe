"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ReviewFormProps {
  onSubmit: (
    rating: number,
    body: string,
    photos: File[]
  ) => Promise<void>;
  isSubmitting: boolean;
}

const ReviewForm = ({ onSubmit, isSubmitting }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setPhotos((prevPhotos) => [...prevPhotos, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPhotoPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
    setPhotoPreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (rating > 0 && body.trim().length > 0) {
      await onSubmit(rating, body, photos);
      setRating(0);
      setBody("");
      setPhotos([]);
      setPhotoPreviews([]);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200">
        <label htmlFor="comment" className="sr-only">
          Your review
        </label>
        <textarea
          id="comment"
          rows={6}
          className="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none"
          placeholder="Write a review..."
          value={body}
          onChange={handleTextChange}
          required
        ></textarea>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-7 h-7 cursor-pointer transition-colors duration-150 ${
                (hoverRating || rating) > i
                  ? "text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              onMouseEnter={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRatingClick(i + 1)}
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          ))}
        </div>
        <button
          type="submit"
          className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-600 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting || rating === 0 || body.trim() === ""}
        >
          {isSubmitting ? "Submitting..." : "Post Review"}
        </button>
      </div>
      <div className="mt-4">
        <label
          htmlFor="photo-upload"
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Add Photos
        </label>
        <input
          id="photo-upload"
          name="photo-upload"
          type="file"
          className="sr-only"
          multiple
          accept="image/*"
          onChange={handlePhotoChange}
          ref={fileInputRef}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {photoPreviews.map((preview, index) => (
            <div key={index} className="relative">
              <Image
                src={preview}
                alt={`preview ${index}`}
                width={80}
                height={80}
                className="rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-md hover:bg-red-700 transition-colors"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};

export default ReviewForm;
