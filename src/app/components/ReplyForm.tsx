"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth/AuthContext";

interface ReplyFormProps {
  parentReviewId: string;
  onSubmit: (body: string, parentReviewId: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ReplyForm = ({ parentReviewId, onSubmit, onCancel, isSubmitting }: ReplyFormProps) => {
  const [body, setBody] = useState("");
  const { session } = useAuth();
  const user = session?.user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !user) return;

    await onSubmit(body, parentReviewId);
    setBody("");
  };

  if (!user) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
        Please log in to reply
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            {user.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt="Your avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {(user.user_metadata?.name || user.email || "?").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Reply Input */}
          <div className="flex-grow">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none placeholder-gray-500"
              rows={2}
              disabled={isSubmitting}
              required
              minLength={2}
              maxLength={500}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 ml-11">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !body.trim()}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Posting..." : "Reply"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ReplyForm;
