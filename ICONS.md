# RoofBros — Icon inventory (generated)

Every icon used anywhere in the project, with its **raw SVG source** exactly as it ships.
Generated from source by `node extract-icons.mjs` — **do not hand-edit** this file.

- **22** single-colour CSS-mask icons in `styles/base.css` (`.ic-*`). They inherit
  `currentColor`, so one SVG serves every colour the UI needs. The glyphs are one outline
  family: 24-viewBox, 2px stroke, round caps — with three documented exceptions that keep
  their native form: the truck (64 viewBox, equivalent stroke weight) and the Apple mark
  (32 viewBox, filled logo — masks ignore fill, so it still recolours like the rest).
- **1** genuine multi-colour logo (Google) inlined in the HTML — a single-colour mask can't carry 4 fills.
- **2** derived assets in `styles/components.css`: the filled map-marker pin and the selected-swatch tick.

Status-bar glyphs (`ic-cell`, `ic-wifi`, `ic-batt`) are decorative CSS shapes in `device.css`, not SVGs — excluded.

> RN handoff: feed these paths into `react-native-svg` components; keep `stroke="currentColor"`
> semantics by passing the colour as a prop. The Apple and Google marks are trademarks —
> replace with the official `ASAuthorizationAppleIDButton` / Google Sign-In button before shipping.

---

## 1. Google "G" mark — (inline SVG, no class)
- **Source:** HashiCorp design-system
- **Licence:** multi-colour trademark logo — replace with Google's official sign-in button before shipping
- **Used for:** Social sign-in "Google" (0C / 0D)
- **Instances in mockups:** 2

```svg
<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><path fill="#4285F4" d="M14.9 8.161c0-.476-.039-.954-.121-1.422h-6.64v2.695h3.802a3.24 3.24 0 01-1.407 2.127v1.75h2.269c1.332-1.22 2.097-3.02 2.097-5.15z"/><path fill="#34A853" d="M8.14 15c1.898 0 3.499-.62 4.665-1.69l-2.268-1.749c-.631.427-1.446.669-2.395.669-1.836 0-3.393-1.232-3.952-2.888H1.85v1.803A7.044 7.044 0 008.14 15z"/><path fill="#FBBC04" d="M4.187 9.342a4.17 4.17 0 010-2.68V4.859H1.849a6.97 6.97 0 000 6.286l2.338-1.803z"/><path fill="#EA4335" d="M8.14 3.77a3.837 3.837 0 012.7 1.05l2.01-1.999a6.786 6.786 0 00-4.71-1.82 7.042 7.042 0 00-6.29 3.858L4.186 6.66c.556-1.658 2.116-2.89 3.952-2.89z"/></svg>
```

## 2. Search — `.ic-search`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** Jobs-hub search button, site-address field (B1), search field (A1)
- **Instances in mockups:** 9

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
```

## 3. Close / dismiss — `.ic-close`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** Every × dismiss: auth sheets, New Quote steps, D2 delivery request, search
- **Instances in mockups:** 27

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
```

## 4. Location pin — `.ic-pin`
- **Source:** pixeden.com
- **Licence:** Public Domain
- **Used for:** Address suggestion rows (B1), delivery/pickup address rows (D2); reused FILLED as the map marker (see below)
- **Instances in mockups:** 10

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.8-7-11a7 7 0 0 1 14 0c0 5.2-7 11-7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>
```

## 5. Camera — `.ic-camera`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** D2 drop-zone photo field, D1b "Take photo", F profile-logo badge
- **Instances in mockups:** 3

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h3.5l2-3h7l2 3H21v12H3z"/><circle cx="12" cy="13.5" r="3.5"/></svg>
```

## 6. Compare — `.ic-compare`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** Before/after slider handle (0B welcome), compare slider handle (C2)
- **Instances in mockups:** 4

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3l4 4-4 4"/><path d="M20 7H7"/><path d="M8 13l-4 4 4 4"/><path d="M4 17h13"/></svg>
```

## 7. Home / roofline — `.ic-home`
- **Source:** icons8
- **Licence:** Public Domain
- **Used for:** Tab bar — Jobs
- **Instances in mockups:** 9

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5.5 9.5V20h5v-6h3v6h5V9.5"/></svg>
```

## 8. File / document — `.ic-file`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** E2 / E3 "Data sheet (PDF)" buttons
- **Instances in mockups:** 2

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l5 5v15H6z"/><path d="M14.5 2.5V8H20"/></svg>
```

## 9. Eye / reveal — `.ic-eye`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** Password show/hide toggle (0C, 0D, 0E)
- **Instances in mockups:** 6

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
```

## 10. Back chevron — `.ic-back`
- **Source:** gonzodesign
- **Licence:** CC Attribution (credit if published)
- **Used for:** Back on every wizard step and sub-screen (B-, C-, D1a-c, E-, F1)
- **Instances in mockups:** 26

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
```

## 11. Chevron right — `.ic-chevron`
- **Source:** mirror of ic-back (gonzodesign)
- **Licence:** CC Attribution (credit if published)
- **Used for:** Trailing chevron on tappable rows: F settings rows, D1a quote rows
- **Instances in mockups:** 6

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
```

## 12. Palette (Colours tab) — `.ic-palette`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** Tab bar — Colours
- **Instances in mockups:** 9

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8.2" r="4"/><circle cx="8" cy="14.5" r="4"/><circle cx="16" cy="14.5" r="4"/></svg>
```

## 13. Trash / discard — `.ic-trash`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** "Discard quote" action in the discard-confirm dialog
- **Instances in mockups:** 1

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M10 4h4"/><path d="M6 7v13h12V7"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>
```

## 14. Arrow right — `.ic-arrow-right`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** First-run tour step arrows (0G)
- **Instances in mockups:** 3

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="19" y2="12"/><path d="M13 6l6 6-6 6"/></svg>
```

## 15. Plus — `.ic-plus`
- **Source:** UXAspects
- **Licence:** Apache 2.0
- **Used for:** Tab bar — New, "Start a job" buttons
- **Instances in mockups:** 12

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
```

## 16. Mail — `.ic-mail`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** Reset-password email row (0E), F1 locked sign-in email, F "Email us"
- **Instances in mockups:** 5

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7.5l9 6 9-6"/></svg>
```

## 17. Check — `.ic-check`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** Success badges (0E/C3/D3), measuring stage done markers (B2), trust rows (0G); reused as the selected-swatch tick (see below)
- **Instances in mockups:** 7

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6.5"/></svg>
```

## 18. User — `.ic-user`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** Tab bar — Profile
- **Instances in mockups:** 9

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
```

## 19. Truck — `.ic-truck`
- **Source:** theforgesmith
- **Licence:** Public Domain
- **Used for:** NOT USED on any current screen (the Deliveries tab was removed). Kept in base.css for delivery UI in the build; delete if unwanted
- **Instances in mockups:** 0

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" stroke="black" stroke-width="5.3" fill="none"><path d="M19.55,43.93H38.1a2,2,0,0,0,2-2V16.28a2,2,0,0,0-2-2H8.68a2,2,0,0,0-2,2V41.91a2,2,0,0,0,2,2h2.6"/><path d="M44.33,43.93H40.19V23.23H50a1,1,0,0,1,.76.35l6.3,7.55a1,1,0,0,1,.23.64V43.93H53"/><ellipse cx="15.53" cy="45.23" rx="4.44" ry="4.5"/><ellipse cx="48.58" cy="45.23" rx="4.44" ry="4.5"/></svg>
```

## 20. Apple mark — `.ic-apple`
- **Source:** vorillaz/devicons
- **Licence:** trademark logo — replace with the official Apple sign-in button before shipping
- **Used for:** Social sign-in "Apple" (0C / 0D)
- **Instances in mockups:** 2

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M23.023 17.093c-0.033-3.259 2.657-4.822 2.777-4.901-1.512-2.211-3.867-2.514-4.705-2.548-2.002-0.204-3.91 1.18-4.926 1.18-1.014 0-2.583-1.15-4.244-1.121-2.185 0.033-4.199 1.271-5.323 3.227-2.269 3.936-0.58 9.769 1.631 12.963 1.081 1.561 2.37 3.318 4.061 3.254 1.63-0.064 2.245-1.055 4.215-1.055s2.524 1.055 4.248 1.021c1.753-0.032 2.864-1.591 3.936-3.159 1.24-1.814 1.751-3.57 1.782-3.659-0.038-0.017-3.416-1.312-3.451-5.202zM19.783 7.53c0.897-1.089 1.504-2.602 1.34-4.108-1.294 0.053-2.861 0.86-3.79 1.948-0.832 0.965-1.561 2.502-1.365 3.981 1.444 0.112 2.916-0.734 3.816-1.821z"/></svg>
```

## 21. Paint roller — `.ic-roller`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** B0 job-type card — Roof Restoration
- **Instances in mockups:** 2

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="16" height="6" rx="2"/><path d="M8 12v4"/><rect x="5" y="16" width="6" height="5" rx="1"/></svg>
```

## 22. Tile grid — `.ic-tiles`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** B0 job-type card — New Roof Installation
- **Instances in mockups:** 2

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>
```

## 23. Warning triangle — `.ic-warn`
- **Source:** hand-drawn
- **Licence:** no external licence
- **Used for:** Amber banners: measurement failed (B1), low confidence (B3), offline (A1)
- **Instances in mockups:** 3

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l9.5 16.5H2.5z"/><path d="M12 9.5v4.5"/><circle cx="12" cy="17" r="1" fill="black" stroke="none"/></svg>
```

## 24. Map marker (filled pin) — `components.css .aerial .pin`
- **Source:** ic-pin's outer path, filled maroon (#7D1017) with a thin white edge
- **Licence:** Public Domain (derived from pixeden.com pin)
- **Used for:** The draggable address marker on B1's aerial map

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21s-7-5.8-7-11a7 7 0 0 1 14 0c0 5.2-7 11-7 11z" fill="#7D1017" stroke="#fff" stroke-width="1.3"/></svg>
```

## 25. Selected-swatch tick — `components.css .swatch.sel::after`
- **Source:** identical path to ic-check, rendered white at 16px over the selected swatch/colour
- **Licence:** no external licence (hand-drawn)
- **Used for:** Selected state on every colour swatch (C0, C2)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5.5 5.5L20 6.5"/></svg>
```
