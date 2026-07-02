# BeatShore

BeatShore is an interactive, responsive music-streaming and creator-platform prototype inspired by the supplied product concept.

## Included

- Listener home, explore, search, library and liked-song experiences
- Interactive playback state, queue, likes and responsive mini-player
- Personalized Flow presentation, mood discovery and release cards
- Creator Studio with streams, listener, follower and revenue analytics
- Release-upload workflow and distribution-review confirmation
- Artist verification, fan, merchandising and analytics tool surfaces
- Desktop, tablet and mobile responsive layouts

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Architecture status

This repository currently contains the polished web application front end and simulated product workflows. Production launch still requires authentication, database/storage, licensed music catalog ingestion, actual audio streaming, payments/payouts, moderation, DRM/offline licensing, notifications and distribution-provider integrations. Recommended next layer: Supabase or Firebase for the MVP, then a dedicated media pipeline and object storage/CDN for scale.
