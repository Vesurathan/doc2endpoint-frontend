import { useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { verifyEmail, resendVerification } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { loginUser } = useAuth();

  const email = params.get("email") || "";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  const fullCode = code.join("");

  const handleChange = (i, val) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = char;
    setCode(next);
    if (char && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fullCode.length < 6) { setError("Please enter the 6-digit code."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await verifyEmail({ email, code: fullCode });
      loginUser(res.data.access_token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setSuccess("");
    try {
      await resendVerification({ email });
      setSuccess("A new code has been sent to your email.");
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to resend. Try again shortly.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout heading="Check your email" sub={`We sent a 6-digit code to ${email || "your email"}`}>

      {/* Icon */}
      <div className="flex justify-center mb-2">
        <div className="bg-primary/10 rounded-full p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error text-sm py-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success text-sm py-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {/* Code input */}
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        <div className="flex gap-3" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="input input-bordered w-12 h-14 text-center text-2xl font-bold focus:input-primary"
              autoFocus={i === 0}
            />
          ))}
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading || fullCode.length < 6}>
          {loading ? <span className="loading loading-spinner loading-sm"></span> : "Verify email"}
        </button>
      </form>

      {/* Resend */}
      <p className="text-center text-sm text-base-content/50 mt-5">
        Didn't receive it?{" "}
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-primary font-medium hover:underline disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
      </p>

      <p className="text-center text-sm text-base-content/40 mt-2">
        <Link to="/login" className="hover:text-base-content underline">Back to sign in</Link>
      </p>

    </AuthLayout>
  );
}
