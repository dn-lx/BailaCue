# Current handoff · 0.2.0

Work remains on `feat/bailacue-mobile-foundation`, draft PR #1. Original 0.1.0 native
build and initial shared Me+ migration remain historical verified evidence.

This continuation adds personal Drive/Dropbox source configuration, native Google
sign-in / Dropbox PKCE, discovery/reconciliation, online playback, selected downloads,
Wi-Fi preference, secure resumable uploads, comparison, local reminders/quiet hours,
device lock, and prepared scoped account/sync/sharing server + UI.

Read README, CLOUD-STORAGE.md, ACCOUNT-API.md, VERIFICATION.md and ARTEMIS.md before
claiming availability. Live OAuth requires app registration independent of user
accounts. New API version 1 and private-table migrations are live after explicit approval. Mobile build 3 enables the deployed scoped API. New-video remote push,
automatic sync/merge, server-generated picks and WebDAV/S3 remain pending.

Never send broad shared Me+ Supabase Auth tokens to BailaCue. Do not read health data,
alter existing Me+ objects or delete auth.users for BailaCue account deletion.
Private backend session/rate/snapshot/grant tables have no direct client grants.

Native source is under modules; generated root android/ios and artifacts are ignored.
Use scripts/build-android.sh with JDK 21/Android SDK. Universal preview uses
BAILACUE_ARCHS=arm64-v8a,x86_64. Validate final release bytes/version/signature and record
actual device/ARTEMIS evidence before uploading the APK to a GitHub prerelease.
