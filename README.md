# MixxMedia

The MixxMedia website — a self-contained, static marketing site for a digital
product studio building websites, mobile apps, games, and digital marketing.

Built with plain HTML, CSS, and a touch of vanilla JavaScript. No build step,
no framework, no external CMS — deploy the folder anywhere.

## Structure

```
index.html        Home
services.html     Services (Web, Mobile, Marketing, Games, Consulting)
about.html        About / mission / values
contact.html      Contact info + inquiry form
assets/
  css/styles.css  Design system + all styling
  js/main.js      Nav toggle, scroll reveals, contact form
  img/logo.svg    Logo mark
```

## Develop / preview

It's static, so any local server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

Upload the repository contents to any static host (Netlify, Vercel, GitHub
Pages, Cloudflare Pages, S3, etc.). No build command is required — the
publish/output directory is the repository root.

## Notes / TODO

- The contact form has no backend. It currently opens the visitor's email
  client (`mailto:`) prefilled with their message. To capture submissions
  directly, wire the `#contact-form` in `assets/js/main.js` to a form
  endpoint (e.g. Formspree, Netlify Forms, or your own API).
- Replace the placeholder email `hello@mixxmedia.co` (in `contact.html` and
  `assets/js/main.js`) with your real contact address.
- Confirm the studio address and business hours in `contact.html`.
