import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { FALLBACK_SITES } from "@/lib/webflow";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();

  try {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log('🏊 Starting to populate dive sites...');
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors: Array<{ slug: string; error: unknown }> = [];

    for (const site of FALLBACK_SITES) {
      try {
        // Check if site already exists
        const { data: existing } = await supabase
          .from('dive_sites')
          .select('id')
          .eq('slug', site.slug)
          .single();

        if (existing) {
          console.log(`⏭️  Skipping ${site.slug} - already exists`);
          skippedCount++;
          continue;
        }

        // Insert the dive site
        const { error } = await supabase
          .from('dive_sites')
          .insert({
            slug: site.slug,
            name: site.name,
            description: site.description || '',
            location_country: site.country || '',
            lat: site.lat,
            lng: site.lng,
            depth_m: site.maxDepth || null,
            features: site.highlights || [],
            webflow_item_id: site.id || null,
          });

        if (error) {
          console.error(`❌ Error inserting ${site.slug}:`, error);
          errors.push({ slug: site.slug, error });
          errorCount++;
        } else {
          console.log(`✅ Inserted ${site.slug}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Unexpected error for ${site.slug}:`, err);
        errors.push({ slug: site.slug, error: err });
        errorCount++;
      }
    }

    return NextResponse.json({
      message: 'Dive sites population completed',
      summary: {
        total: FALLBACK_SITES.length,
        inserted: successCount,
        skipped: skippedCount,
        errors: errorCount,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error populating dive sites", error },
      { status: 500 }
    );
  }
}
