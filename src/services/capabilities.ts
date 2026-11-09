import type { FieldDefinition, SigningDocument, User } from "../types/models";
export function getCapabilities(doc: SigningDocument, user: User) {
  const sender = doc.senderId === user.id;
  const recipient = doc.recipientId === user.id;
  const configure = sender && doc.status === "draft";
  const fill = configure || (recipient && doc.status === "sent");
  return {
    view: sender || (recipient && doc.status !== "draft"),
    configure,
    fill,
    issue: configure,
    complete: recipient && doc.status === "sent",
    saveTemplate: configure,
  };
}
export function canFillField(
  doc: SigningDocument,
  user: User,
  field: FieldDefinition,
) {
  const caps = getCapabilities(doc, user);
  return (
    caps.fill &&
    (field.assignee === "sender"
      ? doc.senderId === user.id && doc.status === "draft"
      : doc.recipientId === user.id && doc.status === "sent")
  );
}
