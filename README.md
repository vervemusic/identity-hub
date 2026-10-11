# Identity Hub

A local account directory with search, categories, account add/edit/delete, HTTPS login-page buttons, JSON import/export, and duplicate detection.

## Data boundaries

Only `name`, `username`, `category` and `url` fields are accepted. Unknown fields reject the whole import before storage changes. Password-manager exports must not be imported. Login URLs must use HTTPS without embedded credentials, query parameters or fragments. No password, authentication token or recovery-code field exists. Do not put secrets in metadata fields.

Account metadata is unencrypted in this browser's local storage. It is not sent to GitHub or a server. JSON export contains this metadata only; there is no cloud synchronization. The public repository and deployment contain application code and fictional samples only.

## Install and offline use

Manifest, 192/512 PNG icons, standalone display, installation prompt handling and offline application-shell cache are implemented. When published over HTTPS, supported Windows Edge/Chrome and Android Chrome browsers can offer installation. Actual Windows/Android installation and hardware biometric prompts have not been tested.

## Verification

`npm test`: three tests covering metadata validation/search, unsafe URLs and credential-field rejection, transactional import validation and deduplication. Passed locally and on GitHub Actions.

`browser-test.cjs`: Playwright browser checks for account creation/edit/deletion, persistence after reload, search/category filtering, JSON export, valid/invalid import, duplicate skipping, offline reload and narrow-screen overflow. Passed on GitHub Actions October 11, 2026, run 38149110995. The workflow installs Chromium and runs this test before deployment.

## Authentication investigation

Windows Hello can approve website-specific passkeys through WebAuthn. Android passkeys support device PIN and biometrics. Passkeys are scoped to a relying party; approving a Hub passkey cannot sign the user into unrelated sites. A secure Hub account-login service would require enrollment, fresh challenges and assertion verification; none is implemented here.

Proton Pass supports browser-extension autofill and passkeys, Android credential-provider use, and Windows biometric vault unlock (paid account required for Windows biometric unlock). Hub currently links to the official Proton Pass web vault. It does not read the vault, synchronize vault items, perform autofill, or send credentials. No direct vault API integration has been implemented or tested.

Sources:
- https://learn.microsoft.com/en-us/windows/security/identity-protection/passkeys/
- https://developer.android.com/identity/passkeys
- https://proton.me/support/pass-use-passkeys
- https://proton.me/support/how-to-set-up-proton-pass-for-windows
- https://developer.chrome.com/docs/lighthouse/pwa/installable-manifest

## Deployment status

GitHub write authorization was repaired and application files uploaded October 11, 2026. First-time Pages activation was rejected by GitHub with `Resource not accessible by integration`. The repository owner must select GitHub Actions as the Pages publishing source. No working live URL has yet been verified.

Target URL after successful deployment: https://vervemusic.github.io/identity-hub/

Remaining: Pages activation/deployment and published-site verification; device installation tests; biometric/passkey login integration; Proton Pass vault integration. No personal account list has been retrieved or seeded.
