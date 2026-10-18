# Verification · BailaCue 0.2.9 (build13)

Number-only correction: source video titles are numeric only; actual source filenames
and BailaCue-owned phone copies keep only the allocated number plus media extension.
Previous descriptive prefixes migrate without reallocating numbers. New external
files use the persisted next number; each source keeps an independent sequence.

Local validation:135 tests across16 suites, TypeScript and ESLint passed. All six browser journeys passed in the complete final run. Native acceptance results follow after completion. Publication is
gated on Google ARTEMIS native acceptance.

Focused regressions cover existing numbered-file migration, extension preservation,
non-recycled incremental allocation, offline title normalization and title invariants
on edits, legacy/new upload staging names and duplicate reservations, source renames,
phone-copy staging/cleanup ordering and upload registration without descriptive titles.
Existing large native-buffer upload and practice/edit tests are retained.

Live cloud consent/transfers/renames and iOS compilation remain unverified. Tests use
synthetic media and mocked provider responses; no private media or production writes.

[Previous build11 evidence](VERIFICATION-0.2.8.md).
