# Antry — visual tour

Captured 2026-05-06 against `localhost:3002` after commit `a3b8632`.
1280×900 viewport, 1.5× DPR.

| # | File | Surface |
|---|---|---|
| 01 | [`01-landing.png`](./01-landing.png) | Landing page — editorial hero with real Receipt embedded |
| 02 | [`02-briefs.png`](./02-briefs.png) | Briefs gallery — sponsor-tinted cards |
| 03 | [`03-brief-detail.png`](./03-brief-detail.png) | Brief detail — constraints panel + ideal Fingerprint sidebar |
| 04 | [`04-missions.png`](./04-missions.png) | Builder mission inbox — quota meter (8/month, free) |
| 05 | [`05-candidates-dashboard.png`](./05-candidates-dashboard.png) | Company candidates dashboard — ranked Receipts table |
| 06 | [`06-brief-templates.png`](./06-brief-templates.png) | Brief authoring — 5 quick-start templates + blank |
| 07 | [`07-api-keys.png`](./07-api-keys.png) | API keys management page (HMAC-only storage) |
| 08 | [`08-company-signup.png`](./08-company-signup.png) | Company signup `/c/start?plan=growth` (3-step) |
| 09 | [`09-pricing-freemium.png`](./09-pricing-freemium.png) | Pricing — Free / Growth $499 / Enterprise $2,499 |
| 10 | [`10-receipt-with-footprint.png`](./10-receipt-with-footprint.png) | Receipt artifact — composite, Fingerprint, footprint |
| 11 | [`11-lab-chat-tab.png`](./11-lab-chat-tab.png) | Lab — Chat tab (gateway-streamed conversation) |
| 12 | [`12-lab-code-tab.png`](./12-lab-code-tab.png) | Lab — Code tab (TypeScript editor + sandbox runner) |
| 13 | [`13-lab-preview-tab.png`](./13-lab-preview-tab.png) | Lab — Preview tab (HTML iframe, embeds in Receipt) |
| 14 | [`14-lab-tests-run.png`](./14-lab-tests-run.png) | Lab — after running tests against Brief suite |
| 15 | [`15-api-response.png`](./15-api-response.png) | `/api/v1/briefs` JSON response |

## How these were captured

```bash
node /tmp/full-tour.mjs
```

Playwright headless Chromium, navigates each route, waits for network
idle + 900ms for animations, screenshots full-fold (not full-page).
Lab interactions: click tab → wait → screenshot. Run-tests: click
button → wait 2.2s for sandbox + judge → screenshot.

To recapture after future changes, the script lives at `/tmp/full-tour.mjs`
in the dev container (or rewrite from this README in any environment
with Playwright + a running dev server).
