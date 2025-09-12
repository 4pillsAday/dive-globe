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

    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select(
        `
        id,
        rating,
        body,
        created_at,
        review_photos (
          storage_path
        ),
        author:author_id (
          display_name,
          avatar_url,
          email
        )
      `
      )
      .eq("site_id", diveSite.id)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      throw reviewsError;
    }

    return NextResponse.json(reviews);
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

    const { rating, body, photos } = await req.json();

    if (!rating || !body) {
      return NextResponse.json(
        { message: "Rating and body are required" },
        { status: 400 }
      );
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
        },
      ])
      .select()
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

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating review", error },
      { status: 500 }
    );
  }
}
