import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Ensure profile exists
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!profile) {
          await supabase.from('profiles').insert({
            id: user.id,
            display_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to home
  return NextResponse.redirect(`${origin}/`);
}
