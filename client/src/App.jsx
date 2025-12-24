import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL;

function formatTime(d) {
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const emptyRegister = {
  fullName: "",
  dob: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: ""
};

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState("");

  const [authView, setAuthView] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState("");

  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [register, setRegister] = useState(emptyRegister);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("retroUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("retroUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("retroUser");
    }
  }, [user]);

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
    if (user) fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
        body: JSON.stringify({ title: t, content })
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
    const ok = confirm("Delete this note? (forever)");
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

  const logout = () => {
    setUser(null);
    setNotes([]);
    setSearch("");
    setError("");
  };

  const checkUsername = async () => {
    const u = register.username.trim();
    if (!u) {
      setUsernameStatus("");
      return;
    }

    setUsernameStatus("checking");
    try {
      const res = await fetch(
        `${API}/auth/check-username?username=${encodeURIComponent(u)}`
      );
      if (!res.ok) throw new Error("Failed to check");
      const data = await res.json();
      setUsernameStatus(data.available ? "available" : "taken");
    } catch {
      setUsernameStatus("error");
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthMessage("");

    if (register.password !== register.confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(register)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setUser(data.user);
      setRegister(emptyRegister);
      setAuthMessage("Welcome aboard. Profile created.");
    } catch (e2) {
      setAuthError(e2.message || "Registration failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setAuthLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginId, password: loginPassword })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Login failed");

      setUser(data.user);
      setLoginId("");
      setLoginPassword("");
    } catch (e2) {
      setAuthError(e2.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="topbar">
          <div className="brand">
            <div className="badge" />
            <div className="title">
              <strong>RETRO NOTES 2005</strong>
              <span>MongoDB / Express / React / Node</span>
            </div>
          </div>
          <div className="clock">{now.toLocaleTimeString()}</div>
        </div>

        <div className="authLayout">
          <div className="panel authPanel">
            <div className="authTabs">
              <button
                className={`tab ${authView === "login" ? "active" : ""}`}
                onClick={() => setAuthView("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={`tab ${authView === "register" ? "active" : ""}`}
                onClick={() => setAuthView("register")}
                type="button"
              >
                Register
              </button>
            </div>

            {authError ? (
              <div className="empty authAlert">{authError}</div>
            ) : null}
            {authMessage ? (
              <div className="empty authAlert success">{authMessage}</div>
            ) : null}

            {authView === "login" ? (
              <form className="authForm" onSubmit={submitLogin}>
                <div>
                  <div className="label">Email or username</div>
                  <input
                    className="input"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="you@retro.net or neonUser"
                  />
                </div>
                <div>
                  <div className="label">Password</div>
                  <input
                    className="input"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Your secret passcode"
                  />
                </div>
                <button className="btn primary" disabled={authLoading}>
                  {authLoading ? "Logging in..." : "Login"}
                </button>
              </form>
            ) : (
              <form className="authForm" onSubmit={submitRegister}>
                <div>
                  <div className="label">Full name</div>
                  <input
                    className="input"
                    value={register.fullName}
                    onChange={(e) =>
                      setRegister((prev) => ({
                        ...prev,
                        fullName: e.target.value
                      }))
                    }
                    placeholder="Jamie Neon"
                  />
                </div>
                <div className="row">
                  <div style={{ flex: 1 }}>
                    <div className="label">Date of birth</div>
                    <input
                      className="input"
                      type="date"
                      value={register.dob}
                      onChange={(e) =>
                        setRegister((prev) => ({
                          ...prev,
                          dob: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="label">Email address</div>
                    <input
                      className="input"
                      type="email"
                      value={register.email}
                      onChange={(e) =>
                        setRegister((prev) => ({
                          ...prev,
                          email: e.target.value
                        }))
                      }
                      placeholder="you@retro.net"
                    />
                  </div>
                </div>
                <div>
                  <div className="label">Preferred username</div>
                  <div className="row">
                    <input
                      className="input"
                      value={register.username}
                      onChange={(e) => {
                        setRegister((prev) => ({
                          ...prev,
                          username: e.target.value
                        }));
                        setUsernameStatus("");
                      }}
                      onBlur={checkUsername}
                      placeholder="no duplicates allowed"
                    />
                    <span className={`status ${usernameStatus}`}>
                      {usernameStatus === "checking" ? "checking" : null}
                      {usernameStatus === "available" ? "available" : null}
                      {usernameStatus === "taken" ? "taken" : null}
                      {usernameStatus === "error" ? "retry" : null}
                    </span>
                  </div>
                </div>
                <div className="row">
                  <div style={{ flex: 1 }}>
                    <div className="label">Password</div>
                    <input
                      className="input"
                      type="password"
                      value={register.password}
                      onChange={(e) =>
                        setRegister((prev) => ({
                          ...prev,
                          password: e.target.value
                        }))
                      }
                      placeholder="Create a password"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="label">Confirm password</div>
                    <input
                      className="input"
                      type="password"
                      value={register.confirmPassword}
                      onChange={(e) =>
                        setRegister((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value
                        }))
                      }
                      placeholder="Repeat it"
                    />
                  </div>
                </div>
                <button className="btn primary" disabled={authLoading}>
                  {authLoading ? "Creating..." : "Create account"}
                </button>
              </form>
            )}
          </div>

          <div className="panel authSide">
            <h2>Retro access rules</h2>
            <div className="authList">
              <div className="authItem">
                <strong>Login uses</strong>
                <span>Email or username plus password.</span>
              </div>
              <div className="authItem">
                <strong>Registration needs</strong>
                <span>Full name, birth date, email, username, password.</span>
              </div>
              <div className="authItem">
                <strong>Username check</strong>
                <span>We scan the database for collisions.</span>
              </div>
            </div>
            <div className="hr" />
            <div className="footer">Keep it retro. Keep it yours.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <div className="badge" />
          <div className="title">
            <strong>RETRO NOTES 2005</strong>
            <span>MongoDB / Express / React / Node</span>
          </div>
        </div>
        <div className="row">
          <div className="userBadge">
            <div className="userName">{user.fullName}</div>
            <div className="userMeta">@{user.username}</div>
          </div>
          <button className="btn mini" onClick={logout}>
            Logout
          </button>
          <div className="clock">{now.toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="grid">
        <div className="panel">
          <h2>Write a note</h2>

          {error ? (
            <>
              <div className="empty" style={{ borderStyle: "solid" }}>
                {error}
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
                placeholder="Type like its 2005"
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
            Tip: Search on the right like an old-school site filter.
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
            <div className="empty">No notes found. Make one on the left.</div>
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
                      Created:{" "}
                      {n.createdAt ? formatTime(new Date(n.createdAt)) : ""}
                    </div>
                    {n.content ? (
                      <div className="cardContent">{n.content}</div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="footer" style={{ marginTop: 12 }}>
            Best viewed in Netscape (jk) - MERN edition
          </div>
        </div>
      </div>

      <div className="footer" style={{ marginTop: 16 }}>
        {new Date().getFullYear()} Retro Notes. Totally not a MySpace plugin.
      </div>
    </div>
  );
}
