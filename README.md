# CedarSign

A small React document-signing app built around the supplied two-page Master Agreement. A sender places fields, fills and signs their part, then issues the agreement to a recipient. The recipient completes their fields and signs, locking the completed document. Reusable templates are the additional feature.

## Run locally

Use Node 22.12+ in the 22 release line or Node 24+, with npm.

```sh
git clone https://github.com/Lotstarr/CedarSign.git
cd CedarSign
npm ci
npm run dev
```

Open the local URL printed by Vite. No database, credentials, or environment variables are needed.

```sh
npm test          # service tests
npm run build    # TypeScript check and production build
npm run preview  # serve the production build locally
```

## Demo walkthrough

1. As **Jordan Vance**, open **Master Agreement — draft demo**, choose **Casey Rivera** as recipient, and enter Jordan's signature and title.
2. To edit the layout, choose **Place fields**, select a field type, then click its position on the actual document. The new field appears under **Edit a placed field**, where its label, type, required flag, assignee, and date-autofill setting can be changed. A tool selection alone does not create a field.
3. Optionally save the layout under a template name. Switch to **Fill & sign** and choose **Sign & issue agreement**. The sender's values and field layout become read-only.
4. Switch to **Casey Rivera**. Fill the customer information, signature, and title, then choose **Sign & complete agreement**. Fax is optional, but a supplied fax must be valid. Automatic names and dates are captured when signing succeeds.
5. Switch to **Morgan Blake** to verify that the agreement is unavailable, including through its `#document=...` URL.
6. On the dashboard, choose **Use template**. The new draft has fresh field IDs and empty captured values. An automatic signer-name preview may appear before signing.

The seeded **awaiting Casey** agreement provides a recipient-ready demo. **Reset demo data** restores the seed data after confirmation. Refreshing preserves agreements and templates; the active simulated user resets to Jordan.

## Browser verification

With the dev server running in another terminal:

```sh
npx playwright install chromium
npm run test:browser
```

`BROWSER_EXECUTABLE_PATH=/path/to/chromium` selects an installed browser. `BASE_URL` can target a local production preview. Screenshots go to the ignored `artifacts/` directory. See [VERIFICATION.md](VERIFICATION.md) for results and scope.

## Architecture and documentation

- `src/types/`: data models.
- `src/services/`: permissions, validation, signing transitions, and templates.
- `src/repositories/`: versioned localStorage persistence.
- `src/context/`: shared application state.
- `src/components/`: the workspace and shared page canvas.
- `src/data/`: users, template layout, and demo agreements.

[WRITEUP.md](WRITEUP.md) covers the six submission topics. [DECISIONS.md](DECISIONS.md) explains the engineering choices. [DEPLOYMENT.md](DEPLOYMENT.md) describes hosting and access. [ASSIGNMENT.md](ASSIGNMENT.md) preserves the original employer instructions.

This demo uses simulated users and browser-local data. It does not provide real authentication, tamper resistance, email delivery, or cross-device synchronization. Automatic signing dates use UTC.

## Document assets

The source PDF and rendered pages are in `public/documents/`. The bundled Caveat signature font and its SIL Open Font License are in `public/fonts/`. Ordinary npm builds use the committed images directly. Optional regeneration uses `PyMuPDF==1.26.6` and `python scripts/render-pages.py` to produce 1530 × 1980 Letter pages with correct standard-font rendering.
