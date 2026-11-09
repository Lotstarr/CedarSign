# Deployment and submission

## Hosted demonstration

- URL: https://cedarsign.vercel.app
- Team/project: Lotstarr / cedarsign
- Deployment: `dpl_31nhx5wZrmHfjqunpPLgMFqFW4Vq`
- Application commit: `720d2952f1d3b6460bf46d6a93c63f42af68a329`
- Target/state: production / READY, reconfirmed during delivery review.
- Access: Vercel Authentication enabled for **all** deployments, including production.

The tested Vite `dist/` files were uploaded directly using the connected Vercel app. This deployment is not connected to automatic GitHub builds. Documentation-only commits made after deployment do not alter the hosted application.

An authenticated HTTP request returned the app HTML successfully. The user subsequently confirmed the hosted dashboard loads. The six service tests and twelve browser checkpoints documented in VERIFICATION.md ran locally; no full hosted browser-suite result is claimed.

## Reviewer access

The ordinary hosted URL requires an authorized Vercel account. It is not automatically available to Sydney. Keep deployment protection enabled until an appropriate sharing method is agreed. The self-contained submission ZIP is the ready alternative and can be run with `npm ci` and `npm run dev`.

## GitHub status

Repository `Lotstarr/CedarSign` is **private**, verified through the connected GitHub app after the user changed its visibility. Source delivery uses that connected app because the CLI credential remains invalid. The uploaded `main` snapshot contains the full app, corrected agreement images, scripts, and documentation. Its file tree is checked against the local committed source.

Sydney will need a repository collaborator invitation to view private code. That invitation has not been sent. The submission ZIP is the alternative if repository access is inconvenient. Vercel access is separate from GitHub access.

## Final human review

1. Open the hosted app as Jordan; open the draft demo, choose Casey, enter signature/title, and issue.
2. Switch to Casey; fill customer fields, signature/title, and complete. Confirm all fields lock.
3. Switch to Morgan and verify the agreement is unavailable, including through its document URL.
4. Save and use a template; confirm the new agreement starts empty.
5. Read WRITEUP.md and verify that its explanation matches the applicant's understanding.
6. Submit the ZIP or an accessible private repository, plus interview availability. Sending the submission is a separate user action; no message has been sent.

The application implementation checkpoint was recorded within the 90-minute budget. Subsequent deployment, documentation corrections, and packaging are disclosed as later delivery work in DECISIONS.md.

## Blue-and-white theme deployment

The requested blue-and-white revision is deployed to the same production aliases. Vercel reports READY for the application commit listed above. An authenticated request returned the new CSS with HTTP 200 and the expected royal-blue theme token. Protection remains configured for all deployments. The revised build passed six service tests and twelve local browser checkpoints before upload. The reference website was inaccessible, so the palette is an interpretation of the requested blue/white direction.

## Document typography fix deployment

The corrected MuPDF page images and image-cache version are deployed to the same production URL. Vercel reports READY for the application commit above. Both corrected page-image URLs returned HTTP 200 with image/png content types and the expected new sizes (305179 and 164302 bytes). The six service tests and twelve local browser checkpoints passed before deployment. Both corrected source pages and a populated desktop agreement screenshot were visually inspected for clean glyphs, field alignment, and signatures.
