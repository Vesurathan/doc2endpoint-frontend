import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      return next;
    });
  };

  return (
    <div className="navbar bg-base-100 border-b border-base-200 px-4 lg:px-8 sticky top-0 z-50">
      <div className="navbar-start">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-base-content">Doc2Endpoint</span>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          <li><a href="#features" className="font-medium">Features</a></li>
          <li><a href="#how-it-works" className="font-medium">How it works</a></li>
          <li><a href="#pricing" className="font-medium">Pricing</a></li>
          <li><Link to="/gallery" className="font-medium">Gallery</Link></li>
          <li><Link to="/docs" className="font-medium">Docs</Link></li>
        </ul>
      </div>

      <div className="navbar-end gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm btn-square"
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          )}
        </button>

        {/* Auth buttons — changes based on login state */}
        {user ? (
          <>
            <div className="flex items-center gap-2 pl-1">
              <div className="avatar placeholder hidden sm:flex">
                <div className="bg-primary text-primary-content rounded-full w-7">
                  <span className="text-xs font-bold">
                    {user.full_name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              </div>
              <span className="text-sm text-base-content/70 hidden md:block max-w-[120px] truncate">
                {user.full_name}
              </span>
            </div>
            <Link to="/dashboard" className="btn btn-primary btn-sm gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Start free trial</Link>
          </>
        )}
      </div>
    </div>
  );
}
