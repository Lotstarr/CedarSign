import { useState } from "react";
import type {
  FieldDefinition,
  FieldType,
  SigningDocument,
  User,
} from "../types/models";
import { useApp } from "../context/AppContext";
import { getCapabilities, canFillField } from "../services/capabilities";
import {
  completeDocument,
  configureDocument,
  fillField,
  issueDocument,
} from "../services/documentService";
import { saveTemplate } from "../services/templateService";
import { AgreementCanvas, FieldLegend, fieldTypes } from "./AgreementCanvas";
export function AgreementWorkspace({
  doc,
  user,
  onBack,
}: {
  doc: SigningDocument;
  user: User;
  onBack: () => void;
}) {
  const { data, commit, updateDocument } = useApp();
  const caps = getCapabilities(doc, user);
  const [mode, setMode] = useState<"fill" | "configure">("fill");
  const configuring = caps.configure && mode === "configure";
  const [placing, setPlacing] = useState<FieldType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [templateName, setTemplateName] = useState("");
  const selected = doc.fields.find((f) => f.id === selectedId);
  const source = data.sources.find((s) => s.id === doc.sourceDocumentId)!;
  function attempt(action: () => void) {
    try {
      action();
      setError("");
      setNotice("");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      return false;
    }
  }
  function configure(patch: Parameters<typeof configureDocument>[2]) {
    return attempt(() => updateDocument(configureDocument(doc, user, patch)));
  }
  function updateField(patch: Partial<FieldDefinition>) {
    if (selected)
      configure({
        fields: doc.fields.map((f) =>
          f.id === selected.id ? { ...f, ...patch } : f,
        ),
      });
  }
  const roleFields = doc.fields.filter((f) => canFillField(doc, user, f));
  return (
    <>
      <button className="back-button" onClick={onBack}>
        ← All agreements
      </button>
      <div className="workspace-heading">
        <div>
          <div className="eyebrow">AGREEMENT WORKSPACE</div>
          <h1>{doc.title}</h1>
          <p>
            {data.users.find((u) => u.id === doc.senderId)?.name} →{" "}
            {data.users.find((u) => u.id === doc.recipientId)?.name ??
              "Recipient not selected"}
          </p>
        </div>
        <span className={`badge ${doc.status}`}>{doc.status}</span>
      </div>
      {error && (
        <div role="alert" className="alert error">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="alert success">
          {notice}
        </div>
      )}
      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <section className="panel">
            <h2>
              {caps.configure
                ? "Prepare agreement"
                : caps.complete
                  ? "Your signature is next"
                  : "Agreement details"}
            </h2>
            {caps.configure && (
              <>
                <label>
                  Agreement title
                  <input
                    value={doc.title}
                    onChange={(e) => configure({ title: e.target.value })}
                  />
                </label>
                <label>
                  Send to
                  <select
                    value={doc.recipientId ?? ""}
                    onChange={(e) =>
                      configure({ recipientId: e.target.value || null })
                    }
                  >
                    <option value="">Choose recipient</option>
                    {data.users
                      .filter((u) => u.id !== user.id)
                      .map((u) => (
                        <option value={u.id} key={u.id}>
                          {u.name}
                        </option>
                      ))}
                  </select>
                </label>
                <div className="segmented">
                  <button
                    className={mode === "fill" ? "active" : ""}
                    onClick={() => {
                      setMode("fill");
                      setPlacing(null);
                    }}
                  >
                    Fill & sign
                  </button>
                  <button
                    className={mode === "configure" ? "active" : ""}
                    onClick={() => setMode("configure")}
                  >
                    Place fields
                  </button>
                </div>
              </>
            )}
            <FieldLegend />
            <p className="hint">
              {configuring
                ? "Choose a type, then click a page. Select any field to edit its properties."
                : caps.fill
                  ? "Fill your fields below or directly on the pages. Name and automatic dates are captured when you sign."
                  : doc.status === "completed"
                    ? "Both parties have signed. All fields are locked."
                    : "This agreement is read-only for you."}
            </p>
          </section>
          {configuring ? (
            <section className="panel">
              <h2>
                Field layout{" "}
                <span className="muted">({doc.fields.length} placed)</span>
              </h2>
              <p className="hint">1. Choose the type of field to add.</p>
              <div className="field-tools">
                {fieldTypes.map((type) => (
                  <button
                    key={type}
                    className={placing === type ? "active" : ""}
                    aria-pressed={placing === type}
                    onClick={() => {
                      setPlacing(placing === type ? null : type);
                      setSelectedId(null);
                      setNotice("");
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {placing && (
                <p role="status" className="placement-help">
                  <strong>
                    2. Click the document to place your {placing} field.
                  </strong>
                  <span>
                    {placing === "date"
                      ? "For a signing date, click the Date cell on page 2. The field will then appear in the list below."
                      : "Choose the spot where this field should appear. It will then be selected below."}
                  </span>
                  <button className="link" onClick={() => setPlacing(null)}>
                    Cancel placement
                  </button>
                </p>
              )}
              <label>
                Edit a placed field
                <select
                  aria-label="Edit a placed field"
                  disabled={doc.fields.length === 0}
                  value={selectedId ?? ""}
                  onChange={(e) => {
                    setSelectedId(e.target.value || null);
                    setPlacing(null);
                  }}
                >
                  <option value="">
                    {doc.fields.length
                      ? "Choose an existing field"
                      : "No fields placed yet"}
                  </option>
                  {doc.fields.map((f) => (
                    <option value={f.id} key={f.id}>
                      {f.label} · page {f.pageIndex + 1} · {f.assignee}
                    </option>
                  ))}
                </select>
              </label>
              {doc.fields.length === 0 && (
                <p className="hint">
                  This list fills up after you place fields on the document.
                  Selecting a type alone does not create a field.
                </p>
              )}
              {selected && (
                <div className="field-properties">
                  <label>
                    Label
                    <input
                      value={selected.label}
                      onChange={(e) => updateField({ label: e.target.value })}
                    />
                  </label>
                  <label>
                    Type
                    <select
                      value={selected.type}
                      onChange={(e) =>
                        updateField({ type: e.target.value as FieldType })
                      }
                    >
                      {fieldTypes.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Assigned to
                    <select
                      value={selected.assignee}
                      onChange={(e) =>
                        updateField({
                          assignee: e.target.value as "sender" | "recipient",
                        })
                      }
                    >
                      <option value="sender">Sender</option>
                      <option value="recipient">Recipient</option>
                    </select>
                  </label>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={selected.required}
                      onChange={(e) =>
                        updateField({ required: e.target.checked })
                      }
                    />
                    Required
                  </label>
                  {selected.type === "date" && (
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={!!selected.autoFillSigningDate}
                        onChange={(e) =>
                          updateField({ autoFillSigningDate: e.target.checked })
                        }
                      />
                      Capture signing date
                    </label>
                  )}
                  <button
                    className="danger"
                    onClick={() => {
                      configure({
                        fields: doc.fields.filter((f) => f.id !== selected.id),
                      });
                      setSelectedId(null);
                    }}
                  >
                    Delete field
                  </button>
                </div>
              )}
            </section>
          ) : (
            caps.fill && (
              <section className="panel">
                <h2>
                  Your fields{" "}
                  <span className="muted">({roleFields.length})</span>
                </h2>
                {roleFields.length === 0 && (
                  <p className="hint">
                    Use Place fields to add your signature and any other fields.
                  </p>
                )}
                {roleFields.map((f) => {
                  const automatic =
                    f.type === "signerName" ||
                    (f.type === "date" && f.autoFillSigningDate);
                  return (
                    <label key={f.id}>
                      {f.label}
                      {f.required ? " *" : ""}
                      <input
                        className={
                          f.type === "signature" ? "signature-input" : ""
                        }
                        type={
                          f.type === "date" && !automatic
                            ? "date"
                            : f.type === "email"
                              ? "email"
                              : f.type === "phone"
                                ? "tel"
                                : "text"
                        }
                        value={
                          automatic
                            ? f.type === "signerName"
                              ? user.name
                              : "Captured when signing"
                            : (doc.values[f.id]?.value ?? "")
                        }
                        readOnly={automatic}
                        maxLength={500}
                        onChange={(e) =>
                          attempt(() =>
                            updateDocument(
                              fillField(doc, user, f.id, e.target.value),
                            ),
                          )
                        }
                      />
                      {automatic && <small>Automatic</small>}
                    </label>
                  );
                })}
              </section>
            )
          )}
          {caps.saveTemplate && (
            <section className="panel">
              <h2>Reuse this layout</h2>
              <label>
                Template name
                <input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Standard customer agreement"
                />
              </label>
              <button
                className="secondary full"
                onClick={() => {
                  try {
                    const template = saveTemplate(doc, user, templateName);
                    commit({
                      ...data,
                      templates: [...data.templates, template],
                    });
                    setTemplateName("");
                    setError("");
                    setNotice(
                      "Template saved. Create a fresh agreement from the dashboard.",
                    );
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Save as template
              </button>
            </section>
          )}
          {(caps.issue || caps.complete) && (
            <section className="panel">
              <p className="hint">
                {caps.issue
                  ? "Issuing locks the field layout and your values."
                  : "Completing locks every field for both parties."}
              </p>
              <button
                className="primary full"
                onClick={() =>
                  attempt(() =>
                    updateDocument(
                      caps.issue
                        ? issueDocument(doc, user, data.users)
                        : completeDocument(doc, user),
                    ),
                  )
                }
              >
                {caps.issue
                  ? "Sign & issue agreement →"
                  : "Sign & complete agreement ✓"}
              </button>
            </section>
          )}
          {doc.sentAt && (
            <p className="timestamp">
              Issued {new Date(doc.sentAt).toLocaleString()}
            </p>
          )}
          {doc.completedAt && (
            <p className="timestamp">
              Completed {new Date(doc.completedAt).toLocaleString()}
            </p>
          )}
        </aside>
        <AgreementCanvas
          doc={doc}
          source={source}
          user={user}
          configuring={configuring}
          placing={configuring ? placing : null}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setPlacing(null);
          }}
          onFill={(id, value) =>
            attempt(() => updateDocument(fillField(doc, user, id, value)))
          }
          onPlace={(pageIndex, x, y) => {
            if (!placing) return;
            const width = placing === "date" ? 0.15 : 0.25,
              height = placing === "signature" ? 0.035 : 0.022;
            const field: FieldDefinition = {
              id: crypto.randomUUID(),
              type: placing,
              label:
                placing === "signerName"
                  ? "Print Name"
                  : placing[0].toUpperCase() + placing.slice(1),
              required: true,
              assignee: "sender",
              pageIndex,
              rect: {
                x: Math.min(1 - width, Math.max(0, x)),
                y: Math.min(1 - height, Math.max(0, y)),
                width,
                height,
              },
              autoFillSigningDate: placing === "date",
            };
            if (configure({ fields: [...doc.fields, field] })) {
              setSelectedId(field.id);
              setPlacing(null);
              setNotice(
                `${field.label} field added to page ${pageIndex + 1}. Edit its properties under “Edit a placed field.”`,
              );
            }
          }}
        />
      </div>
    </>
  );
}
