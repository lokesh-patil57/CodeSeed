import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NavBar from "../components/Navbar";
import Footer from "../components/Footer";
import GoogleLogin from "../components/GoogleLogin";
import CodeSymbolsAnimation from "../components/CodeSymbolsAnimation";
import { AppContext } from "../context/AppContext";
import { FileText, BookOpen, Users } from "lucide-react";

function AuthBox({
  isDark,
  emailInputRef,
  formData,
  setFormData,
  isLogin,
  setIsLogin,
  showPassword,
  setShowPassword,
  handleSubmit,
  handleChange,
  toggleMode,
  isLoading,
  formError,
  onForgotPassword,
}) {
  // theme-based classes
  const wrapperBg = isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-neutral-200 text-gray-900";
  const inputBg = isDark ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500" : "bg-neutral-100 border-neutral-200 text-gray-900 placeholder-neutral-400";
  const primaryBtn = isDark ? "bg-white text-black hover:bg-neutral-100" : "bg-black text-white hover:bg-gray-900";

  return (
    <div
      className={`rounded-2xl ${wrapperBg} border p-5 w-3/4 relative shadow-xl`}
      style={isDark ? { backgroundColor: "#1a1a1a" } : undefined}
    >
      <div className="flex flex-col" style={{ width: "100%" }}>
        {/* Google Sign In Button */}
        <div className="mb-4">
          <GoogleLogin isDark={isDark} />
        </div>

        {/* OR Divider */}
        <div className="flex items-center my-2">
          <div className={`flex-1 h-px ${isDark ? "bg-zinc-700" : "bg-neutral-200"}`}></div>
          <span className={`px-3 text-sm ${isDark ? "text-zinc-400" : "text-neutral-500"}`}>OR</span>
          <div className={`flex-1 h-px ${isDark ? "bg-zinc-700" : "bg-neutral-200"}`}></div>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          {!isLogin && (
            <div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-0 transition ${inputBg}`}
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <input
              ref={emailInputRef}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-0 transition ${inputBg}`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-0 transition pr-12 ${inputBg}`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              aria-label="Toggle password visibility"
              disabled={isLoading}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {isLogin && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onForgotPassword}
                className={`text-xs ${
                  isDark
                    ? "text-zinc-400 hover:text-white"
                    : "text-neutral-500 hover:text-gray-900"
                } transition`}
              >
                Forgot Password?
              </button>
            </div>
          )}
        </div>

        {/* Login/Signup Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`mt-5 h-11 w-full rounded-xl font-semibold flex items-center justify-center transition duration-200 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          } ${
            isDark
              ? "bg-white text-black hover:bg-neutral-100"
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {isLoading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
        </button>
        {formError && (
          <p className="mt-3 text-center text-sm text-red-400 px-6">
            {formError}
          </p>
        )}

        {/* Toggle Login/Signup */}
        <div className="mt-4 text-center">
          <p className={`${isDark ? "text-zinc-400" : "text-neutral-600"} text-sm`}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={toggleMode}
              disabled={isLoading}
              className={`${isDark ? "text-white" : "text-black"} hover:underline font-medium`}
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPreview() {
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const { isDark, setIsDark } = useContext(AppContext);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [faqOpen, setFaqOpen] = useState("what");
  const [openSection, setOpenSection] = useState("create");
  const [showVideoControls, setShowVideoControls] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError("");
  };

  const validateForm = () => {
    const { email, password, username } = formData;
    if (!email || !password) {
      return "Email and password are required.";
    }
    const emailRegex =
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return "Enter a valid email address.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (!isLogin) {
      if (!username?.trim()) {
        return "Username is required.";
      }
      if (username.trim().length < 3) {
        return "Username must have at least 3 characters.";
      }
    }
    return "";
  };

  const handleSubmit = async () => {
    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      toast.error(validationMessage);
      return;
    }

    const { email, password, username } = formData;

    setIsLoading(true);

    try {
      const endpoint = isLogin ? "login" : "register";
      const payload = isLogin ? { email, password } : { email, password, username };

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        const serverMessage =
          data.message ||
          (response.status === 401
            ? "Incorrect email or password."
            : response.status === 409
            ? "An account with this email already exists."
            : "Unable to complete the request. Please try again.");
        setFormError(serverMessage);
        toast.error(serverMessage);
        return;
      }

      setFormError("");
      if (data.success) {
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        toast.success(
          data.message || `${isLogin ? "Login" : "Registration"} successful!`
        );

        if (isLogin) {
          const normalizedEmail = email.trim().toLowerCase();
          const isVerified = data.user?.isAccountVerified;

          if (isVerified) {
            localStorage.removeItem("pendingVerifyEmail");
            navigate("/chat", { replace: true });
          } else {
            localStorage.setItem("pendingVerifyEmail", normalizedEmail);
            navigate("/email-verify", {
              state: { email: normalizedEmail },
              replace: true,
            });
          }
        } else {
          // For signup, clear form and switch to login
          setFormData({ username: "", email: "", password: "" });
          setIsLogin(true);
          toast.info("Please login with your credentials");
        }
      } else {
        setFormError(data.message || "Authentication failed");
        toast.error(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      const fallback = "Unable to reach the server. Please try again.";
      setFormError(error.message || fallback);
      toast.error(error.message || fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: "", email: "", password: "" });
    setFormError("");
  };

  const focusEmail = () => {
    setFormData({ username: "", email: "", password: "" });
    setIsLogin(true);
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

  const toggleVideoControls = (e) => {
    e.stopPropagation();
    setShowVideoControls((s) => !s);
  };

  function Collapsible({ isOpen, children }) {
    const innerRef = useRef(null);
    const [maxHeight, setMaxHeight] = useState("0px");

    useEffect(() => {
      if (!innerRef.current) return;
      setMaxHeight(isOpen ? `${innerRef.current.scrollHeight}px` : "0px");
    }, [isOpen, children]);

    return (
      <div
        style={{
          maxHeight,
          overflow: "hidden",
          transition: "max-height 500ms cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <div ref={innerRef} className="pt-2">
          {children}
        </div>
      </div>
    );
  }

  const meetSections = [
    {
      id: "create",
      title: "Create with CodeSeed",
      icon: FileText,
      body:
        "Draft and iterate on code, documents and UI concepts alongside your chat. CodeSeed stays in sync with your changes so you can move from idea to implementation faster.",
    },
    {
      id: "knowledge",
      title: "Bring your knowledge",
      icon: BookOpen,
      body:
        "Connect your own projects, docs and notes so CodeSeed can answer with your context in mind while keeping your data private and secure.",
    },
    {
      id: "collaborate",
      title: "Share and collaborate with your team",
      icon: Users,
      body:
        "Share your best prompts, snippets and workflows to help your team move faster together on engineering work, docs and experiments.",
    },
  ];

  const handleVideoClick = () => {
    setShowVideoControls((prev) => !prev);
  };

  const faqItems = [
    {
      id: "what",
      question: "What is CodeSeed and how does it work?",
      answer:
        "CodeSeed is an AI assistant designed to help you understand code, explore ideas and ship features faster. It can read your prompts, reason about problems, and suggest or generate code while keeping you in control of the final implementation.",
    },
    {
      id: "use-for",
      question: "What should I use CodeSeed for?",
      answer:
        "Use CodeSeed to explore new concepts, refactor existing code, debug issues, sketch out UI, or draft technical documents. It’s great for brainstorming and turning rough ideas into working prototypes.",
    },
    {
      id: "cost",
      question: "How much does it cost to use?",
      answer:
        "You can start using CodeSeed on a free tier and upgrade later if you need more usage or team features. Pricing is designed to stay accessible while scaling with more intensive workloads.",
    },
  ];

  return (
    <div
      className={`${
        isDark ? "text-white" : "bg-white text-gray-900"
      } min-h-screen transition-colors duration-300`}
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#ffffff" }}
    >
      <NavBar isDark={isDark} toggleTheme={toggleTheme} focusEmail={focusEmail} />

      <div className={`flex min-h-screen w-full`}>
        <div
          className={`flex-1 flex flex-col justify-center px-6 sm:px-12 py-12 w-full ${
            isDark ? "text-white" : "bg-white"
          }`}
          style={{ backgroundColor: isDark ? "#1a1a1a" : "#ffffff" }}
        >
          <div className="w-full">
            <h1
              className={`flex text-center justify-center text-6xl font-light mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Impossible? Possible.
            </h1>
            <p
              className={`flex justify-center ${
                isDark ? "text-neutral-400" : "text-neutral-600"
              } mb-8`}
            >
              The AI for problem solvers
            </p>

            <div className="flex justify-center">
              <AuthBox
                isDark={isDark}
                emailInputRef={emailRef}
                formData={formData}
                setFormData={setFormData}
                isLogin={isLogin}
                setIsLogin={setIsLogin}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                handleSubmit={handleSubmit}
                handleChange={handleChange}
                toggleMode={toggleMode}
                isLoading={isLoading}
            formError={formError}
            onForgotPassword={() =>
              navigate("/reset-password", {
                state: { email: formData.email.trim() },
              })
            }
              />
            </div>
          </div>
        </div>

        {/* Right decorative panel */}
        <div
          className={`flex-1 relative overflow-hidden hidden md:flex items-center justify-center transition-colors duration-300 ${
            isDark ? "text-white" : "bg-white"
          }`}
          style={{ backgroundColor: isDark ? "#1a1a1a" : "#ffffff" }}
        >
          <div
            aria-hidden="true"
            className={`absolute inset-0 bg-no-repeat bg-center bg-contain transition-[filter] duration-300 pointer-events-none z-0 ${
              isDark ? "" : "filter brightness-0"
            }`}
            style={{ backgroundImage: "url('/images/1.png')" }}
          />
          <CodeSymbolsAnimation isDark={isDark} />
        </div>
      </div>

      {/* Meet CodeSeed section */}
      <section id="meet-codeseed">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Centered heading & description */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-light mb-3">
              Meet CodeSeed
            </h2>
            <p
              className={`text-base ${
                isDark ? "text-neutral-400" : "text-neutral-700"
              }`}
            >
              CodeSeed is your AI partner for understanding code, shipping
              features and exploring new ideas safely.
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-2 items-start">
            {/* Left: video only, with rounded frame */}
            <div className="flex justify-center">
              <div className="relative overflow-hidden rounded-[32px] flex justify-center">
                <video
                  src="/videos/vid1.mp4"
                  autoPlay
                  loop
                  muted={!showVideoControls}
                  playsInline
                  controls={showVideoControls}
                  onClick={handleVideoClick}
                  className="object-cover cursor-pointer"
                  style={{ width: 570, height: 320 }}
                />
              </div>
            </div>

            {/* Right: collapsible sections */}
            <div className="flex flex-col justify-center space-y-4">
              {meetSections.map((section, idx) => (
                <div
                  key={section.id}
                  className={`cursor-pointer py-3 transition-colors ${
                    openSection === section.id
                      ? isDark
                        ? "text-white"
                        : "text-gray-900"
                      : isDark
                      ? "text-neutral-400"
                      : "text-neutral-700"
                  } ${idx === 0 ? (isDark ? "border-b border-neutral-800 pb-4" : "border-b border-neutral-200 pb-4") : ""}`}
                  onClick={() => setOpenSection(section.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {section.icon && (
                        <section.icon
                          size={22}
                          className={
                            openSection === section.id
                              ? ""
                              : isDark
                              ? "text-neutral-500"
                              : "text-neutral-500"
                          }
                        />
                      )}
                      <h3 className="text-lg md:text-xl font-medium">
                        {section.title}
                      </h3>
                    </div>
                    <span className="text-xs opacity-60">
                      {openSection === section.id ? "−" : "+"}
                    </span>
                  </div>
                  {openSection === section.id && (
                    <p
                      className={`mt-2 text-base leading-relaxed ${
                        isDark ? "text-neutral-400" : "text-neutral-700"
                      }`}
                    >
                      {section.body}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-center text-3xl md:text-4xl font-light mb-10">
            Frequently asked questions
          </h2>

          <div className="space-y-4">
            {faqItems.map((item) => (
              <div
                key={item.id}
                className="border-b border-neutral-800 pb-4"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left"
                  onClick={() =>
                    setFaqOpen((current) =>
                      current === item.id ? item.id : item.id
                    )
                  }
                >
                  <span className="text-lg md:text-2xl font-normal">
                    {item.question}
                  </span>
                  <span className="text-xl md:text-2xl px-2">
                    {faqOpen === item.id ? "+" : "+"}
                  </span>
                </button>
                <Collapsible isOpen={faqOpen === item.id}>
                  <p
                    className={`mt-2 text-sm md:text-base leading-relaxed ${
                      isDark ? "text-neutral-400" : "text-neutral-700"
                    }`}
                  >
                    {item.answer}
                  </p>
                </Collapsible>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer isDark={isDark}  />

      <style>{`
        @keyframes pop {
          0% { transform: scale(.6); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop { 
          animation: pop .5s ease-out forwards; 
        }
      `}</style>
    </div>
  );
}

