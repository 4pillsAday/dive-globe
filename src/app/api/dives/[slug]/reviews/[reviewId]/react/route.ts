import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/dives/[slug]/reviews/[reviewId]/react
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; reviewId: string }> }
) {
  const { reviewId } = await params;
  const supabase = await createClient();

  try {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { reaction } = await req.json();

    if (!reaction || !["like", "dislike"].includes(reaction)) {
      return NextResponse.json(
        { message: "Invalid reaction type" },
        { status: 400 }
      );
    }

    // Verify the review exists
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("id, author_id")
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { message: "Review not found" },
        { status: 404 }
      );
    }

    // Prevent users from reacting to their own reviews
    if (review.author_id === user.id) {
      return NextResponse.json(
        { message: "Cannot react to your own review" },
        { status: 400 }
      );
    }

    // Insert or update reaction (upsert)
    const { data, error } = await supabase
      .from("review_reactions")
      .upsert(
        {
          review_id: reviewId,
          user_id: user.id,
          reaction,
        },
        {
          onConflict: "review_id,user_id",
        }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Get updated counts
    const { data: updatedReview } = await supabase
      .from("reviews")
      .select("like_count, dislike_count")
      .eq("id", reviewId)
      .single();

    return NextResponse.json({
      reaction: data,
      counts: {
        like_count: updatedReview?.like_count || 0,
        dislike_count: updatedReview?.dislike_count || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating reaction", error },
      { status: 500 }
    );
  }
}

// DELETE /api/dives/[slug]/reviews/[reviewId]/react
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; reviewId: string }> }
) {
  const { reviewId } = await params;
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Delete the reaction
    const { error } = await supabase
      .from("review_reactions")
      .delete()
      .eq("review_id", reviewId)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    // Get updated counts
    const { data: updatedReview } = await supabase
      .from("reviews")
      .select("like_count, dislike_count")
      .eq("id", reviewId)
      .single();

    return NextResponse.json({
      counts: {
        like_count: updatedReview?.like_count || 0,
        dislike_count: updatedReview?.dislike_count || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error removing reaction", error },
      { status: 500 }
    );
  }
}