import { useState, useRef } from "react";
import NavBar from "../components/Navbar";

export default function LoginPreview() {
  const emailRef = useRef(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const focusEmail = () => {
    setStep(1);
    requestAnimationFrame(() => {
      if (emailRef.current) {
        emailRef.current.focus();
        emailRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    });
  };

  return (
    <div
      className={`${isDark ? "bg-black text-white" : "bg-white text-gray-900"} min-h-screen transition-colors duration-300`}
    >
      <NavBar isDark={isDark} toggleTheme={toggleTheme} focusEmail={focusEmail} />

      <div className={`flex min-h-screen w-full`}>
        <div className={`flex-1 flex flex-col justify-center px-6 sm:px-12 py-12 w-full ${isDark ? "bg-black" : "bg-white"}`}>
          <div className="w-full">
            <h1 className={`text-6xl font-light mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Impossible? <br /> Possible.
            </h1>
            <p className={`${isDark ? "text-neutral-400" : "text-neutral-600"} mb-8`}>The AI for problem solvers</p>

            <div
              className={`${
                isDark ? "bg-black border border-neutral-800" : "bg-white border border-neutral-200"
              } rounded-2xl p-8 w-4/5 relative shadow-xl`}
            >
              {/* Success overlay */}
              {showSuccess && (
                <div className="absolute inset-0 bg-neutral-950/90 flex items-center justify-center z-50 rounded-2xl">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-3 animate-pop">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div className="text-green-400 font-medium">Verified!</div>
                  </div>
                </div>
              )}

              {/* Google button placeholder */}
              <button className="w-full flex items-center justify-center gap-3 bg-white text-neutral-900 py-3 px-6 rounded-lg font-medium hover:bg-neutral-100 transition-colors mb-4">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-4 my-3">
                <div
                  className={`h-px ${
                    isDark ? "bg-neutral-800" : "bg-neutral-300"
                  } flex-1`}
                />
                <div
                  className={`${
                    isDark ? "text-neutral-500" : "text-neutral-500"
                  } text-sm`}
                >
                  OR
                </div>
                <div
                  className={`h-px ${
                    isDark ? "bg-neutral-800" : "bg-neutral-300"
                  } flex-1`}
                />
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
                    className={`${
                      isDark
                        ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
                        : "bg-neutral-100 border-neutral-200 text-gray-900 placeholder-neutral-400"
                    } w-full p-3 rounded-lg border mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  <button
                    onClick={() => setStep(2)}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      isDark
                        ? "bg-white text-black hover:bg-neutral-100"
                        : "bg-gray-700 text-white hover:bg-gray-800"
                    }`}
                  >
                    Continue with email
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <div
                      className={`${
                        isDark
                          ? "text-sm text-neutral-400"
                          : "text-sm text-neutral-600"
                      }`}
                    >
                      We sent a code to {email || "your email"}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className={`${
                      isDark
                        ? "bg-neutral-800 border-neutral-700 text-white"
                        : "bg-neutral-100 border-neutral-200 text-gray-900"
                    } w-full p-3 rounded-lg border text-center text-2xl tracking-widest mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />

                  <button
                    onClick={() => setShowSuccess(true)}
                    className="w-full bg-white text-black py-3 rounded-lg font-medium mb-3 hover:bg-neutral-100 transition-colors"
                  >
                    Verify OTP
                  </button>

                  <div
                    className={`text-sm mb-2 ${
                      isDark ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    {timer > 0 ? (
                      <>
                        Resend OTP in{" "}
                        <span
                          className={isDark ? "text-white" : "text-gray-900"}
                        >
                          {timer}s
                        </span>
                      </>
                    ) : (
                      <button className="text-sm text-purple-400 hover:text-purple-300">
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setStep(1)}
                    className={`text-sm ${
                      isDark
                        ? "text-neutral-400 hover:text-white"
                        : "text-neutral-600 hover:text-gray-900"
                    } transition-colors`}
                  >
                    Back to login
                  </button>
                </>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowMore(!showMore)}
                  className={`text-sm ${
                    isDark
                      ? "text-neutral-400 hover:text-white"
                      : "text-neutral-600 hover:text-gray-900"
                  } transition-colors`}
                >
                  More options
                </button>
              </div>

              {showMore && (
                <div
                  className={`mt-4 border-t ${
                    isDark ? "border-neutral-800" : "border-neutral-200"
                  } pt-4`}
                >
                  <input
                    type="password"
                    placeholder="Password (for signup/login)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${
                      isDark
                        ? "bg-neutral-800 border-neutral-700 text-white"
                        : "bg-neutral-100 border-neutral-200 text-gray-900"
                    } w-full p-3 rounded-lg mb-3 border focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  />
                  <div className="flex gap-2">
                    <button
                      className={`flex-1 ${
                        isDark
                          ? "bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
                          : "bg-neutral-100 border-neutral-200 hover:bg-neutral-200"
                      } py-2 rounded-md transition-colors`}
                    >
                      Sign up (password)
                    </button>
                    <button className="flex-1 bg-purple-600 py-2 rounded-md hover:bg-purple-700 transition-colors">
                      {isLoggingIn ? "Logging..." : "Login"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right decorative panel with animated coding symbols */}
        <div
          className={`flex-1 relative overflow-hidden hidden md:flex items-center justify-center transition-colors duration-300 ${
            isDark ? "bg-black" : "bg-white"
          }`}
        >
          {/* Background image layer */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 bg-no-repeat bg-center bg-contain transition-[filter] duration-300 pointer-events-none z-0 ${
              isDark ? "" : "filter brightness-0"
            }`}
            style={{ backgroundImage: "url('/images/1.png')" }}
          />

          {/* Animated Coding Symbols */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {[...Array(50)].map((_, i) => {
              const symbols = ['</>', '}{', '[]', '"', "'", ';', ':', ',', '.', '?', '-', '()', '*', '&', '^', '%', '$', '#', '@', '!', '~', '`', '+', '=', '<', '>', '/', '\\'];
              const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
              const colors = ['#00CED1', '#FFD700', '#FF69B4', '#7FFF00', '#FF6347', '#9D4EDD', '#06FFA5', '#FF1493', '#00FF7F'];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              const randomLeft = Math.random() * 100;
              const randomDelay = Math.random() * 5;
              const randomDuration = 8 + Math.random() * 7;
              const randomRotation = -30 + Math.random() * 60;
              
              return (
                <div
                  key={i}
                  className="absolute animate-symbol-fall"
                  style={{
                    left: `${randomLeft}%`,
                    top: `-${Math.random() * 10}%`,
                    animationDelay: `${randomDelay}s`,
                    animationDuration: `${randomDuration}s`,
                  }}
                >
                  <div
                    className="font-mono font-bold text-xl"
                    style={{
                      color: randomColor,
                      opacity: isDark ? 0.9 : 0.7,
                      transform: `rotate(${randomRotation}deg)`,
                      textShadow: isDark ? '0 0 15px currentColor' : '0 0 8px currentColor',
                    }}
                  >
                    {randomSymbol}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative z-20 text-center px-8">
            <div className={`text-6xl mb-4 transition-colors`}></div>
            <h2
              className={`text-3xl font-light mb-2 transition-colors ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            ></h2>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div
          className={`${isDark ? "text-gray-300" : "text-gray-700"} space-y-8`}
        >
          <h1
            className={`text-4xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Welcome to CodeSeed
          </h1>
          <p className="text-lg">
            Scroll down to see the sticky navbar in action. The navbar stays at
            the top of the page as you scroll.
          </p>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`p-6 rounded-lg ${
                isDark ? "bg-gray-900" : "bg-white"
              } shadow-md`}
            >
              <h2
                className={`text-2xl font-semibold mb-3 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Section {i + 1}
              </h2>
              <p>
                This is some demo content to show the sticky navbar behavior.
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pop {
          0% { transform: scale(.6); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop { 
          animation: pop .5s ease-out forwards; 
        }
        
        @keyframes symbol-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(180deg);
            opacity: 0;
          }
        }
        .animate-symbol-fall {
          animation: symbol-fall linear infinite;
        }
      `}</style>
    </div>
  );
}