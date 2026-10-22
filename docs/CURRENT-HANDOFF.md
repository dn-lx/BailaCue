# Current handoff · 0.3.0/build27 candidate

Local-first implementation is complete; native release gates are in progress.
[Requirements](LOCAL-FIRST-REQUIREMENTS.md) · [Usage](LOCAL-STORAGE.md) · [Verification](VERIFICATION.md).

189 tests/20 suites and 17 browser journeys pass, plus typecheck/lint/web export.
Android/iOS use SQLite; browser uses IndexedDB. Legacy on-device libraries migrate
separately and old records are retained. No production Me+ action was taken.
Supabase runtime, accounts and username sharing are retired; historical server
code is archived. Provider-folder sharing guidance replaces the old account flow.

Personal backup import/export/Drive/Dropbox folders, optional Sheets two-way sync,
editable metadata tabs/versioned recovery, offline retry/backoff/conflict review,
visible label removal and global deletion are implemented. Sheets API needs owner
setup; no live private-account acceptance is claimed. Public preview release waits
for exact-byte native acceptance. iOS compile is distinct from signed device testing.

Compact headers/cards, tab indicators and native press/entry/progress motion retain
the approved concept05 b/play identity. Both themes, reduced motion, centered chip
rows and narrow/large-text layouts are checked. Source docs record the starter
workflow adaptation; no web animation library was introduced into the native app.

PR#1 remains draft and main unmerged. Do not use TinyFish, paid services, production
DB deletion or store submission. Do not spawn agents without explicit delegation.
