import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ images: [] });
  }

  const supabase = createClient(url, key);
  const { searchParams } = new URL(req.url);
  const courseSlug = searchParams.get("courseSlug") || "";
  const type = searchParams.get("type") || "youtube";

  const path = `courses/${courseSlug}/images`;

  const { data, error } = await supabase.storage
    .from("course-assets")
    .list(path, { limit: 200 });

  if (error || !data) {
    return NextResponse.json({ images: [] });
  }

  const images = data
    .filter((f) => f.name.match(/\.(png|jpg|jpeg|webp)$/i))
    .map((f) => ({
      name: f.name,
      url: `${url}/storage/v1/object/public/course-assets/${path}/${f.name}`,
    }));

  // Also check territory images
  const { data: territoryData } = await supabase.storage
    .from("course-assets")
    .list("territories", { limit: 200 });

  const territoryImages = (territoryData || [])
    .filter((f) => f.name.match(/\.(png|jpg|jpeg|webp)$/i))
    .map((f) => ({
      name: f.name,
      url: `${url}/storage/v1/object/public/course-assets/territories/${f.name}`,
    }));

  return NextResponse.json({ images: [...images, ...territoryImages] });
}
