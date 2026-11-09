# CedarSign

## 1. How to run it

Use Node 22.12+ in the 22 release line or Node 24+, then run `npm ci` and `npm run dev`. Open the URL Vite prints. No credentials or server are needed. `npm test` runs the service tests; `npm run build` checks TypeScript and builds production assets. README.md contains the exact demo and optional browser-test commands.

## 2. Architecture overview

The data model separates the original document pages (`SourceDocument`), reusable layout (`DocumentTemplate`), and each signing instance (`SigningDocument`). Each instance owns copied field definitions and a map of captured values with user IDs and timestamps. A user is a sender or recipient within a particular agreement, rather than having a permanent role.

React Context holds the authoritative application state. Components call pure services for capabilities, validation, configuration, issue, completion, and template operations. The synchronous repository stores versioned JSON in localStorage. It writes before updating UI state, so a failed storage write cannot display an apparently successful signing event. React components do not decide their own competing permission rules.

`AgreementCanvas` renders both source-page images and the same field rectangles in layout, signing, and read-only modes. The workspace adds the properties editor and a readable sidebar form, which is especially useful when a whole page is scaled down on a phone. The dashboard filters documents through the same capability service used by direct-document access.

| Document state | Sender | Assigned recipient | Other users |
| --- | --- | --- | --- |
| Draft | Configure and fill sender fields | No access | No access |
| Sent | Read-only | Fill recipient fields | No access |
| Completed | Read-only | Read-only | No access |

## 3. Three to five key decisions and trade-offs

1. **Normalized page coordinates.** Every rectangle stores a page index and x/y/width/height fractions. CSS percentages and the source's Letter aspect ratio preserve positioning as page width changes. New fields are clamped inside the page. Coordinates were visually measured against the supplied PDF's rendered pages. This avoids PDF-coordinate conversion at runtime, at the cost of a fixed sample document and image-based text.
2. **Derived permissions and immutable transitions.** One capability service defines access. Locking follows lifecycle and field ownership rather than mutable per-field lock flags. Signing clones the document, captures automatic names/dates, validates the appropriate party, and returns a new status only on success. Invalid transitions leave the original untouched. UTC signing dates avoid relying on an unspecified simulated-user timezone.
3. **A repository seam with localStorage.** This keeps the take-home self-contained and refresh-persistent. It is not production security or a multi-user database. A real backend would need authentication, server-enforced permissions, transactional writes, and concurrency handling; replacing the repository alone would not establish those guarantees.
4. **One canvas plus a sidebar form.** Shared geometry prevents sender and recipient layouts from drifting. The sidebar makes short fields practical at narrow widths. Click placement and property edits meet the core requirement; dragging, resizing, and drawn signatures were omitted.
5. **Small dependency set.** React and Context handle UI/state; TypeScript checks domain boundaries; Vite builds; Tailwind and local CSS style the interface. Vitest exercises business rules. Playwright drives repeatable real-browser checks. A bundled OFL script font makes typed signatures consistent without a third-party font request at runtime.

## 4. Additional feature: reusable templates

Templates make repeated customer agreements useful without repeating layout work. A draft's configured field definitions can be saved under a name. Creating from a template copies the definitions, generates new field IDs, assigns the current user as sender, and starts with no recipient or captured values.

Templates contain layouts, not signing values. Definitions are deeply copied, so editing an instance does not change its template or sibling documents. This behavior lives in a separate template service and uses the same source-document and repository abstractions as the core workflow. The standard 17-field layout is pre-seeded.

## 5. How AI was used, including a genuine changed or rejected suggestion

The supplied planning document describes input from ChatGPT, Gemini, and Claude. Codex was used in this implementation session to generate the scaffold, models, services, React interface, tests, and documentation. Compiler output, service tests, browser checks, and screenshot inspection were used to check that generated work.

One concrete correction: screenshot inspection showed that the AI-generated text sizing clipped values inside short overlays. That sizing and line-height were changed, and the initial system cursive fallback was replaced with a bundled Caveat script font. Another correction was a missing JSX brace caught by TypeScript. The browser test itself also needed correction: repeated placement clicks were landing on an existing field, and an exact label query included select-option text. These are actual observed changes, not invented examples of rejecting an architectural proposal. In a later review, a user reported distorted PDF lettering that the initial screenshot review had missed. The page images were regenerated with MuPDF, which rendered the original PDF's standard fonts correctly; the source PDF and field geometry were preserved. This correction occurred after the initial implementation checkpoint.

Planning, tool/repository inspection, and reading the attachments occurred before the implementation timer. Application scaffolding, dependency installation, PDF rendering, implementation, and verification occurred after the recorded start in DECISIONS.md. No application work was prepared before that timer. After the initial timebox and human walkthrough, a user-requested blue-and-white theme revision was applied and reverified; that additional styling and delivery work is outside the original implementation checkpoint.

## 6. What's unfinished

- No real authentication, backend authorization, email delivery, cryptographic signing, or PDF export. These are intentionally outside this local demo's scope.
- No field dragging/resizing, PDF upload, multiple source documents, or advanced filtering. Fields can be deleted and placed again.
- localStorage has a versioned envelope and basic shape checks, but no complete runtime schema validation, migration system, cross-tab synchronization, or tamper protection. Very long documents and storage failures have not received broad compatibility testing.
- Whole-page overlays become small on narrow screens; the sidebar provides the usable editing form. Page images preserve the sample's typography and are not selectable PDF text.
- Browser verification used Chromium, not a full cross-browser or accessibility audit. Focused tests do not claim exhaustive coverage.
- Reviewer access remains to be arranged. The full source snapshot was delivered through the connected GitHub app after CLI authentication failed; the user subsequently made the repository public. The tested build is deployed to Vercel with authentication protection for all deployments; the user confirmed the hosted dashboard loads. Sydney can access the public GitHub code without an invitation. Separate Vercel access or the submission ZIP is still needed to review the protected hosted demo or run it locally. Public hosting permission remains unconfirmed, so deployment protection remains enabled. See DEPLOYMENT.md.
- Deployment and the later documentation/delivery review occurred after the initial implementation checkpoint. No application functionality was changed during that later review.
