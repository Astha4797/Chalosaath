#!/usr/bin/env bash
# Build and deploy the ChaloSaath mobile app to Firebase Hosting (free plan).
#   - compiles Tailwind + app shell styles into app.css (pages arrive fully styled, no flash)
#   - renders the tab bar into each page
#   - stamps asset links with a content hash so phones never run a stale cached copy
set -euo pipefail
cd "$(dirname "$0")"
python3 build/build.py
npx -y firebase-tools@14 deploy --only hosting --project chalosaath-4797 --non-interactive
