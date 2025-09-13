// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }) {
  const supabase = await createClient();

  try {
    const { data: diveSite, error: diveSiteError } = await supabase
      .from("dive_sites")
      .select("id")
      .eq("slug", params.slug)
      .single();

    if (diveSiteError) {
      return NextResponse.json(
        { message: "Dive site not found", error: diveSiteError },
        { status: 404 }
      );
    }

    // Get the current user to check their reactions
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch only top-level reviews (parent_review_id is null)
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        body,
        created_at,
        parent_review_id,
        thread_depth,
        like_count,
        dislike_count,
        review_photos (
          storage_path
        ),
        author:users!author_id (
          display_name,
          avatar_url,
          email
        ),
        replies:reviews!parent_review_id (
          id,
          rating,
          body,
          created_at,
          thread_depth,
          like_count,
          dislike_count,
          author:users!author_id (
            display_name,
            avatar_url,
            email
          ),
          review_photos (
            storage_path
          )
        )
      `
      )
      .eq("site_id", diveSite.id)
      .is("parent_review_id", null)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      throw reviewsError;
    }

    // If user is logged in, fetch their reactions for all reviews
    const userReactions = new Map();
    if (user) {
      const reviewIds = reviews?.flatMap(r => [
        r.id,
        ...(r.replies?.map(reply => reply.id) || [])
      ]) || [];

      if (reviewIds.length > 0) {
        const { data: reactions } = await supabase
          .from("review_reactions")
          .select("review_id, reaction")
          .eq("user_id", user.id)
          .in("review_id", reviewIds);

        reactions?.forEach(r => {
          userReactions.set(r.review_id, r.reaction);
        });
      }
    }

    // Add user's reaction to each review
    const reviewsWithReactions = reviews?.map(review => ({
      ...review,
      user_reaction: userReactions.get(review.id) || null,
      replies: review.replies?.map(reply => ({
        ...reply,
        user_reaction: userReactions.get(reply.id) || null
      })) || []
    }));

    return NextResponse.json(reviewsWithReactions);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching reviews", error },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { rating, body, photos, parentReviewId } = await req.json();

    if (!rating || !body) {
      return NextResponse.json(
        { message: "Rating and body are required" },
        { status: 400 }
      );
    }

    // Validate parent review if provided
    if (parentReviewId) {
      const { data: parentReview, error: parentError } = await supabase
        .from("reviews")
        .select("id, site_id, thread_depth")
        .eq("id", parentReviewId)
        .single();

      if (parentError || !parentReview) {
        return NextResponse.json(
          { message: "Parent review not found" },
          { status: 404 }
        );
      }

      // Check if parent review belongs to the same site
      if (parentReview.site_id !== diveSite.id) {
        return NextResponse.json(
          { message: "Parent review does not belong to this dive site" },
          { status: 400 }
        );
      }

      // Check thread depth limit (handled by trigger, but good to check here too)
      if (parentReview.thread_depth >= 2) {
        return NextResponse.json(
          { message: "Maximum reply depth reached" },
          { status: 400 }
        );
      }
    }

    const { data: diveSite, error: diveSiteError } = await supabase
      .from("dive_sites")
      .select("id")
      .eq("slug", params.slug)
      .single();

    if (diveSiteError) {
      return NextResponse.json(
        { message: "Dive site not found", error: diveSiteError },
        { status: 404 }
      );
    }

    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert([
        {
          site_id: diveSite.id,
          author_id: user.id,
          rating,
          body,
          parent_review_id: parentReviewId || null,
        },
      ])
      .select(`
        id,
        rating,
        body,
        created_at,
        parent_review_id,
        thread_depth,
        like_count,
        dislike_count,
        author:users!author_id (
          display_name,
          avatar_url,
          email
        )
      `)
      .single();

    if (reviewError) {
      throw reviewError;
    }

    if (photos && photos.length > 0) {
      const photoRecords = photos.map((photo: { storage_path: string }) => ({
        review_id: review.id,
        storage_path: photo.storage_path,
      }));

      const { error: photosError } = await supabase
        .from("review_photos")
        .insert(photoRecords);

      if (photosError) {
        // If photo insert fails, we might want to delete the review
        // For simplicity now, we'll just log the error
        console.error("Error inserting review photos:", photosError);
      }
    }

    // Add empty user_reaction field for consistency with GET response
    const reviewWithReaction = {
      ...review,
      user_reaction: null,
      replies: []
    };

    return NextResponse.json(reviewWithReaction, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating review", error },
      { status: 500 }
    );
  }
}
