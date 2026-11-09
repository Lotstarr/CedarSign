# CedarSign

## 1. How to run it

Use Node 22.12+ in the 22 release line or Node 24+, with npm:

```sh
git clone https://github.com/Lotstarr/CedarSign.git
cd CedarSign
npm ci
npm run dev
```

Open the URL printed by Vite. No database, credentials, or environment variables are needed. As Jordan, open the draft demo, choose Casey, enter a signature and title, and issue. Switch to Casey to complete and sign; Morgan demonstrates unrelated-user restrictions. README.md contains the full walkthrough and browser-test commands.

`npm test` runs service tests. `npm run build` checks TypeScript and creates production assets.

## 2. Architecture overview

The model separates original document pages, reusable template layouts, individual signing agreements, and captured values. An agreement owns its sender, recipient, status, copied field definitions, and values. Sender/recipient are roles within an agreement, not permanent user types.

React Context holds shared application state. Pure TypeScript services handle capabilities, validation, signing transitions, and templates. A versioned localStorage repository owns persistence. The UI adopts new state only after saving succeeds.

One AgreementCanvas renders the same page geometry in configuration, signing, and read-only modes. The sidebar provides field properties and a readable form when overlays are small. Drafts are configurable by the sender; Sent locks layout and sender values; Completed is read-only. Dashboard filtering and direct-document access share the same permission rules.

## 3. Five key decisions and trade-offs

1. **React, TypeScript, and Vite:** a small foundation for UI, typed models, development, and builds. Tailwind/local CSS handle styling, Vitest checks services, and Playwright checks browser workflows.
2. **Page images and relative coordinates:** images are explicitly allowed by the assignment. Fields store a page index and x/y/width/height fractions, rendered as percentages within the preserved page aspect ratio. This avoids a runtime PDF-rendering dependency but makes document text non-selectable. MuPDF generates the committed page images with correct standard-font rendering.
3. **Centralized permissions and immutable transitions:** editability derives from status and ownership rather than separate lock flags. Signing validates a copy before returning a new state, so invalid input cannot partially sign the agreement. Automatic names/dates are captured at signing; signing dates use UTC, and manual dates are preserved.
4. **localStorage behind a repository:** refresh persistence without backend setup. Data stays in one browser; switching users simulates the workflow rather than delivering data to another device. Production would require authentication, server-side authorization, transactional storage, and concurrency handling.
5. **Click placement and typed signatures:** both meet the assignment while keeping effort focused on ownership, validation, and lifecycle correctness. Dragging/resizing, drawn signatures, and arbitrary PDF uploads are omitted.

## 4. Additional feature: reusable templates

Templates save repeated agreement setup. A sender can save a draft's field definitions and create fresh agreements from that layout.

New instances deeply copy definitions, generate fresh field IDs, and start with no recipient or captured values. They cannot inherit another customer's signatures or mutate sibling agreements through shared references. Template operations have their own service and use the same source-document model and repository as the core workflow. A standard 17-field template is included.

## 5. How AI was used

Codex helped generate the scaffold, models, services, interface, tests, and documentation from the agreed plan. Planning materials incorporated ChatGPT, Gemini, and Claude. I reviewed the actual workflow and identified issues; compiler checks, service tests, browser checks, and screenshots provided additional verification.

A concrete change to generated output was the document renderer: I flagged distorted PDF lettering, and the converted images were regenerated with MuPDF while preserving the original PDF and field geometry. I also flagged confusing placement controls. The interface now distinguishes choosing a tool from placing a field, then automatically selects the new field for editing.

Functional review also identified an agreement that could be issued without a recipient signature field, making completion impossible after locking. Issue now rejects that layout while it remains editable; regression checks cover rejection and repair. These are actual corrections to the generated result.

## 6. What's unfinished

This is a simulated-user demo, with no real email delivery, backend security, cryptographic signing, or signed-PDF export. Browser storage is user-modifiable and does not synchronize across devices or tabs. It has basic validation and a versioned envelope, not a complete migration/runtime-schema system.

Only the supplied agreement is supported. Full-page overlays become small on narrow screens; the sidebar provides the practical editing form. Verification used Chromium, not a full browser or accessibility matrix.

The production build, eight service tests, and seventeen browser checkpoints pass. These support the checked workflows, not exhaustive coverage or production readiness. Public GitHub source and local setup are available; hosted-demo access is managed separately. See VERIFICATION.md and DEPLOYMENT.md.
