import { useState, useEffect, createContext, useContext } from "react";

// ─── Auth Context ────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

const MOCK_USERS = [
  { id: 1, email: "admin@company.com", password: "Admin@123", role: "admin", name: "Arjun Sharma" },
  { id: 2, email: "emp@company.com",   password: "Emp@123",   role: "employee", name: "Priya Menon" },
];

let MOCK_EMPLOYEES = [
  { _id: "e001", name: "Priya Menon",    email: "priya@company.com",  phone: "9876543210", department: "Engineering", designation: "Frontend Dev",    role: "employee" },
  { _id: "e002", name: "Ravi Kumar",     email: "ravi@company.com",   phone: "9845123456", department: "Design",      designation: "UI/UX Designer",  role: "employee" },
  { _id: "e003", name: "Sneha Iyer",     email: "sneha@company.com",  phone: "9901234567", department: "HR",          designation: "HR Manager",      role: "admin"    },
  { _id: "e004", name: "Amit Patel",     email: "amit@company.com",   phone: "9812345678", department: "Backend",     designation: "Node.js Dev",     role: "employee" },
  { _id: "e005", name: "Divya Nair",     email: "divya@company.com",  phone: "9756789012", department: "QA",          designation: "Test Engineer",   role: "employee" },
];

function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("ums_token"));

  useEffect(() => {
    const saved = localStorage.getItem("ums_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = (email, password) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, message: "Invalid email or password." };
    const fakeToken = btoa(JSON.stringify({ id: found.id, role: found.role, name: found.name }));
    setUser(found);
    setToken(fakeToken);
    localStorage.setItem("ums_token", fakeToken);
    localStorage.setItem("ums_user", JSON.stringify(found));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("ums_token");
    localStorage.removeItem("ums_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin: user?.role === "admin", isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

// ─── Toast ───────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };
  return { toasts, show };
}

function ToastContainer({ toasts }) {
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500,
          background: t.type === "success" ? "#1a3a2a" : "#3a1a1a",
          color: t.type === "success" ? "#4ade80" : "#f87171",
          border: `1px solid ${t.type === "success" ? "#166534" : "#7f1d1d"}`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          animation: "slideIn .25s ease",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>{t.type === "success" ? "✓" : "✕"}</span> {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar({ onNavigate, page }) {
  const { user, logout, isAdmin } = useAuth();
  return (
    <nav style={{
      background: "#0d0d0d", borderBottom: "1px solid #1f1f1f",
      padding: "0 28px", height: 60, display: "flex", alignItems: "center",
      justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#e8e0d0", letterSpacing: "-0.5px" }}>
          <span style={{ color: "#c9a84c" }}>⬡</span> StaffOS
        </span>
        <button onClick={() => onNavigate("dashboard")} style={navLinkStyle(page === "dashboard")}>Dashboard</button>
        {isAdmin && <button onClick={() => onNavigate("add")} style={navLinkStyle(page === "add")}>+ Add Employee</button>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, color: "#e8e0d0", fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "0.08em" }}>{user?.role}</div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: "#1e1a0e",
          border: "1.5px solid #c9a84c", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 14, color: "#c9a84c", fontWeight: 700,
        }}>
          {user?.name?.charAt(0)}
        </div>
        <button onClick={logout} style={{
          background: "transparent", border: "1px solid #2a2a2a", color: "#888",
          padding: "6px 14px", borderRadius: 7, fontSize: 12, cursor: "pointer",
          transition: "all .15s",
        }}
          onMouseEnter={e => { e.target.style.borderColor = "#c9a84c"; e.target.style.color = "#c9a84c"; }}
          onMouseLeave={e => { e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#888"; }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

const navLinkStyle = (active) => ({
  background: "transparent", border: "none", cursor: "pointer",
  color: active ? "#c9a84c" : "#666", fontSize: 13, fontWeight: active ? 600 : 400,
  padding: "4px 0", borderBottom: active ? "2px solid #c9a84c" : "2px solid transparent",
  transition: "all .15s",
});

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Both fields are required."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);
    if (!result.success) setError(result.message);
    else onLogin();
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080808", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)",
        backgroundSize: "48px 48px", opacity: 0.4,
      }} />

      <div style={{
        position: "relative", zIndex: 1, width: "100%", maxWidth: 420, padding: "0 20px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: "#1a1500",
            border: "1.5px solid #c9a84c", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px", fontSize: 26,
          }}>⬡</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: "#e8e0d0", margin: 0, letterSpacing: "-0.5px" }}>StaffOS</h1>
          <p style={{ color: "#555", fontSize: 13, margin: "6px 0 0" }}>Employee Management Platform</p>
        </div>

        {/* Card */}
        <div style={{
          background: "#0d0d0d", border: "1px solid #1f1f1f",
          borderRadius: 18, padding: "32px 28px",
        }}>
          <h2 style={{ color: "#e8e0d0", fontSize: 18, fontWeight: 600, margin: "0 0 24px", fontFamily: "'Syne', sans-serif" }}>Sign in to your account</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email address</label>
              <input
                type="text" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={inputStyle(false)}
                onFocus={e => e.target.style.borderColor = "#c9a84c"}
                onBlur={e => e.target.style.borderColor = "#1f1f1f"}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ ...inputStyle(false), paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = "#c9a84c"}
                  onBlur={e => e.target.style.borderColor = "#1f1f1f"}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 14,
                }}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: "#1a0808", border: "1px solid #5c1a1a", borderRadius: 8,
                padding: "10px 14px", fontSize: 12, color: "#f87171", marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "12px", borderRadius: 10, border: "none",
              background: loading ? "#2a2208" : "linear-gradient(135deg, #c9a84c, #a07830)",
              color: loading ? "#666" : "#0d0d0d", fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Syne', sans-serif", letterSpacing: "0.02em",
              transition: "all .2s",
            }}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: 24, borderTop: "1px solid #1a1a1a", paddingTop: 18 }}>
            <p style={{ fontSize: 11, color: "#444", textAlign: "center", marginBottom: 12 }}>DEMO CREDENTIALS</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Admin", email: "admin@company.com", pw: "Admin@123" },
                { label: "Employee", email: "emp@company.com", pw: "Emp@123" },
              ].map(c => (
                <button key={c.label} onClick={() => { setEmail(c.email); setPassword(c.pw); setError(""); }}
                  style={{
                    background: "#111", border: "1px solid #222", borderRadius: 8,
                    padding: "8px 10px", cursor: "pointer", textAlign: "left",
                  }}>
                  <div style={{ fontSize: 11, color: "#c9a84c", fontWeight: 600, marginBottom: 2 }}>{c.label}</div>
                  <div style={{ fontSize: 10, color: "#555", fontFamily: "monospace" }}>{c.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ employee, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.75)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#0d0d0d", border: "1px solid #2a1a1a",
        borderRadius: 18, padding: "28px 28px", maxWidth: 380, width: "100%",
        animation: "slideIn .2s ease",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: "#1a0808",
          border: "1px solid #5c1a1a", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 22, marginBottom: 18,
        }}>🗑</div>
        <h3 style={{ color: "#e8e0d0", margin: "0 0 8px", fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Delete Employee</h3>
        <p style={{ color: "#666", fontSize: 13, margin: "0 0 24px", lineHeight: 1.6 }}>
          Are you sure you want to delete <span style={{ color: "#e8e0d0", fontWeight: 600 }}>{employee?.name}</span>? This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "10px", borderRadius: 10, background: "transparent",
            border: "1px solid #2a2a2a", color: "#888", cursor: "pointer", fontSize: 13,
            transition: "all .15s",
          }}
            onMouseEnter={e => { e.target.style.borderColor = "#444"; e.target.style.color = "#ccc"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#888"; }}
          >Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "10px", borderRadius: 10, background: "#3a0808",
            border: "1px solid #7f1d1d", color: "#f87171", cursor: "pointer",
            fontSize: 13, fontWeight: 600, transition: "all .15s",
          }}
            onMouseEnter={e => { e.target.style.background = "#4a0a0a"; }}
            onMouseLeave={e => { e.target.style.background = "#3a0808"; }}
          >Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
function DashboardPage({ onNavigate, toast }) {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [search, setSearch]       = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const departments = ["All", ...new Set(MOCK_EMPLOYEES.map(e => e.department))];

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.department.toLowerCase().includes(q);
    const matchDept   = deptFilter === "All" || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const handleDelete = () => {
    MOCK_EMPLOYEES = MOCK_EMPLOYEES.filter(e => e._id !== deleteTarget._id);
    setEmployees([...MOCK_EMPLOYEES]);
    toast.show(`${deleteTarget.name} deleted.`, "error");
    setDeleteTarget(null);
  };

  const deptColors = {
    Engineering: "#1a3a2a", Design: "#1a1a3a", HR: "#2a1a3a",
    Backend: "#3a2a1a", QA: "#1a2a3a",
  };

  return (
    <div style={{ padding: "32px 28px", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: "#e8e0d0", margin: 0, letterSpacing: "-0.5px" }}>
            Employee Directory
          </h1>
          <p style={{ color: "#555", fontSize: 13, margin: "4px 0 0" }}>{employees.length} employees across {departments.length - 1} departments</p>
        </div>
        {isAdmin && (
          <button onClick={() => onNavigate("add")} style={{
            background: "linear-gradient(135deg, #c9a84c, #a07830)",
            border: "none", borderRadius: 10, padding: "10px 20px",
            color: "#0d0d0d", fontWeight: 700, fontSize: 13, cursor: "pointer",
            fontFamily: "'Syne', sans-serif", letterSpacing: "0.02em",
            transition: "opacity .15s",
          }}
            onMouseEnter={e => e.target.style.opacity = "0.88"}
            onMouseLeave={e => e.target.style.opacity = "1"}
          >
            + Add Employee
          </button>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total", value: employees.length, icon: "👥" },
          { label: "Admins", value: employees.filter(e => e.role === "admin").length, icon: "🔑" },
          { label: "Departments", value: departments.length - 1, icon: "🏢" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: 14,
            padding: "16px 18px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#e8e0d0", lineHeight: 1, fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          placeholder="Search name, email, department…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle(false), flex: "1 1 220px", padding: "10px 14px" }}
          onFocus={e => e.target.style.borderColor = "#c9a84c"}
          onBlur={e => e.target.style.borderColor = "#1f1f1f"}
        />
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{
          ...inputStyle(false), width: "auto", padding: "10px 14px", cursor: "pointer",
        }}>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: "#111", borderBottom: "1px solid #1f1f1f" }}>
                {["ID", "Name", "Email", "Department", "Designation", "Contact", "Role", isAdmin && "Actions"].filter(Boolean).map(h => (
                  <th key={h} style={{
                    padding: "12px 16px", textAlign: "left", fontSize: 11,
                    color: "#555", fontWeight: 600, letterSpacing: "0.08em",
                    textTransform: "uppercase", whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={isAdmin ? 8 : 7} style={{ padding: "40px", textAlign: "center", color: "#444", fontSize: 14 }}>No employees found.</td></tr>
              ) : (
                filtered.map((emp, i) => (
                  <tr key={emp._id} style={{
                    borderBottom: "1px solid #161616",
                    background: i % 2 === 0 ? "transparent" : "#0a0a0a",
                    transition: "background .15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#111"}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#0a0a0a"}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#555" }}>{emp._id}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: "#1e1a0e", border: "1px solid #2a2010",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, color: "#c9a84c", fontWeight: 700, flexShrink: 0,
                        }}>
                          {emp.name.charAt(0)}
                        </div>
                        <span style={{ color: "#e8e0d0", fontSize: 14, fontWeight: 500 }}>{emp.name}</span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, color: "#888", fontSize: 13 }}>{emp.email}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: deptColors[emp.department] || "#1a1a1a", color: "#aaa",
                        border: "1px solid #2a2a2a",
                      }}>{emp.department}</span>
                    </td>
                    <td style={{ ...tdStyle, color: "#aaa", fontSize: 13 }}>{emp.designation}</td>
                    <td style={{ ...tdStyle, color: "#888", fontSize: 13, fontFamily: "monospace" }}>{emp.phone}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: emp.role === "admin" ? "#1a1500" : "#111",
                        color: emp.role === "admin" ? "#c9a84c" : "#555",
                        border: `1px solid ${emp.role === "admin" ? "#3a2e00" : "#222"}`,
                      }}>{emp.role}</span>
                    </td>
                    {isAdmin && (
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => onNavigate("edit", emp)} style={actionBtnStyle("#1a3a2a", "#4ade80", "#166534")}>Edit</button>
                          <button onClick={() => setDeleteTarget(emp)} style={actionBtnStyle("#3a0808", "#f87171", "#7f1d1d")}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <DeleteModal employee={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}

// ─── Employee Form Page ───────────────────────────────────────────────────────
function EmployeeFormPage({ mode = "add", employee = null, onNavigate, toast }) {
  const emptyForm = { name: "", email: "", phone: "", department: "", designation: "", role: "employee", password: "" };
  const [form, setForm]   = useState(mode === "edit" && employee ? { ...employee, password: "" } : emptyForm);
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name = "Name is required.";
    if (!form.email.trim())        e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.phone.trim())        e.phone = "Phone is required.";
    else if (!/^\d{10}$/.test(form.phone))      e.phone = "Enter a valid 10-digit phone.";
    if (!form.department.trim())   e.department = "Department is required.";
    if (!form.designation.trim())  e.designation = "Designation is required.";
    if (mode === "add" && !form.password) e.password = "Password is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));

    if (mode === "add") {
      const newEmp = { ...form, _id: "e" + String(Date.now()).slice(-4) };
      MOCK_EMPLOYEES = [...MOCK_EMPLOYEES, newEmp];
      toast.show("Employee added successfully!");
    } else {
      MOCK_EMPLOYEES = MOCK_EMPLOYEES.map(emp => emp._id === employee._id ? { ...emp, ...form } : emp);
      toast.show("Employee updated successfully!");
    }

    setSaving(false);
    onNavigate("dashboard");
  };

  const departments = ["Engineering", "Design", "HR", "Backend", "QA", "Marketing", "Finance", "Operations"];

  return (
    <div style={{ padding: "32px 28px", fontFamily: "'DM Sans', sans-serif", maxWidth: 680, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button onClick={() => onNavigate("dashboard")} style={{
          background: "none", border: "none", color: "#555", cursor: "pointer",
          fontSize: 13, padding: 0, marginBottom: 12, display: "flex", alignItems: "center", gap: 6,
          transition: "color .15s",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#c9a84c"}
          onMouseLeave={e => e.currentTarget.style.color = "#555"}
        >
          ← Back to Dashboard
        </button>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: "#e8e0d0", margin: 0, letterSpacing: "-0.5px" }}>
          {mode === "add" ? "Add New Employee" : "Edit Employee"}
        </h1>
        <p style={{ color: "#555", fontSize: 13, margin: "4px 0 0" }}>
          {mode === "add" ? "Fill in the details below to create a new employee record." : `Editing record for ${employee?.name}`}
        </p>
      </div>

      {/* Form card */}
      <div style={{ background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: 18, padding: "28px" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            {/* Name */}
            <div style={{ marginBottom: 18, gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Full Name <span style={{ color: "#c9a84c" }}>*</span></label>
              <input value={form.name} onChange={e => update("name", e.target.value)}
                placeholder="e.g. Priya Menon" style={inputStyle(!!errors.name)}
                onFocus={e => !errors.name && (e.target.style.borderColor = "#c9a84c")}
                onBlur={e => !errors.name && (e.target.style.borderColor = "#1f1f1f")}
              />
              {errors.name && <p style={errStyle}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Email Address <span style={{ color: "#c9a84c" }}>*</span></label>
              <input type="text" value={form.email} onChange={e => update("email", e.target.value)}
                placeholder="priya@company.com" style={inputStyle(!!errors.email)}
                onFocus={e => !errors.email && (e.target.style.borderColor = "#c9a84c")}
                onBlur={e => !errors.email && (e.target.style.borderColor = "#1f1f1f")}
              />
              {errors.email && <p style={errStyle}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Phone Number <span style={{ color: "#c9a84c" }}>*</span></label>
              <input value={form.phone} onChange={e => update("phone", e.target.value)}
                placeholder="10-digit number" style={inputStyle(!!errors.phone)}
                onFocus={e => !errors.phone && (e.target.style.borderColor = "#c9a84c")}
                onBlur={e => !errors.phone && (e.target.style.borderColor = "#1f1f1f")}
              />
              {errors.phone && <p style={errStyle}>{errors.phone}</p>}
            </div>

            {/* Department */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Department <span style={{ color: "#c9a84c" }}>*</span></label>
              <select value={form.department} onChange={e => update("department", e.target.value)}
                style={{ ...inputStyle(!!errors.department), cursor: "pointer" }}>
                <option value="">Select department</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p style={errStyle}>{errors.department}</p>}
            </div>

            {/* Designation */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Designation <span style={{ color: "#c9a84c" }}>*</span></label>
              <input value={form.designation} onChange={e => update("designation", e.target.value)}
                placeholder="e.g. Frontend Developer" style={inputStyle(!!errors.designation)}
                onFocus={e => !errors.designation && (e.target.style.borderColor = "#c9a84c")}
                onBlur={e => !errors.designation && (e.target.style.borderColor = "#1f1f1f")}
              />
              {errors.designation && <p style={errStyle}>{errors.designation}</p>}
            </div>

            {/* Role */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Role <span style={{ color: "#c9a84c" }}>*</span></label>
              <select value={form.role} onChange={e => update("role", e.target.value)}
                style={{ ...inputStyle(false), cursor: "pointer" }}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24, gridColumn: "1 / -1" }}>
              <label style={labelStyle}>
                Password {mode === "add" && <span style={{ color: "#c9a84c" }}>*</span>}
                {mode === "edit" && <span style={{ color: "#555", fontSize: 11, marginLeft: 8 }}>(leave blank to keep current)</span>}
              </label>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} value={form.password}
                  onChange={e => update("password", e.target.value)}
                  placeholder={mode === "edit" ? "Leave blank to keep unchanged" : "Create a password"}
                  style={{ ...inputStyle(!!errors.password), paddingRight: 44 }}
                  onFocus={e => !errors.password && (e.target.style.borderColor = "#c9a84c")}
                  onBlur={e => !errors.password && (e.target.style.borderColor = "#1f1f1f")}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 14,
                }}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && <p style={errStyle}>{errors.password}</p>}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #1a1a1a", paddingTop: 20 }}>
            <button type="button" onClick={() => onNavigate("dashboard")} style={{
              padding: "10px 22px", borderRadius: 10, background: "transparent",
              border: "1px solid #2a2a2a", color: "#888", cursor: "pointer", fontSize: 13,
              transition: "all .15s",
            }}
              onMouseEnter={e => { e.target.style.borderColor = "#444"; e.target.style.color = "#ccc"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#888"; }}
            >Cancel</button>
            <button type="submit" disabled={saving} style={{
              padding: "10px 26px", borderRadius: 10, border: "none",
              background: saving ? "#2a2208" : "linear-gradient(135deg, #c9a84c, #a07830)",
              color: saving ? "#666" : "#0d0d0d", fontWeight: 700, fontSize: 13,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "'Syne', sans-serif", transition: "opacity .15s",
            }}>
              {saving ? "Saving…" : mode === "add" ? "Add Employee →" : "Save Changes →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const labelStyle = {
  display: "block", fontSize: 12, color: "#777", marginBottom: 6,
  fontWeight: 500, letterSpacing: "0.03em",
};
const inputStyle = (hasError) => ({
  width: "100%", boxSizing: "border-box",
  background: "#080808", border: `1px solid ${hasError ? "#7f1d1d" : "#1f1f1f"}`,
  borderRadius: 10, padding: "10px 14px", color: "#e8e0d0", fontSize: 14,
  outline: "none", transition: "border-color .15s",
  fontFamily: "'DM Sans', sans-serif",
});
const errStyle = { margin: "4px 0 0", fontSize: 11, color: "#f87171" };
const tdStyle  = { padding: "13px 16px", fontSize: 13, color: "#aaa", whiteSpace: "nowrap" };
const actionBtnStyle = (bg, color, border) => ({
  padding: "5px 12px", borderRadius: 7, border: `1px solid ${border}`,
  background: bg, color, fontSize: 12, cursor: "pointer", fontWeight: 500,
  transition: "opacity .15s",
});

// ─── App Root ─────────────────────────────────────────────────────────────────
function AppContent() {
  const { isAuthenticated } = useAuth();
  const [page, setPage]     = useState("login");
  const [editTarget, setEditTarget] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated && page === "login") setPage("dashboard");
    if (!isAuthenticated) setPage("login");
  }, [isAuthenticated]);

  const navigate = (to, data = null) => {
    setEditTarget(data);
    setPage(to);
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0d0d0d; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
        select option { background: #0d0d0d; color: #e8e0d0; }
      `}</style>

      <ToastContainer toasts={toast.toasts} />

      {!isAuthenticated ? (
        <LoginPage onLogin={() => navigate("dashboard")} />
      ) : (
        <>
          <Navbar onNavigate={navigate} page={page} />
          <main>
            {page === "dashboard" && <DashboardPage onNavigate={navigate} toast={toast} />}
            {page === "add"       && <EmployeeFormPage mode="add" onNavigate={navigate} toast={toast} />}
            {page === "edit"      && <EmployeeFormPage mode="edit" employee={editTarget} onNavigate={navigate} toast={toast} />}
          </main>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
