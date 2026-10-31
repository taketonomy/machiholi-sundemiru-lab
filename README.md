# まちホリ！ 住んでみるラボ

Static working prototype for Team E at Project LINKS DATA × DATA 2026 (2026-10-31).

## Team Machiholi! / Collaborators

Collaborators who participated as Team Machiholi! at the [LINKS: POWER of DATA x DATA 2026 Ideathon](https://connpass.com/event/407264/):

- Masaki Nishida
- Sakurako Aoyama

## Scope

Discover a place to try living while continuing remote work and exploring participation in vacant-home DIY with the local community. The design distinguishes physical access from community acceptance. It does not claim that listed houses are currently available, suitable for short stays, or accepting DIY participants.

- Select a municipality, intended stay and mobility preferences.
- Explore **44 actual housing sample records across 5 municipalities**.
- Inspect original housing fields and a municipality-name join to regional public-transport plans and their indicators.
- Review a clearly labeled proposed stay scenario, not booked or scheduled activities.
- Select questions to investigate, and download a local text planning memo.

No external API, account creation, booking, message sending, persistent user storage or payment is used. User preferences stay in browser memory. A page reload resets them.

## Version 0.2.0

The [v0.2 specification](spec-v0.2.md) is implemented as a bounded browser prototype. See [CHANGELOG](CHANGELOG.md) for changes and production gaps.

- Layer A preserves the original 44 housing records and five-city transport-plan extraction unchanged.
- Layer B explicitly reports that real participation opportunities and outcomes are not registered.
- An opt-in, clearly fictitious review sandbox demonstrates source text → draft → confirmation → separate visitor-demo reflection, with expiry, rejection, withdrawal and rechecking. It is not an authenticated admin interface and cannot publish real records.
- Regional context follows filters and property selection. Visitor preferences produce an unsent local inquiry draft; no messages, bookings or personal profiles are sent or saved.
- Parsing is a local deterministic line parser, not AI extraction. Source URLs are displayed as text, not fetched. Reload clears the sandbox.

## Run and test

`dist/` is buildless HTML, CSS and JavaScript. Serve it with any static server. No build/dependency install is needed.

Run from this directory:

- `node --check dist/app.js`
- `node tests/check-data.cjs`
- `node tests/check-opportunities.cjs`
- `node tests/check-support.cjs`

Optional browser regression: serve `dist/` on port 8765, then run `node tests/browser.cjs` with Playwright installed and Chromium available. Override `MACHI_TEST_URL` / `CHROMIUM_PATH` if needed.

The hosting identity is managed separately; do not copy a Site project ID into other deployments.

Published Site (anyone with the link, authorized 2026-10-31): https://machiholi-sundemiru-lab-20261031.mobility-commons.chatgpt.site


## Actual data and provenance

`dist/data.js` embeds a provenance-preserving extraction from the event's actual sample files, not generated listings. The `sources` array contains source URLs, dates, licenses and limitations. Each housing record retains `sourceRow`, `sourceId`, anonymized `PROPERTY_NUMBER_ID` and joined `planId`.

1. Vacant house/land bank registered properties, snapshot **2026-03-31**.
   - 32,173 source rows; 44 selected records.
   - 41 rental-residential records: Ise 5, Uda 22, Annaka 12, Toba 2.
   - 3 sale-residential records: Iki. These are explicitly shown as sale prices, not rents.
   - https://drive.google.com/file/d/15Uzmd0qP57-83QwNDgqRUZvSchTECdAC/view
   - Specification: https://docs.google.com/spreadsheets/d/1JlpJp7YYRaFgt-9F0--sW0iipB4nljDf/edit
2. Regional public-transport plan sample, plans published as of **2026-09**.
   - Original sample: 103 plans and 1,671 indicators. Only joined municipalities are embedded.
   - https://drive.google.com/file/d/14Y49lSGRlwF8e3m0r2jfNLqDA2jE5s57/view
   - Indicators: https://drive.google.com/file/d/1xhqYkpuyp_E2-97Kv3o8JHmvBuGhBAXE/view
   - Specification: https://docs.google.com/spreadsheets/d/1Lc_OzL2Y4wVARsP4BqkX9zikgOKjLEYA/edit

Publication review on 2026-10-31 rechecked the exact [housing specification](https://docs.google.com/spreadsheets/d/1JlpJp7YYRaFgt-9F0--sW0iipB4nljDf/edit) and [transport-plan specification](https://docs.google.com/spreadsheets/d/1Lc_OzL2Y4wVARsP4BqkX9zikgOKjLEYA/edit), also linked in `dist/data.js`. Both state Government of Japan Standard Terms of Use version 2.0 and compatibility with CC BY 4.0. The transport specification explicitly identifies the plan and KPI sample CSVs. The reviewed sample guide contained no participant-only redistribution prohibition; limited event access alone does not establish such a prohibition. This records the reviewed source terms, not a legal guarantee. The public prototype retains the source attribution and limitations below.

The footer credits MLIT Project LINKS and the original housing provider, LIFULL, identifies Team Machiholi as the extractor/processor, and states that MLIT did not create or endorse this service.

## Official relocation/support references (v0.2.0)

`dist/support-data.js` records six programs across the five demo municipalities, checked on 2026-10-31. Source URLs, official page titles, update dates, applicable fiscal-year notes, conditions, and acceptance status are rendered for the selected municipality. These are official public Web/PDF references, not verified machine-readable open datasets or confirmed open-reuse licenses. No eligibility or payment decision is made.

- Ise, Uda and Annaka: relocation support; residence/work requirements apply, not short visits alone.
- Toba: vacant-home renovation support includes DIY materials subject to acquisition and long-term residence requirements, not visiting volunteers alone.
- Iki short-stay support: migration-exploration conditions apply; page updated 2024-12-10 and current-year acceptance remains unverified.
- Iki relocation support: **temporarily stopped**, per official notice updated 2026-10-27. Not shown as accepting applications.

## Important data interpretation

- The geographic join is exact `CITY` ↔ `MUNICIPALITY_NAME`, then `PLAN_ID` for indicators. This is **not** a route/property spatial match and does not prove a bus runs near a house.
- `AMOUNT/RENT` is yen; the specification does not explicitly establish a monthly period. The UI therefore does not add `/month`.
- Station-distance values contain inconsistencies between documented metres and original walking-time prose. They are displayed as raw values and are never converted to travel time or used to claim car-free feasibility.
- Source property identifiers are anonymized and cannot be used to generate real listing links.
- One Ise record, anonymized ID `7011578`, original CSV row `10390`, explicitly says `ＤＩＹ可能`. The UI quotes this as historical source text, not current permission or safe scope.
- Plan indicators may include retrospective evaluation of older plans. Chapter and section titles are preserved; retrospective sections are not preferred in the first three displayed indicators. No indicator is treated as a service guarantee.
- Welcoming hosts, internet, actual transit schedules, short-term rental terms and current DIY permission are not provided by these samples. They remain visibly unconfirmed.
- Proposal scenarios adapt to preferences but are not a matching score or evidence that activities exist.

## Verification on 2026-10-31

- 11 data/provenance/safety assertions pass.
- JavaScript syntax check passes.
- Desktop Chromium preview visually inspected (hero and detail screens).
- Browser tested: all five municipality filters and expected counts; property opening; sale/rental distinction; stay and mobility preference changes; checklist count; close and repeated selection; text memo download and contents.
- No application console errors observed; the environment browser extension produced unrelated metadata errors.
- Responsive media queries and keyboard/focus support implemented. Physical phone/device testing not performed.

## Demo path

Choose 三重県 伊勢市 → open the first record (DIY source mention) → inspect source evidence and public transport plan → review proposed stay and community acceptance questions → save memo.

For a record with station and daily-life distance values, choose 群馬県 安中市 and the first property. Explain that actual transit and community acceptance still need confirmation.

## License and source data

The application code is available under the [MIT License](LICENSE).
Third-party housing and transport records, quoted source text, and official support information retain their original providers' rights and applicable terms; they are not relicensed under MIT. See the source URLs, specifications, attribution and limitations above and the provenance in `dist/data.js` and `dist/support-data.js`. Publicly accessible pages do not by themselves establish an open-data license.
