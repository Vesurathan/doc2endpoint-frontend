import { useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { forgotPassword, resetPassword } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { loginUser } = useAuth();

  const [step, setStep] = useState("email");     // "email" → "reset"
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
    if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const sendCode = async (isResend = false) => {
    isResend ? setResending(true) : setLoading(true);
    setError("");
    setSuccess("");
    try {
      await forgotPassword({ email });
      setStep("reset");
      setSuccess(`If an account exists for ${email}, a 6-digit code is on its way.`);
      if (isResend) {
        setCode(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      isResend ? setResending(false) : setLoading(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    sendCode(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (fullCode.length < 6) { setError("Please enter the 6-digit code."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await resetPassword({ email, code: fullCode, new_password: password });
      loginUser(res.data.access_token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not reset your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const alerts = (
    <>
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
    </>
  );

  // ── Step 1: ask for the email ──────────────────────────────────────────────
  if (step === "email") {
    return (
      <AuthLayout heading="Reset your password" sub="Enter your email and we'll send you a reset code">

        <div className="flex justify-center mb-5">
          <div className="bg-primary/10 rounded-full p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {alerts}

        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
          <div className="form-control">
            <label className="label pb-1">
              <span className="label-text font-medium">Email</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-1" disabled={loading}>
            {loading ? <span className="loading loading-spinner loading-sm"></span> : "Send reset code"}
          </button>
        </form>

        <p className="text-center text-sm text-base-content/50 mt-6">
          Remembered it?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Back to sign in</Link>
        </p>

      </AuthLayout>
    );
  }

  // ── Step 2: enter the code and choose a new password ───────────────────────
  return (
    <AuthLayout heading="Choose a new password" sub={`Enter the code we sent to ${email}`}>

      {alerts}

      <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
        <div className="flex justify-center gap-3" onPaste={handlePaste}>
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

        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text font-medium">New password</span>
          </label>
          <PasswordInput
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-control">
          <label className="label pb-1">
            <span className="label-text font-medium">Confirm new password</span>
          </label>
          <PasswordInput
            placeholder="Repeat your new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? <span className="loading loading-spinner loading-sm"></span> : "Reset password"}
        </button>
      </form>

      <p className="text-center text-sm text-base-content/50 mt-5">
        Didn't receive it?{" "}
        <button
          onClick={() => sendCode(true)}
          disabled={resending}
          className="text-primary font-medium hover:underline disabled:opacity-50"
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
      </p>

      <p className="text-center text-sm text-base-content/40 mt-2">
        <button onClick={() => { setStep("email"); setError(""); setSuccess(""); }} className="hover:text-base-content underline">
          Use a different email
        </button>
      </p>

    </AuthLayout>
  );
}
