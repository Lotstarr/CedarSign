import type {
  DocumentTemplate,
  SigningDocument,
  SourceDocument,
  User,
} from "../types/models";
import { getCapabilities } from "./capabilities";
import { DomainError } from "./documentService";
export function saveTemplate(
  doc: SigningDocument,
  user: User,
  name: string,
  now = new Date().toISOString(),
): DocumentTemplate {
  if (!getCapabilities(doc, user).saveTemplate)
    throw new DomainError("Only the sender may save a draft layout.");
  if (!name.trim()) throw new DomainError("Enter a template name.");
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    sourceDocumentId: doc.sourceDocumentId,
    fields: structuredClone(doc.fields),
    createdAt: now,
  };
}
export function createDocument(
  source: SourceDocument,
  user: User,
  template?: DocumentTemplate,
  now = new Date().toISOString(),
): SigningDocument {
  if (template && template.sourceDocumentId !== source.id)
    throw new DomainError("Template and source do not match.");
  return {
    id: crypto.randomUUID(),
    title: template
      ? `${template.name} — new agreement`
      : "Master Agreement — new agreement",
    sourceDocumentId: source.id,
    templateId: template?.id,
    senderId: user.id,
    recipientId: null,
    status: "draft",
    fields: template
      ? structuredClone(template.fields).map((f) => ({
          ...f,
          id: crypto.randomUUID(),
        }))
      : [],
    values: {},
    createdAt: now,
  };
}
