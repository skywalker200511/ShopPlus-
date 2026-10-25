/**
 * Demo mode is activated when Supabase credentials are not configured.
 * In demo mode, the app uses in-memory data and local state.
 */

export function isDemoMode(): boolean {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co" ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "your-anon-key-here"
  );
}

export const DEMO_MODE_BANNER = "You are viewing demo data. Connect Supabase to use real data.";
