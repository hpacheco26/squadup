# Mobile Build (Capacitor)

App ID: `com.squadup.app`. Web output: `dist/`. Config: [capacitor.config.json](../capacitor.config.json).

## Common scripts

```pwsh
npm run cap:sync     # build web + sync both platforms
npm run cap:android  # build + sync + open Android Studio
npm run cap:ios      # build + sync + open Xcode (macOS only)
```

## Android

- Project: [android/](../android)
- Namespace: `com.squadup.app`
- FCM: requires `android/app/google-services.json` (NOT committed). Pull from Firebase console.
- Signing: configure release keystore in `android/app/build.gradle` (`signingConfigs`).

## iOS

- Project: [ios/App/App.xcodeproj](../ios/App/App.xcodeproj)
- FCM: requires `ios/App/App/GoogleService-Info.plist` (NOT committed).
- APNs: upload an APNs key/cert in Firebase console > Cloud Messaging.
- Capabilities: enable Push Notifications and Background Modes → Remote notifications in Xcode.

## Splash & status bar

Both are configured via Capacitor plugins. Color: `#5b7bb3`.
