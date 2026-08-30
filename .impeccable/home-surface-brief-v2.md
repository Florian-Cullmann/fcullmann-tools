# Public home

- Scope: localized public homepage at `/en` and `/de`; mode: Persuade with a direct Operate path into the catalogue.
- Audience and job: developers seeking a dependable browser utility, and technical peers or collaborators evaluating Florian's work.
- Primary action: search for and open a tool. Secondary actions lead to the complete catalogue and writing.
- Proof and content: real browser tools, ranked featured tools, selected projects, and technical writing. Personal claims remain restrained until supplied.
- Constraints: English first with a persisted German alternative; WCAG 2.2 AA; fast and indexable; no account needed; administration remains separate.
- Chosen direction: Straight Utility Catalogue. Approved composition: `.impeccable/mocks/search-led-catalogue.webp` (Search First). iLovePDF is the sole craft reference; its branding and exact layout must not be copied.
- Memorable moment: the wide search control focuses with a crisp coral ring and filters the catalogue immediately as the visitor types.
- Unresolved: verified biography, additional project records, social URLs, and final legal details.

## Composition inventory

| Ingredient           | Commitment                                                                                                             | Medium                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Page ground          | Cool `#F5F7FB` canvas                                                                                                  | CSS color                                       |
| Navigation and cards | White `#FEFEFE` surfaces, 1px cool borders, 14px corners, almost no shadow                                             | Semantic HTML and CSS                           |
| Typography           | Public Sans as a compact workhorse sans; JetBrains Mono only for tool inputs and outputs                               | `next/font`; semantic text                      |
| Intro                | Concise centered heading and one-line context; no profile illustration or oversized hero                               | Semantic HTML                                   |
| Search               | Wide focal search with explicit label, result feedback, keyboard focus, and instant filtering                          | Accessible React client component               |
| Filters              | Compact category controls using restrained rectangular geometry                                                        | Native buttons                                  |
| Featured tools       | Highest-use published tools in a six-column desktop matrix                                                             | Database-backed semantic links and Lucide icons |
| All tools            | Five-column, multirow catalogue beginning in the first viewport on desktop                                             | Semantic links and CSS grid                     |
| Latest writing       | Slim dated list below the catalogue                                                                                    | Semantic links; database-backed when configured |
| Functional color     | Coral `#F75339` for the primary action; green, violet, blue, amber, and teal identify tool families                    | CSS tokens and Lucide icons                     |
| Responsive layout    | Six-column featured and five-column catalogue grids resolving to two columns on tablet and one column on narrow mobile | CSS grid and media queries                      |
| Shipping media       | None required; this interface is native UI, not image-native content                                                   | HTML, CSS, and icon library                     |
