/**
 * Shared API error helpers.
 *
 * Centralizes the shape of 400 responses for failed zod validation so every
 * route returns an identical, predictable payload:
 *
 *   { error: "invalid_request", message, details }
 *
 * `details` is zod's flattened error tree (fieldErrors + formErrors).
 *
 * Usage in a route handler:
 *
 *   const parsed = mySchema.safeParse(body);
 *   if (!parsed.success) return zodErrorResponse(parsed.error);
 *
 * Or, when validating untrusted JSON in one step:
 *
 *   const result = parseJsonBody(body, mySchema);
 *   if (!result.ok) return result.response;
 *   const data = result.data;
 */

import { NextResponse } from "next/server";
import { z, type ZodError, type ZodType } from "zod";

/**
 * Build a uniform 400 response from a ZodError.
 *
 * @param error - The ZodError produced by `.safeParse()`.
 * @param extraHeaders - Optional headers merged into the response (e.g. CORS).
 */
export function zodErrorResponse(
  error: ZodError,
  extraHeaders: Record<string, string> = {}
): NextResponse {
  return NextResponse.json(
    {
      error: "invalid_request",
      message: "The request failed validation. See `details` for field-level errors.",
      details: z.flattenError(error),
    },
    { status: 400, headers: extraHeaders }
  );
}

/**
 * Validate already-parsed data against a schema.
 *
 * Returns a discriminated result: `{ ok: true, data }` on success, or
 * `{ ok: false, response }` carrying a ready-to-return 400 NextResponse.
 */
export function validate<T>(
  schema: ZodType<T>,
  data: unknown,
  extraHeaders: Record<string, string> = {}
):
  | { ok: true; data: T }
  | { ok: false; response: NextResponse } {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, response: zodErrorResponse(parsed.error, extraHeaders) };
  }
  return { ok: true, data: parsed.data };
}

/**
 * Parse a Request body as JSON and validate it against a schema in one step.
 *
 * Returns `{ ok: true, data }` or `{ ok: false, response }`, where `response`
 * is a 400 for malformed JSON or a 400 for schema-validation failure.
 */
export async function parseJsonBody<T>(
  req: Request,
  schema: ZodType<T>,
  extraHeaders: Record<string, string> = {}
): Promise<
  | { ok: true; data: T }
  | { ok: false; response: NextResponse }
> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "invalid_json",
          message: "The request body must be valid JSON.",
        },
        { status: 400, headers: extraHeaders }
      ),
    };
  }
  return validate(schema, raw, extraHeaders);
}

/**
 * Pagination query schema shared by public list endpoints.
 *
 * `limit` is clamped to 1-100 (default 50); `offset` is >= 0 (default 0).
 * Coerces from string query params.
 */
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type Pagination = z.infer<typeof paginationSchema>;
