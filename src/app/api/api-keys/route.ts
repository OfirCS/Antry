/**
 * API key management for the authenticated builder.
 *
 * POST   /api/api-keys     — mint a new ant_live_<id>_<secret> token
 * DELETE /api/api-keys?id  — revoke a token (sets revoked_at)
 *
 * Both routes require an authenticated session (Supabase cookie). The
 * minted plaintext token is returned ONCE in the POST response — the
 * client must surface it to the user immediately because it can't be
 * retrieved later (we only store the HMAC).
 */

import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { mintApiKey } from "@/lib/mcp/auth";
import { apiKeyCreateSchema } from "@/lib/schemas";
import { zodErrorResponse } from "@/lib/api-errors";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // An empty body is allowed — the label defaults. Only a present-but-invalid
  // body is rejected with a uniform 400.
  let rawBody: unknown = {};
  try {
    const text = await req.text();
    if (text.trim()) rawBody = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "The request body must be valid JSON." },
      { status: 400 }
    );
  }
  const parsed = apiKeyCreateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }
  const { label } = parsed.data;

  try {
    const { token, id } = await mintApiKey({ builderId: user.id, label });
    return NextResponse.json({ token, id, label });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_builder_id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
