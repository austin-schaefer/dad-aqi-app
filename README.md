# dad-aqi-app

Client-side React app for browsing Air Quality Index data across multiple cities. No backend — fetches directly from Open-Meteo's free API.

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + build to dist/
npm run preview    # preview production build locally
```

## Deploy to Netlify

### First deploy

1. Push this repo to GitHub.

2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project** → connect your GitHub account.

3. Select this repo. Netlify will auto-detect the build settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

4. Click **Deploy site**. Done.

### Auto-deploy on push

Once connected, every push to `main` triggers a new deploy automatically. No extra configuration needed — Netlify watches the branch set during import (defaults to `main`).

To verify: **Site settings** → **Build & deploy** → **Continuous deployment** → confirm the production branch is `main`.

### Manual deploy (CLI)

If you ever want to deploy without going through GitHub:

```bash
npm install -g netlify-cli
netlify login
netlify deploy --build --prod
```

## Notes

- `netlify.toml` includes a catch-all redirect (`/* → /index.html`) so deep-linking works correctly.
- No environment variables or secrets needed — the app calls Open-Meteo directly from the browser.
