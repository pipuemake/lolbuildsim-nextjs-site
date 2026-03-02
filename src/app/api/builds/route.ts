import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchProfileMap } from "@/lib/supabase/profiles";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const championId = searchParams.get("champion");
  const lane = searchParams.get("lane");
  const role = searchParams.get("role");
  const search = searchParams.get("search");
  const userId = searchParams.get("user");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);
  const offset = Number(searchParams.get("offset") ?? 0);

  const supabase = await createClient();

  let query = supabase
    .from("published_builds")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (championId) query = query.eq("champion_id", championId);
  if (lane) query = query.eq("lane", lane);
  if (role) query = query.eq("role", role);
  if (userId) query = query.eq("user_id", userId);
  if (search) query = query.ilike("build_name", `%${search}%`);

  const { data: builds, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = [...new Set((builds ?? []).map((b) => b.user_id))];
  const profileMap = await fetchProfileMap(supabase, userIds);

  const buildsWithProfiles = (builds ?? []).map((b) => ({
    ...b,
    profiles: profileMap[b.user_id] ?? null,
  }));

  return NextResponse.json({ builds: buildsWithProfiles, total: count ?? 0 });
}

const MAX_PUBLISHED_BUILDS = 20;
const ADMIN_USER_ID = process.env.ADMIN_USER_ID ?? "";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { champion_id, build_name, level, items, runes, lane, role, spells } = body;

  if (!champion_id || !build_name || !level || !items || !runes) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Validate field constraints
  if (typeof build_name !== "string" || build_name.length > 100) {
    return NextResponse.json({ error: "Invalid build name" }, { status: 400 });
  }
  if (typeof champion_id !== "string" || champion_id.length > 30) {
    return NextResponse.json({ error: "Invalid champion" }, { status: 400 });
  }
  if (typeof level !== "number" || level < 1 || level > 18 || !Number.isInteger(level)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length > 6) {
    return NextResponse.json({ error: "Invalid items" }, { status: 400 });
  }

  // Per-user build limit (admin is unlimited)
  if (user.id !== ADMIN_USER_ID) {
    const { count } = await supabase
      .from("published_builds")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count ?? 0) >= MAX_PUBLISHED_BUILDS) {
      return NextResponse.json(
        { error: "Build limit reached", max: MAX_PUBLISHED_BUILDS },
        { status: 429 },
      );
    }
  }

  const { data, error } = await supabase
    .from("published_builds")
    .insert({
      user_id: user.id,
      champion_id,
      build_name,
      level,
      items,
      runes,
      lane: lane ?? null,
      role: role ?? null,
      spells: spells ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Build insert failed:", error);
    return NextResponse.json({ error: "Failed to create build" }, { status: 500 });
  }

  return NextResponse.json({ build: data });
}
