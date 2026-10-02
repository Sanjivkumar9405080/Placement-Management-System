import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState(() => ({
    email:
      location.state?.email ||
      localStorage.getItem("placement_remember_email") ||
      "",
    password: "",
  }));
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() =>
    Boolean(localStorage.getItem("placement_remember_email"))
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    () => location.state?.message || ""
  );
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      const { token, user } = response.data;

      // Handle remember me preference
      if (rememberMe) {
        localStorage.setItem("placement_remember_email", formData.email.trim());
      } else {
        localStorage.removeItem("placement_remember_email");
      }

      if (token) {
        localStorage.setItem("token", token);
      }

      // Update auth context
      login(user);

      // Redirect according to user role
      if (user?.role === "company") {
        navigate("/company/dashboard");
      } else if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        "Unable to sign in. Please verify your email and password.";
      setErrorMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center">
      <div className="w-full min-h-screen flex flex-col lg:flex-row">
        {/* Left Side: Brand & Visual Showcase */}
        <div className="relative hidden lg:flex lg:w-1/2 xl:w-5/12 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex-col justify-between p-12 overflow-hidden border-r border-slate-800">
          {/* Subtle Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-extrabold text-xl tracking-tight">
                P
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  PlacementHub
                  <span className="text-[11px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                    Official
                  </span>
                </h1>
                <p className="text-xs text-slate-400">Campus Career & Placement Ecosystem</p>
              </div>
            </div>
          </div>

          {/* Center Content */}
          <div className="relative z-10 my-auto py-12 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Campus Recruitment Drive 2026-27 Active
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Connect with top employers and fast-track your future.
            </h2>
            <p className="mt-4 text-slate-300 text-sm leading-relaxed">
              One centralized portal for college placement drives, interview schedules, verified job offers, and real-time application updates.
            </p>

            {/* Feature Points */}
            <div className="mt-8 space-y-3.5">
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="h-6 w-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>500+ Verified Corporate Recruitment Partners</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="h-6 w-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Live Interview Slots & Drive Status Notifications</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="h-6 w-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Direct Role-Based Portals for Students & Recruiters</span>
              </div>
            </div>

            {/* Placement Stat Card */}
            <div className="mt-10 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">Total Offers Rolled Out</p>
                <p className="text-xl font-bold text-white mt-0.5">2,480+ Offers</p>
              </div>
              <div className="h-10 w-px bg-slate-700" />
              <div>
                <p className="text-xs font-medium text-slate-400">Avg. Package Growth</p>
                <p className="text-xl font-bold text-emerald-400 mt-0.5">+24.5% YoY</p>
              </div>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Enterprise-Grade 256-Bit SSL Encrypted Access</span>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 py-10 lg:py-16">
          <div className="w-full max-w-md">
            {/* Mobile Header with Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-500/20">
                P
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">PlacementHub</h1>
                <p className="text-xs text-slate-500">Placement Management System</p>
              </div>
            </div>

            {/* Header Text */}
            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Enter your credentials to access your placement dashboard.
              </p>
            </div>

            {/* Notification Banners */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-fadeIn">
                <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 font-medium">{successMessage}</div>
                <button
                  type="button"
                  onClick={() => setSuccessMessage("")}
                  className="text-emerald-500 hover:text-emerald-700 font-bold ml-1"
                  aria-label="Dismiss message"
                >
                  ×
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-fadeIn">
                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 font-medium">{errorMessage}</div>
                <button
                  type="button"
                  onClick={() => setErrorMessage("")}
                  className="text-red-500 hover:text-red-700 font-bold ml-1"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}

            {/* Login Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@college.edu"
                      className="block w-full rounded-xl border border-slate-300 pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-150"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="block w-full rounded-xl border border-slate-300 pl-11 pr-12 py-3 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-150"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm font-medium text-slate-700">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(formData.email);
                      setForgotSubmitted(false);
                      setIsForgotModalOpen(true);
                    }}
                    className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Portal Roles Pill */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Supports Student, Company & Administrator accounts</span>
              </div>
            </div>

            {/* Register Link Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 relative animate-scaleUp">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
                <p className="text-xs text-slate-500">PlacementHub Account Recovery</p>
              </div>
            </div>

            {forgotSubmitted ? (
              <div className="py-4 space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                  <div className="font-semibold text-emerald-900 flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Recovery Request Registered
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    If an account exists for <span className="font-bold">{forgotEmail}</span>, instructions have been dispatched. For urgent campus drive access, contact the Placement Cell directly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered institutional or corporate email address. Your placement cell administrator will review your identity and reissue credentials.
                </p>
                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700 flex items-start gap-2">
                  <span className="font-bold">Note:</span>
                  <span>Students can also approach the Training & Placement Office (TPO) in person for instant password reset.</span>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
