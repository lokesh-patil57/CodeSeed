import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const ResetPassword = () => {
  const { isDark, backendUrl } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    (location.state && location.state.email) || ""
  );
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [stage, setStage] = useState("request"); // "request" | "reset"
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const emailValid = (value) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
      value.trim().toLowerCase()
    );

  const handleSendOtp = async () => {
    if (!emailValid(email)) {
      toast.error("Enter a valid email to receive a reset code.");
      return;
    }

    try {
      setIsSending(true);
      const res = await fetch(`${backendUrl}/api/auth/send-reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Could not send reset code.");
        return;
      }

      toast.success("Reset code sent to your email.");
      setStage("reset");
    } catch (error) {
      toast.error(error.message || "Failed to send reset code.");
    } finally {
      setIsSending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!emailValid(email)) {
      toast.error("Enter a valid email.");
      return;
    }
    if (!otp.trim()) {
      toast.error("Enter the reset code sent to your email.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    try {
      setIsResetting(true);
      const res = await fetch(`${backendUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Unable to reset password.");
        return;
      }

      toast.success("Password reset successfully. You can now log in.");
      navigate("/", { replace: true, state: { email } });
    } catch (error) {
      toast.error(error.message || "Password reset failed.");
    } finally {
      setIsResetting(false);
    }
  };

  const bgMain = isDark ? "#1a1a1a" : "#f5f5f7";

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-10 ${
        isDark ? "text-white" : "text-gray-900"
      }`}
      style={{ backgroundColor: bgMain }}
    >
      <div
        className={`w-full max-w-lg rounded-[32px] border p-10 text-center shadow-[0_20px_80px_rgba(0,0,0,0.6)] bg-gradient-to-b ${
          isDark
            ? "border-white/10 from-white/5 to-black/40"
            : "border-black/10 from-white to-gray-100"
        }`}
      >
        <p
          className={`text-sm uppercase tracking-[0.3em] mb-6 ${
            isDark ? "text-white/60" : "text-gray-500"
          }`}
        >
          Reset your password
        </p>
        <h1 className="text-2xl font-semibold">Forgot your password?</h1>
        <p
          className={`mt-4 text-base ${
            isDark ? "text-white/70" : "text-gray-700"
          }`}
        >
          Enter your email address and we'll send you a code to set a new
          password.
        </p>

        <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-2xl border px-6 py-3 text-base focus:outline-none ${
              isDark
                ? "border-white/20 bg-black/60 text-white placeholder-white/40 focus:border-white"
                : "border-black/20 bg-white text-gray-900 placeholder-gray-400 focus:border-black"
            }`}
            placeholder="Enter your email"
          />

          {stage === "reset" && (
            <>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`w-full rounded-2xl border px-6 py-3 text-base focus:outline-none ${
                  isDark
                    ? "border-white/20 bg-black/60 text-white placeholder-white/40 focus:border-white"
                    : "border-black/20 bg-white text-gray-900 placeholder-gray-400 focus:border-black"
                }`}
                placeholder="Enter reset code"
                maxLength={6}
                inputMode="numeric"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full rounded-2xl border px-6 py-3 text-base focus:outline-none ${
                  isDark
                    ? "border-white/20 bg-black/60 text-white placeholder-white/40 focus:border-white"
                    : "border-black/20 bg-white text-gray-900 placeholder-gray-400 focus:border-black"
                }`}
                placeholder="New password"
              />
            </>
          )}

          {stage === "request" ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSending}
              className={`w-full rounded-2xl py-3 text-base font-semibold ${
                isSending
                  ? "opacity-60 cursor-not-allowed"
                  : isDark
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              {isSending ? "Sending code..." : "Send reset code"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isResetting}
              className={`w-full rounded-2xl py-3 text-base font-semibold ${
                isResetting
                  ? "opacity-60 cursor-not-allowed"
                  : isDark
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              {isResetting ? "Resetting..." : "Reset password"}
            </button>
          )}
        </form>

        {stage === "reset" && (
          <p
            className={`mt-4 text-sm ${
              isDark ? "text-white/60" : "text-gray-600"
            }`}
          >
            Didn't get a code?{" "}
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSending}
              className={`underline ${
                isDark
                  ? "text-white hover:text-white/80 disabled:text-white/40"
                  : "text-gray-900 hover:text-gray-700 disabled:text-gray-400"
              }`}
            >
              {isSending ? "Sending..." : "Resend code"}
            </button>
          </p>
        )}

        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className={`mt-8 text-sm underline ${
            isDark
              ? "text-white/50 hover:text-white/80"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
