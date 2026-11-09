# Deployment and access

## Source and local review

The complete project is public at https://github.com/Lotstarr/CedarSign. Reviewers can read, clone, or download it without a collaborator invitation. Setup and demonstration steps are in README.md. The submission ZIP is an alternative delivery format.

## Hosted demo

The app is deployed at https://cedarsign.vercel.app. Vercel reports the reviewed deployment as READY. Authentication protection is enabled for all deployments, including production, so the ordinary URL requires an authorized Vercel account. Public GitHub access does not grant hosted-demo access.

The assignment does not require hosting. The repository and local setup provide a reproducible review path while hosted access is protected.

## Deployment method

The compiled Vite dist files are uploaded directly to the existing Vercel project. Automatic deployment from GitHub is not configured: changing or pushing source code does not by itself update the hosted app.

For an application update, run the build and relevant checks, deploy the resulting dist files, and verify readiness and the affected assets. Hash-based document routing does not require a server catch-all rewrite. No application environment variables or backend services are needed.

## Verification boundary

Authenticated HTTP checks confirmed the hosted application assets and expected functionality markers. The full automated browser suite runs locally in Chromium; it is not claimed as a full hosted-browser test. See VERIFICATION.md for current results.
