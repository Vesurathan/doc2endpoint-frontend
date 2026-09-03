import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import GoogleButton from "../components/GoogleButton";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register({ full_name: form.full_name, email: form.email, password: form.password });
      const res = await login({ username: form.email, password: form.password });
      loginUser(res.data.access_token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Create your account"
      sub="Start your 7-day free trial — no credit card required"
    >

      {/* Google */}
      <GoogleButton label="Sign up with Google" />

      {/* Divider */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-base-300" />
        <span className="text-xs text-base-content/40 font-medium">or register with email</span>
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
            <span className="label-text font-medium">Full name</span>
          </label>
          <input
            type="text"
            placeholder="John Smith"
            className="input input-bordered w-full"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
        </div>

        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text font-medium">Email</span>
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="input input-bordered w-full"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text font-medium">Password</span>
          </label>
          <input
            type="password"
            placeholder="Min. 8 characters"
            className="input input-bordered w-full"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text font-medium">Confirm password</span>
          </label>
          <input
            type="password"
            placeholder="Repeat your password"
            className="input input-bordered w-full"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-full mt-1" disabled={loading}>
          {loading
            ? <span className="loading loading-spinner loading-sm"></span>
            : "Create account — it's free"}
        </button>
      </form>

      {/* Terms */}
      <p className="text-xs text-base-content/40 text-center mt-4">
        By creating an account you agree to our{" "}
        <Link to="/terms" className="underline hover:text-base-content">Terms of Service</Link>{" "}
        and{" "}
        <Link to="/privacy" className="underline hover:text-base-content">Privacy Policy</Link>.
      </p>

      {/* Footer link */}
      <p className="text-center mt-5 text-base-content/50 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>

    </AuthLayout>
  );
}
