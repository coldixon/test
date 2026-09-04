# mixxmedia.co

Marketing site for MixxMedia, LLC. Plain HTML, CSS, and one small JS file — no
build step, no dependencies. Edit a file, refresh the browser, ship it.

## Structure

```
mixxmedia-site/
├── index.html          Home — the portfolio at a glance
├── ventures.html       Hub listing every property (add new ones here)
├── inklings.html       Inklings® card game + the K–3 Math Program
├── games.html          Game studio — slate, principles, partnering
├── sports.html         Sports platforms — properties, capabilities
├── juneteenth.html     JuneteenthEvents.us — audience, rate card, ad specs
├── consulting.html     Practices, proof, engagement models
├── contact.html        Contact form + about
├── 404.html
└── assets/
    ├── css/styles.css  Whole design system, sectioned and commented
    ├── js/main.js      Mobile nav, sticky header, scroll reveal, footer year
    ├── img/favicon.svg
    └── img/art-*.svg   Original illustrations, one per section
```

Navigation is deliberately just **Ventures · Consulting · Contact**. As the
portfolio grows, new properties get a card on `ventures.html` and the top nav
never gets crowded.

## Running it

Any static server works:

```bash
cd mixxmedia-site
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploying

Drag the folder into Netlify, Vercel, or Cloudflare Pages, or push it to GitHub
Pages. No configuration needed. Point `mixxmedia.co` at whichever you choose.

## Copy I still need from you

Several properties came up with nothing in the source material, so rather than
invent claims about real brands they are clearly-marked placeholders. Each needs
one or two sentences — what it is, who it is for, where it stands, and a URL.
HerWhispr now says what it is; it still needs enough detail to earn its own page:

| Property | Where the placeholder is | Status |
| --- | --- | --- |
| **HerWhispr** | `ventures.html`, its own section | Listed as a book app for women — needs platform, catalogue/reading experience, launch status, URL |
| **Herzog** | `games.html`, slate | Listed as an original game in development — needs genre, platform, audience, status |
| **Elite Sport** | `sports.html`, "Our properties" | Listed as a sports AI platform (AI coaching + tournament hosting) — needs sports covered, what the coaching returns, live status, URL |
| **Second sports site** | `sports.html`, "Our properties" | Name unknown |
| **blackevents.us** | `ventures.html`, Platforms | Confirmed as yours — needs what it covers, how it relates to JuneteenthEvents.us, scale, whether it sells advertising |
| **Hockey game** | `games.html`, slate | Listed as in development; confirm platform, audience and working title |

Each placeholder is wrapped in an HTML comment saying exactly what to send.
Search the files for `PLACEHOLDER` and `TODO`.

Everything else on `sports.html` describes capabilities generically and should
be true of the work regardless — but read it and cut anything that overstates.

## Before you publish — please check these

The copy was written from your own documents (the Inklings curriculum guide, the
box copy and rules PDF, the GMA-era interview notes, and the JuneteenthEvents.us
media kit and strategy doc). A few things still need your eyes:

1. **JuneteenthEvents.us traffic.** `juneteenth.html` states **50k+ monthly
   visitors**, taken from your May 2026 strategy doc. Your own media kit says to
   replace audience figures with current 30-day analytics before sending them to
   advertisers — the same applies here. Search the file for the
   `Verify audience figures` comment.
2. **Inklings sales figures.** "1,000+ copies" and "85% rated 4 or 5 stars" are
   as of May 30, 2022. Refresh or soften if they are stale.
3. **Rate card.** Prices mirror the media kit exactly, including Brand Spotlight
   Week ($1,500) and Annual Brand Sponsor ($5,000–$15,000). Confirm these are
   live and not still draft.
4. **Purchase links.** There is no "buy now" link anywhere yet — add your Amazon
   or Shopify URL to `inklings.html` and the home page when you want one.
5. **Contact form backend.** `contact.html` is wired for Netlify Forms. If you
   host elsewhere, swap in Formspree or your own endpoint — instructions are in
   an HTML comment right above the `<form>` tag.
6. **Ages.** The box says 6+; the curriculum guide says 5+. The site uses 6+ for
   specs and mentions 5+ in the learning context, matching your source docs.
7. **Sports claims.** `sports.html` describes what an event site includes. Make
   sure every capability listed is one you actually ship today.

## Things deliberately left out

- **Street address.** Only "Upper Marlboro, MD" appears. Your documents carry a
  residential address; putting it on a public site invites mail you don't want.
- **Phone number.** Same reasoning — add a business line if you'd like one shown.
- **Photography.** There is none — I had no product or event photos to work
  from. Every image is an original SVG illustration in `assets/img/art-*.svg`,
  drawn in the site palette. They are real artwork, not placeholders, but if you
  send photos of the deck, a tournament, or a Juneteenth event, swapping them in
  is one line each: the `.media` container already handles sizing and cropping.
- **Founder bios.** The about section names the company, not individuals beyond
  the Inklings inventors. Say the word if you want a proper leadership section.

## Design notes

- Each pillar has its own accent colour, applied via a theme class on `<body>`
  (`theme-inklings`, `theme-games`, `theme-juneteenth`, `theme-consulting`) or on
  a single section. Everything else — buttons, tags, stat numbers, card hovers —
  inherits from `--accent` automatically.
- Type is **Fraunces** for headings, the wordmark and figures, and **Public Sans**
  for body and all UI (buttons, nav, labels, tables). Both from Google Fonts with
  real fallback stacks. Fraunces is variable — headings use its SOFT and WONK
  axes, which is where the warmth comes from.
- Neutrals are biased toward the brand violet rather than being flat grey, and
  the paper deliberately is not cream.
- Header and footer markup are duplicated per page, since there is no build step.
  Change one, change all nine. If that becomes annoying, the natural next step is
  Eleventy or Astro with a shared layout.
- Scroll reveals use a rect test rather than IntersectionObserver, so content
  still appears when a visitor lands via an anchor link or a restored scroll
  position — an observer never fires for elements the viewport skipped past.
- Accessibility: skip link, visible focus rings, labelled form fields, an
  `aria-current` state on nav, and full `prefers-reduced-motion` support.
