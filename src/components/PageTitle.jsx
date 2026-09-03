/**
 * PageTitle — updates document.title on every route change.
 * Place once inside <BrowserRouter> and it will fire automatically.
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const APP = "Doc2Endpoint";

const TITLES = {
  "/":                          `${APP} — Turn Documents into Live APIs`,
  "/login":                     `Sign In — ${APP}`,
  "/register":                  `Create Account — ${APP}`,
  "/privacy":                   `Privacy Policy — ${APP}`,
  "/terms":                     `Terms of Service — ${APP}`,
  "/docs":                      `Documentation — ${APP}`,
  "/gallery":                   `Public Gallery — ${APP}`,
  "/dashboard":                 `Dashboard — ${APP}`,
  "/dashboard/datasets":        `My Datasets — ${APP}`,
  "/dashboard/datasets/new":    `New Dataset — ${APP}`,
  "/dashboard/api-keys":        `API Keys — ${APP}`,
  "/dashboard/analytics":       `Analytics — ${APP}`,
  "/dashboard/settings":        `Settings — ${APP}`,
  "/dashboard/billing":         `Manage Subscription — ${APP}`,
  "/admin":                     `Admin Dashboard — ${APP}`,
  "/admin/users":               `Users — ${APP} Admin`,
  "/admin/datasets":            `Datasets — ${APP} Admin`,
  "/admin/api-keys":            `API Keys — ${APP} Admin`,
  "/admin/analytics":           `Analytics — ${APP} Admin`,
};

function resolve(pathname) {
  // Exact match first
  if (TITLES[pathname]) return TITLES[pathname];

  // Dataset detail page  /dashboard/datasets/:id
  if (/^\/dashboard\/datasets\/\d+/.test(pathname)) {
    return `Dataset — ${APP}`;
  }

  // Fallback
  return `${APP} — Turn Documents into Live APIs`;
}

export default function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = resolve(pathname);
  }, [pathname]);

  return null; // renders nothing
}
