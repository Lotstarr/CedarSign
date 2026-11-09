# Engineering decisions

Implementation started November 7, 2026, 7:44:34 PM MST (02:44:34 UTC November 8). The strict 90-minute budget ends 04:14:34 UTC. Planning, environment inspection, and attachment review occurred before the timer; no application code or PDF rendering was prepared then.

- React/TypeScript/Vite with pure services: keeps business rules testable independently of the interface. This environment runs Node 24.22.1; Node 22 was recommended during setup but not installed. Both satisfy the selected Vite runtime requirement.
- Source documents, template layouts, signing instances, and values are distinct. New instances clone definitions and generate fresh field IDs.
- One centralized capability function controls permissions. Field locks are derived from lifecycle and ownership, avoiding redundant mutable flags.
- Signing transitions clone, capture automatic fields, and validate before returning a new document. Dates use the UTC calendar date of the signing timestamp; simulated users have no timezone setting.
- The PDF is pre-rendered to Letter-aspect-ratio PNGs. Normalized rectangles are measured visually on the actual pages, below printed labels.
- Synchronous versioned localStorage repository: simple offline demo persistence with a clear data seam. This is simulated authorization, not production security. Invalid stored data raises an explicit error rather than silently overwriting it.
- Reusable templates are the single additional feature. Their layouts are copied, never shared by mutable reference.
- Field configuration discards stale values when type, ownership, or automatic-date behavior changes. Changing ownership or field type must not retain an earlier signer's input.
- Repository visibility has not been verified in this runtime. Agreement materials will not be pushed or deployed publicly without confirming publication permission.

## Verified corrections to AI-generated work

- The initial reset handler contained a missing JSX brace. TypeScript caught it and the handler was corrected before browser verification.
- Screenshot inspection showed text clipping in short field overlays. The initial text sizing and line-height were changed, and the signature fallback font was replaced with a bundled Caveat font (OFL license).
- The initial browser placement check clicked the same coordinates repeatedly and hit existing fields. The test was corrected to use separate locations; then it exposed an overly strict label query. Those are test corrections, not claimed application defects.

## Implementation checkpoint

Final implementation checks completed at 2026-11-08T02:56:27+00:00. Elapsed wall time since implementation start: 11 minutes 53 seconds, within the 90-minute budget. Clean install, production build, six service tests, and twelve browser checkpoints passed. Local commit and ZIP packaging follow this checkpoint; GitHub authentication blocks remote delivery.

## Post-implementation delivery review — November 8, 2026 (America/Denver)

The tested static build from application commit 34b02b1 was deployed directly through the connected Vercel app because CLI GitHub authentication failed. Vercel assigned the first deployment to production. Authentication protection is enabled for all deployments. Later review reconfirmed READY status and the user confirmed the hosted dashboard loads. The connected GitHub app confirms Lotstarr/CedarSign is public and still has starter content. No source push, public-access change, or collaborator invitation was made. This later work updates delivery documentation and packaging only; it is outside the initial implementation checkpoint and does not change application functionality.

## Requested theme revision — November 8, 2026 (America/Denver)

After the original timebox and human walkthrough, the user requested a blue-and-white theme inspired by Lotholmstead.com. The reference could not be retrieved through the available web/hosting tools, so the delivered palette is an explicit interpretation: royal blue #2563eb, navy #102f57, white cards, and pale blue #f5f9ff backgrounds. CSS theme variables centralize the palette. Sender/recipient overlays use different blue shades and solid/dashed borders. Build, six service tests, and twelve browser checkpoints passed after the change. This is additional styling and delivery work outside the original implementation checkpoint.

## Document typography correction

The user reported jumbled/spread-out text on the agreement pages. Inspection confirmed the distortion was baked into the original pdftoppm-generated PNGs, rather than the sidebar form values. The original PDF uses unembedded Helvetica and Times-Bold; its rendering in that conversion environment had incorrect glyph appearance/spacing. Re-rendering with MuPDF's standard PDF fonts produced clean text. Both images were regenerated at 180 DPI (1530 × 1980) with identical Letter page geometry; a reproducible optional Python script is included. The canvas adds a render-version query so existing stored documents request the corrected images. Original PDF bytes, user values, and normalized field definitions are preserved. Build, six service tests, and twelve browser checkpoints passed; corrected source pages and populated desktop screenshots were visually inspected. The earlier review failed to catch the rendering defect. This correction is additional work outside the original timebox.

## Private source delivery

After the user changed Lotstarr/CedarSign to private, the connected GitHub app verified visibility and write access. Source delivery uses Git data operations through that app because the CLI credential is invalid. A complete source snapshot is imported on top of the original GitHub README commit; detailed local checkpoint history remains in this workspace. The imported remote file tree is compared with the local committed tree. Reviewer invitations and Vercel access are separate remaining steps. This is delivery work outside the implementation timebox.

## Public source sharing

After verifying the full source upload, the user changed Lotstarr/CedarSign to public. The connected GitHub app verified that setting and the uploaded main branch. Public source access no longer requires a collaborator invitation. Vercel authentication protection remains a separate setting and was not changed.

## Field placement guidance

The user selected the Date placement tool on a blank agreement, then opened the field picker expecting a new field. No field exists until a page is clicked, which the earlier UI did not explain clearly enough. The layout panel now separates adding a field from editing an existing field, disables the empty picker with an explicit message, shows placed-field counts and page labels, and automatically selects a newly placed field. Selecting an existing field cancels the placement tool. The placement selection/success message is updated only after configuration succeeds. A browser regression check reproduces the blank Date flow at 718 × 827, verifies selection, manual/automatic date configuration, and deletion; all thirteen browser checkpoints and six service tests pass. This usability correction is post-timebox work.
