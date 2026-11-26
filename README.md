# PARS Recruitment Portal

Dreisprachiges Recruitment-Portal (DE/EN/TR) mit Bewerbungsformular, privatem Screenshot-Upload, Freigabe-Workflow und Adminansicht.

## Wichtig
Dieses Projekt ist ein startfähiges Grundgerüst, aber noch nicht veröffentlicht und nicht mit einem Supabase-Projekt verbunden. Die Admin-E-Mail ist NICHT fest in den Client eingebaut. Adminrechte werden ausschließlich serverseitig in Supabase vergeben.

## 1. Supabase einrichten
1. Kostenloses Projekt unter https://supabase.com erstellen.
2. Im SQL Editor den Inhalt von `supabase/schema.sql` ausführen.
3. In Authentication die E-Mail-Registrierung aktivieren.
4. Unter Project Settings > API die Project URL und den anon/public key kopieren.
5. `.env.example` nach `.env` kopieren und Werte eintragen.
6. Ein Benutzerkonto mit der gewünschten Admin-E-Mail registrieren.
7. In SQL Editor ausführen (E-Mail ersetzen):
   `update public.profiles set role='admin' where id=(select id from auth.users where email='DEINE_ADMIN_EMAIL');`
8. Supabase Storage: prüfen, dass der private Bucket `evidence` existiert (SQL legt ihn an).

## 2. Lokal starten
Node.js 20+ installieren, dann:
```bash
npm install
npm run dev
```

## 3. Cloudflare Pages veröffentlichen
1. Projekt in ein privates oder öffentliches GitHub-Repository hochladen.
2. Cloudflare Dashboard > Workers & Pages > Create > Pages > Connect to Git.
3. Build command: `npm run build`; Build output directory: `dist`.
4. In Cloudflare Pages > Settings > Environment variables die beiden Variablen aus `.env` setzen:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
5. Deploy. Gewünschte kostenlose Subdomain `pars-recruitment.pages.dev` versuchen; Verfügbarkeit ist nicht garantiert.

## Sicherheitshinweise
- Niemals den Supabase `service_role`-Key in die Website oder `.env` mit VITE_-Präfix schreiben.
- Adminrechte nur für das eigene Konto vergeben und Zwei-Faktor-Authentifizierung im E-Mail-Konto aktivieren.
- Aktuell kann ein Spieler mehrere Bewerbungen einreichen; für öffentliche Nutzung kann ein Rate-Limit/CAPTCHA ergänzt werden.
- Uploads sind auf Bilder und 8 MB pro Datei begrenzt.
- Die Website enthält ein Wolf-Emoji als Platzhalter-Emblem. Ein individuelles Logo kann später eingesetzt werden.
