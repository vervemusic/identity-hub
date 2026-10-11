# Identity Hub

Local account metadata directory, built October 11, 2026. No dependencies are required for the application. Serve this folder over HTTPS (or localhost for development).

Features: account CRUD, identity search, categories, HTTPS login links, local persistence, JSON import/export, duplicate detection, PWA manifest/icons and offline application shell.

Only name, username, category and url are accepted. Unknown import fields reject the whole import. URLs with credentials, query parameters or fragments are rejected. Metadata is unencrypted and local to the browser; export contains that same metadata. Never enter a password, token or recovery code in any field. Do not import password manager exports. There is no analytics, cloud sync, password vault or backend.

## Verification

`npm test` runs metadata validation, filtering, duplicate and unsafe-input tests. All three tests pass locally. `browser-test.cjs` is an additional Playwright UI test; it requires Playwright and a browser plus a local server on port 8765. It is not part of npm test.

GitHub Pages workflow is prepared, but has not been uploaded or run. GitHub Pages is not enabled. Target URL after deployment: https://vervemusic.github.io/identity-hub/ (not verified live).

## Authentication investigation

Windows Hello can approve site-specific passkeys through WebAuthn. Android passkeys can use the device PIN or biometrics. These are credentials for the destination site; the dashboard cannot authenticate arbitrary third-party sites.

Proton Pass offers browser-extension autofill and passkeys, Android credential-provider support, and Windows biometric vault unlock (paid account required for Windows biometric unlock). Hub provides a link to the official web vault only. No vault API, synchronization, autofill or biometric unlock has been implemented or tested.

Sources:
- https://learn.microsoft.com/en-us/windows/security/identity-protection/passkeys/
- https://developer.android.com/identity/passkeys
- https://proton.me/support/pass-use-passkeys
- https://proton.me/support/how-to-set-up-proton-pass-for-windows
- https://developer.chrome.com/docs/lighthouse/pwa/installable-manifest

## Unfinished

GitHub integration write authorization (403), upload, Pages enablement/deployment, live-site browser testing, real Windows/Android installation and biometric tests. PWA configuration is implemented but installation is unverified. Secure encrypted vault storage and secure Hub-specific passkey authentication would be separate implementation work. Personal account lists have not been retrieved or included.
