import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchProfileMap } from "@/lib/supabase/profiles";
import { MAX_BOOKMARKS } from "@/lib/supabase/bookmarks";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("build_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!bookmarks || bookmarks.length === 0) {
    return NextResponse.json({ bookmarks: [] });
  }

  const buildIds = bookmarks.map((b) => b.build_id);
  const { data: builds } = await supabase
    .from("published_builds")
    .select("*")
    .in("id", buildIds);

  const userIds = [...new Set((builds ?? []).map((b) => b.user_id))];
  const profileMap = await fetchProfileMap(supabase, userIds);

  const buildsWithProfiles = (builds ?? []).map((b) => ({
    ...b,
    profiles: profileMap[b.user_id] ?? null,
  }));

  const result = bookmarks.map((bm) => ({
    ...bm,
    published_builds: buildsWithProfiles.find((b) => b.id === bm.build_id) ?? null,
  }));

  return NextResponse.json({ bookmarks: result });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { build_id } = await request.json();

  if (!build_id || typeof build_id !== "string") {
    return NextResponse.json({ error: "Missing or invalid build_id" }, { status: 400 });
  }

  const { count } = await supabase
    .from("bookmarks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= MAX_BOOKMARKS) {
    return NextResponse.json(
      { error: `Bookmark limit (${MAX_BOOKMARKS}) reached` },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({ user_id: user.id, build_id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookmark: data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { build_id } = await request.json();

  if (!build_id || typeof build_id !== "string") {
    return NextResponse.json({ error: "Missing or invalid build_id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("build_id", build_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
