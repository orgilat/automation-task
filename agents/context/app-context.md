# TakeNote — Application Context

This document describes the application under test for all agents.

## What is TakeNote

TakeNote is an open-source, client-side notes app built in React. Source: https://github.com/taniarascia/takenote. Demo: https://takenote.dev.

**Critical architecture note:** TakeNote has **NO backend API**. All state lives in browser `localStorage`. There is an optional GitHub Gist sync, but we do not test that path.

This is why our test strategy is **E2E-only**, with `localStorage` state inspection as the verification layer for persistence.

## Application Surface

The app has roughly these regions (verify exact DOM during POM creation):

1. **Sidebar** — navigation (All Notes, Favorites, Trash) + Categories list + Settings/Sync controls
2. **Note list (middle column)** — list of notes in the selected scope, search input, "+" button to create
3. **Editor (right column)** — markdown editor + preview toggle
4. **Settings modal** — theme, line numbers, markdown preview toggle

## Key User Flows

1. **Create a note** — click `+` in note list → editor opens with empty note → type → auto-saves
2. **Edit a note** — select from list → editor loads content → modify → auto-saves
3. **Delete a note** — right-click or menu → "Delete" → moves to Trash
4. **Restore from Trash** — sidebar → Trash → select → restore
5. **Permanent delete** — Trash → delete forever
6. **Favorite a note** — note menu → "Add to favorites" → appears under Favorites
7. **Create category** — sidebar → "+ Add Category" → name
8. **Assign note to category** — note menu → "Move to category"
9. **Search** — top of note list, filters by text
10. **Toggle settings** — preview, theme, line numbers

## localStorage Schema

Keys (verify exact names when writing POMs):

- `notes` — array of note objects: `{ id, text, created, lastUpdated, category, scratchpad, favorite, trash }`
- `categories` — array: `{ id, name }`
- `settings` — object: `{ darkTheme, previewMarkdown, ... }`

## Test Environment

- **Default target**: `https://takenote.dev` (public demo)
- **Override**: `BASE_URL` environment variable
- **Browser support**: Chromium, Firefox, WebKit
- **Isolation strategy**: `clearAppState()` before every test via the `cleanPage` fixture

## Demo App Caveats

- The demo is a public site. Assume it can be cold-started — `waitForAppReady` handles this.
- No login required. App is open immediately.
- The `Sync with GitHub` feature opens OAuth — we do not test this flow.
