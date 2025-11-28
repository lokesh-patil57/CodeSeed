import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/Navbar";

const API = "http://localhost:3000/api";

export default function Login() {
  const navigate = useNavigate();

  // refs
  const emailRef = useRef(null);

  // states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1=email entry, 2=enter OTP
  const [timer, setTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // More options (password)
  const [showMore, setShowMore] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // theme state used across the page (now writable)
  const [isDark, setIsDark] = useState(true);
  const toggleTheme = () => setIsDark(prev => !prev);

  // focus handler passed to Navbar
  const focusEmail = () => {
    // ensure email step is visible
    setStep(1);
    // focus immediately without smooth scrolling/animation
    requestAnimationFrame(() => {
      if (emailRef.current) {
        emailRef.current.focus();
        emailRef.current.scrollIntoView({ behavior: "auto", block: "center" });
      } else {
        const el = document.getElementById("emailInput");
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: "auto", block: "center" });
        }
      }
    });
  };

  // Google button init
  useEffect(() => {
    // Load Google script in index.html; here we render button after load
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large" }
      );
    }
    // eslint-disable-next-line
  }, []);

  // timer effect
  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => setTimer((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const startTimer = (secs = 60) => setTimer(secs);

  // send OTP
  const sendOtp = async (isResend = false) => {
    if (!email) return alert("Enter your email");
    try {
      if (isResend) setIsResending(true);
      const res = await fetch(`${API}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
        startTimer(60);
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending OTP");
    } finally {
      setIsResending(false);
    }
  };

  // verify OTP
  const verifyOtp = async () => {
    if (!otp) return alert("Enter OTP");
    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/chat");
        }, 1400);
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying OTP");
    }
  };

  // password signup/login (hidden under More options)
  const signupPassword = async () => {
    if (!email || !password) return alert("Provide email and password");
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      alert(data.message || "Signed up");
    } catch (err) {
      console.error(err);
      alert("Error signing up");
    }
  };

  const loginPassword = async () => {
    if (!email || !password) return alert("Provide email and password");
    try {
      setIsLoggingIn(true);
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        navigate("/chat");
      } else alert(data.message || "Login failed");
    } catch (err) {
      console.error(err);
      alert("Error logging in");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Google response
  const handleGoogleResponse = async (response) => {
    try {
      const res = await fetch(`${API}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        navigate("/chat");
      } else alert(data.message || "Google login failed");
    } catch (err) {
      console.error(err);
      alert("Google login error");
    }
  };

  return (
    <div className={`${isDark ? "bg-neutral-950 text-white" : "bg-white text-gray-900"} min-h-screen transition-colors duration-300`}>
      {/* Navbar receives theme and toggle so it controls page theme */}
      <NavBar isDark={isDark} toggleTheme={toggleTheme} focusEmail={focusEmail} />

      <div className="flex min-h-screen">
        <div className="flex-1 flex flex-col justify-center px-12 py-12">
          <div className="max-w-2xl">
            <h1 className={`text-6xl font-light mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Impossible? <br /> Possible.</h1>
            <p className={`${isDark ? "text-neutral-400" : "text-neutral-600"} mb-8`}>The AI for problem solvers</p>

            <div className={`${isDark ? "bg-neutral-900 border border-neutral-800" : "bg-white border border-neutral-200"} rounded-2xl p-8 max-w-md relative`}>
              {/* Success overlay */}
              {showSuccess && (
                <div className="absolute inset-0 bg-neutral-950/90 flex items-center justify-center z-50 rounded-2xl">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-3 animate-pop">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-green-400 font-medium">Verified!</div>
                  </div>
                </div>
              )}

              {/* Google button placeholder */}
              <div id="googleBtn" className="mb-4 flex justify-center" />

              <div className="flex items-center gap-4 my-3">
                <div className="h-px bg-neutral-800 flex-1" />
                <div className={`${isDark ? "text-neutral-500" : "text-neutral-500"} text-sm`}>OR</div>
                <div className="h-px bg-neutral-800 flex-1" />
              </div>

              {step === 1 ? (
                <>
                  <input
                    id="emailInput"
                    ref={emailRef}
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${isDark ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-100 border-neutral-200 text-gray-900"} w-full p-3 rounded-lg border mb-4`}
                  />
                  <button
                    onClick={() => sendOtp(false)}
                    className={`w-full py-3 rounded-lg font-medium ${
                      isDark ? "bg-white text-black" : "bg-gray-700 text-white"
                    }`}
                  >
                    Continue with email
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <div className={`${isDark ? "text-sm text-neutral-400" : "text-sm text-neutral-600"}`}>We sent a code to {email}</div>
                  </div>

                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className={`${isDark ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-100 border-neutral-200 text-gray-900"} w-full p-3 rounded-lg border text-center text-2xl tracking-widest mb-4`}
                  />

                  <button onClick={verifyOtp} className="w-full bg-white text-black py-3 rounded-lg font-medium mb-3">Verify OTP</button>

                  <div className="text-sm mb-2">
                    {timer > 0 ? (
                      <>Resend OTP in <span className="text-white">{timer}s</span></>
                    ) : (
                      <button onClick={() => sendOtp(true)} disabled={isResending} className={`text-sm ${isResending ? "opacity-50" : "text-purple-400 hover:text-purple-300"}`}>
                        {isResending ? "Resending..." : "Resend OTP"}
                      </button>
                    )}
                  </div>

                  <button onClick={() => setStep(1)} className="text-sm text-neutral-400">Back to login</button>
                </>
              )}

              <div className="mt-6 text-center">
                <button onClick={() => setShowMore(!showMore)} className="text-sm text-neutral-400 hover:text-white">More options</button>
              </div>

              {showMore && (
                <div className="mt-4 border-t border-neutral-800 pt-4">
                  <input
                    type="password"
                    placeholder="Password (for signup/login)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${isDark ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-100 border-neutral-200 text-gray-900"} w-full p-3 rounded-lg mb-3 border`}
                  />
                  <div className="flex gap-2">
                    <button onClick={signupPassword} className={`flex-1 ${isDark ? "bg-neutral-800 border-neutral-700" : "bg-neutral-100 border-neutral-200"} py-2 rounded-md`}>Sign up (password)</button>
                    <button onClick={loginPassword} className="flex-1 bg-purple-600 py-2 rounded-md">{isLoggingIn ? "Logging..." : "Login"}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right decorative panel */}
        <div className="flex-1 relative overflow-hidden hidden md:block">
          <img
            src="/images/1.png"
            alt=""
            className={`mt-40 transition-all duration-300 ${isDark ? "" : "filter brightness-0"}`}
          />
          {/* confetti etc (keep as-is) */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`${isDark ? "text-gray-300" : "text-gray-700"} space-y-8`}>
          <h1 className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Welcome to CodeSeed</h1>
          <p className="text-lg">Scroll down to see the sticky navbar in action. The navbar stays at the top of the page as you scroll.</p>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`p-6 rounded-lg ${isDark ? "bg-gray-900" : "bg-white"} shadow-md`}>
              <h2 className={`text-2xl font-semibold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Section {i + 1}</h2>
              <p>This is some demo content to show the sticky navbar behavior.</p>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes pop {
            0% { transform: scale(.6); opacity: 0; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); }
          }
          .animate-pop { animation: pop .5s ease-out forwards; }
        `}</style>
      </div>
    </div>
  );
}
