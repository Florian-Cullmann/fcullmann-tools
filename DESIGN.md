---
name: "fcullmann.com API Atlas"
description: "A technical field atlas for Florian Ullmann's tools, projects, and practical writing."
colors:
  route-vermilion: "#b83212"
  route-vermilion-dark: "#a92c0d"
  cartographic-blue: "#55728b"
  map-paper: "#f5f2e8"
  map-paper-deep: "#e8e0d2"
  deep-ink: "#1b2225"
  soft-ink: "#536064"
  survey-line: "color-mix(in srgb, #1b2225 27%, transparent)"
  survey-line-soft: "color-mix(in srgb, #1b2225 13%, transparent)"
  valid-green: "#19713f"
  error-red: "#a52119"
  admin-canvas: "#f5f6f4"
  admin-ink: "#18201e"
  admin-action: "#1f5e50"
typography:
  display:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(3.2rem, 4.6vw, 5.25rem)"
    fontWeight: 560
    lineHeight: 0.93
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(3rem, 6vw, 5.8rem)"
    fontWeight: 560
    lineHeight: 0.94
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "1.55rem"
    fontWeight: 550
    lineHeight: 1.1
  body:
    fontFamily: "Public Sans, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.67rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.055em"
  code:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.72rem"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  square: "0px"
  waypoint: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  field: "30px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.route-vermilion}"
    textColor: "white"
    rounded: "{rounded.square}"
    padding: "10px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.route-vermilion-dark}"
    textColor: "white"
    rounded: "{rounded.square}"
    padding: "10px 20px"
    height: "44px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.square}"
    padding: "10px 20px"
    height: "44px"
  formatter-field:
    backgroundColor: "{colors.map-paper}"
    textColor: "{colors.deep-ink}"
    typography: "{typography.code}"
    rounded: "{rounded.square}"
    padding: "18px"
  atlas-container:
    backgroundColor: "{colors.map-paper}"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.square}"
    padding: "16px"
  coordinate-label:
    textColor: "{colors.soft-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
  admin-button-primary:
    backgroundColor: "{colors.admin-action}"
    textColor: "white"
    rounded: "{rounded.square}"
    padding: "8px 14px"
    height: "40px"
---

# Design System: fcullmann.com API Atlas

## Overview

**Creative North Star: "API Atlas"**

API Atlas treats Florian Ullmann's portfolio and tool catalogue as one navigable technical territory. Warm folded map stock, survey lines, route identifiers, and compact coordinates create a precise working document rather than a generic hero followed by a card grid. The public experience is editorial but operational: visitors meet Florian, complete a real task, then follow authored routes into tools, projects, and writing.

The world is restrained, tactile, and technically credible. Deep ink carries most information; vermilion marks the primary path and cartographic blue marks supporting paths. Texture supplies material character while square bordered fields keep tools usable. The homepage is the fullest expression of the atlas, with an identity legend beside a dominant two-pane formatter and featured routes crossing the fold. Interior pages reuse the route language at lower density so content remains primary.

The protected admin and login surfaces are deliberately related rather than decorative copies. They retain Public Sans, square geometry, fine borders, compact labels, and a small warm route marker, then shift to a cooler neutral canvas and dark sidebar for sustained desktop operation.

**Key Characteristics:**

- Warm, quiet map stock beneath semantic HTML and CSS-drawn geometry.
- One vermilion primary route, one cartographic-blue secondary route, and deep ink for almost everything else.
- Editorial serif identity and headings; compact grotesk UI; monospace only for code, coordinates, route IDs, dates, and technical metadata.
- Square bordered work fields contrasted with circular waypoints and tool glyph markers.
- Functional wayfinding: labels, route numbers, status, and direction always communicate structure or state.

The visual authority is the approved API Atlas composition at `.impeccable/mocks/decision/api-atlas.webp` (ranked first, seed `a1ea90f0`), confirmed against `.impeccable/review/desktop.png`, `hero-repro.png`, and `mobile.png`. Final review disposition is **pass with optional polish**. The only shipping raster is `public/textures/atlas-paper.webp`; its prompt sidecar and `.impeccable/assets-manifest.md` preserve provenance, and the asset scan records one raster with zero missing provenance entries.

## Colors

The palette reads like printed survey ink on warm uncoated stock, with accents reserved for routes, links, and state.

### Primary

- **Route Vermilion** (#B83212): The contrast-safe primary route color. Use it for the Format JSON action, the principal path, tool indices, active directional links, and small identity marks.
- **Route Vermilion Dark** (#A92C0D): The primary route's hover and pressed treatment, not an independent accent.

### Secondary

- **Cartographic Blue** (#55728B): Marks secondary routes, project and writing destinations, supporting links, selection, scrollbars, and the universal focus outline. It may tint quiet hover backgrounds at very low opacity.

### Tertiary

- **Valid Green** (#19713F): Positive formatter and privacy states only; never use it as general decoration.
- **Error Red** (#A52119): Invalid input, copy failures, destructive or error communication. Keep it distinct from decorative vermilion by pairing it with explicit status text.
- **Admin Action Green** (#1F5E50): The admin's primary save/sign-in action. It belongs to the operational surface, not the public route map.

### Neutral

- **Map Paper** (#F5F2E8): The public canvas and field base. The shipping atlas-paper texture tiles over this fallback without changing its dominant color.
- **Map Paper Deep** (#E8E0D2): A reserved warm neutral for deeper paper layering when a stronger tonal step is genuinely needed.
- **Deep Ink** (#1B2225): Default public text, strong borders, and scale bars.
- **Soft Ink** (#536064): Supporting copy, metadata, line markers, and quieter labels.
- **Survey Line** (`color-mix(in srgb, #1B2225 27%, transparent)`): The standard field and region separator.
- **Survey Line Soft** (`color-mix(in srgb, #1B2225 13%, transparent)`): Quiet internal dividers and guide geometry.
- **Admin Canvas** (#F5F6F4): The cooler protected-surface background.
- **Admin Ink** (#18201E): The protected surface's default text and sidebar base.

**The Route Scarcity Rule.** Vermilion identifies the primary route or action; do not wash large backgrounds with it or apply it to every link.

**The Functional Color Rule.** Blue means a secondary path or focus, green means success, and red means failure or danger; never exchange those meanings for variety.

## Typography

**Display Font:** Source Serif 4 (with Georgia and generic serif fallbacks)

**Body Font:** Public Sans (with Arial and generic sans-serif fallbacks)
**Label/Mono Font:** JetBrains Mono (with generic monospace fallback)

**Character:** Source Serif 4 gives the atlas an authored, field-manual voice without nostalgia becoming costume. Public Sans keeps interfaces and navigation brisk; JetBrains Mono makes coordinate and code semantics immediately legible. All three are loaded through `next/font`, avoiding a runtime font dependency.

### Hierarchy

- **Display** (560, fluid from 3.2rem to 5.25rem, 0.93): Florian's name and other identity-defining moments. Use tight tracking and short measures.
- **Headline** (560, fluid from 3rem to 5.8rem, 0.94): Interior page titles. Mobile resolves to roughly 3rem rather than shrinking into body hierarchy.
- **Title** (550, 1.55rem, 1.1): Route-close panels and editorial subheads.
- **Body** (400, 1rem, 1.7): Long descriptions and page introductions, normally capped near 65–72 characters. Compact list copy may step down to 0.68–0.9rem while retaining generous line-height.
- **Label** (400–760, 0.57–0.72rem, tracked): Coordinates, route IDs, dates, categories, badges, and field metadata. Uppercase is appropriate for map annotations, not ordinary prose.
- **Code** (400, 0.72rem, 1.7): JSON input and output. Preserve whitespace and allow long data to scroll or wrap without breaking the field.

**The Three-Voice Rule.** Serif authors the territory, sans-serif operates it, and monospace locates or encodes it. Do not use monospace as a general futuristic decoration.

## Layout

The public shell is centered at a maximum width of 1400px with 24px outer gutters on desktop and 12px on narrow phones. Fine vertical quarter guides, borders, and the paper folds create the grid; they are supporting coordinates, not content columns that every element must fill.

On wide screens the home workbench uses a compact identity rail beside a dominant formatter at roughly a 1:4 ratio. The formatter is a two-pane input/output field, followed by a numbered route divider, then a two-column featured-tools and writing region. Interior indexes use bordered rows rather than freestanding cards. Reading content narrows to 850px overall and 72ch for prose.

At 980px, the primary navigation becomes a full-width horizontally scrollable row, the identity and formatter stack, lower home regions become one column, and the admin sidebar narrows. At 700px, the paper guide grid is removed, formatter panes stack vertically, actions wrap to full available width, catalog metadata is progressively hidden, editorial lists reflow, and the admin becomes a one-column shell with horizontally scrollable navigation. Borders stay intact so stacked regions still read as one field atlas.

English and German share the same structures. Let labels and titles wrap; never size controls to a single English string. Locale changes preserve the corresponding route. Keep route IDs, coordinates, dates, and counts semantically separate from localized prose, and verify both locales at the 700px and 980px boundaries.

Growth beyond 50 tools depends on the catalogue contract: stable `T-###` identifiers, searchable localized name/summary/category data, reusable row and glyph primitives, and one task per tool route. Add category filters, result counts, pagination, or virtualization inside this index pattern when scale requires them; do not return to a many-card dashboard.

**The Cross-the-Fold Rule.** On the home surface, the working formatter owns the first viewport while the route and featured destinations remain visibly connected below it.

## Elevation & Depth

The system is flat by default. Paper texture, border weight, route overlap, and tonal transparency establish depth; public lists, pages, and admin cards do not float. The formatter alone receives a restrained structural shadow so the live workbench separates from the mapped ground without looking like a generic elevated card.

### Shadow Vocabulary

- **Workbench lift** (`0 15px 28px -25px color-mix(in srgb, #1b2225 45%, transparent)`): Use only on an active, dominant work field comparable to the formatter.

**The Survey-Flat Rule.** Prefer rules, ink density, and paper layers over shadows. A shadow must explain active working depth, never merely decorate a container.

## Shapes

The core form language is square and measured. Containers, buttons, inputs, badges, search fields, cards, and admin editors use zero corner radius and one-pixel borders. Dividers may be solid or dashed when the dash carries route semantics.

Circles are a controlled exception for numbered waypoints, route destinations, compass-like marks, and authored tool glyphs. They identify locations in the system; they are not a softer alternate card or button style. Registration ticks, scale bars, and route lines remain thin, orthogonal geometry.

**The Field-and-Waypoint Rule.** Work happens in square bordered fields; circles mark where the visitor is going.

## Components

### Buttons

Buttons feel like explicit route controls: square, weighty, and concise.

- **Shape:** Square corners, one-pixel border, and a minimum touch height of 44px on the public surface.
- **Primary:** Vermilion fill with white text, usually 10px × 20px padding. The home formatter uses a wide 210px anchor so “Format JSON” reads as the route endpoint.
- **Hover / Focus / Active:** Hover deepens to route vermilion dark. Every interactive element receives a 3px cartographic-blue focus outline with a 3px offset; do not remove it. Disabled controls reduce opacity to 45% and use a not-allowed cursor. Pressed state remains flat and immediate.
- **Secondary:** Transparent paper, ink text, and survey border; hover shifts border and text to cartographic blue.
- **Admin:** Slightly denser 40px controls; primary actions use admin action green, destructive actions use error-colored text and border.

### Chips

Badges are small cartographic annotations, not pills.

- **Style:** Square, transparent, one-pixel cartographic-blue border with blue JetBrains Mono text and uppercase labels.
- **State:** Use for categories, sample-content disclosure, or status metadata. Selected filters may use a subtle blue tint but must retain a text label.

### Cards / Containers

Containers resemble plotted fields, never generic cards.

- **Corner Style:** Square corners throughout.
- **Background:** Map paper or a slightly white paper mix on public work surfaces; white on the cooler admin canvas.
- **Shadow Strategy:** Flat except for the dominant active workbench described above.
- **Border:** One-pixel deep ink for primary work fields; survey-line strengths for lists and subdivisions.
- **Internal Padding:** Compact rows use 8–16px; larger field or route-close regions use 24–38px.

### Inputs / Fields

Inputs are direct working areas with labels integrated into their field geometry.

- **Style:** Square, transparent or lightly paper-toned, one-pixel ink or survey border. Code fields use JetBrains Mono and generous line-height.
- **Focus:** The shared blue 3px focus outline remains visible; large textareas may inset the outline to prevent clipping.
- **Status:** Valid, dirty, idle, and invalid states pair semantic color with explicit live text. Errors sit directly against the affected field; color is never the only signal.
- **Disabled:** Reduce opacity, preserve label legibility, and prevent pointer implication.

### Navigation

The public header is one compact horizontal line with the compass wordmark, four destination links, and a locale action. Links stay ink-colored at rest and draw a 2px vermilion underline on hover or keyboard focus. Below 980px, destinations move to their own horizontally scrollable row rather than collapsing behind a menu. The locale control is a text button with an icon and an accessible destination-language label.

The admin uses a dark fixed desktop sidebar, icon-plus-text routes, and a filled active row. On mobile it becomes a horizontal route strip above the content. The protected shell does not use public coordinate decoration because publishing clarity outranks atmosphere.

### Formatter Workbench

The formatter is the signature component and the clearest expression of “useful software, carefully made.” Its header binds route metadata to a live status; paired input and formatted output share one border; copy and clear are secondary actions; Format JSON is the unmistakable primary endpoint. Output line numbers are part of the current system. Preserve keyboard access, live validation, copy feedback, scrollable code, and the single-use telemetry boundary when adapting it to other tools.

### Atlas Rows and Routes

Tool and article indexes use full-width bordered rows with stable identifiers, semantic titles, concise descriptions, and a terminal arrow. Hover introduces a low-opacity route tint or a small directional shift. Vermilion solid segments identify the main tools path; cartographic-blue solid or dashed segments identify projects, writing, and supporting continuation. Coordinates and route labels must describe actual information architecture rather than appear as filler.

## Do's and Don'ts

### Do:

- **Do** use Route Vermilion sparingly for the one primary action or route and Cartographic Blue for supporting navigation and focus.
- **Do** preserve square field geometry, fine borders, circular waypoint semantics, and the visible paper base across new public tools.
- **Do** keep code, status, validation, copy, and clear behavior genuinely functional; the atlas metaphor must improve wayfinding rather than mask a mock interface.
- **Do** test English and German without truncation, keep touch targets usable, expose visible keyboard focus, and honor reduced-motion preferences.
- **Do** extend a growing catalogue through shared rows, taxonomy, search, and stable route identifiers so more than 50 tools remain scannable.
- **Do** keep the admin quieter and denser while carrying forward the same square geometry, typographic discipline, border logic, and clear state language.

### Don't:

- **Don't** rebuild the public site as a centered marketing hero followed by a grid of rounded cards.
- **Don't** rasterize route lines, coordinates, icons, labels, or interface chrome into the paper texture; the texture remains material only.
- **Don't** use vermilion, blue, green, or error red interchangeably, or rely on color without text and shape to communicate state.
- **Don't** round fields into pills, add ambient shadows to ordinary containers, or fill empty space with decorative coordinates that imply no real route.
- **Don't** introduce unverified biography, project claims, metrics, or social proof as visual content.

Optional future polish, not part of the current system: strengthen cartographic-blue continuity between secondary destinations; make an explicit product decision before adding a second theme; consider JSON syntax highlighting; consider input-side line numbering to match the existing output gutter.
