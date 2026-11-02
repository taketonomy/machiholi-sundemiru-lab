# Changelog

## v0.4.0 — 2026-11-02

Live Claude draft for the owner entry point, per [spec-v0.3.md](spec-v0.3.md) P1, and Vercel hosting preparation.

### Implemented

- `api/owner-draft.js` (Vercel Node function; logic in `server/owner-draft.cjs`): `POST {city, text}` → Claude (`claude-opus-5-5`, `effort: low`) with a JSON schema that has one array of verbatim quotes per field and a list of unknowns. The system prompt forbids inference, safety or legal judgements, and treats the owner text as data, not instructions. Server-side refusal fallback (`fallbacks: "default"`) is enabled.
- `MACHI_OWNER.fromQuotes()`: shared validator used by the server and again by the browser. A quote is kept only if it appears word for word in the owner's text; paraphrases, invented claims and unknown fields are dropped; structural safety stays 「専門家による確認が必要（未確認）」.
- The browser calls the endpoint, disables the button while waiting, ignores stale replies, and labels the draft source (Claude or keyword). Any failure — no endpoint (static hosting), no key (503), rate limit (429), refusal, `max_tokens`, invalid JSON, no verbatim quote, network error or 30 s timeout — falls back to the v0.3 keyword draft.
- Input limits (2,000 characters, city 40), POST only, `Cache-Control: no-store`, optional origin check (`MACHI_ALLOWED_ORIGIN`), best-effort per-IP rate limit. Owner text is never logged.
- `package.json`, `vercel.json` (serves `dist/`, 30 s function limit, security headers). Deployment steps in README.
- Version updated to v0.4.0 in title, badge, revision history and labels.

### Not done

- No live call was made during development (no API key in the build environment). The request shape was checked against the SDK with a mocked transport. A real smoke test is needed after the key is set in Vercel.
- The ChatGPT Sites deployment still serves v0.2.1 and has no server function.

### Validation

10 endpoint tests with Claude mocked (`tests/check-owner-draft-api.cjs`), 17 owner-model tests (4 new), existing data, opportunity and support checks, and both Chromium flows. The owner flow now also covers a mocked Claude reply (an invented claim is dropped) and endpoint failure. Details in `qa/test-results-v0.4.0.txt`.

## v0.3.0 — 2026-11-02

Owner entry point, per [spec-v0.3.md](spec-v0.3.md) P0.

### Implemented

- New section 「まず一度、そのままで。」 for owners who are not ready to "rent out" a vacant house. Three owner-chosen levels: (1) one-off as-is use (ghost-house experience, shoots, local events — no clearing out), (2) short trial stay, (3) DIY stay. Moving up is never required.
- Free-text description → deterministic keyword draft. Each field keeps the source sentences it came from; unmentioned fields stay empty and are listed as needing confirmation; "不明" in the source is flagged, not resolved. Structural safety is never inferred and always shows "専門家による確認が必要（未確認）".
- Safety checklist per level (structure by a professional, off-limits areas, insurance, neighbours, keys, fire/lighting/exits; plus night use and wildlife for as-is use; lodging law, water and network for stays; DIY scope and guidance for DIY stays). Publication is blocked until every item and both owner and operator confirmations are done.
- Stay levels show the legal status as 「要確認」 until the lodging-law item is checked.
- Optional revenue example (10% operator fee) clearly labelled as an assumption, not a promise.
- Visitor-facing preview appears only after publication, labelled as fictional demo data with no exact location. Any edit after publication returns the offer to draft and clears both confirmations.
- Version updated to v0.3.0 in title, navigation badge, revision history and inquiry draft. Original housing, transport and support-source records remain unchanged.

### Prototype boundary

The draft parser is local keyword matching, not AI. The live Claude call (P1) is not implemented and will run server-side. All owner input stays in browser memory and is cleared on reload. No real owners, properties, bookings, payments or messages.

### Validation

13 owner-model assertions (`tests/check-owner.cjs`), existing 11 data, 11 opportunity and support checks, JavaScript syntax checks, and Chromium checks for the existing flow (`tests/browser.cjs`) and the owner flow (`tests/browser-owner.cjs`): empty input, source-quoted draft, safety gate, two confirmations, publish preview, edit withdrawal, stay legal status, XSS escaping, mobile width and reload reset. Details in `qa/test-results-v0.3.0.txt`.

## v0.2.1 — 2026-11-01

- Made the prototype version badge the single header link to revision history, visible on desktop and mobile. Removed the redundant separate history button.


- Added the original 20-second Machiholi PV in the hero’s right column, replacing the static illustration, with native playback controls, inline playback and no autoplay.
- Added visible revision history and a link to this changelog. Updated the visible version and inquiry-draft label to v0.2.1.
- Original housing, transport and support-source records remain unchanged.
- Validated video metadata/play/pause, mobile width, version labels and existing data/state/support checks.

## v0.2.0 — 2026-10-31

### Implemented

- Two evidence layers: unchanged real housing/transport samples and an explicit empty state for real local participation opportunities and outcomes.
- Municipality/property-aware community section and downloadable unsent inquiry draft reflecting stay, mobility and interests.
- Optional fictitious review sandbox: literal source snippets, nullable conditions, source owner/URL/retrieval date, human-review checkboxes, separate confirmation and visitor-demo reflection, bounded expiry, rejection, withdrawal and reconfirmation.
- Changed source text creates a new unconfirmed draft; unknown costs, dates, permission and internet remain unknown. Demo activity is never represented as an actual host or recruitment.
- Version shown in page title, navigation badge, community section and inquiry draft. Original MLIT/LIFULL attribution retained.

- Six official support references matched to the selected municipality, with source/update/check dates, fiscal-year uncertainty, short-stay limitations and stopped-acceptance status. These are public pages/PDFs, not claimed open datasets.

### Prototype boundary

The review sandbox is accessible to all visitors and changes only their own in-memory demo. It is not role authentication, publication authority, actual reuse verification, or a real regional data-management service. No live AI, scraping, API call, external message, booking, payment, durable storage, user account or actual-host contact is implemented. No real testimonials or participant data are collected. Source edits and review history are ephemeral; reload resets them.

Production P0 work remains: authorized regional reviewers and separate authenticated operator publication; server-side provenance/consent/expiry enforcement; review notification and moderation; rights checks and official contact verification; consent withdrawal and retention controls. P1 source monitoring, assisted extraction and outcome measurement also remain future work. The 1-region pilot has not begun. Fictitious examples are opt-in and labeled; they are not added to the real opportunity list.

### Validation

11 original data assertions and 11 opportunity-state assertions; JavaScript syntax; Chromium interaction checks for filtering, selected-property context, review gates, confirmation/publication separation, expiry, withdrawal, regeneration, local download, escaping, mobile width and reload reset. Repository Markdown checks run before PR merge. QA details are in `qa/test-results-v0.2.0.txt`.
