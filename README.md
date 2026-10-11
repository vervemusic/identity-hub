# Identity Hub

Working application: https://vervemusic.github.io/identity-hub/

GitHub write access was repaired, the application uploaded, and GitHub Pages enabled. The dashboard implements account creation, editing and deletion, identity search, category filtering, HTTPS login-page buttons, JSON import/export and duplicate detection. It works offline after its first successful online load.

## Verified results — October 11, 2026

| Check | Result and evidence |
| --- | --- |
| Model validation, search, import and deduplication | All 3 unit tests passed locally and in Pages CI. |
| Published application in Chromium, Firefox, WebKit and Android browser emulation | [All four suites passed](https://github.com/vervemusic/identity-hub/actions/runs/38151966347). CRUD, persistence, search, categories, export/import, duplicate skipping, rejected secret fields, responsive layout, safe links and actual login-button navigation verified. |
| Invalid imports and injection handling | Seven invalid-import cases leave the existing list unchanged. HTML names render as plain text. Canceled deletion retains the account. Manifest parsing and Chromium installation eligibility passed. |
| WebKit offline operation | Passed with the local origin server actually stopped. Playwright's offline switch has a reported WebKit defect, so this test uses a real origin outage instead. |
| Windows installation and operation | [Passed on a Windows hosted runner](https://github.com/vervemusic/identity-hub/actions/runs/38151151025): live functional and robustness suites, actual PWA installation, OS app-state query, standalone launch and saved-account persistence. |
| Android OS operation and installation | [Passed on an Android 15 emulator](https://github.com/vervemusic/identity-hub/actions/runs/38152784886): creation, search, persistence, offline reload with HTTPS blocked inside the emulator, failed uncached requests, network recovery, native installation confirmation, home-screen launch in standalone mode and retained accounts. |

Android's tested installation created a home-screen application; the emulator did not mint a separate WebAPK package. Physical Windows/Android devices and their biometric hardware have not been tested. Third-party credential sign-in was not performed. The tests use fictional accounts in separate test profiles.

The installation tests exposed an app identity that resolved to the domain root. The manifest now explicitly identifies `/identity-hub/`, preventing identity collisions with other applications on the same GitHub Pages domain. Windows installation was verified against this correction.

## Data boundaries

Only `name`, `username`, `category` and `url` fields are accepted. Unknown fields reject the whole import before storage changes. Password-manager exports must not be imported. Login URLs must use HTTPS without embedded credentials, query parameters or fragments. No password, authentication-token or recovery-code field exists. Arbitrary text cannot reliably be recognized as a secret: never put secrets in metadata fields.

Account metadata is unencrypted in this browser's local storage. The application does not upload that list to GitHub or another server. JSON export contains this metadata only. There is no cloud synchronization. The public repository and deployment contain application code and fictional samples, not personal credentials. The page's security policy blocks native form submissions and inline scripts.

## Installation

The manifest, 192/512 PNG icons, standalone display, browser installation prompt handling and offline shell cache are implemented and verified as described above. Use the app's Install app button when offered, or the browser's installation menu. Windows Chrome/Edge and Android Chrome are the intended installation paths.

## Authentication investigation and unfinished work

Windows Hello can approve website-specific passkeys through WebAuthn; Android can use device PIN or biometrics. Passkeys are scoped to the destination relying party. A Hub passkey would not sign the user into unrelated websites.

Proton Pass supports browser autofill, passkeys and biometric vault unlock on supported platforms. Hub provides a link to its official web vault. It does not read or synchronize the vault, perform autofill, or transmit credentials.

Not implemented: Hub biometric locking, Hub passkey enrollment/authentication, an encrypted credential vault, direct Proton Pass vault integration, automatic third-party sign-in, and cross-device account synchronization. No personal account list has been retrieved or seeded. These features are not included in the passing tests.

Sources investigated:
- https://learn.microsoft.com/en-us/windows/security/identity-protection/passkeys/
- https://developer.android.com/identity/passkeys
- https://proton.me/support/pass-use-passkeys
- https://proton.me/support/how-to-set-up-proton-pass-for-windows
- https://proton.me/support/biometric-setup-mobile
- https://github.com/microsoft/playwright/issues/42775
- https://chromium.googlesource.com/chromium/src/+/main/components/webapps/docs/android_testing_guide.md

## Reproducible tests

`npm test` runs the model suite. GitHub Actions supplies the browsers and operating-system test environments. See `browser-test.cjs`, `robustness-test.cjs`, `webkit-offline.cjs`, `install-test.cjs` and `android-test.cjs`, and the workflows in `.github/workflows/`. Successful final runs are linked above; earlier diagnostic failures were investigated and corrected.
