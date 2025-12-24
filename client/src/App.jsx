import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL;

function formatTime(d) {
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchNotes = async () => {
    try {
      setError("");
      const res = await fetch(`${API}/notes`);
      if (!res.ok) throw new Error("Failed to load notes");
      const data = await res.json();
      setNotes(data);
    } catch (e) {
      setError(e.message || "Something went wrong");
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.content || "").toLowerCase().includes(q)
    );
  }, [notes, search]);

  const remaining = 60 - title.length;

  const addNote = async (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, content }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.message || "Failed to create note");
      }
      setTitle("");
      setContent("");
      await fetchNotes();
    } catch (e2) {
      setError(e2.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    const ok = confirm("Delete this note? (forever 😵)");
    if (!ok) return;

    setError("");
    const old = notes;
    setNotes((prev) => prev.filter((n) => n._id !== id));

    try {
      const res = await fetch(`${API}/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    } catch (e) {
      setNotes(old);
      setError(e.message || "Something went wrong");
    }
  };

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div className="badge" />
          <div className="title">
            <strong>RETRO NOTES 2005</strong>
            <span>MongoDB • Express • React • Node • pure nostalgia</span>
          </div>
        </div>
        <div className="clock">{now.toLocaleTimeString()}</div>
      </div>

      <div className="grid">
        <div className="panel">
          <h2>Write a note</h2>

          {error ? (
            <>
              <div className="empty" style={{ borderStyle: "solid" }}>
                ❌ {error}
              </div>
              <div className="hr" />
            </>
          ) : null}

          <form onSubmit={addNote} style={{ display: "grid", gap: 10 }}>
            <div>
              <div className="label">Title (max 60 chars)</div>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 60))}
                placeholder="e.g. Buy milk, call boss, rule the web"
              />
              <div
                className="row"
                style={{ justifyContent: "space-between", marginTop: 6 }}
              >
                <span className="counter">{remaining} left</span>
                <button className="btn primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Note"}
                </button>
              </div>
            </div>

            <div>
              <div className="label">Content</div>
              <textarea
                className="textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type like it’s 2005…"
              />
            </div>

            <div className="row">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setTitle("");
                  setContent("");
                }}
              >
                Clear
              </button>
              <button type="button" className="btn" onClick={fetchNotes}>
                Refresh
              </button>
            </div>
          </form>

          <div className="hr" />
          <div className="footer">
            Tip: Search on the right like an old-school site filter 😄
          </div>
        </div>

        <div className="panel">
          <div className="notesHead">
            <h2 style={{ margin: 0 }}>Notes ({filtered.length})</h2>
            <input
              className="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
            />
          </div>

          {filtered.length === 0 ? (
            <div className="empty">No notes found. Make one on the left 👈</div>
          ) : (
            <div className="noteList">
              {filtered.map((n) => (
                <div className="card" key={n._id}>
                  <div className="cardBody">
                    <div
                      className="row"
                      style={{ justifyContent: "space-between" }}
                    >
                      <div className="cardTitle">{n.title}</div>
                      <button
                        className="btn danger mini"
                        onClick={() => deleteNote(n._id)}
                      >
                        Delete
                      </button>
                    </div>
                    <div className="cardMeta">
                      Created: {n.createdAt ? formatTime(new Date(n.createdAt)) : "—"}
                    </div>
                    {n.content ? <div className="cardContent">{n.content}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="footer" style={{ marginTop: 12 }}>
            “Best viewed in Netscape” (jk) • MERN edition
          </div>
        </div>
      </div>

      <div className="footer" style={{ marginTop: 16 }}>
        © {new Date().getFullYear()} Retro Notes. Totally not a MySpace plugin.
      </div>
    </div>
  );
}
