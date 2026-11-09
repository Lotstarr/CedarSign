import { Component, useEffect, useState, type ReactNode } from "react";
import { useApp, AppProvider } from "./context/AppContext";
import { getCapabilities } from "./services/capabilities";
import { getVisibleDocument } from "./services/documentService";
import { createDocument } from "./services/templateService";
import { AgreementWorkspace } from "./components/AgreementWorkspace";
import { createLocalRepository } from "./repositories/localRepository";
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: string }
> {
  state = { error: "" };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    return this.state.error ? (
      <main className="app-shell">
        <h1>Unable to open saved demo</h1>
        <p role="alert">{this.state.error}</p>
        <button
          className="primary"
          onClick={() => {
            createLocalRepository(localStorage).reset();
            location.reload();
          }}
        >
          Reset demo data
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
function CedarSign() {
  const { data, userId, setUserId, commit, reset } = useApp();
  const user = data.users.find((u) => u.id === userId) ?? data.users[0];
  const [documentId, setDocumentId] = useState(() =>
    new URLSearchParams(location.hash.slice(1)).get("document"),
  );
  const [error, setError] = useState("");
  useEffect(() => {
    const changed = () =>
      setDocumentId(
        new URLSearchParams(location.hash.slice(1)).get("document"),
      );
    addEventListener("hashchange", changed);
    return () => removeEventListener("hashchange", changed);
  }, []);
  const open = (id: string | null) => {
    location.hash = id ? `document=${encodeURIComponent(id)}` : "";
    setDocumentId(id);
    setError("");
  };
  let doc;
  if (documentId) {
    try {
      doc = getVisibleDocument(data.documents, documentId, user);
    } catch {
      /* Render access denied without document details. */
    }
  }
  const visible = data.documents.filter((d) => getCapabilities(d, user).view);
  const create = (templateId?: string) => {
    try {
      const template = data.templates.find((t) => t.id === templateId);
      const source =
        data.sources.find((s) => s.id === template?.sourceDocumentId) ??
        data.sources[0];
      const next = createDocument(source, user, template);
      commit({ ...data, documents: [next, ...data.documents] });
      open(next.id);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <button className="brand" onClick={() => open(null)}>
            <span className="brand-icon">C</span>CedarSign
            <span className="demo-label">DEMO</span>
          </button>
          <label className="user-switch">
            Acting as
            <select
              aria-label="Active user"
              value={user.id}
              onChange={(e) => {
                setUserId(e.target.value);
                setError("");
              }}
            >
              {data.users.map((u) => (
                <option value={u.id} key={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>
      <main className="app-shell">
        {error && (
          <div role="alert" className="alert error">
            {error}
          </div>
        )}
        {documentId ? (
          doc ? (
            <AgreementWorkspace
              key={`${doc.id}-${user.id}`}
              doc={doc}
              user={user}
              onBack={() => open(null)}
            />
          ) : (
            <section className="panel">
              <h1>Agreement unavailable</h1>
              <p>
                This document does not exist or is not visible to the active
                user.
              </p>
              <button className="secondary" onClick={() => open(null)}>
                Back to agreements
              </button>
            </section>
          )
        ) : (
          <>
            <div className="dashboard-heading">
              <div>
                <div className="eyebrow">YOUR DOCUMENT DESK</div>
                <h1>Agreements, without the paperwork.</h1>
                <p>Prepare, send, and sign in one place.</p>
              </div>
              <button className="primary" onClick={() => create()}>
                + New blank agreement
              </button>
            </div>
            <div className="stats">
              {(["draft", "sent", "completed"] as const).map((status) => (
                <div className="stat" key={status}>
                  <strong>
                    {visible.filter((d) => d.status === status).length}
                  </strong>
                  <span>
                    {status === "sent"
                      ? "Awaiting signature"
                      : status === "draft"
                        ? "Draft agreements"
                        : "Completed"}
                  </span>
                </div>
              ))}
            </div>
            <section className="document-section">
              <div className="section-heading">
                <h2>Your agreements</h2>
                <span className="muted">{visible.length} total</span>
              </div>
              <div className="document-list">
                {visible.length === 0 ? (
                  <div className="empty-state">
                    <h3>No agreements yet</h3>
                    <p>Agreements you send or receive will appear here.</p>
                  </div>
                ) : (
                  visible.map((d) => (
                    <button
                      className="document-row"
                      key={d.id}
                      onClick={() => open(d.id)}
                    >
                      <span className="document-icon">▤</span>
                      <span className="document-info">
                        <strong>{d.title}</strong>
                        <span>
                          {data.users.find((u) => u.id === d.senderId)?.name} →{" "}
                          {data.users.find((u) => u.id === d.recipientId)
                            ?.name ?? "No recipient yet"}
                        </span>
                      </span>
                      <span className={`badge ${d.status}`}>{d.status}</span>
                      <span className="row-action">
                        {getCapabilities(d, user).configure
                          ? "Prepare"
                          : getCapabilities(d, user).complete
                            ? "Sign"
                            : "View"}{" "}
                        →
                      </span>
                    </button>
                  ))
                )}
              </div>
            </section>
            <section>
              <div className="section-heading">
                <div>
                  <h2>Start with a template</h2>
                  <p className="hint">
                    Reuse a layout. Every agreement starts with its own empty
                    fields.
                  </p>
                </div>
              </div>
              <div className="template-grid">
                {data.templates.map((t) => (
                  <article className="template-card" key={t.id}>
                    <span className="template-icon">▧</span>
                    <h3>{t.name}</h3>
                    <p>
                      {t.fields.length} fields ·{" "}
                      {
                        data.sources.find((s) => s.id === t.sourceDocumentId)
                          ?.pages.length
                      }{" "}
                      pages
                    </p>
                    <button className="secondary" onClick={() => create(t.id)}>
                      Use template →
                    </button>
                  </article>
                ))}
              </div>
            </section>
            <footer>
              <span>Local demo · simulated users · saved in this browser</span>
              <button
                className="link"
                onClick={() => {
                  if (
                    window.confirm(
                      "Reset all agreements and templates in this browser?",
                    )
                  ) {
                    try {
                      reset();
                      setError("");
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }
                }}
              >
                Reset demo data
              </button>
            </footer>
          </>
        )}
      </main>
    </>
  );
}
export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <CedarSign />
      </AppProvider>
    </ErrorBoundary>
  );
}
