# Engineering decisions

## Separate pages, layouts, agreements, and values

SourceDocument represents the original pages. DocumentTemplate stores reusable field definitions. SigningDocument owns the sender, recipient, status, copied definitions, and captured values for one agreement. Creating from a template deeply copies definitions, generates fresh field IDs, and starts with empty values. This prevents changes or signatures from carrying between customers.

## Keep rules outside the interface

Pure TypeScript services own validation and document transitions. A shared capability function determines visibility and editing permissions from status and ownership. Layout and value locking are derived from those rules, avoiding separate lock flags that could disagree. The UI and services use the same rules.

Issue and completion operate on a copy, validate the relevant party's fields, and return a new document only on success. Issue also requires a recipient signature field so the locked agreement can be completed. Automatic names and UTC signing dates are captured at signing; manual dates are preserved.

## Use one canvas with page-relative coordinates

Each field stores a page index and x/y/width/height fractions. CSS percentages and the preserved Letter aspect ratio keep fields aligned as the page resizes. Placement is clamped inside page boundaries. The same canvas supports configuration, filling, and read-only viewing.

Pre-rendered PDF images keep the runtime simple and are explicitly permitted by the assignment. MuPDF supplies clean standard-font rendering. The trade-off is that page text is not selectable. A sidebar form keeps editing practical when whole-page overlays are small.

## Persist through a repository

React Context holds shared state; a synchronous repository owns versioned localStorage access. Persistence succeeds before UI state changes. Saved-data errors are reported rather than silently replacing data, and reset provides a recovery path.

Browser-local storage needs no backend setup but does not provide cross-device sharing, concurrency control, or real security. A production system would require authentication, server-enforced permissions, transactional persistence, and conflict handling.

## Keep the scope focused

React, TypeScript, and Vite provide the application foundation; Tailwind and local CSS provide styling. Vitest checks services, and Playwright checks browser workflows. Click placement and typed signatures meet the assignment without dragging, resizing, or drawing infrastructure.

Templates solve repeated agreement setup and extend the existing model without requiring scheduling or notification delivery. The blue-and-white palette uses shared CSS variables. Signer Name is a display label; the internal signerName type remains stable for saved-data compatibility.
