import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleRoleSelect = (roleName) => {
    setFormData((prev) => ({ ...prev, role: roleName }));
    if (errorMessage) setErrorMessage("");
  };

  // Basic password strength score (0 to 4)
  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const passwordScore = getPasswordStrength(formData.password);

  const getStrengthLabel = (score) => {
    if (!formData.password) return "";
    if (score <= 1) return "Weak";
    if (score <= 2) return "Moderate";
    if (score === 3) return "Good";
    return "Strong";
  };

  const getStrengthColor = (score) => {
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-amber-500";
    if (score === 3) return "bg-blue-500";
    return "bg-emerald-500";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Client-side validations
    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!formData.password) {
      setErrorMessage("Please enter a password.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the terms and campus placement guidelines.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      const response = await api.post("/auth/register", payload);

      if (response.status === 201 || response.status === 200) {
        navigate("/login", {
          state: {
            message: "Account created successfully! Please sign in with your credentials.",
            email: formData.email.trim(),
          },
        });
      }
    } catch (error) {
      const serverMessage =
        error.response?.data?.message ||
        "Registration could not be completed. Please check your details and try again.";
      setErrorMessage(serverMessage);
    } finally {
      setLoading(false);
    }
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
            <Link to="/login" className="inline-flex items-center gap-3 group">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-extrabold text-xl tracking-tight group-hover:scale-105 transition-transform">
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
            </Link>
          </div>

          {/* Center Content */}
          <div className="relative z-10 my-auto py-10 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-6">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Quick & Free Registration
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Create your account to unlock campus recruitment.
            </h2>
            <p className="mt-4 text-slate-300 text-sm leading-relaxed">
              Join thousands of aspiring students and industry-leading recruiters collaborating on one unified placement platform.
            </p>

            {/* Value Proposition Cards */}
            <div className="mt-8 space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">For Students</h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Apply to exclusive on-campus drives, upload resumes, and track interviews seamlessly.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-sm flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">For Companies & Recruiters</h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Post job openings, filter qualified candidates by CGPA/skills, and shortlist in seconds.
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial / Assurance Quote */}
            <div className="mt-8 border-l-2 border-blue-500 pl-4 py-1">
              <p className="text-xs italic text-slate-300">
                &ldquo;PlacementHub transformed our campus hiring season, cutting recruitment cycle time by over 50%.&rdquo;
              </p>
              <p className="text-[11px] font-semibold text-blue-400 mt-1.5">— Campus Training & Placement Directorate</p>
            </div>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Verified Institutional Security Standards</span>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 py-10 lg:py-14">
          <div className="w-full max-w-lg">
            {/* Mobile Header with Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-500/20">
                P
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">PlacementHub</h1>
                <p className="text-xs text-slate-500">Placement Management System</p>
              </div>
            </div>

            {/* Header Text */}
            <div className="mb-6 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create an account
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Choose your portal role and enter your details to get started.
              </p>
            </div>

            {/* Error Notification */}
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

            {/* Register Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Student Option */}
                    <button
                      type="button"
                      onClick={() => handleRoleSelect("student")}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                        formData.role === "student"
                          ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20"
                          : "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                          formData.role === "student"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold flex items-center gap-1.5">
                          Student
                          {formData.role === "student" && (
                            <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">Candidate / Aspirant</p>
                      </div>
                    </button>

                    {/* Company Option */}
                    <button
                      type="button"
                      onClick={() => handleRoleSelect("company")}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                        formData.role === "company"
                          ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20"
                          : "border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                          formData.role === "company"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold flex items-center gap-1.5">
                          Company
                          {formData.role === "company" && (
                            <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">Hiring Partner / HR</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Full Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    {formData.role === "company" ? "Company / Representative Name" : "Full Name"}
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={formData.role === "company" ? "e.g. Acme Corp Careers / Sarah Connor" : "e.g. Alex Johnson"}
                      className="block w-full rounded-xl border border-slate-300 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-150"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    {formData.role === "company" ? "Corporate Work Email" : "Institutional / Student Email"}
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
                      placeholder={formData.role === "company" ? "hr@company.com" : "student@college.edu"}
                      className="block w-full rounded-xl border border-slate-300 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-150"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Password
                  </label>
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
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      className="block w-full rounded-xl border border-slate-300 pl-11 pr-12 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-150"
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

                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Strength:</span>
                        <span className="font-semibold text-slate-700">{getStrengthLabel(passwordScore)}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        <div className={`rounded-full ${passwordScore >= 1 ? getStrengthColor(passwordScore) : "bg-slate-200"}`} />
                        <div className={`rounded-full ${passwordScore >= 2 ? getStrengthColor(passwordScore) : "bg-slate-200"}`} />
                        <div className={`rounded-full ${passwordScore >= 3 ? getStrengthColor(passwordScore) : "bg-slate-200"}`} />
                        <div className={`rounded-full ${passwordScore >= 4 ? getStrengthColor(passwordScore) : "bg-slate-200"}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      className={`block w-full rounded-xl border pl-11 pr-12 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-white focus:bg-white outline-none transition-all duration-150 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                          : "border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? (
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

                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      I agree to the{" "}
                      <span className="text-blue-600 hover:underline font-semibold cursor-pointer">Campus Placement Policy</span>{" "}
                      and{" "}
                      <span className="text-blue-600 hover:underline font-semibold cursor-pointer">Code of Conduct</span>.
                    </span>
                  </label>
                </div>

                {/* Register Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer pt-3"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Login Link Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
