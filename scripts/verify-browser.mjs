import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
mkdirSync("artifacts", { recursive: true });
const browser = await chromium.launch({
  ...(process.env.BROWSER_EXECUTABLE_PATH
    ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH }
    : {}),
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const results = [];
const pass = (name) => {
  results.push(name);
  console.log("PASS", name);
};
await page.goto(process.env.BASE_URL ?? "http://localhost:5173");
await page
  .getByRole("heading", { name: "Agreements, without the paperwork." })
  .waitFor();
assert.equal(await page.locator(".document-row").count(), 2);
await page.screenshot({
  path: "artifacts/dashboard-desktop.png",
  fullPage: true,
});
pass("Fresh storage initializes draft and sent demos");
await page
  .getByRole("button", { name: /Master Agreement — draft demo/ })
  .click();
assert.equal(await page.locator(".agreement-page img").count(), 2);
assert.equal(await page.locator(".field-overlay").count(), 17);
assert.equal(
  await page
    .locator(".agreement-page img")
    .evaluateAll((imgs) => imgs.every((i) => i.complete && i.naturalWidth > 0)),
  true,
);
pass("Both source pages and all 17 seeded fields render");
await page.getByRole("button", { name: "Sign & issue agreement →" }).click();
await page
  .getByRole("alert")
  .filter({ hasText: "Choose a valid recipient" })
  .waitFor();
await page.getByLabel("Send to").selectOption("casey");
await page.getByRole("button", { name: "Sign & issue agreement →" }).click();
await page
  .getByRole("alert")
  .filter({ hasText: "sender must provide a signature" })
  .waitFor();
await page.getByLabel("Signature *", { exact: true }).fill("Jordan Vance");
await page.getByRole("button", { name: "Sign & issue agreement →" }).click();
await page
  .getByRole("alert")
  .filter({ hasText: "Title is required" })
  .waitFor();
await page.getByLabel("Title *", { exact: true }).fill("Account Manager");
pass("Issue rejects missing recipient, signature, and required sender values");
await page.getByLabel("Template name").fill("Browser verified layout");
await page.getByRole("button", { name: "Save as template" }).click();
await page.getByRole("status").filter({ hasText: "Template saved" }).waitFor();
await page.getByRole("button", { name: "Sign & issue agreement →" }).click();
assert.equal(
  await page.getByRole("button", { name: "Place fields", exact: true }).count(),
  0,
);
assert.equal(
  await page
    .getByLabel("Signature (sender)", { exact: true })
    .getAttribute("readonly"),
  "",
);
pass(
  "Issue succeeds, captures sender name/date, locks layout and sender values",
);
await page.getByLabel("Active user").selectOption("casey");
assert.equal(
  await page
    .getByLabel("Signature (sender)", { exact: true })
    .getAttribute("readonly"),
  "",
);
await page.getByRole("button", { name: "Sign & complete agreement ✓" }).click();
await page
  .getByRole("alert")
  .filter({ hasText: "recipient must provide a signature" })
  .waitFor();
for (const [label, value] of Object.entries({
  "Customer Legal Name *": "Cedar Customer LLC",
  "Purchasing Agent *": "Casey Rivera",
  "Email *": "invalid",
  "Address *": "123 Main Street",
  "City *": "Fort Worth",
  "State *": "TX",
  "Zip *": "76140",
  "Phone *": "817-555-1234",
  "Signature *": "Casey Rivera",
  "Title *": "Purchasing Director",
}))
  await page.getByLabel(label, { exact: true }).fill(value);
await page.getByLabel("Fax", { exact: true }).fill("invalid");
await page.getByRole("button", { name: "Sign & complete agreement ✓" }).click();
await page
  .getByRole("alert")
  .filter({ hasText: "Email must be a valid email" })
  .waitFor();
await page.getByRole("alert").filter({ hasText: "Fax must contain" }).waitFor();
await page.getByLabel("Email *", { exact: true }).fill("casey@example.com");
await page.getByLabel("Fax", { exact: true }).fill("");
const before = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("cedarsign:v1")).data.documents.find(
    (d) => d.id === "demo-draft",
  ),
);
await page.getByRole("button", { name: "Sign & complete agreement ✓" }).click();
await page.locator(".workspace-heading .badge.completed").waitFor();
assert.equal(
  await page.locator(".field-overlay input:not([readonly])").count(),
  0,
);
const completed = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("cedarsign:v1")).data.documents.find(
    (d) => d.id === "demo-draft",
  ),
);
for (const f of completed.fields.filter(
  (f) => f.type === "signerName" || f.type === "date",
))
  assert.ok(completed.values[f.id]?.value);
for (const f of completed.fields.filter((f) => f.assignee === "sender"))
  assert.deepEqual(completed.values[f.id], before.values[f.id]);
pass(
  "Recipient validation includes optional contacts; completion captures name/date and locks all values",
);
await page.screenshot({
  path: "artifacts/agreement-desktop.png",
  fullPage: true,
});
const desktop = await page
  .locator(".agreement-page")
  .first()
  .evaluate((el) => {
    const p = el.getBoundingClientRect(),
      f = el.querySelector(".field-overlay").getBoundingClientRect();
    return {
      x: (f.x - p.x) / p.width,
      y: (f.y - p.y) / p.height,
      w: f.width / p.width,
    };
  });
await page.setViewportSize({ width: 390, height: 844 });
const narrow = await page
  .locator(".agreement-page")
  .first()
  .evaluate((el) => {
    const p = el.getBoundingClientRect(),
      f = el.querySelector(".field-overlay").getBoundingClientRect();
    return {
      x: (f.x - p.x) / p.width,
      y: (f.y - p.y) / p.height,
      w: f.width / p.width,
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
for (const k of ["x", "y", "w"])
  assert.ok(
    Math.abs(desktop[k] - narrow[k]) < 0.003,
    `${k} responsive alignment`,
  );
assert.equal(narrow.overflow, false);
await page.screenshot({
  path: "artifacts/agreement-mobile.png",
  fullPage: true,
});
pass(
  "Normalized field alignment survives 1440px → 390px; no horizontal overflow",
);
await page.reload();
await page.locator(".workspace-heading .badge.completed").waitFor();
pass("Saved document survives reload");
await page.getByLabel("Active user").selectOption("morgan");
await page.getByRole("heading", { name: "Agreement unavailable" }).waitFor();
await page.getByRole("button", { name: "Back to agreements" }).click();
assert.equal(await page.locator(".document-row").count(), 0);
pass("Unrelated user sees no documents and cannot open a direct ID");
await page.getByLabel("Active user").selectOption("jordan");
await page
  .locator(".template-card")
  .filter({ hasText: "Browser verified layout" })
  .getByRole("button", { name: "Use template →" })
  .click();
const copy = await page.evaluate(() => {
  const id = new URLSearchParams(location.hash.slice(1)).get("document");
  return JSON.parse(localStorage.getItem("cedarsign:v1")).data.documents.find(
    (d) => d.id === id,
  );
});
assert.equal(Object.keys(copy.values).length, 0);
assert.ok(
  copy.fields.every((f) => !completed.fields.some((g) => g.id === f.id)),
);
pass("Saved template produces fresh field IDs and empty values");
await page
  .getByRole("button", { name: "All agreements", exact: false })
  .click();
await page.getByRole("button", { name: "+ New blank agreement" }).click();
await page.getByRole("button", { name: "Place fields", exact: true }).click();
await page.setViewportSize({ width: 1440, height: 1000 });
for (const type of [
  "text",
  "email",
  "phone",
  "date",
  "signature",
  "signerName",
]) {
  await page.getByRole("button", { name: type, exact: true }).click();
  const p = page.locator(".agreement-page").first();
  const bounds = await p.boundingBox();
  await p.click({
    position: {
      x: bounds.width - 4,
      y:
        100 +
        ["text", "email", "phone", "date", "signature", "signerName"].indexOf(
          type,
        ) *
          50,
    },
  });
}
assert.equal(await page.locator(".field-overlay").count(), 6);
const placed = await page.evaluate(() => {
  const id = new URLSearchParams(location.hash.slice(1)).get("document");
  return JSON.parse(localStorage.getItem("cedarsign:v1")).data.documents.find(
    (d) => d.id === id,
  );
});
assert.ok(
  placed.fields.every(
    (f) =>
      f.rect.x + f.rect.width <= 1.000001 &&
      f.rect.y + f.rect.height <= 1.000001,
  ),
);
pass("All six field types can be placed and are clamped inside the page");
await page.getByLabel("Assigned to").selectOption("recipient");
await page.getByLabel("Required", { exact: true }).uncheck();
await page.getByRole("button", { name: "Delete field" }).click();
assert.equal(await page.locator(".field-overlay").count(), 5);
pass("Field assignment, required configuration, and deletion work");
assert.deepEqual(errors, []);
pass("No browser runtime errors");
console.log(JSON.stringify({ passed: results.length, results }, null, 2));
await browser.close();
