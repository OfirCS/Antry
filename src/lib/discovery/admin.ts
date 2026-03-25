/**
 * Admin check using ADMIN_USER_IDS env var.
 * Returns true if the given Supabase user ID is in the comma-separated list.
 */
export function isAdmin(userId: string): boolean {
  const adminIds =
    process.env.ADMIN_USER_IDS ||
    process.env.NEXT_PUBLIC_ADMIN_USER_IDS ||
    "";
  return adminIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .includes(userId);
}
