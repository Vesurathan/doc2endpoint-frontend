import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: "Datasets",
    path: "/admin/datasets",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
  },
  {
    label: "API Keys",
    path: "/admin/api-keys",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    path: "/admin/analytics",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("admin_sidebar_collapsed") === "true"
  );

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="min-h-screen flex overflow-x-hidden" style={{ background: "#0f172a" }}>
      {/* Dark admin sidebar */}
      <aside
        className={`${
          collapsed ? "w-16" : "w-64"
        } shrink-0 hidden lg:flex flex-col fixed h-full z-40 transition-all duration-300 overflow-hidden`}
        style={{ background: "#1e293b", borderRight: "1px solid #334155" }}
      >
        {/* Brand + collapse toggle */}
        <div
          className="min-h-[64px] flex items-center px-3"
          style={{ borderBottom: "1px solid #334155" }}
        >
          {collapsed ? (
            /* Collapsed — just the chevron, centred in 64 px */
            <button
              onClick={toggleCollapse}
              className="w-full flex justify-center items-center p-1 rounded transition-colors"
              style={{ color: "#64748b" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
              title="Expand sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            /* Expanded — logo left, chevron right */
            <>
              <Link to="/admin" className="flex items-center gap-2 flex-1 overflow-hidden">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#6366f1" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm whitespace-nowrap">Doc2Endpoint Admin</p>
                  <p className="text-xs whitespace-nowrap" style={{ color: "#94a3b8" }}>System management</p>
                </div>
              </Link>
              <button
                onClick={toggleCollapse}
                className="p-1 rounded transition-colors shrink-0"
                style={{ color: "#64748b" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                title="Collapse sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? "justify-center" : ""
                }`}
                style={{
                  background: active ? "#6366f1" : "transparent",
                  color: active ? "#fff" : "#94a3b8",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "#334155";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#94a3b8";
                  }
                }}
              >
                {item.icon}
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: back to app + user */}
        <div className="p-3" style={{ borderTop: "1px solid #334155" }}>
          {collapsed ? (
            /* ── Collapsed: back-arrow + avatar + logout stacked, centred ── */
            <div className="flex flex-col items-center gap-2">
              <Link
                to="/dashboard"
                title="Back to App"
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: "#94a3b8" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#334155"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                style={{ background: "#6366f1" }}
                title={user?.full_name || "Admin"}
              >
                {user?.full_name?.[0]?.toUpperCase() || "A"}
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: "#475569" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            /* ── Expanded: back link row + avatar / name / logout row ── */
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-3 transition-colors"
                style={{ color: "#94a3b8" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#334155"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="whitespace-nowrap">Back to App</span>
              </Link>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm text-white"
                  style={{ background: "#6366f1" }}
                >
                  {user?.full_name?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
                  <p className="text-xs truncate" style={{ color: "#64748b" }}>Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1 rounded transition-colors shrink-0"
                  style={{ color: "#475569" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3"
          style={{ background: "#1e293b", borderBottom: "1px solid #334155" }}
        >
          <span className="font-bold text-white text-sm">Doc2Endpoint Admin</span>
          <button onClick={handleLogout} className="text-sm" style={{ color: "#94a3b8" }}>
            Sign out
          </button>
        </header>
        <div className="flex-1 p-6 min-w-0">{children}</div>
      </main>
    </div>
  );
}
