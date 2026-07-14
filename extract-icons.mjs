// extract-icons.mjs — regenerates ICONS.md straight from source.
// Run: node extract-icons.mjs
// Sources of truth: styles/base.css (.ic-* masks), styles/components.css
// (filled map pin + selected-swatch check), 02-mobile-design/index.html
// (inline Google SVG). Usage counts are grepped live from both HTML docs.
import { readFileSync, writeFileSync } from 'node:fs';

const read = (p) => readFileSync(p, 'utf8');
const baseCss = read('styles/base.css');
const compCss = read('styles/components.css');
const design = read('02-mobile-design/index.html');
const guide = read('01-style-guide/index.html');

// --- metadata: source + licence per icon (maintained here, by hand) ---
const META = {
  'ic-search':      { name: 'Search',            source: 'hand-drawn', licence: 'no external licence' },
  'ic-close':       { name: 'Close / dismiss',   source: 'hand-drawn', licence: 'no external licence' },
  'ic-pin':         { name: 'Location pin',      source: 'pixeden.com', licence: 'Public Domain' },
  'ic-camera':      { name: 'Camera',            source: 'hand-drawn', licence: 'no external licence' },
  'ic-compare':     { name: 'Compare',           source: 'hand-drawn', licence: 'no external licence' },
  'ic-home':        { name: 'Home / roofline',   source: 'icons8', licence: 'Public Domain' },
  'ic-file':        { name: 'File / document',   source: 'hand-drawn', licence: 'no external licence' },
  'ic-eye':         { name: 'Eye / reveal',      source: 'hand-drawn', licence: 'no external licence' },
  'ic-back':        { name: 'Back chevron',      source: 'gonzodesign', licence: 'CC Attribution (credit if published)' },
  'ic-chevron':     { name: 'Chevron right',     source: 'mirror of ic-back (gonzodesign)', licence: 'CC Attribution (credit if published)' },
  'ic-palette':     { name: 'Palette (Colours tab)', source: 'hand-drawn', licence: 'no external licence' },
  'ic-trash':       { name: 'Trash / discard',   source: 'hand-drawn', licence: 'no external licence' },
  'ic-arrow-right': { name: 'Arrow right',       source: 'hand-drawn', licence: 'no external licence' },
  'ic-plus':        { name: 'Plus',              source: 'UXAspects', licence: 'Apache 2.0' },
  'ic-mail':        { name: 'Mail',              source: 'hand-drawn', licence: 'no external licence' },
  'ic-check':       { name: 'Check',             source: 'hand-drawn', licence: 'no external licence' },
  'ic-user':        { name: 'User',              source: 'hand-drawn', licence: 'no external licence' },
  'ic-truck':       { name: 'Truck',             source: 'theforgesmith', licence: 'Public Domain' },
  'ic-apple':       { name: 'Apple mark',        source: 'vorillaz/devicons', licence: 'trademark logo — replace with the official Apple sign-in button before shipping' },
  'ic-roller':      { name: 'Paint roller',      source: 'hand-drawn', licence: 'no external licence' },
  'ic-tiles':       { name: 'Tile grid',         source: 'hand-drawn', licence: 'no external licence' },
  'ic-warn':        { name: 'Warning triangle',  source: 'hand-drawn', licence: 'no external licence' },
};

// where each icon appears, written against the CURRENT screens
const USED_FOR = {
  'ic-search':      'Jobs-hub search button, site-address field (B1), search field (A1)',
  'ic-close':       'Every × dismiss: auth sheets, New Quote steps, D2 delivery request, search',
  'ic-pin':         'Address suggestion rows (B1), delivery/pickup address rows (D2); reused FILLED as the map marker (see below)',
  'ic-camera':      'D2 drop-zone photo field, D1b "Take photo", F profile-logo badge',
  'ic-compare':     'Before/after slider handle (0B welcome), compare slider handle (C2)',
  'ic-home':        'Tab bar — Jobs',
  'ic-file':        'E2 / E3 "Data sheet (PDF)" buttons',
  'ic-eye':         'Password show/hide toggle (0C, 0D, 0E)',
  'ic-back':        'Back on every wizard step and sub-screen (B-, C-, D1a-c, E-, F1)',
  'ic-chevron':     'Trailing chevron on tappable rows: F settings rows, D1a quote rows',
  'ic-palette':     'Tab bar — Colours',
  'ic-trash':       '"Discard quote" action in the discard-confirm dialog',
  'ic-arrow-right': 'First-run tour step arrows (0G)',
  'ic-plus':        'Tab bar — New, "Start a job" buttons',
  'ic-mail':        'Reset-password email row (0E), F1 locked sign-in email, F "Email us"',
  'ic-check':       'Success badges (0E/C3/D3), measuring stage done markers (B2), trust rows (0G); reused as the selected-swatch tick (see below)',
  'ic-user':        'Tab bar — Profile',
  'ic-truck':       'NOT USED on any current screen (the Deliveries tab was removed). Kept in base.css for delivery UI in the build; delete if unwanted',
  'ic-apple':       'Social sign-in "Apple" (0C / 0D)',
  'ic-roller':      'B0 job-type card — Roof Restoration',
  'ic-tiles':       'B0 job-type card — New Roof Installation',
  'ic-warn':        'Amber banners: measurement failed (B1), low confidence (B3), offline (A1)',
};

// --- extract every .ic-* mask SVG from base.css ---
const iconRe = /\.(ic-[a-z-]+)\s*\{[^}]*?[^-]mask-image:\s*url\('data:image\/svg\+xml;utf8,(<svg[\s\S]*?<\/svg>)'\)/g;
const icons = [];
for (const m of baseCss.matchAll(iconRe)) {
  icons.push({ cls: m[1], svg: decodeURIComponent(m[2]) });
}

// --- Google inline SVG from the design doc (first occurrence) ---
const google = design.match(/<svg viewBox="0 0 16 16"[\s\S]*?<\/svg>/)[0].replace(/\s+/g, ' ');

// --- filled map pin + selected-swatch check from components.css ---
const pin = decodeURIComponent(compCss.match(/\.aerial \.pin\s*\{[\s\S]*?url\('data:image\/svg\+xml;utf8,(<svg[\s\S]*?<\/svg>)'\)/)[1]);
const swatchCheck = decodeURIComponent(compCss.match(/\.swatch\.sel::after\s*\{[\s\S]*?[^-]mask-image:\s*url\('data:image\/svg\+xml;utf8,(<svg[\s\S]*?<\/svg>)'\)/)[1]);

// --- usage counts across both docs ---
const count = (cls) => ((design + guide).match(new RegExp(`${cls}\\b`, 'g')) || []).length - 2; // minus the 2 css-file defs? not present in html; keep raw
const usage = (cls) => ((design.match(new RegExp(`${cls}\\b`, 'g')) || []).length);

// --- build ICONS.md ---
let out = `# RoofBros — Icon inventory (generated)

Every icon used anywhere in the project, with its **raw SVG source** exactly as it ships.
Generated from source by \`node extract-icons.mjs\` — **do not hand-edit** this file.

- **${icons.length}** single-colour CSS-mask icons in \`styles/base.css\` (\`.ic-*\`). They inherit
  \`currentColor\`, so one SVG serves every colour the UI needs. All are one outline
  family: 24-viewBox, 2px stroke, round caps (the truck keeps its native 64 viewBox
  at an equivalent stroke weight).
- **1** genuine multi-colour logo (Google) inlined in the HTML — a single-colour mask can't carry 4 fills.
- **2** derived assets in \`styles/components.css\`: the filled map-marker pin and the selected-swatch tick.

Status-bar glyphs (\`ic-cell\`, \`ic-wifi\`, \`ic-batt\`) are decorative CSS shapes in \`device.css\`, not SVGs — excluded.

> RN handoff: feed these paths into \`react-native-svg\` components; keep \`stroke="currentColor"\`
> semantics by passing the colour as a prop. The Apple and Google marks are trademarks —
> replace with the official \`ASAuthorizationAppleIDButton\` / Google Sign-In button before shipping.

---
`;

let n = 1;
const googleCount = design.split('viewBox="0 0 16 16"').length - 1;
out += `\n## ${n++}. Google "G" mark — (inline SVG, no class)\n- **Source:** HashiCorp design-system\n- **Licence:** multi-colour trademark logo — replace with Google's official sign-in button before shipping\n- **Used for:** Social sign-in "Google" (0C / 0D)\n- **Instances in mockups:** ${googleCount}\n\n\`\`\`svg\n${google}\n\`\`\`\n`;

for (const { cls, svg } of icons) {
  const meta = META[cls] || { name: cls, source: 'UNKNOWN — add to extract-icons.mjs', licence: 'UNKNOWN' };
  out += `\n## ${n++}. ${meta.name} — \`.${cls}\`\n- **Source:** ${meta.source}\n- **Licence:** ${meta.licence}\n- **Used for:** ${USED_FOR[cls] || 'UNKNOWN — add to extract-icons.mjs'}\n- **Instances in mockups:** ${usage(cls)}\n\n\`\`\`svg\n${svg}\n\`\`\`\n`;
}

out += `\n## ${n++}. Map marker (filled pin) — \`components.css .aerial .pin\`\n- **Source:** ic-pin's outer path, filled maroon (#7D1017) with a thin white edge\n- **Licence:** Public Domain (derived from pixeden.com pin)\n- **Used for:** The draggable address marker on B1's aerial map\n\n\`\`\`svg\n${pin}\n\`\`\`\n`;
out += `\n## ${n++}. Selected-swatch tick — \`components.css .swatch.sel::after\`\n- **Source:** identical path to ic-check, rendered white at 16px over the selected swatch/colour\n- **Licence:** no external licence (hand-drawn)\n- **Used for:** Selected state on every colour swatch (C0, C2)\n\n\`\`\`svg\n${swatchCheck}\n\`\`\`\n`;

writeFileSync('ICONS.md', out);
console.log(`ICONS.md regenerated: ${icons.length} mask icons + Google + pin + swatch tick = ${n - 1} entries`);
for (const { cls } of icons) if (!META[cls]) console.warn('!! missing metadata for', cls);
