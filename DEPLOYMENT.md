# Deployment and submission

## Hosted demonstration

- URL: https://cedarsign.vercel.app
- Team/project: Lotstarr / cedarsign
- Deployment: `dpl_31nCSVpG4n1aNXN18qWPVVXPPKQm`
- Application commit: `dbad12c30fc79c34c61c6c476be9f6933483fdad`
- Target/state: production / READY, reconfirmed during delivery review.
- Access: Vercel Authentication enabled for **all** deployments, including production.

The tested Vite `dist/` files were uploaded directly using the connected Vercel app. This deployment is not connected to automatic GitHub builds. Documentation-only commits made after deployment do not alter the hosted application.

An authenticated HTTP request returned the app HTML successfully. The user subsequently confirmed the hosted dashboard loads. The six service tests and twelve browser checkpoints documented in VERIFICATION.md ran locally; no full hosted browser-suite result is claimed.

## Reviewer access

The ordinary hosted URL requires an authorized Vercel account. It is not automatically available to Sydney. Keep deployment protection enabled until an appropriate sharing method is agreed. The self-contained submission ZIP is the ready alternative and can be run with `npm ci` and `npm run dev`.

## GitHub status

Repository https://github.com/Lotstarr/CedarSign is **public**, verified through the connected GitHub app after the user changed its visibility. Sydney can read and download the full source without a collaborator invitation. The source snapshot includes the app, corrected agreement images, scripts, and documentation; its file tree was checked against the local committed source.

Source delivery used the connected GitHub app because the CLI credential was invalid. The submission ZIP remains available as an alternative. Vercel access is separate: the hosted demo still requires authorization, even though GitHub is public.

## Final human review

1. Open the hosted app as Jordan; open the draft demo, choose Casey, enter signature/title, and issue.
2. Switch to Casey; fill customer fields, signature/title, and complete. Confirm all fields lock.
3. Switch to Morgan and verify the agreement is unavailable, including through its document URL.
4. Save and use a template; confirm the new agreement starts empty.
5. Read WRITEUP.md and verify that its explanation matches the applicant's understanding.
6. Submit the public repository URL or ZIP, plus interview availability. Sending the submission is a separate user action; no message has been sent.

The application implementation checkpoint was recorded within the 90-minute budget. Subsequent deployment, documentation corrections, and packaging are disclosed as later delivery work in DECISIONS.md.

## Blue-and-white theme deployment

The requested blue-and-white revision is deployed to the same production aliases. Vercel reports READY for the application commit listed above. An authenticated request returned the new CSS with HTTP 200 and the expected royal-blue theme token. Protection remains configured for all deployments. The revised build passed six service tests and twelve local browser checkpoints before upload. The reference website was inaccessible, so the palette is an interpretation of the requested blue/white direction.

## Document typography fix deployment

The corrected MuPDF page images and image-cache version are deployed to the same production URL. Vercel reports READY for the application commit above. Both corrected page-image URLs returned HTTP 200 with image/png content types and the expected new sizes (305179 and 164302 bytes). The six service tests and twelve local browser checkpoints passed before deployment. Both corrected source pages and a populated desktop agreement screenshot were visually inspected for clean glyphs, field alignment, and signatures.

## Placement guidance update

The revised field layout controls are deployed and Vercel reports READY. The hosted JavaScript returned HTTP 200 and contains the explicit empty-field state and placed-field editor. Six service tests and thirteen local browser checkpoints passed, including the reported Date selection flow at 718 × 827. The application checkpoint above is the local source commit; GitHub receives an equivalent source snapshot through the connected app.
