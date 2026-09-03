import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import GoogleButton from "../components/GoogleButton";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ username: form.username, password: form.password });
      loginUser(res.data.access_token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail === "EMAIL_NOT_VERIFIED") {
        navigate(`/verify-email?email=${encodeURIComponent(form.username)}`);
        return;
      }
      setError(detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout heading="Welcome back" sub="Sign in to your account">

      {/* Google */}
      <GoogleButton label="Continue with Google" />

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-base-300" />
        <span className="text-xs text-base-content/40 font-medium">or sign in with email</span>
        <div className="flex-1 h-px bg-base-300" />
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error text-sm py-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text font-medium">Email</span>
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="input input-bordered w-full"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>

        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text font-medium">Password</span>
            <a href="mailto:support@doc2endpoint.io" className="label-text-alt text-primary hover:underline">
              Forgot password?
            </a>
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="input input-bordered w-full"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-full mt-1" disabled={loading}>
          {loading ? <span className="loading loading-spinner loading-sm"></span> : "Sign in"}
        </button>
      </form>

      {/* Footer link */}
      <p className="text-center mt-6 text-base-content/50 text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-primary font-medium hover:underline">
          Create one free
        </Link>
      </p>

    </AuthLayout>
  );
}
