import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/Navbar";
import Footer from "../components/Footer";
import CodeSymbolsAnimation from "../components/CodeSymbolsAnimation";
import AuthBox from "../components/AuthBox";
import MeetSection from "../components/MeetSection";
import FAQItem from "../components/FAQItem";
import { AppContext } from "../context/AppContext";
import { useAuthAPI } from "../hooks/useAuthAPI";
import {
  FORM_INITIAL_STATE,
  MEET_SECTIONS,
  FAQ_ITEMS,
} from "../constants/loginConfig";
import {
  validateLoginForm,
  validateSignupForm,
} from "../utils/formValidation";

export default function LoginPage() {
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const { isDark, setIsDark, setUserData } = useContext(AppContext);
  const { isLoading, login, register } = useAuthAPI();

  // Form state
  const [formData, setFormData] = useState(FORM_INITIAL_STATE);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  // UI state
  const [faqOpen, setFaqOpen] = useState("what");
  const [openSection, setOpenSection] = useState("create");
  const [showVideoControls, setShowVideoControls] = useState(false);

  // Handlers
  const toggleTheme = () => setIsDark((prev) => !prev);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError("");
  };

  const handleSubmit = async () => {
    // Validate form
    const validationError = isLogin
      ? validateLoginForm(formData.email, formData.password)
      : validateSignupForm(formData.email, formData.password, formData.username);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const { email, password, username, confirmPassword } = formData;

    // Perform authentication
    const result = isLogin
      ? await login(email, password)
      : await register(email, password, confirmPassword, username);

    if (result.success && result.data?.user) {
      // Update context with user data
      setUserData(result.data.user);
      
      // Save user data to localStorage for Chat component
      localStorage.setItem("user", JSON.stringify(result.data.user));

      const normalizedEmail = email.trim().toLowerCase();
      const isVerified = result.data.user.isAccountVerified;

      if (isLogin) {
        if (isVerified) {
          localStorage.removeItem("pendingVerifyEmail");
          // Small delay to ensure state is updated before navigation
          setTimeout(() => navigate("/chat", { replace: true }), 100);
        } else {
          localStorage.setItem("pendingVerifyEmail", normalizedEmail);
          setTimeout(
            () =>
              navigate("/email-verify", {
                state: { email: normalizedEmail },
                replace: true,
              }),
            100
          );
        }
      } else {
        // For signup, clear form and switch to login
        setFormData(FORM_INITIAL_STATE);
        setIsLogin(true);
      }
    } else {
      setFormError(result.error || "Authentication failed");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData(FORM_INITIAL_STATE);
    setFormError("");
  };

  const focusEmail = () => {
    setFormData(FORM_INITIAL_STATE);
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

  const handleVideoClick = () => {
    setShowVideoControls((prev) => !prev);
  };

  return (
    <div
      className={`${
        isDark ? "text-white" : "bg-white text-gray-900"
      } min-h-screen transition-colors duration-300`}
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#ffffff" }}
    >
      <NavBar isDark={isDark} toggleTheme={toggleTheme} focusEmail={focusEmail} />

      {/* Auth Section */}
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

      {/* Meet CodeSeed Section */}
      <section id="meet-codeseed">
        <div className="max-w-6xl mx-auto px-6 py-16">
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
            {/* Video Section */}
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

            {/* Collapsible Sections */}
            <div className="flex flex-col justify-center space-y-4">
              {MEET_SECTIONS.map((section, idx) => (
                <MeetSection
                  key={section.id}
                  section={section}
                  isOpen={openSection === section.id}
                  isDark={isDark}
                  onToggle={() => setOpenSection(section.id)}
                  showBorder={idx === 0}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <div className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-center text-3xl md:text-4xl font-light mb-10">
            Frequently asked questions
          </h2>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <FAQItem
                key={item.id}
                item={item}
                isOpen={faqOpen === item.id}
                isDark={isDark}
                onToggle={() => setFaqOpen(item.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer isDark={isDark} />

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
