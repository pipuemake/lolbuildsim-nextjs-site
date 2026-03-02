"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

function getSupabase(): SupabaseClient | null {
  try {
    return createClient();
  } catch {
    return null;
  }
}

/** Shared hook for auth state — used by AuthButton and useUser */
function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabaseRef.current = supabase;

    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!cancelled) {
        setUser(user ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, supabaseRef };
}

interface AuthButtonProps {
  locale: string;
}

export function AuthButton({ locale }: AuthButtonProps) {
  const { user, loading, supabaseRef } = useAuthState();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = useCallback(async (provider: "google" | "discord") => {
    setMenuOpen(false);
    const supabase = supabaseRef.current;
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${window.location.pathname}`,
      },
    });
  }, [supabaseRef]);

  const handleLogout = useCallback(async () => {
    setMenuOpen(false);
    const supabase = supabaseRef.current;
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabaseRef]);

  if (loading) {
    return (
      <div className="w-16 h-7 rounded bg-secondary/40 animate-pulse" />
    );
  }

  if (user) {
    const displayName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "User";

    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border transition-colors"
        >
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt=""
              className="w-4 h-4 rounded-full"
            />
          )}
          <span className="max-w-[80px] truncate">{displayName}</span>
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded shadow-lg py-1 min-w-[120px]">
              <button
                onClick={handleLogout}
                className="w-full text-left text-xs px-3 py-1.5 hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                {locale === "ja" ? "ログアウト" : "Logout"}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="text-xs px-2 py-1 rounded bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border transition-colors"
      >
        {locale === "ja" ? "ログイン" : "Login"}
      </button>
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded shadow-lg py-1 min-w-[160px]">
            <button
              onClick={() => handleLogin("google")}
              className="w-full text-left text-xs px-3 py-1.5 hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              Google {locale === "ja" ? "でログイン" : "Login"}
            </button>
            <button
              onClick={() => handleLogin("discord")}
              className="w-full text-left text-xs px-3 py-1.5 hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              Discord {locale === "ja" ? "でログイン" : "Login"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** Hook to get current user — reuses the same singleton Supabase client */
export function useUser() {
  const { user, loading } = useAuthState();
  return { user, loading };
}
