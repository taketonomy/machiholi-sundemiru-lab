# Changelog

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
