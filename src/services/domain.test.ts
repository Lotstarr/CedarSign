import { describe, expect, it } from "vitest";
import { createSeedData } from "../data/seed";
import { canFillField, getCapabilities } from "./capabilities";
import {
  completeDocument,
  configureDocument,
  fillField,
  getVisibleDocument,
  issueDocument,
  validateField,
} from "./documentService";
import { createDocument, saveTemplate } from "./templateService";
import { createLocalRepository } from "../repositories/localRepository";

describe("signing boundaries", () => {
  it("rejects unauthorized access, including direct IDs and draft recipients", () => {
    const { documents, users } = createSeedData();
    expect(() =>
      getVisibleDocument(documents, "demo-sent", users[2]),
    ).toThrow();
    expect(() =>
      getVisibleDocument(documents, "demo-draft", users[1]),
    ).toThrow();
    expect(() => issueDocument(documents[0], users[1], users)).toThrow();
    expect(() => completeDocument(documents[1], users[0])).toThrow();
  });
  it("rejects an invalid issue without partially capturing fields", () => {
    const { documents, users } = createSeedData();
    let draft = configureDocument(documents[0], users[0], {
      recipientId: users[1].id,
    });
    const signature = draft.fields.find(
      (f) => f.assignee === "sender" && f.type === "signature",
    )!;
    draft = fillField(draft, users[0], signature.id, "Jordan");
    const before = structuredClone(draft);
    expect(() => issueDocument(draft, users[0], users)).toThrow("Title");
    expect(draft).toEqual(before);
  });
  it("captures names/dates, enforces ownership and locks completed documents", () => {
    const { documents, users } = createSeedData();
    let doc = documents[1];
    const senderField = doc.fields.find((f) => f.assignee === "sender")!;
    expect(canFillField(doc, users[1], senderField)).toBe(false);
    expect(() => fillField(doc, users[1], senderField.id, "changed")).toThrow();
    expect(() => configureDocument(doc, users[0], { fields: [] })).toThrow();
    expect(() => completeDocument(doc, users[1])).toThrow();
    for (const f of doc.fields.filter(
      (f) =>
        f.assignee === "recipient" &&
        f.type !== "signerName" &&
        f.type !== "date",
    )) {
      const value =
        f.type === "email"
          ? "casey@example.com"
          : f.type === "phone"
            ? "817-555-0101"
            : f.type === "signature"
              ? "Casey Rivera"
              : "Example";
      doc = fillField(doc, users[1], f.id, value);
    }
    const now = "2026-11-09T20:30:00.000Z";
    const completed = completeDocument(doc, users[1], now);
    for (const f of completed.fields.filter(
      (f) =>
        f.assignee === "recipient" && ["signerName", "date"].includes(f.type),
    ))
      expect(completed.values[f.id]).toEqual({
        value: f.type === "date" ? "2026-11-09" : users[1].name,
        filledByUserId: users[1].id,
        filledAt: now,
      });
    expect(completed.status).toBe("completed");
    expect(getCapabilities(completed, users[1]).fill).toBe(false);
    expect(() =>
      fillField(completed, users[1], completed.fields[0].id, "changed"),
    ).toThrow();
    expect(doc.status).toBe("sent");
  });
  it("validates optional contact values and real calendar dates", () => {
    const field = createSeedData().templates[0].fields.find(
      (f) => f.label === "Fax",
    )!;
    expect(validateField(field, "")).toBeNull();
    expect(validateField(field, "invalid")).toBeTruthy();
    expect(validateField({ ...field, type: "email" }, "invalid")).toBeTruthy();
    expect(
      validateField({ ...field, type: "date" }, "2026-02-30"),
    ).toBeTruthy();
  });
});
describe("templates and persistence", () => {
  it("copies layouts with unique field IDs, empty values, and independent rectangles", () => {
    const data = createSeedData();
    const template = saveTemplate(data.documents[0], data.users[0], "Reusable");
    const a = createDocument(data.sources[0], data.users[0], template);
    const b = createDocument(data.sources[0], data.users[0], template);
    expect(a.values).toEqual({});
    expect(
      a.fields.every(
        (f) =>
          !b.fields.some((g) => g.id === f.id) &&
          !template.fields.some((g) => g.id === f.id),
      ),
    ).toBe(true);
    a.fields[0].rect.x = 0.4;
    expect(b.fields[0].rect.x).toBe(template.fields[0].rect.x);
  });
  it("seeds only fresh storage and survives a new repository instance", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    };
    const repo = createLocalRepository(storage),
      data = repo.load();
    data.documents[0].title = "Persisted";
    repo.save(data);
    expect(createLocalRepository(storage).load().documents[0].title).toBe(
      "Persisted",
    );
    expect(repo.reset().documents[0].title).not.toBe("Persisted");
  });
});
