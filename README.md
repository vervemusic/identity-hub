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

In the original version, account metadata was unencrypted in local storage. The security update below adds optional encrypted protection. The application does not upload that list to GitHub or another server. JSON export contains this metadata only. The public Pages edition does not have cloud synchronization; the private hosted edition added below does. The public repository and deployment contain application code and fictional samples, not personal credentials. The page's security policy blocks native form submissions and inline scripts.

## Installation

The manifest, 192/512 PNG icons, standalone display, browser installation prompt handling and offline shell cache are implemented and verified as described above. Use the app's Install app button when offered, or the browser's installation menu. Windows Chrome/Edge and Android Chrome are the intended installation paths.

## Authentication investigation and unfinished work

Windows Hello can approve website-specific passkeys through WebAuthn; Android can use device PIN or biometrics. Passkeys are scoped to the destination relying party. A Hub passkey would not sign the user into unrelated websites.

Proton Pass supports browser autofill, passkeys and biometric vault unlock on supported platforms. Hub provides a link to its official web vault. It does not read or synchronize the vault, perform autofill, or transmit credentials.

At the original test baseline, Hub biometric locking and passkey enrollment were not implemented. The update below adds PRF device unlock and encrypted directory storage. An encrypted credential vault, direct Proton Pass vault reading, automatic third-party sign-in remain outside the implemented functionality. Private encrypted cross-device synchronization is implemented in the hosted edition described below. No personal account list has been retrieved or seeded. These features are not included in the passing tests.

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

## Security update — implementation under verification

The existing app now offers **Enable encrypted protection**. Choose a recovery passphrase of at least 16 characters and save it in Proton Pass. Migration writes authenticated AES-256-GCM ciphertext before removing the old plaintext directory. PBKDF2-SHA-256 uses 600,000 iterations with a random 16-byte salt; every write uses a fresh 12-byte nonce. Wrong passphrases, altered ciphertext and unsupported envelopes reject without replacing the directory. Legacy users retain their existing directory until they enable protection; protection is not silently enabled without a recovery method.

Once enabled, reload requires unlocking; hiding the app, five minutes without input, or changes from another browser window lock it. Lock clears rendered accounts, the editor, search and the in-memory key reference. JavaScript cannot guarantee immediate memory erasure. Protection does not defend against a compromised device, malicious app update, browser extension with page access, or someone using an already unlocked session. GitHub Pages cannot set custom response security headers. CSP remains a defense in depth rather than a complete defense against compromised same-origin code.

**Enable device unlock** registers a platform WebAuthn passkey with required user verification, checks PRF support and wraps the directory key using a purpose-separated HKDF-SHA-256 key and AES-GCM. It never stores the PRF secret or an unwrapped key. Windows Hello or Android controls the biometric/PIN dialog. A platform that supports ordinary passkeys may still lack PRF; setup fails closed and passphrase unlock remains available. Device unlock enrollment/retrieval has controlled authenticator tests; physical biometric hardware remains unverified. Removing device unlock deletes its wrapped key from this browser; the platform passkey must be removed in device settings separately. A passkey belongs to this origin, not arbitrary destination sites. Losing the passphrase and enrolled passkey means losing the directory unless a usable backup exists.

### Secure transfer versus automatic synchronization

With protection enabled, **Export JSON** exports ciphertext only. Importing an encrypted snapshot on another device asks for its recovery passphrase and automatically encrypts that device's directory, including any pre-existing entries. Transfer the snapshot through your chosen private file service or directly between devices. Device unlock enrollment stays local and is not exported. Keep a separate backup; clearing browser data removes the local directory. Old plaintext exports remain plaintext and are not automatically erased.

This is manual encrypted snapshot transfer, **not automatic synchronization**. Duplicate imports merge additions; matching records are not overwritten, and edits/deletions do not propagate. An authenticated private backend, conflict resolution, deletion history and recovery/rotation must be built and deployed before automatic sync can be claimed. GitHub Pages is a static host and cannot supply that backend. Never use a public repository, public issue or unauthenticated paste service to synchronize user data.

### Proton Pass and account selection

The card's **Copy username** helps identify the correct item. Open its destination login page and choose the matching username in Proton Pass's browser extension on Windows or Android autofill service. The app includes official setup links. Existing website sessions need the site's switcher or sign-out; Hub does not control another site's cookies. Only username metadata is copied, never passwords. The browser clipboard is outside Hub's encrypted storage and may be retained by OS clipboard history.

Proton's supported CLI was investigated as an alternative; it can expose vault items to a trusted local process, but a static browser app cannot safely invoke it. Credential-reading API/CLI integration would widen the credential boundary. This implementation deliberately leaves credential handling and cross-device credential sync inside the official Proton Pass clients. No personal credential login has been tested.

Research includes official Proton documentation, Microsoft's regional documentation/community answers, Chromium's PRF design discussions, Yubico's implementation guidance, Mozilla's developer issue tracker, and Japanese PRF implementation reports. Findings were checked against primary implementation documentation rather than treating community compatibility reports as proof of this user's device support:
- https://developers.yubico.com/WebAuthn/Concepts/PRF_Extension/Developers_Guide_to_PRF.html
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API/WebAuthn_extensions
- https://groups.google.com/a/chromium.org/g/blink-dev/c/iTNOgLwD2bI
- https://learn.microsoft.com/en-gb/answers/questions/2286384/windows-hello-support-for-webauthn-prf-extension
- https://bugzilla.mozilla.org/show_bug.cgi?id=1958716
- https://github.com/YubicoLabs/android-prf-sample
- https://zenn.dev/taizo_pro/scraps/c6ecec3219a6a6
- https://proton.me/blog/proton-pass-cli
- https://proton.me/support/pass-browser-extension
- https://proton.me/support/pass-setup-android

`npm test` now includes ciphertext tampering, wrong-key rejection, nonce uniqueness and strict envelope validation. `security-browser-test.cjs` covers migration, reload locking, encrypted changes, encrypted export/second-profile import, cross-window locking, unsupported PRF rejection and a simulated successful device key-wrapping/unlock cycle. Windows and Android standalone installation tests additionally verify encrypted migration and passphrase unlock. Post-deployment suites now wait for successful Pages deployment rather than racing against it.

## Private automatic synchronization

A private deployment of this same application is being added at https://identity-hub-verve.brownhake3.chatgpt.site . GitHub Pages remains the public-code, local-directory edition. The hosted edition uses Sites' owner-private access and trusted server-side ChatGPT identity. It stores only encrypted snapshots in a private R2 binding, with no recovery passphrase, directory key or device-unlock key on the server. Each user ID hashes to a separate storage key. Writes require same-origin JSON and an atomic ETag precondition; conflicts return 412 rather than silently replacing another device's changes. API responses are not cached. The service worker caches the application shell only and never deliberately caches the sync API.

Open the private app on both devices using the same ChatGPT account. On the first device, enable encrypted protection and choose **Sync now**. On an empty second device, choose **Sync now** and enter the same directory recovery passphrase. Existing accounts from the GitHub Pages origin must be moved with an encrypted export/import; browser storage and platform passkeys do not move between origins automatically. Enroll device unlock again on the private origin.

Once connected, the unlocked app checks for updates every 30 seconds, after edits and when connectivity returns. Additions, edits and deletions propagate as complete encrypted directory revisions. Offline local changes remain encrypted and pending. A concurrent local/remote edit stops synchronization and offers explicit **Use synced directory** or **Replace synced directory with this device** choices. Before restoring the remote snapshot, previous local ciphertext is retained as a conflict recovery backup and can be exported. There is no silent last-writer-wins overwrite and no claim of field-level merging. Keep independent encrypted backups; cloud storage alone is not a backup/version-history service.

The automatic-sync tests use two isolated browser profiles and the real server handler with a controlled storage adapter. They cover initial upload, second-device encrypted bootstrap, remote additions and deletions, offline edits, conflict detection and recovery. Server tests cover authentication, user isolation, rejection of plaintext, same-origin enforcement and atomic stale-write rejection. Hosted authentication and R2 provisioning must additionally be checked against the deployment; local/CI tests do not prove physical biometric support or sign-in to external personal accounts.


### Verified security-update results (October 11)

- [Two-device sync, directory security and real-browser virtual PRF tests passed](https://github.com/vervemusic/identity-hub/actions/runs/38156101804). Its Pages deployment was subsequently canceled by concurrent repository updates, not by a failing test.
- [All four published browser suites passed](https://github.com/vervemusic/identity-hub/actions/runs/38155986986), including WebKit real-origin-outage testing.
- [Windows install, standalone operation, encrypted migration and unlock passed](https://github.com/vervemusic/identity-hub/actions/runs/38155986980).
- The private deployment succeeded. Its access policy lists only the owner and no groups. Live HTTP checks returned 403 for unauthenticated access, 200 for authorized service access to the shell, and 401 for a forged visitor-identity header with service access. Service access intentionally does not impersonate a signed-in visitor.
- Hosted signed-in synchronization against production R2, private-origin installation, physical biometric/PIN hardware and third-party Proton autofill/sign-in are not yet end-to-end verified. The sync logic and atomic storage adapter are tested separately; private publication and access enforcement are verified live.
- Android OS installation verification is being rerun after intermittent emulator native-dialog failures. Earlier installation passed on the original app; that alone is not proof of the final security update.

Capacity: up to 10,000 entries, subject to a 3 MB serialized import/encrypted-envelope limit and browser storage quota. Encryption validates the complete envelope before persistence, so an oversized change cannot save a vault that the reader would reject. These are independent limits; 10,000 unusually long entries can exceed the byte limit.

If the private shell opens before a visitor identity has been established, choose **Sign in with ChatGPT for private sync** in the header. This uses Sites’ supported top-level sign-in route; service-access credentials never substitute for a visitor session. Native Android BiometricPrompt/Keystore and Windows KeyCredentialManager wrappers were also investigated as alternatives to PRF. Those are separate native applications and are not implemented or tested here; their feasibility is not ruled out by a browser lacking PRF.
