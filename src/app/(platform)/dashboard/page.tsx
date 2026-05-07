import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * /dashboard is the legacy "your stuff" page. In the social-feed pivot
 * the user's home is their public profile (/@<username>). We resolve
 * username from the auth.uid() → profiles join and 307 there.
 *
 * If profile doesn't exist yet (just signed up, hasn't set a username),
 * send them to /settings to claim one.
 */
export default async function DashboardRedirect() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const { data: profile } = await sb
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profile?.username) {
    redirect(`/u/${profile.username}`);
  }
  redirect("/settings");
}
