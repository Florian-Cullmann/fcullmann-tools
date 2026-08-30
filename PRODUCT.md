# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: Next.js with TypeScript, PostgreSQL through Prisma, and Auth.js. The application must remain portable to a self-managed KVM server; infrastructure prerequisites and the production deployment setup will be decided later.

## Users

- Developers and technical users looking for focused browser-based utilities such as JSON formatting and PDF conversion.
- Potential clients, collaborators, and peers evaluating Florian Ullmann's professional profile, projects, and writing.
- Florian Ullmann as the single administrator maintaining tools, articles, and localized editorial content.

## Product Purpose

fcullmann.com combines a professional personal website with a growing collection of useful developer tools and a technical blog. The public experience should establish Florian's expertise quickly, let visitors complete common utility tasks with minimal friction, and create a maintainable foundation that can grow beyond 50 tools.

## Positioning

The site connects practical, privacy-conscious tools with the working knowledge and authorship of the developer who builds and maintains them, rather than presenting an anonymous catalogue of generic utilities.

## Operating Context

Visitors arrive through search, direct links, shared tool URLs, articles, or Florian's professional profiles. They should be able to use public tools without an account, browse projects and articles, and switch languages without losing their current context. Administration is a protected, desktop-oriented workflow for managing tools and blog content.

## Capabilities and Constraints

- Public personal homepage with a prominent professional introduction.
- Featured tools ranked by actual usage count.
- Extensible tool catalogue designed to support more than 50 tools.
- Initial lightweight tools include a JSON formatter and other utilities suitable for local browser-side processing.
- Blog with localized articles, metadata, drafts, and publication scheduling.
- Protected single-user administration for tools, categories, usage visibility, and blog content.
- English is the default content language; German is available through a language switcher.
- On the first visit, the browser language selects English or German once. The selected locale is persisted and explicit user changes take precedence afterward.
- Editorial content and SEO metadata are modeled in both languages.
- Production hosting will later use a self-managed KVM server. Infrastructure details are intentionally undecided.
- Personal biography, project history, social profiles, portrait, legal copy, and production credentials are still required from the owner and must not be fabricated.

## Brand Commitments

- Public name and domain: Florian Ullmann / fcullmann.com.
- The supplied mockup is a structural reference only: professional introduction first, popular tools immediately below, followed by broader catalogue and editorial material.
- The final visual system should feel more contemporary and bespoke than a Bootstrap-style card interface.
- Voice should be direct, useful, technically credible, and free of inflated marketing language.
- The public visual system follows the familiar light utility-platform category standard: compact navigation, concise personal context, prominent search and category controls, and a dense card catalogue. iLovePDF is the sole craft reference; its branding and exact layout are not to be copied.

## Evidence on Hand

- Structural mockup supplied in the project conversation.
- Confirmed technology preferences and deployment direction.
- No verified biography, portrait, client claims, usage figures, project records, testimonials, or social URLs are currently available. Demonstration content must be labeled and owner-specific claims must remain placeholders.

## Product Principles

- Every tool should solve one clear task quickly and work without unnecessary sign-up or navigation.
- Growth to a large catalogue must come from shared contracts and reusable primitives, not duplicated pages.
- The person, tools, projects, and writing should reinforce one coherent professional identity.
- Public pages should be fast, accessible, indexable, and useful to both search engines and answer engines.
- Administration should make publishing safe through drafts, validation, previews, and explicit status changes.

## Accessibility & Inclusion

Target WCAG 2.2 AA. All public and administrative workflows must be keyboard accessible, respect reduced-motion preferences, preserve visible focus, and provide meaningful validation and status announcements.
