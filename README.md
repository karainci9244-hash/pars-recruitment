# WOLF PACK (WPCK) – Public Player Portfolio

This is a Vite + React website for Last Z: Survival Shooter.

## Important behavior
- No account, login, or admin area.
- Anyone can submit a player profile and up to 6 screenshots.
- New profiles and images appear publicly immediately.
- Public visitor gallery, search, sort, and basic totals.
- German, English, Turkish interface.
- Uploaded images are public. Do not upload private or sensitive information.

## 1. Configure Supabase
In your Supabase project, open SQL Editor and run the complete file:
`supabase/schema.sql`

This creates `public.wpck_players` and the public Storage bucket `wpck-public`.
The policies deliberately allow anonymous uploads and public reads. This is suitable only if you accept spam and public exposure. There is no moderation or deletion interface.

## 2. Configure Cloudflare build variables
Add these as **Build environment variables**:
- `VITE_SUPABASE_URL` = `https://YOUR_PROJECT_REF.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = your Supabase Publishable key (`sb_publishable_...`)

Never use a Supabase secret or service_role key in the website.

## 3. Deploy with Cloudflare Pages
Connect the GitHub repository containing these files at its root.
- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

Do not use `npx wrangler deploy` for this Pages project.

## Local test
`npm install`
`npm run dev`

## Security / abuse warning
Because the site has no login and publishes instantly, anyone can submit content and images. Public submissions can include abusive or copyrighted material. The SQL schema limits image types and sizes, but it does not provide CAPTCHA, rate limiting, moderation, or content review. For a public production site, consider adding CAPTCHA and a report/remove process.
