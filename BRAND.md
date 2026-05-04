# NZ Golf Stays — Brand Guide

> A discovery platform for New Zealand golf courses that welcome motorhome and caravan travellers to park overnight. Like Airbnb, but for motorhomes — at golf courses.

This guide is the source of truth for the visual identity. Use it whenever building or revising UI.

---

## 1. Brand essence

**Name:** NZ Golf Stays
**Audience:** NZ-based motorhome and caravan travellers, predominantly 50+, who play golf or want a quiet, scenic place to park overnight. Also Australian and international visitors touring NZ.
**Promise:** Find a welcoming course, see what's on offer, park up for the night.
**Personality:** Warm, plain-spoken, knowledgeable, a little bit Kiwi. Not corporate, not gimmicky, not "tech-startup". Think *NZ Geographic* or *AA Traveller* rather than *Airbnb*.

**Voice principles**
- Plain English over marketing-speak. "Park overnight" beats "Unlock your stay."
- Practical first. Travellers want price, power, dogs, booking — surface it.
- Light Kiwi flavour where it lands naturally (e.g. "park up", "tee off"). Don't force it.
- Never patronising about age or motorhome life.

---

## 2. Colour palette — Coastal Fairway

Inspired by NZ seaside links courses where fairways meet the coast. Greens lead, blues support, sand grounds. Use the named **roles** in code; the hex is the source value.

### Tokens

| Role | Name | Hex | Usage |
|---|---|---|---|
| `primary` | Fairway Green | `#2D5F3F` | Primary brand colour. Headers, primary buttons, key UI surfaces, logo. |
| `primary-dark` | Deep Fairway | `#1F4530` | Hover states for primary, dark-mode primary surfaces. |
| `secondary` | Ocean Blue | `#3A7CA5` | Secondary actions, links, map accents, "Stay" indicators. |
| `accent` | Sea Foam | `#A8DADC` | Soft highlights, hover backgrounds, badge fills, illustrations. |
| `neutral-warm` | Pale Sand | `#F4ECD8` | Page backgrounds, card backgrounds when warmth is wanted, badge fills. |
| `neutral-mid` | Driftwood | `#8B7355` | Tertiary text, dividers when warmth is wanted, secondary metadata. |
| `text` | Deep Navy | `#1D3557` | Primary body text, headings. Do **not** use pure black. |
| `surface` | White | `#FFFFFF` | Cards, modals, primary surfaces. |
| `surface-alt` | Mist | `#F7F9FA` | Subtle alternate surface, table stripes, app background on cool screens. |
| `border` | Hairline | `#E6E6E6` | Default dividers and card outlines. |
| `success` | Fairway Green | `#2D5F3F` | Reuse the primary — keeps the palette tight. |
| `warning` | Stamen | `#E8B547` | Use sparingly for "ask first" / "must book" notices. |
| `danger` | Pōhutukawa | `#C73E1D` | Errors, destructive actions only. Never decorative. |

### Usage rules

- **60 / 30 / 10:** roughly 60% neutrals (white, sand, mist), 30% Fairway Green surfaces, 10% Ocean Blue / Sea Foam accents. Don't flood the UI in green.
- **Pale Sand** is the warm background; **Mist** is the cool background. Pick one per screen — don't mix.
- **Sea Foam** is a tint, not a fill for important surfaces. Buttons in Sea Foam look weak.
- **Deep Navy** for body copy, not Fairway Green. Green text on white reads as a link.
- Keep gradients subtle if used at all (Fairway Green → Deep Fairway, ~10° angle). No rainbow gradients, no glow effects.
- Pure black (`#000`) and pure white text on coloured backgrounds is allowed; reserve pure black for code-style mono only.

### Contrast (WCAG AA)

- **Fairway Green on white** — 7.4:1 ✅
- **Deep Navy on white** — 12.6:1 ✅
- **Deep Navy on Pale Sand** — 11.5:1 ✅
- **Ocean Blue on white** — 4.6:1 ✅ (AA for normal text)
- **White on Fairway Green** — 7.4:1 ✅
- **Driftwood on white** — 4.5:1 ⚠️ (AA only — use for metadata, not body)
- **Sea Foam on white** — 1.5:1 ❌ (decorative only, never for text)

---

## 3. Typography

### Typeface pairing

**Display / Headings: [Fraunces](https://fonts.google.com/specimen/Fraunces)** (Google Fonts, free)
A variable serif with character — soft, slightly editorial. Gives the brand a travel-magazine feel rather than a generic SaaS feel.
- Use weights **500** (Medium) and **600** (SemiBold).
- Use the optical-size axis: opsz **24–144** for big display, opsz **9** for inline serif use.
- Disable the "soft" variation axis (SOFT 0). Slight "wonky" axis (WONK 1) is allowed at very large sizes only for hero headlines.

**Body / UI: [Inter](https://fonts.google.com/specimen/Inter)** (Google Fonts, free)
Workhorse sans for everything UI: buttons, body, labels, navigation.
- Use weights **400** (Regular), **500** (Medium), **600** (SemiBold).
- Tracking: default for body; **-0.01em** for sizes ≥18px; **-0.02em** for ≥32px.

**Mono (rare):** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) for any code or coordinate display.

### Type scale

Use this scale (rem at 16px base). Don't invent off-scale sizes.

| Token | Size | Line | Weight | Family | Use |
|---|---|---|---|---|---|
| `display` | 56 / 3.5rem | 1.05 | 600 | Fraunces | Hero headlines on landing |
| `h1` | 40 / 2.5rem | 1.1 | 600 | Fraunces | Page titles |
| `h2` | 30 / 1.875rem | 1.2 | 600 | Fraunces | Section headers |
| `h3` | 22 / 1.375rem | 1.3 | 600 | Fraunces | Card titles, modal titles |
| `h4` | 18 / 1.125rem | 1.4 | 600 | Inter | Subsection headers (sans here, on purpose) |
| `body` | 16 / 1rem | 1.5 | 400 | Inter | Default body |
| `body-sm` | 14 / 0.875rem | 1.5 | 400 | Inter | Secondary text, metadata |
| `caption` | 12 / 0.75rem | 1.4 | 500 | Inter | Eyebrows, badges, labels |
| `eyebrow` | 11 / 0.6875rem | 1.4 | 600 | Inter | UPPERCASE, letter-spacing 0.14em |

**Pairing rule:** Headlines use Fraunces. Anything that looks like a UI control (button, tab, input, badge, nav) uses Inter. Don't put Fraunces on a button — it goes brittle at small sizes.

---

## 4. Layout and component principles

### Spacing
4px base. Use the scale **4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96**. Don't invent values.

### Radius
- `radius-sm` 6px — inputs, badges
- `radius-md` 12px — cards, buttons (pill buttons excepted)
- `radius-lg` 16px — modals, large surfaces
- `radius-pill` 999px — primary CTA buttons, filter chips

Pill buttons signal "discover/explore" actions; rectangular 12px-radius buttons signal "submit/confirm/destructive". Use the distinction deliberately.

### Shadow
Use sparingly. Two levels only:
- `shadow-sm` — `0 1px 2px rgba(29, 53, 87, 0.06)` for cards at rest
- `shadow-md` — `0 8px 24px rgba(29, 53, 87, 0.10)` for elevated/hover/modals

Never use multi-layer "Material" shadows or coloured neon glows.

### Buttons
- **Primary**: Fairway Green bg, white text, pill, 600 weight, 14–15px.
- **Secondary**: white bg, Fairway Green text, 1px Fairway Green border, pill.
- **Tertiary / link**: Ocean Blue text, no background, underline on hover.
- **Destructive**: Pōhutukawa bg, white text, 12px radius (square-ish, not pill — friction is the point).

### Cards
- White surface, 1px Hairline border, `radius-md`, `shadow-sm`.
- On hover: lift to `shadow-md`, border stays.
- Image area: 16:10 ratio for course cards, 4:3 for list view.

### Maps
- Use a custom Google Maps style: muted greens for parks/golf, Sea Foam water, Pale Sand land. Never default Google blue/yellow.
- Course pins: Fairway Green tear-drop with white golf-flag glyph. Selected pin: Ocean Blue.

---

## 5. Photography and imagery direction

- **Subjects:** Wide NZ landscape shots — fairways with sea behind, motorhomes parked at dusk, coastal greens, native bush bordering courses, rolling rural courses.
- **Treatment:** Natural light, slightly warm white balance. Avoid heavy filters, HDR, or oversaturated greens.
- **People:** Show real travellers (50+) where possible. Avoid stock-photo "young fitness" golf imagery — wrong audience.
- **Avoid:** Drone shots so wide the course is unrecognisable. Generic golf-ball-in-grass close-ups. Anything that looks like American country-club marketing.

### Iconography
- Stroke-based, 1.5px stroke, rounded caps. [Lucide](https://lucide.dev) is the chosen icon set.
- Filled icons reserved for active/selected states only.
- Custom glyphs (golf flag, motorhome silhouette, power plug, dog) should match Lucide's stroke weight.

---

## 6. Logo direction

The logo should be designed externally (image AI tool / illustrator). Targeting a wordmark + simple symbol that scales from favicon to billboard. Direction:

**Preferred concept:** A **golf flag pin** where the flag itself is a stylised silver fern frond, in Fairway Green. The pin sits to the left of the wordmark "NZ Golf Stays" set in Fraunces SemiBold.

**Alternates worth exploring:**
1. Golf flag pin rising from a tiny motorhome silhouette
2. A coastal hill profile with a flag and a parked van — landscape badge style, good for stickers/swag
3. A koru spiral that resolves into a flag pin — most distinctly NZ

**Colour:** Single-colour Fairway Green primary. Reverse to Pale Sand on dark backgrounds. A two-colour version may add Ocean Blue for the wordmark only.

**Don't:** Use a golf ball as the dominant symbol (too generic). Use kiwi birds (cliché). Use multiple icons stacked together. Use gradients in the logo.

---

## 7. Voice examples

| Don't say | Say |
|---|---|
| "Unlock authentic Kiwi adventures" | "Find a course. Park up. Tee off if you want." |
| "Premium overnight experiences" | "200+ NZ courses welcoming motorhomes overnight" |
| "Join our growing community" | "Save your favourites and submit courses you've stayed at" |
| "Powered by Supabase" | (don't credit infrastructure in product copy) |

Empty states and error states should be plain and helpful, not whimsical. "No courses match these filters — try widening the region." beats "Whoops! Looks like our greens are empty."

---

## 8. Quick token reference (for code)

```ts
export const colors = {
  primary:      '#2D5F3F', // Fairway Green
  primaryDark:  '#1F4530', // Deep Fairway
  secondary:    '#3A7CA5', // Ocean Blue
  accent:       '#A8DADC', // Sea Foam
  neutralWarm:  '#F4ECD8', // Pale Sand
  neutralMid:   '#8B7355', // Driftwood
  text:         '#1D3557', // Deep Navy
  surface:      '#FFFFFF',
  surfaceAlt:   '#F7F9FA', // Mist
  border:       '#E6E6E6', // Hairline
  warning:      '#E8B547', // Stamen
  danger:       '#C73E1D', // Pōhutukawa
};

export const fonts = {
  display: '"Fraunces", Georgia, serif',
  body:    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono:    '"JetBrains Mono", ui-monospace, monospace',
};

export const radius = { sm: 6, md: 12, lg: 16, pill: 9999 };
```

---

## 9. What to avoid (anti-patterns)

- Generic "AI/SaaS" aesthetic: purple gradients, glassmorphism, neon glow shadows, oversized hero text in pure black.
- Cluttered cards with five badges, three icons, and a star rating fighting for attention.
- Twee Kiwiana: jandals, sheep, "She'll be right" puns, hokey pokey colour schemes.
- Overuse of pure Fairway Green — it dominates the palette if you let it. Lean on neutrals.
- Mixing Fraunces and Inter on the same line. They're a pair, not a blend.
