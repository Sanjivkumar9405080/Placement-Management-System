import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import CompanyNavbar from "../../components/CompanyNavbar";
import { applicationsAPI } from "../../services/api";
import ScheduleInterviewModal from "../../components/company/ScheduleInterviewModal";

import {
  Search,
  Users,
  UserCheck,
  Clock3,
  Eye,
  Download,
  ChevronDown,
  Loader2,
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  XCircle,
  FileText,
  SlidersHorizontal,
  Phone,
  Mail,
  GraduationCap,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";

const CompanyApplicants = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Filters (Requirement 7)
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [minCgpaFilter, setMinCgpaFilter] = useState("All");
  const [skillCategoryFilter, setSkillCategoryFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [academicYearFilter, setAcademicYearFilter] = useState("All");

  // Schedule Interview Modal State
  const [selectedAppForInterview, setSelectedAppForInterview] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Profile View Modal State
  const [profileModal, setProfileModal] = useState({
    isOpen: false,
    app: null,
  });

  const getResumeUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");
    return `${baseUrl}/uploads/resumes/${url}`;
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const showSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(""), 4500);
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await applicationsAPI.getCompanyApplications();
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error("Error fetching company applications:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load applications. Please ensure you are logged in as a company."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await applicationsAPI.updateStatus(appId, newStatus);
      if (res.data.success) {
        showSuccess(
          `Applicant status updated to "${newStatus}". Student has been notified!`
        );
        // Update local state immediately
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
        if (profileModal.app && profileModal.app._id === appId) {
          setProfileModal((prev) => ({
            ...prev,
            app: { ...prev.app, status: newStatus },
          }));
        }
      }
    } catch (err) {
      console.error("Update status error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update applicant status. Please try again."
      );
    }
  };

  const handleOpenScheduleModal = (app) => {
    setSelectedAppForInterview(app);
    setIsScheduleModalOpen(true);
  };

  // Helper to derive academic year
  const deriveAcademicYear = (academicYear, gradYear) => {
    if (academicYear) return academicYear;
    const curr = new Date().getFullYear();
    const grad = Number(gradYear) || curr + 1;
    const diff = grad - curr;
    if (diff <= 0) return "4th Year";
    if (diff === 1) return "3rd Year";
    if (diff === 2) return "2nd Year";
    return "1st Year";
  };

  // Helper to match skill categories
  const matchesSkillCategory = (skills = [], category) => {
    if (!category || category === "All") return true;
    const sStr = skills.join(" ").toLowerCase();
    const cat = category.toLowerCase();

    if (cat.includes("full stack")) {
      return (
        sStr.includes("full stack") ||
        (sStr.includes("react") && sStr.includes("node")) ||
        sStr.includes("mern")
      );
    }
    if (cat.includes("frontend")) {
      return (
        sStr.includes("frontend") ||
        sStr.includes("react") ||
        sStr.includes("vue") ||
        sStr.includes("html") ||
        sStr.includes("angular")
      );
    }
    if (cat.includes("backend")) {
      return (
        sStr.includes("backend") ||
        sStr.includes("node") ||
        sStr.includes("express") ||
        sStr.includes("django") ||
        sStr.includes("spring")
      );
    }
    if (cat.includes("java")) {
      return sStr.includes("java") && !sStr.includes("javascript");
    }
    if (cat.includes("python")) {
      return sStr.includes("python") || sStr.includes("django") || sStr.includes("flask");
    }
    if (cat.includes("ai") || cat.includes("ml")) {
      return (
        sStr.includes("ai") ||
        sStr.includes("ml") ||
        sStr.includes("machine learning") ||
        sStr.includes("tensorflow") ||
        sStr.includes("pytorch")
      );
    }
    if (cat.includes("data analyst") || cat.includes("analyst")) {
      return (
        sStr.includes("data") ||
        sStr.includes("analyst") ||
        sStr.includes("sql") ||
        sStr.includes("tableau") ||
        sStr.includes("power bi")
      );
    }
    return sStr.includes(cat);
  };

  // Helper to match branch category
  const matchesBranchCategory = (branch = "", category) => {
    if (!category || category === "All") return true;
    const bStr = branch.toLowerCase();
    const cat = category.toLowerCase();

    if (cat === "computer science" || cat === "cse") {
      return (
        bStr.includes("computer") ||
        bStr.includes("cse") ||
        bStr.includes("software")
      );
    }
    if (cat.includes("ai") || cat.includes("ml")) {
      return (
        bStr.includes("ai") ||
        bStr.includes("ml") ||
        bStr.includes("artificial") ||
        bStr.includes("machine learning")
      );
    }
    if (cat === "it" || cat === "information technology") {
      return bStr.includes("it") || bStr.includes("information");
    }
    if (cat === "other branches") {
      return (
        !bStr.includes("cse") &&
        !bStr.includes("computer") &&
        !bStr.includes("it") &&
        !bStr.includes("ai") &&
        !bStr.includes("ml")
      );
    }
    return bStr.includes(cat);
  };

  // Multi-Filter Logic
  const filteredApplicants = useMemo(() => {
    return applications.filter((app) => {
      const student = app.student || {};
      const studentUser = student.userId || {};
      const name = studentUser.name || "";
      const email = studentUser.email || "";
      const branch = student.branch || "";
      const driveRole = app.drive?.role || app.role || "";
      const skills = student.skills || [];
      const cgpa = student.cgpa !== undefined ? Number(student.cgpa) : 7.0;
      const academicYear = deriveAcademicYear(student.academicYear, student.graduationYear);

      // 1. Search Query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchSearch =
          name.toLowerCase().includes(q) ||
          email.toLowerCase().includes(q) ||
          branch.toLowerCase().includes(q) ||
          driveRole.toLowerCase().includes(q) ||
          skills.some((s) => s.toLowerCase().includes(q));
        if (!matchSearch) return false;
      }

      // 2. Status Filter
      if (statusFilter !== "All") {
        if (app.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      // 3. Minimum CGPA Filter
      if (minCgpaFilter !== "All") {
        const minVal = Number(minCgpaFilter);
        if (cgpa < minVal) return false;
      }

      // 4. Technical Skills Category Filter
      if (skillCategoryFilter !== "All") {
        if (!matchesSkillCategory(skills, skillCategoryFilter)) return false;
      }

      // 5. Branch Filter
      if (branchFilter !== "All") {
        if (!matchesBranchCategory(branch, branchFilter)) return false;
      }

      // 6. Academic Year Filter
      if (academicYearFilter !== "All") {
        if (academicYear.toLowerCase() !== academicYearFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [
    applications,
    search,
    statusFilter,
    minCgpaFilter,
    skillCategoryFilter,
    branchFilter,
    academicYearFilter,
  ]);

  const totalApplications = applications.length;
  const shortlisted = applications.filter((app) => app.status === "Shortlisted").length;
  const interviews = applications.filter((app) => app.status === "Interview").length;
  const selected = applications.filter((app) => app.status === "Selected").length;

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setMinCgpaFilter("All");
    setSkillCategoryFilter("All");
    setBranchFilter("All");
    setAcademicYearFilter("All");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "All" ||
    minCgpaFilter !== "All" ||
    skillCategoryFilter !== "All" ||
    branchFilter !== "All" ||
    academicYearFilter !== "All";

  const exportToCSV = () => {
    if (applications.length === 0) return;

    const headers = [
      "Student Name",
      "Email",
      "Phone",
      "Branch",
      "Academic Year",
      "CGPA",
      "Technical Skills",
      "Applied Role",
      "Status",
      "Applied Date",
    ];

    const rows = applications.map((app) => {
      const student = app.student || {};
      const user = student.userId || {};
      const year = deriveAcademicYear(student.academicYear, student.graduationYear);
      return [
        `"${user.name || "N/A"}"`,
        `"${user.email || "N/A"}"`,
        `"${student.phone || "N/A"}"`,
        `"${student.branch || "N/A"}"`,
        `"${year}"`,
        `"${student.cgpa !== undefined ? student.cgpa : "N/A"}"`,
        `"${(student.skills || []).join(", ")}"`,
        `"${app.role || app.drive?.role || "N/A"}"`,
        `"${app.status || "Applied"}"`,
        `"${new Date(app.appliedAt || app.createdAt).toLocaleDateString()}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `placement_applicants_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <CompanyNavbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 space-y-6">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Company Portal</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Applicant Management
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Filter student candidates by CGPA, branch, year, and technical skills. Review resumes and update candidate statuses.
            </p>
          </div>

          <button
            type="button"
            onClick={exportToCSV}
            disabled={applications.length === 0}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>

        {/* Success Alert Banner */}
        {actionSuccess && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-sm animate-fadeIn">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span className="flex-1 font-semibold">{actionSuccess}</span>
            <button
              onClick={() => setActionSuccess("")}
              className="text-emerald-600 font-bold hover:text-emerald-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= SUMMARY STATS ================= */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard
            title="Total Applications"
            value={totalApplications}
            icon={Users}
            iconStyle="bg-blue-50 text-blue-600"
          />
          <SummaryCard
            title="Shortlisted"
            value={shortlisted}
            icon={UserCheck}
            iconStyle="bg-violet-50 text-violet-600"
          />
          <SummaryCard
            title="Interviews"
            value={interviews}
            icon={Clock3}
            iconStyle="bg-amber-50 text-amber-600"
          />
          <SummaryCard
            title="Selected"
            value={selected}
            icon={CheckCircle2}
            iconStyle="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* ================= ADVANCED MULTI-FILTER TOOLBAR (Requirement 7) ================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
            <SlidersHorizontal size={14} className="text-blue-600" />
            <span>Applicant Filtering & Categorization</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student, role, email..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
              />
            </div>

            {/* Min CGPA Filter */}
            <div>
              <select
                value={minCgpaFilter}
                onChange={(e) => setMinCgpaFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="All">All CGPA</option>
                <option value="6.0">6.0+ CGPA</option>
                <option value="7.0">7.0+ CGPA</option>
                <option value="7.5">7.5+ CGPA</option>
                <option value="8.0">8.0+ CGPA</option>
                <option value="8.5">8.5+ CGPA</option>
                <option value="9.0">9.0+ CGPA</option>
              </select>
            </div>

            {/* Technical Skills Category Filter */}
            <div>
              <select
                value={skillCategoryFilter}
                onChange={(e) => setSkillCategoryFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="All">All Technical Skills</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Java Developer">Java Developer</option>
                <option value="Python Developer">Python Developer</option>
                <option value="AI/ML Developer">AI/ML Developer</option>
                <option value="Data Analyst">Data Analyst</option>
              </select>
            </div>

            {/* Branch Filter */}
            <div>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="All">All Branches</option>
                <option value="Computer Science">Computer Science</option>
                <option value="CSE AI & ML">CSE AI & ML</option>
                <option value="IT">IT</option>
                <option value="Other Branches">Other Branches</option>
              </select>
            </div>

            {/* Academic Year Filter */}
            <div>
              <select
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="All">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing <span className="font-bold text-slate-800">{filteredApplicants.length}</span> of {applications.length} applicants
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </section>

        {/* ================= APPLICANTS TABLE ================= */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              <p className="text-xs text-slate-400">Loading student applicants...</p>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Users size={21} className="text-slate-400" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-800">
                No applicants match your criteria
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {hasActiveFilters
                  ? "Try resetting or adjusting your filter selection."
                  : "No students have applied for your drives yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Candidate</th>
                    <th className="px-4 py-3.5">Branch & Year</th>
                    <th className="px-4 py-3.5">CGPA</th>
                    <th className="px-4 py-3.5">Role Applied</th>
                    <th className="px-4 py-3.5">Skills</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions & Decision</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredApplicants.map((app) => {
                    const student = app.student || {};
                    const user = student.userId || {};
                    const name = user.name || "Student Applicant";
                    const email = user.email || "N/A";
                    const academicYear = deriveAcademicYear(
                      student.academicYear,
                      student.graduationYear
                    );

                    return (
                      <tr key={app._id} className="hover:bg-slate-50/80 transition">
                        {/* Candidate Name & Email */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 text-xs">
                              {name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{name}</p>
                              <p className="text-[11px] text-slate-400">{email}</p>
                              {student.phone && (
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  {student.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Branch & Year */}
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800">
                            {student.branch || "General"}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {academicYear} ({student.graduationYear || 2027})
                          </p>
                        </td>

                        {/* CGPA */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-bold text-sm text-slate-900">
                            {student.cgpa !== undefined ? student.cgpa : "7.0"}
                          </span>
                        </td>

                        {/* Role Applied */}
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800">
                            {app.role || app.drive?.role || "Drive Role"}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                          </p>
                        </td>

                        {/* Skills */}
                        <td className="px-4 py-4 max-w-[180px]">
                          <div className="flex flex-wrap gap-1">
                            {student.skills && student.skills.length > 0 ? (
                              student.skills.slice(0, 3).map((sk, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700"
                                >
                                  {sk}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                None specified
                              </span>
                            )}
                            {student.skills && student.skills.length > 3 && (
                              <span className="text-[10px] text-slate-400">
                                +{student.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge status={app.status} />
                        </td>

                        {/* Actions & Decision */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* View Profile Modal */}
                            <button
                              type="button"
                              onClick={() => setProfileModal({ isOpen: true, app })}
                              title="View Full Profile & Resume"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Resume Download / View */}
                            {student.resume ? (
                              <a
                                href={getResumeUrl(student.resume)}
                                target="_blank"
                                rel="noreferrer"
                                title="Open Candidate Resume"
                                className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition"
                              >
                                <FileText size={15} />
                              </a>
                            ) : null}

                            {/* Status Decision Buttons */}
                            {app.status !== "Shortlisted" && app.status !== "Selected" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(app._id, "Shortlisted")}
                                title="Shortlist Candidate (Notifies Student)"
                                className="rounded-lg bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700 hover:bg-violet-100 transition cursor-pointer"
                              >
                                Shortlist
                              </button>
                            )}

                            {app.status === "Shortlisted" && (
                              <button
                                type="button"
                                onClick={() => handleOpenScheduleModal(app)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                              >
                                <CalendarDays size={12} />
                                Schedule
                              </button>
                            )}

                            {app.status !== "Selected" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(app._id, "Selected")}
                                title="Select Candidate for Offer (Notifies Student)"
                                className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                              >
                                Select
                              </button>
                            )}

                            {app.status !== "Rejected" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(app._id, "Rejected")}
                                title="Reject Application (Notifies Student)"
                                className="rounded-lg bg-red-50 px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 transition cursor-pointer"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* =========================================================
          PROFILE & RESUME PREVIEW MODAL
      ========================================================= */}
      {profileModal.isOpen && profileModal.app && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Candidate Profile Details
                </h3>
                <p className="text-xs text-slate-500">
                  Applied for {profileModal.app.role || profileModal.app.drive?.role}
                </p>
              </div>
              <button
                onClick={() => setProfileModal({ isOpen: false, app: null })}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {profileModal.app.student?.userId?.name || "Student"}
                    </h4>
                    <p className="text-slate-500">
                      {profileModal.app.student?.userId?.email || "N/A"}
                    </p>
                  </div>
                  <StatusBadge status={profileModal.app.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-slate-600">
                  <p><strong>Contact:</strong> {profileModal.app.student?.phone || "N/A"}</p>
                  <p><strong>CGPA:</strong> {profileModal.app.student?.cgpa || 7.0}</p>
                  <p><strong>Branch:</strong> {profileModal.app.student?.branch || "General"}</p>
                  <p><strong>Batch:</strong> {profileModal.app.student?.graduationYear || 2027}</p>
                </div>
              </div>

              <div>
                <span className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Technical Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profileModal.app.student?.skills?.map((sk, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resume Access */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} />
                  <div>
                    <p className="font-bold text-slate-800 text-xs">Student Resume</p>
                    <p className="text-[10px] text-slate-400">
                      {profileModal.app.student?.resumeOriginalName || "Resume Document"}
                    </p>
                  </div>
                </div>

                {profileModal.app.student?.resume ? (
                  <a
                    href={getResumeUrl(profileModal.app.student.resume)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-700"
                  >
                    View / Download <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">No resume uploaded</span>
                )}
              </div>

              {/* Quick Status Update in Modal */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-600">Update Decision:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(profileModal.app._id, "Shortlisted")}
                    className="rounded-lg bg-violet-50 px-2.5 py-1.5 font-bold text-violet-700 hover:bg-violet-100"
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(profileModal.app._id, "Selected")}
                    className="rounded-lg bg-emerald-50 px-2.5 py-1.5 font-bold text-emerald-700 hover:bg-emerald-100"
                  >
                    Select
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(profileModal.app._id, "Rejected")}
                    className="rounded-lg bg-red-50 px-2.5 py-1.5 font-bold text-red-700 hover:bg-red-100"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedAppForInterview(null);
        }}
        application={selectedAppForInterview}
        onSuccess={() => {
          fetchApplications();
        }}
      />
    </div>
  );
};

const SummaryCard = ({ title, value, icon: Icon, iconStyle }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  let style = "bg-slate-50 text-slate-700 border-slate-200";
  let icon = null;

  switch (status) {
    case "Shortlisted":
      style = "bg-violet-50 text-violet-700 border-violet-200";
      icon = <UserCheck size={11} />;
      break;
    case "Interview":
      style = "bg-blue-50 text-blue-700 border-blue-200";
      icon = <Clock3 size={11} />;
      break;
    case "Selected":
      style = "bg-emerald-50 text-emerald-700 border-emerald-200";
      icon = <CheckCircle2 size={11} />;
      break;
    case "Rejected":
      style = "bg-red-50 text-red-700 border-red-200";
      icon = <XCircle size={11} />;
      break;
    case "Under Review":
      style = "bg-amber-50 text-amber-700 border-amber-200";
      icon = <Clock3 size={11} />;
      break;
    default:
      style = "bg-slate-50 text-slate-700 border-slate-200";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${style}`}
    >
      {icon}
      {status || "Applied"}
    </span>
  );
};

export default CompanyApplicants;
