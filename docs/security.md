# Security Policy

## Reporting a vulnerability

Email **squadup.app@gmail.com** with the subject `SECURITY:` and a description, reproduction steps, and impact. Do not open a public GitHub issue for security reports.

We aim to acknowledge within 72 hours.

## Scope

In scope:
- The web app at `squadupv2.web.app`
- The iOS / Android Capacitor builds
- Firebase Cloud Functions in [functions/](../functions)
- Firestore & Storage rules in [firestore.rules](../firestore.rules) and [storage.rules](../storage.rules)

Out of scope:
- Social-engineering of admins
- Brute-forcing other users' invite codes (rate-limited at the platform level)

## Hardening notes

- Firebase Web config in [src/config/firebase.js](../src/config/firebase.js) is intentionally public; access is controlled by Firestore/Storage rules and Auth.
- Cloud Functions trust their Firestore-event payloads — keep [security-rules.md](security-rules.md) tight to maintain that boundary.
