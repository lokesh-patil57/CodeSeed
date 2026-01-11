import GoogleLogin from "../components/GoogleLogin";

export default function AuthBox({
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
  // Theme-based classes
  const wrapperBg = isDark
    ? "bg-zinc-900 border-zinc-800 text-white"
    : "bg-white border-neutral-200 text-gray-900";
  const inputBg = isDark
    ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
    : "bg-neutral-100 border-neutral-200 text-gray-900 placeholder-neutral-400";

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
          <div
            className={`flex-1 h-px ${
              isDark ? "bg-zinc-700" : "bg-neutral-200"
            }`}
          ></div>
          <span
            className={`px-3 text-sm ${
              isDark ? "text-zinc-400" : "text-neutral-500"
            }`}
          >
            OR
          </span>
          <div
            className={`flex-1 h-px ${
              isDark ? "bg-zinc-700" : "bg-neutral-200"
            }`}
          ></div>
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
          <p
            className={`${
              isDark ? "text-zinc-400" : "text-neutral-600"
            } text-sm`}
          >
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={toggleMode}
              disabled={isLoading}
              className={`${
                isDark ? "text-white" : "text-black"
              } hover:underline font-medium`}
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
