# BeatShore

BeatShore is a listener-first and creator-first music platform with a dark purple interface inspired by the supplied product design. It is being developed as an independent streaming platform rather than a wrapper around Spotify, Deezer or Apple Music.

## Advanced product features

- ShoreFlow personalized discovery with regional, mood and language controls
- ShoreAI prompt-to-playlist experience
- Authenticity Shield job queue for AI-music, manipulated-audio, cloned-vocal and AI-lyrics analysis
- Live collaborative listening rooms and synchronized queues
- Stem and practice workspace concept for musicians and learners
- Transparent artist royalty ledger for streams, downloads, tips and subscriptions
- Local-to-global discovery for Surinamese, Caribbean and independent artists
- Creator Studio, uploads, analytics, verification, fan engagement and merchandising
- Hi-Fi presentation, responsive player, search, library, favorites and playlists

## Backend

The web client now supports Supabase for:

- PostgreSQL catalogue and creator data
- Passwordless authentication
- Row Level Security
- Realtime catalogue updates
- Play-event recording
- Authenticity-analysis jobs
- Playlists and collaboration rooms
- Artist royalty records

### Connect Supabase

1. Create a Supabase project.
2. Open the SQL Editor and run `supabase/migrations/20260702_beatshore_core.sql`.
3. Copy `.env.example` to `.env.local`.
4. Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Add published rows to the `tracks` table.
6. Restart the development server.

Never place a Supabase service-role key in the browser application. Administrative writes, payments, royalty settlement, media signing and detector workers should run through protected server or Edge Function endpoints.

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

## Production services still required

A public launch still needs licensed catalogue agreements, actual media upload/transcoding, private audio storage, signed playback URLs, CDN delivery, DRM/offline licensing, payment-provider integration, fraud-resistant stream accounting, content moderation, notification delivery and deployed AI-analysis workers.
