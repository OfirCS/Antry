# @antry/sdk

The official SDK for [Antry Receipts](https://antry.com) — programmatically post Briefs, list Receipts, search candidates, and verify signatures.

```bash
npm install @antry/sdk
```

## Quick start

```ts
import { Antry } from "@antry/sdk";

const antry = new Antry({ apiKey: process.env.ANTRY_API_KEY });

// Public read — no API key needed
const { data: briefs } = await antry.briefs.list({ company: "anthropic" });

// Company read — API key required
const { data: receipts } = await antry.receipts.list({
  company: "anthropic",
  min_score: 80,
});

// Natural-language candidate search
const { results } = await antry.candidates.search({
  q: "fast at tool taste with strong recovery",
});

// Verify any public Receipt
const verified = await antry.receipts.verify("rc_mara_anthropic_001");
console.log(verified.verified); // true if untampered
```

## Reference

| Method | Description |
|---|---|
| `briefs.list({ company?, difficulty?, limit? })` | List public Briefs |
| `briefs.get(slug)` | Get one Brief with full prompt + rubric |
| `receipts.list({ company, min_score?, limit? })` | List Receipts (API key required) |
| `receipts.verify(id)` | Verify a Receipt's signature |
| `candidates.search({ q, limit? })` | NLU candidate search |

## Errors

All methods throw `AntryError` on non-2xx responses:

```ts
import { AntryError } from "@antry/sdk";

try {
  await antry.receipts.list({});
} catch (err) {
  if (err instanceof AntryError) {
    console.log(err.status, err.code, err.message);
  }
}
```

## Configuration

```ts
new Antry({
  apiKey: "ant_live_...",
  baseUrl: "https://antry.com", // default
  timeoutMs: 15_000,            // default
  fetch: customFetch,           // for edge / SSR
});
```

## API keys

Generate a key at `https://antry.com/c/<your-slug>/api-keys`. Keys are scoped to one company; never share between environments. Format: `ant_<env>_<8-hex-id>_<32-char-secret>`.

## Why this SDK

- **Zero dependencies.** Works in Node, Deno, Bun, edge.
- **~250 LOC.** Read it. There's nothing hidden.
- **Strongly typed.** Every response shape is declared.
- **Receipts are verifiable.** The `verify` method confirms Antry signed the artifact you have. Cryptographic, not best-effort.

## License

MIT.
