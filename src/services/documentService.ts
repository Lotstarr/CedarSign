import type {
  Assignee,
  FieldDefinition,
  SigningDocument,
  User,
} from "../types/models";
import { canFillField, getCapabilities } from "./capabilities";
export class DomainError extends Error {}
function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new DomainError(message);
}
export function validateField(
  field: FieldDefinition,
  value: string,
): string | null {
  const text = value.trim();
  if (!text) return field.required ? `${field.label} is required.` : null;
  if (text.length > 500)
    return `${field.label} must be 500 characters or fewer.`;
  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text))
    return `${field.label} must be a valid email.`;
  if (
    field.type === "phone" &&
    (!/^[+\d\s().-]+$/.test(text) ||
      !/^\d{10,15}$/.test(text.replace(/\D/g, "")))
  )
    return `${field.label} must contain 10–15 digits.`;
  if (
    field.type === "date" &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(text) ||
      !Number.isFinite(Date.parse(text)) ||
      new Date(text).toISOString().slice(0, 10) !== text)
  )
    return `${field.label} must be a valid date.`;
  return null;
}
export function fillField(
  doc: SigningDocument,
  user: User,
  fieldId: string,
  value: string,
  now = new Date().toISOString(),
): SigningDocument {
  const field = doc.fields.find((f) => f.id === fieldId);
  assert(
    !!field && canFillField(doc, user, field),
    "You cannot edit this field.",
  );
  assert(
    field.type !== "signerName" &&
      !(field.type === "date" && field.autoFillSigningDate),
    "This field is captured when signing.",
  );
  return {
    ...doc,
    values: {
      ...doc.values,
      [fieldId]: { value, filledByUserId: user.id, filledAt: now },
    },
  };
}
export function configureDocument(
  doc: SigningDocument,
  user: User,
  patch: {
    fields?: FieldDefinition[];
    recipientId?: string | null;
    title?: string;
  },
): SigningDocument {
  assert(
    getCapabilities(doc, user).configure,
    "Only the sender may configure a draft.",
  );
  const fields = structuredClone(patch.fields ?? doc.fields);
  assert(
    new Set(fields.map((f) => f.id)).size === fields.length,
    "Field IDs must be unique.",
  );
  fields.forEach((f) => {
    const { x, y, width, height } = f.rect;
    assert(
      [x, y, width, height].every(Number.isFinite) &&
        x >= 0 &&
        y >= 0 &&
        width > 0 &&
        height > 0 &&
        x + width <= 1.000001 &&
        y + height <= 1.000001,
      "Fields must remain inside the page.",
    );
    assert(
      Number.isInteger(f.pageIndex) && f.pageIndex >= 0 && f.pageIndex < 2,
      "Invalid page.",
    );
    assert(f.label.trim().length > 0, "A field needs a label.");
  });
  const values = Object.fromEntries(
    Object.entries(doc.values).filter(([id]) => {
      const old = doc.fields.find((f) => f.id === id),
        next = fields.find((f) => f.id === id);
      return (
        old &&
        next &&
        old.type === next.type &&
        old.assignee === next.assignee &&
        old.autoFillSigningDate === next.autoFillSigningDate
      );
    }),
  );
  return { ...doc, ...patch, fields, values };
}
function captureAndValidate(
  doc: SigningDocument,
  user: User,
  role: Assignee,
  now: string,
) {
  const next = structuredClone(doc);
  const errors: string[] = [];
  next.fields
    .filter((f) => f.assignee === role)
    .forEach((field) => {
      if (
        field.type === "signerName" ||
        (field.type === "date" && field.autoFillSigningDate)
      ) {
        next.values[field.id] = {
          value: field.type === "signerName" ? user.name : now.slice(0, 10),
          filledByUserId: user.id,
          filledAt: now,
        };
      }
      const error = validateField(field, next.values[field.id]?.value ?? "");
      if (error) errors.push(error);
    });
  assert(errors.length === 0, errors.join("\n"));
  return next;
}
export function issueDocument(
  doc: SigningDocument,
  user: User,
  users: User[],
  now = new Date().toISOString(),
): SigningDocument {
  assert(
    getCapabilities(doc, user).issue,
    "Only the sender may issue a draft.",
  );
  assert(
    !!doc.recipientId &&
      doc.recipientId !== doc.senderId &&
      users.some((u) => u.id === doc.recipientId),
    "Choose a valid recipient other than yourself.",
  );
  assert(
    doc.fields.some(
      (f) =>
        f.assignee === "sender" &&
        f.type === "signature" &&
        !!doc.values[f.id]?.value.trim(),
    ),
    "The sender must provide a signature.",
  );
  const next = captureAndValidate(doc, user, "sender", now);
  return { ...next, status: "sent", sentAt: now };
}
export function completeDocument(
  doc: SigningDocument,
  user: User,
  now = new Date().toISOString(),
): SigningDocument {
  assert(
    getCapabilities(doc, user).complete,
    "Only the assigned recipient may complete a sent document.",
  );
  assert(
    doc.fields.some(
      (f) =>
        f.assignee === "recipient" &&
        f.type === "signature" &&
        !!doc.values[f.id]?.value.trim(),
    ),
    "The recipient must provide a signature.",
  );
  const next = captureAndValidate(doc, user, "recipient", now);
  return { ...next, status: "completed", completedAt: now };
}
export function getVisibleDocument(
  documents: SigningDocument[],
  id: string,
  user: User,
) {
  const doc = documents.find((d) => d.id === id);
  assert(
    !!doc && getCapabilities(doc, user).view,
    "Document not found or access denied.",
  );
  return doc;
}
