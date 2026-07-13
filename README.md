# RoofBros Smart Quote — Design Package

Design system + mobile screens for the RoofBros roofer app (iOS + Android).
Static HTML/CSS blueprints. The design tokens map 1:1 to the future React Native theme.

## Open this first
Open **`index.html`** in Chrome or Edge — it links the two documents below.
(Use Chrome/Edge, not Firefox: Firefox blocks local files from loading `../styles/`.)

## Folder map — where everything lives

```
RoofBros/
├── index.html              ← landing page (links the two docs)
├── 01-style-guide/         ← the design system, documented + live components
├── 02-mobile-design/       ← the app screens (entry, golden path, colours…)
├── README.md               ← this file
├── .docs/                  ← DECISIONS.md + PRODUCT.md + DESIGN.md (internal planning, not tracked in git)
│
├── styles/                 ← ALL css lives here, one concern per file, in load order:
│   ├── tokens.css          1. design tokens ONLY (colour, type, space, radius, touch)
│   │                          → this is the file that becomes the RN theme
│   ├── base.css            2. reset, typography, focus, the icon system
│   ├── components.css      3. reusable app UI (buttons, chips, cards, inputs…)
│   ├── device.css          4. phone mockup shell (bezel, island, status bar) — mock-only
│   ├── docs.css            5. documentation-page chrome (nav, sections, gallery)
│   └── mobile-design.css   6. page-local styles for the 02 screens only
│
└── assets/
    ├── fonts/              af Another Sans (display) + Outfit (body, the client
    │                       brand font) + Albert Sans (free display fallback)
    ├── brand/              favicon.png (tile mark, used) + logo-full.png
    ├── photos/             real RoofBros before/after restoration shots (welcome slider)
    │                       + aerial-suburb.jpg, a stock aerial photo standing in for
    │                       Nearmap imagery in B1/B2/B3 (Unsplash License, free for
    │                       commercial use, no attribution required — photo id
    │                       1476385822777-70eabacbd41f)
    └── video/              empty-hub-illustration.mp4 (looping, muted, A0 empty state)
```

## The rules in one paragraph
Flat, hairline borders, **no UI shadows**. **White** ground, **powder** (`#ECF1F4`)
panels, warm **espresso ink** (`#2D2012`). **One accent — maroon `#7D1017`** — does
everything active (buttons, selection, focus, progress); non-maroon
information uses ink; secondary text links use one harmonised slate-blue
(`#2B4C8C`, the only blue); semantic green/amber/red for status only. Shape by role, **two radii only**: **`0` = structure**
(cards, panels, inputs, imagery, tiles), **pill = touch** (buttons + chips; sheets
keep a 20px top). Type: **af Another Sans 600** for headings/wordmark/hero figures,
**Outfit** (variable) for body, UI, labels and data. Icons are 20&ndash;28px CSS-mask
glyphs — one outline family (2px stroke, round caps), sources below, no emoji. Full detail + live
examples in `01-style-guide`.

## To change something
- A colour, font, spacing or radius → **`styles/tokens.css`** (one place, everything derives from it)
- A reusable component → **`styles/components.css`**
- Phone display size → `--device-scale` / `--device-w` / `--device-h` in **`styles/device.css`**
- A screen's layout → the relevant section in **`02-mobile-design/index.html`**

## Icon sources
Icons are inline CSS-mask SVGs in `styles/base.css` (`.ic-*`), most hand-drawn,
a few supplied from open icon packs — tracked here for attribution:

| Icon | Source | Licence |
|---|---|---|
| `ic-plus` (New Quote) | UXAspects | Apache 2.0 |
| `ic-back` (chevron) | gonzodesign | CC Attribution — credit gonzodesign if published |
| `ic-home` (roofline) | icons8 | Public Domain |
| `ic-pin` (address rows) | pixeden.com | Public Domain |
| `ic-truck` (Deliveries tab) | theforgesmith | Public Domain |
| `ic-apple` (Continue with Apple, 0C/0D) | vorillaz/devicons | Logo mark — see note below |

All other icons (search, close, mail, eye, check, compare, camera, file, user)
are simple hand-drawn stroke paths, no external licence.

The Google "G" mark (Continue with Google, 0C/0D) is inlined directly in
`02-mobile-design/index.html` rather than the `.ic-*` system, since it's
genuinely 4-colour and can't go through a single-colour CSS mask. Source:
HashiCorp design-system. **Both the Apple and Google marks are trademarked
logos, not icon-pack assets** — before shipping, replace these hand-placed
approximations with Apple's official `ASAuthorizationAppleIDButton` (or the
equivalent RN library) and Google's official Sign-In button component, since
both platforms have strict, enforced branding requirements that a static
mockup can't fully guarantee compliance with.

## Fonts — before launch
**Outfit** (body/UI) is free — it's the client's own brand font. **af Another Sans**
(headings, a.Foundry) is **commercial** — the file here is for local preview only;
either buy the licence or the free fallback **Albert Sans** (same foundry feel) takes
over automatically. See the note atop `tokens.css`.
