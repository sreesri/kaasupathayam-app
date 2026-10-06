# kaasupathayam-app

Expense tracker for households. Built with Expo (React Native) and runs on Android and the web from one codebase.

## Setup

```sh
npm install
cp .env.example .env     # API URL and Google OAuth client IDs
npx expo start --web     # website
npx expo run:android     # native dev build on a connected phone/emulator
```

Sign-in uses Google only. The native Google Sign-In module doesn't run in Expo Go, so use a development build (`npx expo run:android`).

## Deployment

The website is hosted on Render as a static site. The Android app is an APK installed directly from a link, with no Play Store, and it receives over-the-air (OTA) updates.

On every push to `main`, `.github/workflows/ci.yml` does the following:
1. Runs typecheck, lint, expo-doctor and a web build.
2. **Android:** publishes an EAS Update to the `production` channel. Installed apps download it in the background on launch and switch to it on the next launch. If native code changed (new native library, Expo SDK upgrade, native settings in `app.json`), it also starts a new APK build. The `fingerprint` runtime version keeps updates away from APKs that can't run them, so everyone needs to install that new APK once.
3. **Website:** Render deploys after the checks pass (`render.yaml`, `autoDeployTrigger: checksPass`).

To build an APK on demand, open GitHub → **Actions → Build Android APK → Run workflow** (`.github/workflows/build-android.yml`). It builds the selected branch with the `production` profile. The run summary links to the build page, which has the install link and QR code. Tick **Wait for the build** if you also want the APK download link in the summary, but note the run then stays open until EAS finishes, which can take a while on the free tier's queue.

### One-time setup

Deploy the backend first (see its README).

1. **Google Cloud Console** → APIs & Services → Credentials. Configure the OAuth consent screen (External; while in *Testing*, add your friends' Gmail addresses as test users). Then create OAuth client IDs:
   - **Web application.** Authorized JavaScript origins: `http://localhost:8081` and `https://<website>.onrender.com`. This is the client ID used everywhere below.
   - **Android.** Package `com.sreesri.kaasupathayam`, plus the SHA-1 from step 4. Create a second Android client with your debug keystore's SHA-1 if you use `npx expo run:android`.
2. **Render website:** go to New → Blueprint and select this repo. Set `EXPO_PUBLIC_API_URL` (the backend URL) and `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. Add the site's URL to the backend's `KAASU_CORS_ORIGINS`.
3. **EAS project:** run the following, then commit the `app.json` changes they make (project ID and update URL):
   ```sh
   npx eas-cli@latest login
   npx eas-cli@latest init
   npx eas-cli@latest update:configure
   npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_API_URL --value https://<backend>.onrender.com --visibility plaintext
   npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value <web client id> --visibility plaintext
   ```
4. **First APK build:** run this by hand once so EAS creates the signing key:
   ```sh
   npx eas-cli@latest build -p android --profile production
   npx eas-cli@latest credentials -p android   # copy the SHA-1 fingerprint for step 1
   ```
   The build page has an install link and QR code you can share. Phones need to allow "install unknown apps" for the browser.
5. **GitHub:** create an access token at expo.dev → Account settings → Access tokens, and add it to this repo as the `EXPO_TOKEN` Actions secret.
