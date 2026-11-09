# Verification results

Verified during the implementation session on November 7, 2026 (America/Denver).

## Automated checks

- Clean `npm ci`: passed (123 packages installed).
- `npm run build`: passed (TypeScript and Vite 7.3.7 production build).
- `npm test`: passed, **6 tests in 1 test file**.
- `BROWSER_EXECUTABLE_PATH=/usr/bin/chromium npm run test:browser`: passed, **12 browser checkpoints**, no browser runtime errors.
- `git diff --check`: passed.
- Original assignment comparison: byte-for-byte identical to the uploaded README.
- Source scan for common private-key, GitHub-token, and AWS-access-key patterns: no matches. This is a limited pattern scan, not a security audit.

Runtime: Node 24.22.1, npm 11.9.0, Git 2.52.0. Browser: installed Chromium in headless mode. Browser verification targets the Vite development server; production compilation was verified separately.

## Browser checkpoints

1. Fresh storage initializes the draft and sent demos.
2. Both source-page images load and all 17 seeded fields render.
3. Issue rejects a missing recipient, missing signature, and missing required sender values.
4. Issue captures automatic sender fields and locks layout/sender input.
5. Recipient validation rejects invalid email and filled optional fax; completion captures automatic fields, preserves sender values, and locks all input.
6. Overlay fractions remain within 0.003 of their desktop measurements at 1440px and 390px viewport widths; narrow layout has no horizontal overflow.
7. Completed document data survives reload.
8. Morgan sees no other users' documents and cannot open a direct document ID.
9. A saved template creates new field IDs and empty values.
10. All six field types can be placed, with rectangles clamped inside page boundaries.
11. Field assignment, required flag, and deletion work.
12. No browser runtime errors occur in this walkthrough.

Service tests additionally verify transition atomicity, ownership checks, real-calendar date validation, template rectangle isolation, and repository initialization/reset behavior.

Initial screenshots were inspected for field alignment, but that review missed distorted PDF glyphs in the background images. A later user report led to the typography correction documented below.

## Delivery status

Application code, source agreement assets, README, original assignment, six-section write-up, decision log, and repeatable checks are prepared locally. GitHub CLI authentication failed with the configured token. No push, repository visibility change, or collaborator invitation was performed. After the initial implementation checkpoint, the tested build was deployed to Vercel with authentication protection for all deployments. A subsequent review reconfirmed READY status for application commit 34b02b1, and the user confirmed the hosted dashboard loads. The full 12-check browser suite remains a local result; a full hosted browser walkthrough is not claimed. See DEPLOYMENT.md.

## Limits

This does not establish production security, exhaustive test coverage, cross-browser compatibility, full accessibility compliance, multi-tab conflict handling, or successful live hosting. Local demo permissions are application behavior and can be bypassed by modifying browser storage.

## Blue-and-white theme revision

After the user-requested styling change, `npm run build` passed, all six service tests passed, and all twelve local browser checkpoints passed again. Screenshots were refreshed and inspected at desktop and narrow widths. This verification is additional work after the original timebox. Exact color matching to Lotholmstead.com was not verified because the reference was inaccessible through the available tools.

The revised production deployment is READY. An authenticated request to its CSS returned HTTP 200 and the expected blue-theme token. See DEPLOYMENT.md for the current application commit and deployment ID.

## Document typography correction

Both original page images were replaced with MuPDF renders at 1530 × 1980 pixels. Visual comparison of the source pages and populated agreement confirms normal letter spacing and aligned values/signatures. A render-version query prevents old image caches from masking the update in existing documents. The source PDF is unchanged. After this correction, the build, six service tests, and twelve local browser checkpoints passed. The browser suite verifies image loading, alignment, values, and the signing workflow; visual inspection is the evidence for typography quality, not an automated typography assertion.

The typography-fix production deployment is READY; authenticated requests for both corrected page images returned HTTP 200. See DEPLOYMENT.md for the current deployment.

## Private GitHub delivery

The user changed Lotstarr/CedarSign to private; the connected GitHub app verified that setting and write access. The full committed source snapshot is uploaded through the connected app, with the remote tree SHA compared to the local committed tree. CLI authentication remains invalid. No reviewer invitation has been sent, and GitHub membership does not grant Vercel access.

## Public repository verification

After the user changed visibility, the connected GitHub app confirmed Lotstarr/CedarSign is public and main still contains the complete imported project. No invitation is needed for public code access. Vercel authentication remains enabled independently.

## Field placement usability regression

The production build and six service tests pass after clarifying placement controls. The browser suite now passes **13 checkpoints**. The additional checkpoint reproduces the reported blank Date flow at 718 × 827: no field is created by selecting a tool alone; the empty picker is explicitly disabled; clicking page 2 creates and selects Date; signing-date autofill can be changed; selecting an existing field cancels pending placement; deleting the last field restores the empty state. Prompt and configured-state screenshots were inspected.

## Comprehensive functional and visual review

The final production build passes, with **8 service tests** and **17 browser checkpoints** passing. Added coverage verifies manual dates, automatic sender snapshots, missing-recipient-signature layouts, repair before issue, reset persistence, and storage-write failure behavior. A separate browser check confirmed invalid saved JSON displays recovery and that resetting returns to the seeded dashboard.

Dashboard and agreement layouts were inspected at 320, 390, 718, 1024, and 1440 pixel widths, including unusually long unbroken document/template names. After the wrapping fix, none of those checks produced horizontal overflow. Populated desktop agreement screenshots show readable source typography and aligned captured values/signatures. The layout editor now displays “Signer Name” in the toolbar, type selector, and placement instructions.

Two review findings were fixed: an agreement could previously be issued without a recipient signature field, leaving it impossible to complete; and long names could stretch the layout horizontally. Issue now keeps the document editable until the recipient signature field is added. Existing signing, permissions, templates, and persistence checks remain passing.

Scope: browser automation used Chromium with fresh isolated storage. This is not an exhaustive cross-browser, accessibility, or production-security assessment. The application remains a single-browser simulated-user/localStorage demo, as allowed by the assignment. This review and the fixes are post-timebox work.
