import { useCallback, useEffect, useMemo, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const EmailVerify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  // Prefer VITE_API_URL (for deployed backend), then VITE_BACKEND_URL, then localhost
  const backendUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    "http://localhost:3000";

  useEffect(() => {
    const storedEmail =
      location.state?.email || localStorage.getItem("pendingVerifyEmail");

    if (!storedEmail) {
      toast.error("Please log in first to request verification.");
      navigate("/", { replace: true });
      return;
    }
    setEmail(storedEmail);
  }, [location.state, navigate]);

  const obfuscatedEmail = useMemo(() => {
    if (!email) return "";
    const [username, domain] = email.split("@");
    if (!domain) return email;
    return `${username.slice(0, 3)}***@${domain}`;
  }, [email]);

  const requestOtp = useCallback(
    async (silent = false) => {
      if (!backendUrl) return;
      setIsSending(true);
      try {
        // credentials: "include" sends cookies (auth token) – required; without it backend sees req.user undefined → 500
        const res = await fetch(`${backendUrl}/api/auth/send-verify-otp`, {
          method: "POST",
          credentials: "include",
        });
        let data;
        try {
          data = await res.json();
        } catch (_) {
          data = { success: false, message: "Invalid response from server" };
        }
        if (data.success) {
          if (!silent) toast.success("Verification code sent to your email.");
        } else if (!silent) {
          toast.error(data.message || "Unable to send verification code.");
        }
      } catch (error) {
        if (!silent) {
          toast.error(error.message || "Failed to send verification code.");
        }
      } finally {
        setIsSending(false);
      }
    },
    [backendUrl]
  );

  useEffect(() => {
    if (!email) return;
    requestOtp(true);
  }, [email, requestOtp]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const trimmedOtp = otp.trim();

    if (trimmedOtp.length < 4) {
      toast.error("Enter the code sent to your email.");
      return;
    }

    try {
      setIsVerifying(true);
      const res = await fetch(`${backendUrl}/api/auth/verify-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ otp: trimmedOtp }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Email verified! Redirecting to chat...");
        localStorage.removeItem("pendingVerifyEmail");
        setTimeout(() => {
          navigate("/chat", { replace: true });
        }, 800);
      } else {
        toast.error(data.message || "Invalid code, please try again.");
      }
    } catch (error) {
      toast.error(error.message || "Verification failed.");
    } finally {
      setIsVerifying(false);
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
          Verify your email
        </p>
        <h1 className="text-2xl font-semibold">Have a verification code?</h1>
        <p
          className={`mt-4 text-base ${
            isDark ? "text-white/70" : "text-gray-700"
          }`}
        >
          Enter the code generated from the link sent to{" "}
          <span
            className={`font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {obfuscatedEmail}
          </span>
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className={`w-full rounded-2xl border px-6 py-4 text-lg focus:outline-none ${
              isDark
                ? "border-white/20 bg-black/60 text-white placeholder-white/40 focus:border-white"
                : "border-black/20 bg-white text-gray-900 placeholder-gray-400 focus:border-black"
            }`}
            placeholder="Enter verification code"
            inputMode="numeric"
            maxLength={6}
            disabled={isVerifying}
          />
          <button
            type="submit"
            disabled={isVerifying || !otp.trim()}
            className={`w-full rounded-2xl py-4 text-base font-semibold ${
              isVerifying || !otp.trim()
                ? isDark
                  ? "bg-white/30 text-black/70 cursor-not-allowed"
                  : "bg-black/10 text-gray-500 cursor-not-allowed"
                : "bg-white text-black hover:bg-white/90 transition"
            }`}
          >
            {isVerifying ? "Verifying..." : "Verify Email Address"}
          </button>
        </form>

        <p
          className={`mt-6 text-sm ${
            isDark ? "text-white/60" : "text-gray-600"
          }`}
        >
          Not seeing the email in your inbox?{" "}
          <button
            type="button"
            onClick={() => requestOtp()}
            disabled={isSending}
            className={`underline ${
              isDark
                ? "text-white hover:text-white/80 disabled:text-white/40"
                : "text-gray-900 hover:text-gray-700 disabled:text-gray-400"
            }`}
          >
            {isSending ? "Sending..." : "Try sending again"}
          </button>
        </p>

        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className={`mt-8 text-sm underline ${
            isDark ? "text-white/50 hover:text-white/80" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default EmailVerify;
