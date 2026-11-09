import type {
  AppData,
  FieldDefinition,
  FieldType,
  Assignee,
} from "../types/models";
import { createDocument } from "../services/templateService";
import {
  configureDocument,
  fillField,
  issueDocument,
} from "../services/documentService";
export function createSeedData(): AppData {
  const users = [
    { id: "jordan", name: "Jordan Vance", email: "jordan@example.com" },
    { id: "casey", name: "Casey Rivera", email: "casey@example.com" },
    { id: "morgan", name: "Morgan Blake", email: "morgan@example.com" },
  ];
  const source = {
    id: "master-agreement",
    title: "Master Agreement",
    pages: [1, 2].map((n) => ({
      imageUrl: `/documents/agreement-${n}.png`,
      aspectRatio: 612 / 792,
    })),
  };
  const fields: FieldDefinition[] = [];
  function add(
    label: string,
    type: FieldType,
    assignee: Assignee,
    pageIndex: number,
    x: number,
    y: number,
    width: number,
    height: number,
    required = true,
  ) {
    fields.push({
      id: `standard-${fields.length + 1}`,
      label,
      type,
      assignee,
      pageIndex,
      required,
      rect: { x, y, width, height },
      ...(type === "date" ? { autoFillSigningDate: true } : {}),
    });
  }
  // Measured against rendered 1082 × 1400 Letter pages. Inputs occupy the space below printed labels.
  add(
    "Customer Legal Name",
    "text",
    "recipient",
    0,
    0.092,
    0.158,
    0.814,
    0.013,
  );
  add("Purchasing Agent", "text", "recipient", 0, 0.092, 0.183, 0.32, 0.013);
  add("Email", "email", "recipient", 0, 0.422, 0.183, 0.484, 0.013);
  add("Address", "text", "recipient", 0, 0.092, 0.209, 0.32, 0.013);
  add("City", "text", "recipient", 0, 0.422, 0.209, 0.238, 0.013);
  add("State", "text", "recipient", 0, 0.67, 0.209, 0.11, 0.013);
  add("Zip", "text", "recipient", 0, 0.794, 0.209, 0.112, 0.013);
  add("Phone", "phone", "recipient", 0, 0.092, 0.234, 0.32, 0.013);
  add("Fax", "phone", "recipient", 0, 0.422, 0.234, 0.484, 0.013, false);
  for (const [assignee, x] of [
    ["sender", 0.092],
    ["recipient", 0.504],
  ] as const) {
    add("Signature", "signature", assignee, 1, x, 0.51, 0.398, 0.025);
    add("Print Name", "signerName", assignee, 1, x, 0.55, 0.257, 0.015);
    add("Date", "date", assignee, 1, x + 0.268, 0.55, 0.13, 0.015);
    add("Title", "text", assignee, 1, x, 0.578, 0.398, 0.014);
  }
  const now = new Date().toISOString();
  const template = {
    id: "standard",
    name: "Master Agreement — Standard",
    sourceDocumentId: source.id,
    fields,
    createdAt: now,
  };
  const draft = {
    ...createDocument(source, users[0], template, now),
    id: "demo-draft",
    title: "Master Agreement — draft demo",
  };
  let sent = {
    ...createDocument(source, users[0], template, now),
    id: "demo-sent",
    title: "Master Agreement — awaiting Casey",
  };
  sent = configureDocument(sent, users[0], { recipientId: users[1].id });
  for (const field of sent.fields.filter(
    (f) => f.assignee === "sender" && ["signature", "text"].includes(f.type),
  ))
    sent = fillField(
      sent,
      users[0],
      field.id,
      field.type === "signature" ? users[0].name : "Account Manager",
      now,
    );
  sent = issueDocument(sent, users[0], users, now);
  return {
    users,
    sources: [source],
    templates: [template],
    documents: [draft, sent],
  };
}
