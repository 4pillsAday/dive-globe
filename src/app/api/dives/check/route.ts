import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  try {
    // Count total dive sites
    const { count, error } = await supabase
      .from("dive_sites")
      .select("*", { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    // Check for specific slugs
    const testSlugs = ["blue-hole-dahab", "andros-blue-holes-bahamas", "great-blue-hole"];
    const slugChecks: Record<string, boolean> = {};

    for (const slug of testSlugs) {
      const { data } = await supabase
        .from("dive_sites")
        .select("id")
        .eq("slug", slug)
        .single();
      
      slugChecks[slug] = !!data;
    }

    return NextResponse.json({
      totalDiveSites: count || 0,
      message: count === 0 
        ? "No dive sites found. Please populate the database by calling POST /app/api/dives/populate" 
        : `Found ${count} dive sites`,
      sampleSlugsExist: slugChecks,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error checking dive sites", error },
      { status: 500 }
    );
  }
}
