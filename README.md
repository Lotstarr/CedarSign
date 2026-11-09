# CedarSign

A mini document-signing app: prepare a two-page agreement, issue it to a recipient, and complete both signatures. Reusable templates are the additional feature.

## Run locally

Use Node **22.12+ in the 22 release line, or Node 24+**, with npm. Development was verified on Node 24.22.1 and npm 11.9.0.

```sh
npm ci
npm run dev
```

Open the URL Vite prints (normally http://localhost:5173). No environment variables, secrets, database, or backend are required.

```sh
npm test          # focused domain tests
npm run build    # TypeScript + production bundle
npm run preview  # serve the production build
```

## Demo walkthrough

1. Start as **Jordan Vance** and open **Master Agreement — draft demo**.
2. Choose **Casey Rivera** in **Send to**. Enter Jordan's signature and title under **Your fields**.
3. To change the layout, choose **Place fields**. Choose a type, then click the actual document where that field belongs. Choosing a type alone does not add a field. The new field is automatically selected under **Edit a placed field**, where you can change its label, type, required flag, assignee, or date-autofill setting, or delete it. A blank layout shows **No fields placed yet** until the first placement. Switch back to **Fill & sign**.
4. Optionally enter a template name and choose **Save as template**.
5. Choose **Sign & issue agreement**. The layout and Jordan's values become read-only.
6. Switch to **Casey Rivera** in the header. Fill the customer information, signature, and title. Fax is optional; any supplied fax must be valid. Choose **Sign & complete agreement**.
7. Switch back to Jordan to view the completed agreement. Switch to **Morgan Blake** to verify that the agreement is unavailable, including through its `#document=...` URL.
8. Return to the dashboard and choose **Use template**. The new draft has copied definitions, fresh field IDs, and no captured values.

The seeded **awaiting Casey** agreement lets you skip directly to recipient signing. Refreshing preserves documents and templates. The active simulated user resets to Jordan on refresh. **Reset demo data** clears changes after confirmation.

## Browser verification

The browser script uses isolated, fresh storage and performs a full sender/recipient walkthrough. With the dev server running in another terminal:

```sh
npx playwright install chromium
npm run test:browser
```

If Chromium is already installed, `BROWSER_EXECUTABLE_PATH=/path/to/chromium npm run test:browser` uses it instead. `BASE_URL` can target a local production preview, such as `http://localhost:4173`. Screenshots are written to the ignored `artifacts/` directory.

## Architecture

- `src/types/models.ts`: source documents, templates, signing documents, field definitions, values, and users.
- `src/services/`: centralized capabilities, validation, immutable transitions, and template copying.
- `src/repositories/localRepository.ts`: synchronous versioned browser persistence.
- `src/context/AppContext.tsx`: authoritative application state; successful writes are persisted before updating UI state.
- `src/components/AgreementCanvas.tsx`: shared page renderer and percentage-based overlays for every mode.
- `src/data/seed.ts`: three simulated users, a 17-field template, one draft, and one sent agreement.

This is a local demonstration. User switching and localStorage do **not** provide real authentication, tamper resistance, or enforceable security. Browser data can be inspected or modified. Signing dates use UTC; other timestamps display in the browser's local timezone.

See [WRITEUP.md](WRITEUP.md), [DECISIONS.md](DECISIONS.md), and [VERIFICATION.md](VERIFICATION.md). The original assignment is preserved unchanged in [ASSIGNMENT.md](ASSIGNMENT.md). The source PDF and rendered page images are in `public/documents/`. Caveat is bundled under the SIL Open Font License in `public/fonts/`.

## Delivery

The user chose public source delivery: https://github.com/Lotstarr/CedarSign. Vite builds to `dist/`; this hash-routed app does not require a catch-all server rewrite. The tested build is deployed at https://cedarsign.vercel.app with Vercel Authentication enabled for every deployment. See DEPLOYMENT.md for delivery details. The complete source snapshot is available in the public GitHub repository. No collaborator invitation is required to read or download it. The submission ZIP is also available.

## Regenerating document images

The committed PNGs are rendered with MuPDF to preserve standard PDF font spacing. Ordinary npm builds use those assets directly. For optional asset maintenance, install `PyMuPDF==1.26.6` in a Python virtual environment, then run `python scripts/render-pages.py`. This produces 1530 × 1980 Letter pages from the unchanged source PDF.
