# Deployment and access

## Source and local review

The complete project is public at https://github.com/Lotstarr/CedarSign. Reviewers can read, clone, or download it without a collaborator invitation. Setup and demonstration steps are in README.md. The submission ZIP is an alternative delivery format.

## Hosted demo

The app is deployed at https://cedarsign.vercel.app. Vercel reports the reviewed deployment as READY. The production domain is public and does not require a Vercel account. Preview and generated deployment URLs retain Vercel Authentication protection. Share the production domain above with reviewers.

The assignment does not require hosting. Reviewers can use the public live demo or follow the reproducible local setup in README.md.

## Deployment method

The compiled Vite dist files are uploaded directly to the existing Vercel project. Automatic deployment from GitHub is not configured: changing or pushing source code does not by itself update the hosted app.

For an application update, run the build and relevant checks, deploy the resulting dist files, and verify readiness and the affected assets. Hash-based document routing does not require a server catch-all rewrite. No application environment variables or backend services are needed.

## Verification boundary

Authenticated HTTP checks confirmed the hosted application assets and expected functionality markers. The full automated browser suite runs locally in Chromium; it is not claimed as a full hosted-browser test. See VERIFICATION.md for current results.
