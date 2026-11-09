import type { CSSProperties } from "react";
import type {
  FieldType,
  SigningDocument,
  SourceDocument,
  User,
} from "../types/models";
import { canFillField } from "../services/capabilities";
export const fieldTypes: FieldType[] = [
  "text",
  "email",
  "phone",
  "date",
  "signature",
  "signerName",
];
interface Props {
  doc: SigningDocument;
  source: SourceDocument;
  user: User;
  configuring: boolean;
  placing: FieldType | null;
  selectedId: string | null;
  onPlace: (pageIndex: number, x: number, y: number) => void;
  onSelect: (id: string) => void;
  onFill: (id: string, value: string) => void;
}
export function AgreementCanvas({
  doc,
  source,
  user,
  configuring,
  placing,
  selectedId,
  onPlace,
  onSelect,
  onFill,
}: Props) {
  return (
    <div className="canvas-stack">
      {source.pages.map((page, pageIndex) => (
        <section key={pageIndex} aria-label={`Agreement page ${pageIndex + 1}`}>
          <div className="page-caption">
            <span>
              Page {pageIndex + 1} of {source.pages.length}
            </span>
            <span>{configuring ? "Configure layout" : "Agreement"}</span>
          </div>
          <div
            className={`agreement-page ${placing ? "placing" : ""}`}
            style={{ aspectRatio: page.aspectRatio }}
            onClick={(event) => {
              if (!placing) return;
              const bounds = event.currentTarget.getBoundingClientRect();
              onPlace(
                pageIndex,
                (event.clientX - bounds.left) / bounds.width,
                (event.clientY - bounds.top) / bounds.height,
              );
            }}
          >
            <img
              src={`${page.imageUrl}${page.imageUrl.includes("?") ? "&" : "?"}render=2`}
              alt={`Master Agreement page ${pageIndex + 1}`}
              draggable={false}
            />
            {doc.fields
              .filter((f) => f.pageIndex === pageIndex)
              .map((field) => {
                const value = doc.values[field.id]?.value ?? "";
                const automatic =
                  field.type === "signerName" ||
                  (field.type === "date" && field.autoFillSigningDate);
                const editable =
                  canFillField(doc, user, field) && !automatic && !configuring;
                const displayValue =
                  value ||
                  (automatic && canFillField(doc, user, field)
                    ? field.type === "signerName"
                      ? user.name
                      : ""
                    : "");
                const style = {
                  left: `${field.rect.x * 100}%`,
                  top: `${field.rect.y * 100}%`,
                  width: `${field.rect.width * 100}%`,
                  height: `${field.rect.height * 100}%`,
                } as CSSProperties;
                return (
                  <div
                    key={field.id}
                    style={style}
                    className={`field-overlay ${field.assignee} ${selectedId === field.id && configuring ? "selected" : ""} ${field.type === "signature" ? "signature" : ""}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {configuring ? (
                      <button
                        className="field-select"
                        onClick={() => onSelect(field.id)}
                        title={`${field.label} · ${field.assignee}`}
                        aria-label={`Configure ${field.label} (${field.assignee})`}
                      >
                        {field.label}
                        {field.required ? " *" : ""}
                      </button>
                    ) : (
                      <input
                        aria-label={`${field.label} (${field.assignee})`}
                        title={`${field.label}${field.required ? " (required)" : ""} · ${field.assignee}`}
                        type={
                          field.type === "date" && !automatic
                            ? "date"
                            : field.type === "email"
                              ? "email"
                              : field.type === "phone"
                                ? "tel"
                                : "text"
                        }
                        value={displayValue}
                        readOnly={!editable}
                        placeholder={
                          automatic
                            ? field.type === "date"
                              ? "At signing"
                              : field.label
                            : field.label
                        }
                        onChange={(event) =>
                          onFill(field.id, event.target.value)
                        }
                        maxLength={500}
                        autoComplete="off"
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
export function FieldLegend() {
  return (
    <div className="legend">
      <span>
        <i className="sender-dot" /> Sender fields
      </span>
      <span>
        <i className="recipient-dot" /> Recipient fields
      </span>
    </div>
  );
}
