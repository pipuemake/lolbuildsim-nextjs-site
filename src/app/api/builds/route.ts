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

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { champion_id, build_name, level, items, runes, lane, role, spells } = body;

  if (!champion_id || !build_name || !level || !items || !runes) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ build: data });
}
