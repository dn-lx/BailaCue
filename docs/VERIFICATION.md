# Verification · BailaCue 0.2.10 (build15)

Source discovery is now read-only. Existing filenames change only after an explicit
reviewed Rename existing videos action. New-upload numbering is a separate source
preference, off by default for both new and upgraded libraries. Actual observed
filenames supply library titles; an unapplied number is never displayed as success.

153 unit/database tests in16 suites, TypeScript and ESLint passed locally. All six browser journeys and web export passed. Native publication results
are recorded after completion. Focused regressions
cover no rename/copy/upload-job vault access on discovery, default-off upload naming, preview,
partial failures with actual filenames, paused/resumed jobs, reviewed-file scope,
queued manual actions, stable allocations, per-file permission errors, and omission
of device-local rename results from metadata snapshots.

Browser coverage uses synthetic media and a mocked provider. Live folder metadata
was inspected with owner authorization; the previously running app completed its
rename pass during inspection. No connector rename writes were made. Private file
names, IDs, folder URLs and account details are not included in this repository.

Android publication is gated on the existing12 real Google ARTEMIS controller/helper
checks. Live provider uploads/rename failures, physical-device hardening and iOS
compilation/signing remain unverified. No production database changes.

[Previous build14 verification](VERIFICATION-0.2.9.md).
