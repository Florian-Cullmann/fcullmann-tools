---
name: "fcullmann.com Search First"
description: "A direct, compact utility catalogue for useful software by Florian Cullmann."
colors:
  cool-canvas: "#f5f7fb"
  utility-surface: "#ffffff"
  soft-surface: "#fafbfe"
  primary-ink: "#252832"
  secondary-ink: "#606673"
  cool-line: "#dfe3eb"
  strong-line: "#cfd5e0"
  action-coral: "#e84b3c"
  action-coral-dark: "#cc392d"
  action-coral-soft: "#fff0ed"
  category-violet: "#7257d4"
  category-violet-soft: "#f0edff"
  category-green: "#3f9858"
  category-green-soft: "#ebf8ef"
  category-blue: "#3977be"
  category-blue-dark: "#2462a9"
  category-blue-soft: "#eaf3ff"
  category-amber: "#aa7414"
  category-amber-soft: "#fff5dc"
  danger: "#b42318"
  success: "#18743d"
typography:
  display:
    fontFamily: "Public Sans, Arial, sans-serif"
    fontSize: "clamp(2rem, 3vw, 3.35rem)"
    fontWeight: 820
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Public Sans, Arial, sans-serif"
    fontSize: "clamp(2.2rem, 4.2vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.038em"
  title:
    fontFamily: "Public Sans, Arial, sans-serif"
    fontSize: "1.04rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Public Sans, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Public Sans, Arial, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.45
  code:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  badge: "6px"
  control: "9px"
  tile: "10px"
  search: "13px"
  card: "14px"
spacing:
  compact: "8px"
  grid: "12px"
  field: "16px"
  card: "18px"
  section: "30px"
components:
  button-primary:
    backgroundColor: "{colors.action-coral}"
    textColor: "white"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.action-coral-dark}"
    textColor: "white"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.utility-surface}"
    textColor: "{colors.primary-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "40px"
  search-field:
    backgroundColor: "{colors.utility-surface}"
    textColor: "{colors.primary-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.search}"
    padding: "0 14px 0 17px"
    height: "58px"
  filter-chip:
    backgroundColor: "{colors.utility-surface}"
    textColor: "{colors.secondary-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 13px"
  filter-chip-selected:
    backgroundColor: "{colors.primary-ink}"
    textColor: "white"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "8px 13px"
  utility-card:
    backgroundColor: "{colors.utility-surface}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.card}"
    padding: "18px"
  code-field:
    backgroundColor: "{colors.soft-surface}"
    textColor: "{colors.primary-ink}"
    typography: "{typography.code}"
    padding: "16px"
---

# Design System: fcullmann.com Search First

## Overview

**Creative North Star: "Search First Utility Catalogue"**

Search First is a direct utility library with a personal author, not a portfolio hero with tools attached. A cool canvas, white work surfaces, compact sans typography, and dense repeated rows make the site feel immediately useful. Florian's authorship appears through the wordmark, restrained introduction, projects, and writing while search remains the clearest route into the product.

The system is bright, precise, and familiar without becoming generic. Coral identifies primary actions and active attention; small violet, green, blue, and amber tiles sort tools into functional families. Rounded rectangles, quiet cool borders, and measured gaps create a steady catalogue rhythm that can scale beyond fifty tools without turning into a decorative card collage.

The shipped implementation is the token authority. The approved composition is `.impeccable/mocks/search-led-catalogue.webp` (Straight Utility Catalogue, seed `9c978054`), and the finish review verdict is **ship** with no material fixes. No raster media ships in the interface; the visual system is semantic HTML, CSS, and inline Lucide geometry.

**Key Characteristics:**

- A cool off-white canvas beneath crisp white utility surfaces.
- Coral reserved for primary action, focus, and directional emphasis.
- Compact Public Sans throughout the interface; JetBrains Mono only inside technical fields.
- Dense, responsive catalogue grids with one clear search control above them.
- Multicolor functional glyph tiles that make repeated tool rows faster to scan.
- Gentle rounded rectangles, cool 1px borders, and soft state-driven elevation.

## Colors

The palette is a cool neutral utility base with one warm action color and a small functional spectrum for category recognition and status.

### Primary

- **Action Coral:** Marks the wordmark tile, primary tool actions, focus, selection, and the strongest directional links.
- **Action Coral Dark:** Supplies hover and pressed contrast for coral actions and text links.
- **Action Coral Soft:** Creates the broad focus halo and quiet coral-tinted field states without turning whole surfaces red.

### Secondary

- **Category Violet:** Identifies one tool family and writing glyphs; its pale partner is used only as a contained tint.
- **Category Green:** Identifies one tool family; its pale partner also backs positive privacy and success states.
- **Category Blue:** Identifies converter and planned-tool families; the dark and pale steps support readable labels and quiet badges.
- **Category Amber:** Identifies text-oriented tools and sample-state badges; its pale partner contains the hue.

### Tertiary

- **Success:** Communicates locally processed, valid, and successful states.
- **Danger:** Communicates invalid input, failures, and destructive actions. It never substitutes for decorative coral.

### Neutral

- **Cool Canvas:** The application ground keeps dense white catalogues legible without the glare of a pure-white page.
- **Utility Surface:** The default card, field, header, footer, and workspace surface.
- **Soft Surface:** A quiet inset layer for keyboard hints, labels, secondary hover states, and code fields.
- **Primary Ink:** Default text and the selected-filter fill.
- **Secondary Ink:** Supporting copy, metadata, inactive controls, and subdued icons.
- **Cool Line:** Default boundaries and row separators.
- **Strong Line:** Emphasized controls, dashed empty states, and hover-ready boundaries.

**The Coral Attention Rule.** Coral marks the next action or the current point of attention; keep it out of large backgrounds and do not assign it to every card.

**The Functional Tile Rule.** Violet, green, blue, and amber live in small glyph tiles, badges, or explicit states; they classify repeated content rather than compete as page-level accents.

**The State Is Semantic Rule.** Success and danger colors always accompany readable text or status structure and never carry meaning alone.

## Typography

**Display Font:** Public Sans (with Arial and generic sans-serif fallbacks)

**Body Font:** Public Sans (with Arial and generic sans-serif fallbacks)

**Label/Mono Font:** Public Sans for interface labels; JetBrains Mono for tool input and output

**Character:** One compact workhorse sans keeps authorship and utility in the same voice. Weight, size, and tight heading tracking establish hierarchy; monospace appears only where the content is encoded, counted, or edited.

### Hierarchy

- **Display** (820, fluid up to `3.35rem`, 1.08): The concise centered home introduction; bold but deliberately smaller than an oversized portfolio hero.
- **Headline** (700, fluid up to `4rem`, 1.05): Interior page and tool titles with tight tracking and balanced wrapping.
- **Title** (700, `1.04rem`, 1.25): Section headings; cards step down slightly to about `0.92rem` so dense grids remain calm.
- **Body** (400, `1rem`, 1.65): Explanations and page copy, generally kept near 62–68 characters per line.
- **Label** (650–750, about `0.72–0.82rem`, 1.45): Navigation, filters, counts, buttons, metadata, and field labels.
- **Code** (400, `0.8rem`, 1.7): JSON, conversion input, output, and other technical work areas.

**The One-Sans Rule.** Use Public Sans for identity, headings, prose, navigation, and controls; hierarchy comes from scale and weight, not a decorative display family.

**The Monospace Boundary Rule.** JetBrains Mono belongs inside technical input, output, and code metadata only; do not use it as a general developer aesthetic.

## Layout

The public shell is fluid up to `1400px`, with `28px` gutters on desktop and `16px` gutters below `760px`. The header is a slim sticky strip: wordmark, centered primary navigation, and locale control align on one row, while narrow screens move navigation to its own horizontally scannable row.

Catalogue density is deliberate. Featured tools use six columns at full width, four below `1100px`, two below `760px`, and one below `500px`. Compact all-tools rows use five, three, two, then one column at the same breakpoints. Gaps cluster around `8–12px`; section transitions use about `20–30px`, keeping more than one catalogue layer visible around the fold.

Tool workspaces use two equal panes and collapse to one column below `760px`. Reading content stays near `780px`, explanatory copy near `62–68ch`, and administrative content near `1160px` so the same compact rhythm survives across operate and read surfaces.

**The Search Leads Rule.** On catalogue surfaces, the widest and most visually elevated control is search; filters and sorting remain compact supporting controls directly around the results.

**The Density Scales Rule.** Preserve the information order while reducing column count; do not remove search, categories, names, or result feedback to make mobile fit.

## Elevation & Depth

The system is flat at rest. White and soft-white tonal layers, 1px cool borders, and inset separators explain most depth. The focal search has a low ambient shadow; cards gain a similarly soft shadow and lift by `2px` only on hover. Focus uses a coral-tinted `4px` halo plus a slight lift. Sticky navigation relies on opacity and a bottom rule rather than blur or heavy depth.

### Shadow Vocabulary

- **Search Ambient** (`0 8px 26px rgba(35, 42, 58, 0.08)`): A constant low shadow that distinguishes the primary search control from the catalogue.
- **Search Focus** (`0 0 0 4px #fff0ed, 0 12px 32px rgba(35, 42, 58, 0.10)`): Combines semantic coral focus with a slightly deeper ambient layer.
- **Card Hover** (`0 8px 22px rgba(35, 42, 58, 0.07–0.08)`): Appears only while an actionable utility card is hovered.
- **Inset Focus** (`inset 0 0 0 2px #fff0ed`): Marks focus inside borderless code work areas without changing their dimensions.

**The Quiet-at-Rest Rule.** Cards and workspaces rest on borders and tonal contrast; shadows appear only for the focal search or an interactive state.

## Shapes

The form language is a controlled family of gently rounded rectangles. Large cards and workspaces use `14px` corners, the focal search uses `13px`, ordinary controls use about `8–9px`, and glyph tiles use `9–10px`. Small status and sample badges tighten to `6–7px`. Borders are consistently one cool pixel; circles and pills are not the default silhouette.

**The Nested Radius Rule.** Outer containers receive the largest corners, controls and tiles step down, and small badges step down again so nested shapes feel intentional.

**The Rectangle Rule.** Filters, buttons, search, cards, and fields stay compact rounded rectangles; avoid oversized pills that imply a softer consumer-social product.

## Components

Components are practical, compact, and visibly interactive. Their states change border, tint, elevation, or a small directional glyph while preserving the dense grid.

### Buttons

- **Shape:** Compact rounded rectangle (`9px`) with a `40px` minimum action height and `14px` horizontal padding.
- **Primary:** White label on Action Coral with a matching border; used for the principal operation inside a tool.
- **Hover / Focus:** Darken to Action Coral Dark on hover. All keyboard-focusable controls use the visible coral outline (`3px`, offset `3px`); reduced-motion users receive effectively instant state changes.
- **Secondary:** White surface, cool border, and Primary Ink; hover shifts to Soft Surface and Strong Line. Disabled controls reduce opacity while preserving the label.

### Chips

- **Style:** Category filters are compact bordered rectangles (`9px`) with a white surface and secondary text.
- **State:** Hover strengthens the border and text. The selected state inverts to Primary Ink with white text and exposes `aria-pressed`; filter rows scroll horizontally on narrow screens.

### Cards / Containers

- **Corner Style:** Gently rounded (`14px`) across tool cards, article lists, workspaces, and most supporting panels.
- **Background:** Utility Surface over Cool Canvas, with Soft Surface reserved for inset labels and secondary layers.
- **Shadow Strategy:** Flat at rest; actionable cards lift `2px` with the Card Hover shadow.
- **Border:** One-pixel Cool Line; actionable hover shifts toward Strong Line.
- **Internal Padding:** Usually `13–20px`, scaled to density rather than varied decoratively.

### Inputs / Fields

- **Style:** The catalogue search is a `58px` bordered white field with a search icon, flexible native input, and optional shortcut or clear control. Tool text areas are borderless inset panes with JetBrains Mono and generous vertical workspace.
- **Focus:** Search changes to a coral border, `4px` coral-soft halo, and `1px` lift. Technical fields use a white surface with an inset coral-soft focus ring.
- **Error / Disabled:** Errors use Danger on a pale red strip with explicit copy; disabled actions retain their structure at reduced opacity.

### Navigation

- **Style:** The sticky white header is `64px` tall on desktop with a coral code-mark tile, strong wordmark, compact neutral links, and a bordered locale control.
- **State:** Links draw a short coral underline from the center on hover and keyboard focus. Below `760px`, navigation moves to a second bordered row; below `500px`, it may scroll horizontally.

### Utility Card

Each card starts with a contained functional glyph tile, followed by a concise name and muted one-line or short summary. Featured cards stack vertically; compact catalogue cards align tile, copy, and arrow in one row. The arrow stays subdued until the card's border, shadow, and position provide the primary hover response.

### Tool Workspace

The workspace is a bordered white `14px` container with a compact header, pale field labels, two equal technical panes, and a bottom action row. Pane borders, not floating subcards, separate input from output. On mobile the panes stack and the actions may share the available width.

## Do's and Don'ts

### Do:

- **Do** place direct search and filtering ahead of profile storytelling on utility catalogue surfaces.
- **Do** use white cards, cool 1px borders, and compact `8–12px` grid gaps to make large result sets scan quickly.
- **Do** reserve coral for the next action, focus, and a few directional cues.
- **Do** use the multicolor glyph tiles consistently to classify tool families.
- **Do** preserve explicit labels, visible focus, live result feedback, and reduced-motion behavior.

### Don't:

- **Don't** add an oversized profile hero, portrait-led composition, or atmospheric metaphor that delays the first useful action.
- **Don't** turn every card into a floating panel; the system is border-led and only lifts on interaction.
- **Don't** spread violet, green, blue, and amber across page backgrounds; keep them functional and contained.
- **Don't** use monospace outside technical work or replace the compact sans hierarchy with a decorative display face.
- **Don't** replace the rounded-rectangle vocabulary with pervasive pills, sharp boxes, or ornamental geometry.
