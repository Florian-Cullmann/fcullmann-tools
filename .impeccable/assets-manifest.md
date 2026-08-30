# API Atlas asset manifest

Approved comp: `.impeccable/mocks/decision/api-atlas.webp`

## Produce

| Field | Value |
| --- | --- |
| `id` | `atlas-paper` |
| `source_crop` | Full approved comp, used only as a material and palette reference |
| `output_path` | `public/textures/atlas-paper.webp` |
| `strategy` | Built-in image generation; 2048 px resize; half-tile offset; softly healed center seams; restrained channel correction to the sampled ground |
| `dimensions` | 2048 × 2048 |
| `format` | WebP, opaque, quality 90 |
| `transparency` | None |
| `deviations` | None. UI, map geometry, symbols, copy, marks, borders, stains, and directional lighting were excluded. |
| `qa_status` | `accepted` — visually checked alone and as a 2 × 2 tile; mean RGB rounds to `#F5F2E8`; edge RMSE is 0.0051 horizontal and 0.0045 vertical on a normalized 0–1 scale. |
| `provenance` | Exact prompt stored in `public/textures/atlas-paper.webp.json`; `embed-prompt.mjs --scan public/textures` reports 1 raster, 0 missing. |

Prompt used:

```text
Use case: stylized-concept
Asset type: seamless production background texture for a responsive web page
Input image: the approved API Atlas comp is a visual reference only for the warm paper material, restrained texture character, and color; do not reproduce any interface content
Primary request: create a seamless square texture of subtle warm uncoated folded-map paper, suitable for edge-to-edge tiling
Scene/backdrop: a flat, evenly colored material scan with no scene and no directional illumination
Style/medium: realistic high-resolution uncoated map paper surface, quiet natural fiber tooth, broad honest vertical and horizontal fold variation, extremely restrained and low contrast
Composition/framing: orthographic flat material sample, uniform across the full square, no focal point; opposite edges must tile seamlessly
Color palette: dominant ground exactly #F5F2E8; only tiny warm-neutral tonal variation around that value
Materials/textures: fine matte paper fibers and very soft broad fold memory, subtle enough that text and diagram lines will remain crisp above it
Constraints: opaque; square; seamless/tileable; no baked presentation chrome; no strong shadows or highlights
Avoid: grid, text, letters, numbers, symbols, icons, compass marks, route lines, waypoints, borders, stains, tears, burns, speckles, foxing, dirt, handwriting, printed ink, watermarks, vignette, perspective, paper edges, strong lighting, dramatic creases, obvious repeated motifs
```

## Direct

None.

## Semantic

| `id` | `implementation` | `notes` | `qa_status` |
| --- | --- | --- | --- |
| `navigation-and-identity` | Semantic header/nav links, locale and theme buttons, headings, paragraphs, and destination list; inline SVG only for small utility marks. | Typography, spacing, focus, and responsive collapse stay in HTML/CSS. | `accepted` |
| `route-system` | One responsive inline SVG with paths for vermilion and blue routes, CSS-owned stroke colors/widths/dashes, SVG markers, numbered waypoint groups, and accessible labels. | No route line, waypoint, compass, or registration symbol is rasterized. | `accepted` |
| `formatter-workbench` | Accessible form with labeled input, formatted `<pre><code>` output, line-number gutters, validation/status region, and real buttons for format, copy, clear, and options. | Borders, panels, scrollbars, focus rings, and control states stay in CSS/HTML. | `accepted` |
| `catalogue-and-writing` | Semantic link lists and article rows; authored feature glyphs as inline SVG with `currentColor`. | Dates and content remain text; directional affordances remain SVG/CSS. | `accepted` |
| `coordinate-frame` | CSS borders plus inline SVG/CSS geometry for compass mark, edge ticks, scale ticks/bar, route IDs, and registration marks. | Keep density restrained and responsive; never bake labels into the paper texture. | `accepted` |

## Execution order

1. Paint the CSS page base at `#F5F2E8`.
2. Tile `atlas-paper.webp` above that base without a color wash that hides the tooth or folds.
3. Compose all typography, controls, routes, waypoints, icons, compass details, and coordinate geometry semantically above the texture.

## Blockers

None.

## Assumptions

- The texture is used at its native 2048 px tile size or larger display scale; CSS owns responsive positioning and any clipping.
- The approved comp remains the visual authority for the texture's final on-screen contrast.
