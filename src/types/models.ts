export type FieldType =
  "text" | "email" | "phone" | "date" | "signature" | "signerName";
export type DocumentStatus = "draft" | "sent" | "completed";
export type Assignee = "sender" | "recipient";
export interface User {
  id: string;
  name: string;
  email: string;
}
export interface FieldDefinition {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  assignee: Assignee;
  pageIndex: number;
  rect: { x: number; y: number; width: number; height: number };
  autoFillSigningDate?: boolean;
}
export interface SourceDocument {
  id: string;
  title: string;
  pages: { imageUrl: string; aspectRatio: number }[];
}
export interface DocumentTemplate {
  id: string;
  name: string;
  sourceDocumentId: string;
  fields: FieldDefinition[];
  createdAt: string;
}
export interface FieldValue {
  value: string;
  filledByUserId: string;
  filledAt: string;
}
export interface SigningDocument {
  id: string;
  title: string;
  sourceDocumentId: string;
  templateId?: string;
  senderId: string;
  recipientId: string | null;
  status: DocumentStatus;
  fields: FieldDefinition[];
  values: Record<string, FieldValue>;
  createdAt: string;
  sentAt?: string;
  completedAt?: string;
}
export interface AppData {
  users: User[];
  sources: SourceDocument[];
  templates: DocumentTemplate[];
  documents: SigningDocument[];
}
