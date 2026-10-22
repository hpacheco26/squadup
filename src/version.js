// Build-time app version info, injected by Vite `define` (see vite.config.js).
// Falls back gracefully when the constants are not defined (e.g. unit tests).
export const APP_VERSION = __APP_VERSION__;
export const APP_COMMIT = __APP_COMMIT__;
export const APP_BUILD_TIME = __APP_BUILD_TIME__;

/** Short label for display, e.g. "v1.0.0 (a1b9f3c)". */
export const APP_VERSION_LABEL = `v${APP_VERSION}${APP_COMMIT ? ` (${APP_COMMIT})` : ''}`;
