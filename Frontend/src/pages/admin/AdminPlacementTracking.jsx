import { useState, useEffect } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { roundTrackingAPI } from "../../services/api";
import {
  Users,
  Search,
  Filter,
  Download,
  Building2,
  BriefcaseBusiness,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ChevronRight,
  ExternalLink,
  Loader2,
  AlertCircle,
  Sparkles,
  Calendar,
  X,
  FileText,
  TrendingUp,
  UserCheck,
} from "lucide-react";

const AdminPlacementTracking = () => {
  const [trackingData, setTrackingData] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalApplied: 0,
    totalShortlisted: 0,
    inRound1: 0,
    inRound2: 0,
    inRound3: 0,
    inHrInterview: 0,
    selected: 0,
    rejected: 0,
    awaitingResults: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters (Requirement 4)
  const [graduationYear, setGraduationYear] = useState("2027");
  const [academicYear, setAcademicYear] = useState("All");
  const [branch, setBranch] = useState("All");
  const [companyId, setCompanyId] = useState("All");
  const [driveId, setDriveId] = useState("All");
  const [role, setRole] = useState("All");
  const [currentRound, setCurrentRound] = useState("All");
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  // Filter options
  const [availableYears, setAvailableYears] = useState([2025, 2026, 2027, 2028]);
  const [availableBranches, setAvailableBranches] = useState([]);
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableDrives, setAvailableDrives] = useState([]);

  // Student Journey Modal
  const [journeyModal, setJourneyModal] = useState({
    isOpen: false,
    studentId: null,
    student: null,
    journeys: [],
    loading: false,
  });

  const [exporting, setExporting] = useState(false);

  // Resume URL Helper
  const getResumeUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");
    return `${baseUrl}/uploads/resumes/${url}`;
  };

  useEffect(() => {
    fetchTrackingData();
  }, [graduationYear, academicYear, branch, companyId, driveId, role, currentRound, status]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        graduationYear,
        academicYear,
        branch,
        companyId,
        driveId,
        role,
        currentRound,
        status,
        search,
      };

      const res = await roundTrackingAPI.getAdminTracking(params);
      if (res.data?.success) {
        setTrackingData(res.data.tracking || []);
        if (res.data.stats) setStats(res.data.stats);
        if (res.data.availableGraduationYears)
          setAvailableYears(res.data.availableGraduationYears);
        if (res.data.availableBranches)
          setAvailableBranches(res.data.availableBranches);
        if (res.data.availableCompanies)
          setAvailableCompanies(res.data.availableCompanies);
        if (res.data.availableDrives)
          setAvailableDrives(res.data.availableDrives);
      }
    } catch (err) {
      console.error("Fetch tracking error:", err);
      setError(
        err.response?.data?.message || "Failed to load placement tracking data."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTrackingData();
  };

  // Open Student Journey Modal
  const handleOpenJourneyModal = async (studentId) => {
    setJourneyModal({
      isOpen: true,
      studentId,
      student: null,
      journeys: [],
      loading: true,
    });

    try {
      const res = await roundTrackingAPI.getAdminStudentJourney(studentId);
      if (res.data?.success) {
        setJourneyModal({
          isOpen: true,
          studentId,
          student: res.data.student,
          journeys: res.data.journeys || [],
          loading: false,
        });
      }
    } catch (err) {
      console.error("Fetch student journey modal error:", err);
      setJourneyModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const params = {
        graduationYear,
        branch,
        status,
      };

      const res = await roundTrackingAPI.exportAdminTrackingCSV(params);
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Placement_Tracking_${graduationYear}_Batch.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export CSV error:", err);
      alert("Failed to export tracking records.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Page Header Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                <Sparkles size={14} />
                <span>Centralized Campus Placement Tracking</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Placement Tracking & Analytics
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Monitor real-time candidate progression through online tests, technical interviews, and final offers across cohorts.
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={exporting || trackingData.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
            >
              <Download size={14} />
              {exporting ? "Exporting CSV..." : "Export Cohort Report (CSV)"}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Real-time Analytics Cards (Requirement 5) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Total Cohort Students
            </span>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {stats.totalStudents}
            </p>
            <span className="text-[10px] text-slate-400">
              Batch of {graduationYear}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Total Applied
            </span>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {stats.totalApplied}
            </p>
            <span className="text-[10px] text-blue-500 font-semibold">
              Active Job Seekers
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Shortlisted Candidates
            </span>
            <p className="mt-1 text-2xl font-bold text-indigo-600">
              {stats.totalShortlisted}
            </p>
            <span className="text-[10px] text-indigo-500">
              Cleared screening
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Finally Selected
            </span>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {stats.selected}
            </p>
            <span className="text-[10px] text-emerald-600 font-bold">
              Offer Recipients 🎉
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              In Interview Rounds
            </span>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {stats.inRound2 + stats.inRound3 + stats.inHrInterview}
            </p>
            <span className="text-[10px] text-amber-600">
              R2: {stats.inRound2} • R3: {stats.inRound3} • HR: {stats.inHrInterview}
            </span>
          </div>
        </div>

        {/* Filter Controls Bar (Requirement 4) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold text-slate-700">
            <Filter size={15} className="text-blue-600" />
            <span>Filter Cohort & Placement Drives</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Graduation Year (MOST IMPORTANT REQUIREMENT) */}
            <div>
              <label className="block font-bold text-blue-900 mb-1">
                Graduation Year:
              </label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full rounded-xl border-2 border-blue-200 bg-blue-50/50 px-3 py-2 font-bold text-blue-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="All">All Years</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Graduation Year {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Branch:
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Branches</option>
                {availableBranches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Company */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Company:
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Companies</option>
                {availableCompanies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Overall Status */}
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Placement Status:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Placed / Selected">Placed / Selected</option>
                <option value="In Progress">In Progress</option>
                <option value="Applied">Applied</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by student name, roll number, email, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Student Records Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Gathering cohort progression records...
            </p>
          </div>
        ) : trackingData.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <Users size={36} className="text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-800">
              No Students Matching Filters
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              Try adjusting your graduation year or branch filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Roll No.</th>
                    <th className="px-4 py-3.5">Branch / Year</th>
                    <th className="px-4 py-3.5 text-center">CGPA</th>
                    <th className="px-4 py-3.5">Applied Companies & Rounds</th>
                    <th className="px-4 py-3.5 text-center">Overall Status</th>
                    <th className="px-5 py-3.5 text-right">Placement Journey</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trackingData.map((s) => (
                    <tr
                      key={s._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Student info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700">
                            {s.name
                              ? s.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()
                              : "ST"}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleOpenJourneyModal(s._id)}
                              className="font-bold text-slate-900 hover:text-blue-600 transition text-left cursor-pointer"
                            >
                              {s.name}
                            </button>
                            <p className="text-[11px] text-slate-400">
                              {s.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Roll number */}
                      <td className="px-4 py-4 font-mono font-medium text-slate-600">
                        {s.rollNumber}
                      </td>

                      {/* Branch & Year */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-700 block">
                          {s.branch}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Class of {s.graduationYear}
                        </span>
                      </td>

                      {/* CGPA */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                          {Number(s.cgpa).toFixed(2)}
                        </span>
                      </td>

                      {/* Applied Companies & Rounds */}
                      <td className="px-4 py-4">
                        {s.appliedDrives.length === 0 ? (
                          <span className="text-slate-400 text-[11px] italic">
                            No active applications
                          </span>
                        ) : (
                          <div className="space-y-1.5 max-w-xs">
                            {s.appliedDrives.map((d, dIdx) => (
                              <div
                                key={dIdx}
                                className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] border border-slate-100"
                              >
                                <span className="font-bold text-slate-800 truncate">
                                  {d.companyName}
                                </span>
                                <span
                                  className={`rounded px-1.5 py-0.2 text-[10px] font-semibold truncate ${
                                    d.latestResult === "Cleared"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : d.latestResult === "Selected"
                                      ? "bg-purple-100 text-purple-800"
                                      : d.latestResult === "Rejected"
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {d.currentRoundName} • {d.latestResult}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Overall Placement Status */}
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            s.overallStatus === "Placed / Selected"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : s.overallStatus === "In Progress"
                              ? "bg-emerald-100 text-emerald-800"
                              : s.overallStatus === "Rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {s.overallStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenJourneyModal(s._id)}
                          className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm cursor-pointer"
                        >
                          View Journey
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: Full Student Placement Journey across All Companies */}
        {journeyModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/70">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {journeyModal.student?.name || "Candidate Placement Journey"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {journeyModal.student?.email} • Roll:{" "}
                    {journeyModal.student?.rollNumber} • {journeyModal.student?.branch} (
                    {journeyModal.student?.graduationYear})
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setJourneyModal({
                      isOpen: false,
                      studentId: null,
                      student: null,
                      journeys: [],
                      loading: false,
                    })
                  }
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {journeyModal.loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 size={28} className="animate-spin text-blue-600" />
                    <p className="mt-2 text-xs text-slate-500">
                      Loading comprehensive placement timeline...
                    </p>
                  </div>
                ) : journeyModal.journeys.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-8">
                    No applications recorded for this student.
                  </p>
                ) : (
                  journeyModal.journeys.map((j, jIdx) => (
                    <div
                      key={jIdx}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {j.companyName}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {j.role} • Package: {j.package}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            j.overallStatus === "Selected"
                              ? "bg-purple-100 text-purple-700"
                              : j.overallStatus === "Rejected"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {j.overallStatus}
                        </span>
                      </div>

                      {/* Timeline Nodes */}
                      <div className="relative pl-6 space-y-4 before:absolute before:bottom-2 before:top-2 before:left-2.5 before:w-0.5 before:bg-slate-200">
                        {j.timeline.map((step, sIdx) => {
                          const isCleared =
                            step.status === "Cleared" || step.status === "Selected";
                          const isRejected =
                            step.status === "Rejected" || step.status === "Not Selected";

                          return (
                            <div key={sIdx} className="relative">
                              <div
                                className={`absolute -left-[27px] flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                                  isCleared
                                    ? "bg-emerald-500 text-white"
                                    : isRejected
                                    ? "bg-rose-500 text-white"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {isCleared ? "✓" : isRejected ? "✕" : step.step}
                              </div>

                              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-800">
                                    {step.title}
                                  </span>
                                  <span
                                    className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                      isCleared
                                        ? "text-emerald-700 bg-emerald-50"
                                        : isRejected
                                        ? "text-rose-700 bg-rose-50"
                                        : "text-slate-500 bg-slate-100"
                                    }`}
                                  >
                                    {step.status}
                                  </span>
                                </div>

                                {step.instructions && (
                                  <p className="mt-1 text-[11px] text-slate-500">
                                    Instructions: {step.instructions}
                                  </p>
                                )}

                                {step.feedback && (
                                  <p className="mt-1 text-[11px] text-slate-600 italic">
                                    Feedback: "{step.feedback}"
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end p-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() =>
                    setJourneyModal({
                      isOpen: false,
                      studentId: null,
                      student: null,
                      journeys: [],
                      loading: false,
                    })
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPlacementTracking;
