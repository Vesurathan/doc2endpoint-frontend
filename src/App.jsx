import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DialogProvider } from "./context/DialogContext";
import PageTitle from "./components/PageTitle";

// Public
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Docs from "./pages/Docs";
import Gallery from "./pages/Gallery";

// User portal
import Dashboard from "./pages/Dashboard";
import Datasets from "./pages/Datasets";
import NewDataset from "./pages/NewDataset";
import DatasetChat from "./pages/DatasetChat";
import ApiKeys from "./pages/ApiKeys";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";

// Admin portal
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDatasets from "./pages/admin/AdminDatasets";
import AdminApiKeys from "./pages/admin/AdminApiKeys";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

// ─── Route guards ─────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <Navigate to="/dashboard" replace />;
  return children;
}

function P({ children }) { return <ProtectedRoute>{children}</ProtectedRoute>; }
function A({ children }) { return <AdminRoute>{children}</AdminRoute>; }

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <DialogProvider>
        <BrowserRouter>
          <PageTitle />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/gallery" element={<Gallery />} />

            {/* User portal */}
            <Route path="/dashboard" element={<P><Dashboard /></P>} />
            <Route path="/dashboard/datasets" element={<P><Datasets /></P>} />
            <Route path="/dashboard/datasets/new" element={<P><NewDataset /></P>} />
            <Route path="/dashboard/datasets/:id" element={<P><DatasetChat /></P>} />
            <Route path="/dashboard/api-keys" element={<P><ApiKeys /></P>} />
            <Route path="/dashboard/analytics" element={<P><Analytics /></P>} />
            <Route path="/dashboard/settings" element={<P><Settings /></P>} />
            <Route path="/dashboard/billing" element={<P><Billing /></P>} />

            {/* Admin portal */}
            <Route path="/admin" element={<A><AdminDashboard /></A>} />
            <Route path="/admin/users" element={<A><AdminUsers /></A>} />
            <Route path="/admin/datasets" element={<A><AdminDatasets /></A>} />
            <Route path="/admin/api-keys" element={<A><AdminApiKeys /></A>} />
            <Route path="/admin/analytics" element={<A><AdminAnalytics /></A>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DialogProvider>
    </AuthProvider>
  );
}
