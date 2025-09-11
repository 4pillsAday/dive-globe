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

    const { data: siteStats, error: siteStatsError } = await supabase
      .from("site_stats")
      .select("avg_rating, review_count")
      .eq("site_id", diveSite.id)
      .single();

    if (siteStatsError) {
      // if no stats row exists yet, return zero values
      if (siteStatsError.code === "PGRST116") {
        return NextResponse.json({
          avg_rating: 0,
          review_count: 0,
        });
      }
      throw siteStatsError;
    }

    return NextResponse.json(siteStats);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching site stats", error },
      { status: 500 }
    );
  }
}
