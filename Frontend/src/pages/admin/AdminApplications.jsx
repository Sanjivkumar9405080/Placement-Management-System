import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { adminAPI } from "../../services/api";
import {
  FileText,
  Search,
  Filter,
  Eye,
  Building2,
  Briefcase,
  GraduationCap,
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  RefreshCw,
  Award,
  Users,
} from "lucide-react";

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    underReview: 0,
    shortlisted: 0,
    interview: 0,
    selected: 0,
    rejected: 0,
  });
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableDrives, setAvailableDrives] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCompanyId, setSelectedCompanyId] = useState("All");
  const [selectedDriveId, setSelectedDriveId] = useState("All");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminAPI.getAdminApplications();
      if (res.data?.success && res.data?.applications) {
        setApplications(res.data.applications);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (res.data.availableCompanies) {
          setAvailableCompanies(res.data.availableCompanies);
        }
        if (res.data.availableDrives) {
          setAvailableDrives(res.data.availableDrives);
        }
      } else {
        setError(res.data?.message || "Failed to load placement applications.");
      }
    } catch (err) {
      console.error("Fetch applications error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load applications. Please check your network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering for ultra-fast, seamless UI
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // 1. Search filter: Student Name, Email, Company Name, Role
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = app.studentName?.toLowerCase().includes(q);
        const matchesEmail = app.studentEmail?.toLowerCase().includes(q);
        const matchesCompany = app.companyName?.toLowerCase().includes(q);
        const matchesRole = app.role?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesCompany && !matchesRole) {
          return false;
        }
      }

      // 2. Status filter
      if (selectedStatus !== "All") {
        if (app.status?.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      // 3. Company filter
      if (selectedCompanyId !== "All") {
        if (app.companyId !== selectedCompanyId) {
          return false;
        }
      }

      // 4. Drive filter (by actual Drive ID)
      if (selectedDriveId !== "All") {
        if (app.driveId !== selectedDriveId) {
          return false;
        }
      }

      return true;
    });
  }, [
    applications,
    searchQuery,
    selectedStatus,
    selectedCompanyId,
    selectedDriveId,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
    setSelectedCompanyId("All");
    setSelectedDriveId("All");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedStatus !== "All" ||
    selectedCompanyId !== "All" ||
    selectedDriveId !== "All";

  // Filter drives in dropdown based on selected company if any
  const drivesForDropdown = useMemo(() => {
    if (selectedCompanyId === "All") return availableDrives;
    return availableDrives.filter((d) => d.companyId === selectedCompanyId);
  }, [availableDrives, selectedCompanyId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Application Pipeline
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Student Applications
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Monitor candidate submissions across all campus recruitment drives, review application pipelines, and track interview statuses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              Total Submissions:{" "}
              <span className="font-bold text-blue-600">{applications.length}</span>
            </span>
            <button
              type="button"
              onClick={fetchApplications}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin text-blue-600" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Summary KPI Cards (Requirement 14) */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Total Applications
            </span>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {stats.total}
            </p>
            <span className="text-[10px] text-slate-400">All submissions</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Applied
            </span>
            <p className="mt-1 text-2xl font-bold text-slate-700">
              {stats.applied}
            </p>
            <span className="text-[10px] text-slate-400">New submissions</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Under Review
            </span>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {stats.underReview}
            </p>
            <span className="text-[10px] text-amber-600">Screening</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Shortlisted
            </span>
            <p className="mt-1 text-2xl font-bold text-indigo-600">
              {stats.shortlisted}
            </p>
            <span className="text-[10px] text-indigo-500">Qualified</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Interview
            </span>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {stats.interview}
            </p>
            <span className="text-[10px] text-blue-500">In interview</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Selected
            </span>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {stats.selected}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">
              Final offers
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Rejected
            </span>
            <p className="mt-1 text-2xl font-bold text-rose-600">
              {stats.rejected}
            </p>
            <span className="text-[10px] text-rose-500">Not selected</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 shadow-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span className="flex-1">{error}</span>
            <button
              onClick={fetchApplications}
              className="font-bold underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search & Multi-Level Filters Toolbar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            {/* Search Input */}
            <div className="relative md:col-span-4">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student, email, company, or role..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter by Status */}
            <div className="md:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              >
                <option value="All">All Application Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Filter by Company */}
            <div className="md:col-span-2">
              <select
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value);
                  setSelectedDriveId("All"); // Reset drive filter when company changes
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              >
                <option value="All">All Companies</option>
                {availableCompanies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Drive (by Drive ID) */}
            <div className="md:col-span-3">
              <select
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              >
                <option value="All">All Placement Drives</option>
                {drivesForDropdown.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.role} ({d.companyName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Status Summary & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={13} className="text-slate-400" />
              <span>
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {filteredApplications.length}
                </span>{" "}
                of {applications.length} applications
              </span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Section: Table for Desktop, Cards for Mobile */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Loading applications from database...
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileText size={24} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No Applications Found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {hasActiveFilters
                ? "No applications matched your current search and filter criteria."
                : "No students have submitted applications yet."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3.5">Student</th>
                      <th className="px-4 py-3.5">Branch</th>
                      <th className="px-4 py-3.5 text-center">CGPA</th>
                      <th className="px-4 py-3.5">Company</th>
                      <th className="px-4 py-3.5">Role</th>
                      <th className="px-4 py-3.5">Applied Date</th>
                      <th className="px-4 py-3.5 text-center">Application Status</th>
                      <th className="px-4 py-3.5 text-center">Interview Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredApplications.map((app) => (
                      <tr
                        key={app._id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Student Name & Avatar */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700 shadow-sm">
                              {app.studentName
                                ? app.studentName
                                    .split(" ")
                                    .filter(Boolean)
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()
                                : "ST"}
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/admin/applications/${app._id}`}
                                className="font-bold text-slate-900 hover:text-blue-600 transition truncate block"
                              >
                                {app.studentName}
                              </Link>
                              <p className="text-[11px] text-slate-400 truncate">
                                {app.studentEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Student Branch */}
                        <td className="px-4 py-4">
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                            {app.studentBranch}
                          </span>
                        </td>

                        {/* CGPA */}
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                              Number(app.studentCgpa) >= 8.0
                                ? "bg-emerald-50 text-emerald-700"
                                : Number(app.studentCgpa) >= 7.0
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {Number(app.studentCgpa).toFixed(2)}
                          </span>
                        </td>

                        {/* Company */}
                        <td className="px-4 py-4">
                          <span className="font-semibold text-slate-800 block truncate">
                            {app.companyName}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {app.companyIndustry}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-4 font-semibold text-slate-800">
                          {app.role}
                        </td>

                        {/* Applied Date */}
                        <td className="px-4 py-4 text-slate-600">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>

                        {/* Application Status */}
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              app.status === "Selected"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : app.status === "Shortlisted"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : app.status === "Interview"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : app.status === "Under Review"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : app.status === "Rejected"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>

                        {/* Interview Status */}
                        <td className="px-4 py-4 text-center">
                          {app.interview ? (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                app.interview.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : app.interview.status === "Cancelled"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              <CalendarCheck size={10} />
                              {app.interview.status}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              No interview scheduled
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/admin/applications/${app._id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
                            >
                              <Eye size={12} />
                              <span>Details</span>
                            </Link>

                            {app.studentId && (
                              <Link
                                to={`/admin/students/${app.studentId}`}
                                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                              >
                                <span>Student</span>
                              </Link>
                            )}

                            {app.driveId && (
                              <Link
                                to={`/admin/drives/${app.driveId}`}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                              >
                                <span>Drive</span>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Responsive Cards */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {filteredApplications.map((app) => (
                <div
                  key={app._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700 shadow-sm">
                        {app.studentName
                          ? app.studentName.slice(0, 2).toUpperCase()
                          : "ST"}
                      </div>
                      <div>
                        <Link
                          to={`/admin/applications/${app._id}`}
                          className="text-sm font-bold text-slate-900 hover:text-blue-600 transition"
                        >
                          {app.studentName}
                        </Link>
                        <p className="text-[11px] text-slate-400">
                          {app.studentBranch} • CGPA {Number(app.studentCgpa).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        app.status === "Selected"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : app.status === "Shortlisted"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : app.status === "Interview"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : app.status === "Under Review"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : app.status === "Rejected"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-2.5">
                    <div>
                      <span className="text-[11px] text-slate-400 block">
                        Company
                      </span>
                      <span className="font-semibold text-slate-800">
                        {app.companyName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">
                        Role
                      </span>
                      <span className="font-bold text-slate-800">
                        {app.role}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">
                        Applied Date
                      </span>
                      <span className="text-slate-600">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">
                        Interview
                      </span>
                      <span className="text-slate-700 font-semibold">
                        {app.interview ? app.interview.status : "No interview"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to={`/admin/applications/${app._id}`}
                      className="flex-1 text-center rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 shadow-sm"
                    >
                      Details
                    </Link>
                    {app.studentId && (
                      <Link
                        to={`/admin/students/${app.studentId}`}
                        className="flex-1 text-center rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-700"
                      >
                        Student
                      </Link>
                    )}
                    {app.driveId && (
                      <Link
                        to={`/admin/drives/${app.driveId}`}
                        className="flex-1 text-center rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-700"
                      >
                        Drive
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminApplications;
