<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Updating daily content without shipping a new build

The app now supports a lightweight "content pack" that can be refreshed whenever the user is online and then cached for offline use.

1. Drop a JSON file at `public/content/latest.json` with the shape:

```json
{
  "version": "my-pack-id",
  "days": [
    {
      "languages": { /* same structure as entries in contentArchive.ts */ }
    }
  ]
}
```

2. On startup, the app fetches `/content/latest.json`, validates it, and saves it in `localStorage`.
3. If the fetch fails or the payload is invalid, the built-in `CONTENT_ARCHIVE` is used as a fallback, so the app always works offline.

You can regenerate a new pack as often as needed (even daily). Just replace `public/content/latest.json` on your hosting/CDN; users will pick it up automatically the next time they come online.

### How the app decides which data to use

1. On startup, it tries to fetch `/content/latest.json` and validates the shape.
2. A valid payload is cached to `localStorage` (with its `version`) and becomes the default source, even offline.
3. If the fetch fails or the payload is malformed, it falls back to the built-in `contentArchive.ts` bundle so the app always works.
4. The Home screen now shows a small panel explaining which source is active and lets you peek at the raw JSON feeding the UI.

## Automated daily data generation (no duplicates)

To create unique, multi-language content for future dates with a single command, use the bundled generator script. It produces the raw objects you can paste into `contentArchive.ts` **or** publish as `public/content/latest.json` for over-the-air refresh.

1. Set an API key for your model provider (OpenAI-compatible):
   ```bash
   export OPENAI_API_KEY="your-key"
   ```
2. Run the generator for any horizon (example: 30 days starting today):
   ```bash
   npm run content:generate -- --start 2025-11-28 --days 30 --output generated/pack-30d.json
   ```
   - `--history generated/history.json` (optional): point to a previous pack so the prompt tells the model which authors/facts to avoid.
   - `--model` / `--endpoint` (optional): override the default `gpt-4o-mini` or supply a self-hosted endpoint.
3. The script validates that no quote text, author name, or fact title is duplicated inside the new batch. If anything repeats, it will fail loudly instead of writing the file.
4. Inspect `generated/pack-30d.json`; if it looks good, either append the objects to `contentArchive.ts` (static build) or copy the JSON into `public/content/latest.json` (dynamic packs cached offline).

### Where to store the generated data

- **Static build:** append into `contentArchive.ts` when you want everything baked into the app with zero network dependency.
- **CDN / Gist / JSON file:** host the `latest.json` output anywhere HTTPS-accessible. The app will fetch once, validate, cache in `localStorage`, and keep serving it offline.
- **Local database (optional):** if you add a local DB later, you can seed it with the generated file; the schema matches the existing `DailyQuoteBundle` shape the UI already consumes.

### Rotation cadence

- Run the generator weekly or monthly with a new `--start` date and keep the `--history` flag pointing at the last accepted pack to enforce uniqueness across time.
- Because the app uses deterministic date selection, you can pre-generate years of content and ship it; users will always see one unique bundle per day with no load time.
