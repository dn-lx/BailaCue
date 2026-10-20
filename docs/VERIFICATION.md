# Verification · BailaCue 0.2.18 / build23 · pending native gate

Implements R2-01–R2-05 from [round 2](REQUIREMENTS-ROUND-2.md): playlist cue/import,
durable saves and Open Library, compact titles, resize/full screen with one player,
and the approved transparent b/play identity. Android publication is pending.

Local validation: 190 unit/database tests in 19 suites, typecheck/lint, web export,
14 browser journeys across the existing suite and focused round-2 rerun, Expo Doctor
20/20, and the iOS-target Hermes export pass. The four new browser journeys use
controlled official YouTube endpoints: keyless cue without playback, invalid-key
fallback/deduplication, resize/full-screen/position/speed continuity, and failed-save
retry without a false success message. These are not live YouTube evidence.

70 exports regenerate from the geometric SVG master. Transparent color/light/dark
marks and Android foreground have genuine alpha; the separate iOS store asset is
opaque. The app uses transparent in-app marks and no filled icon tile. Launcher
backgrounds follow platform rules.

The release gate retains all 14 existing real ARTEMIS controller checks. A bounded
supplemental live public YouTube attempt is included: its actual imported/blocked
result will be recorded separately, never counted as a pass when blocked. Fresh iOS
simulator compilation runs separately. Live transfers, physical iPhone playback,
phone-call interruptions and full TalkBack/VoiceOver review remain manual.

The earlier published [build22 verification](VERIFICATION-0.2.17.md) is historical.
Do not attribute build23 changes to that APK. No new production database deployment,
main merge or store submission is included.
