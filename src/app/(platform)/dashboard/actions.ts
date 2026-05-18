"use server";

/**
 * Dashboard server actions.
 *
 * The dashboard page is a client component, so it cannot call the
 * server-only `getRecommendedBuilders` engine (which reads cookies via the
 * Supabase server client) directly. This thin `"use server"` wrapper makes
 * it callable from the client.
 */

import {
  getRecommendedBuilders,
  type RecommendedBuilder,
} from "@/lib/recommendations";
import { createClient } from "@/lib/supabase/server";

export type { RecommendedBuilder };

/**
 * Fetch recommended builders for the currently signed-in user.
 *
 * Resolves the viewer from the server-side session rather than trusting a
 * client-supplied id, then delegates ranking to the recommendations engine.
 * Never throws — returns an empty array on any failure.
 */
export async function fetchRecommendedBuilders(
  limit = 3,
): Promise<RecommendedBuilder[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return await getRecommendedBuilders(user?.id ?? null, limit);
  } catch {
    return [];
  }
}
