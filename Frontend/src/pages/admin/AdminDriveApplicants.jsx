import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { adminAPI } from "../../services/api";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Eye,
  Building2,
  Briefcase,
  GraduationCap,
  CalendarDays,
  FileText,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  Mail,
  Phone,
  RefreshCw,
} from "lucide-react";

const AdminDriveApplicants = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    fetchApplicants();
  }, [id]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminAPI.getAdminDriveApplicants(id);
      if (res.data?.success) {
        setData(res.data);
      } else {
        setError(res.data?.message || "Failed to load drive applicants.");
      }
    } catch (err) {
      console.error("Fetch applicants error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load drive applicants. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const applicants = data?.applicants || [];
  const drive = data?.drive;

  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      // 1. Search filter: Student Name, Email, or Branch
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = app.studentName?.toLowerCase().includes(q);
        const matchesEmail = app.email?.toLowerCase().includes(q);
        const matchesBranch = app.branch?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesBranch) {
          return false;
        }
      }

      // 2. Status filter
      if (selectedStatus !== "All") {
        if (app.status?.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [applicants, searchQuery, selectedStatus]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
  };

  const hasActiveFilters = searchQuery.trim() !== "" || selectedStatus !== "All";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNavbar />
        <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center">
          <Loader2 size={36} className="animate-spin text-blue-600" />
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Loading candidate applicants for this drive...
          </p>
        </div>
      </div>
    );
  }

  if (error || !drive) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNavbar />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Applicants Not Found
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {error || "Could not retrieve applicant records for this placement drive."}
            </p>
            <div className="pt-2">
              <Link
                to="/admin/drives"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
              >
                <ArrowLeft size={14} />
                <span>Return to Placement Drives</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                to={`/admin/drives/${id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
              >
                <ArrowLeft size={13} />
                <span>Drive Details</span>
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-blue-600">
                Applicants
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {drive.role}
              </h1>
              <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                {drive.companyName}
              </span>
              <span className="rounded-lg bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                {drive.package}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Students who applied specifically to this placement drive. Click [View Student] to view full academic profile.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              Total Applicants:{" "}
              <span className="font-bold text-blue-600">{applicants.length}</span>
            </span>
            <button
              type="button"
              onClick={fetchApplicants}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            {/* Search Input */}
            <div className="relative md:col-span-8">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates by student name, email, or branch..."
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

            {/* Status Filter */}
            <div className="md:col-span-4">
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
          </div>

          {/* Filter Status Summary & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={13} className="text-slate-400" />
              <span>
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {filteredApplicants.length}
                </span>{" "}
                of {applicants.length} candidates
              </span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Section: Table for Desktop, Cards for Mobile */}
        {filteredApplicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Users size={24} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No Applicants Found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {hasActiveFilters
                ? "No candidates matched your search or status filter."
                : "No students have applied to this placement drive yet."}
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
                      <th className="px-5 py-3.5">Student Name</th>
                      <th className="px-4 py-3.5">Branch & Course</th>
                      <th className="px-4 py-3.5 text-center">CGPA</th>
                      <th className="px-4 py-3.5">Applied Date</th>
                      <th className="px-4 py-3.5 text-center">Application Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredApplicants.map((app) => (
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
                              <p className="font-bold text-slate-900 truncate">
                                {app.studentName}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {app.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Branch & Course */}
                        <td className="px-4 py-4">
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                            {app.branch}
                          </span>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {app.course}
                          </p>
                        </td>

                        {/* CGPA */}
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                              Number(app.cgpa) >= 8.0
                                ? "bg-emerald-50 text-emerald-700"
                                : Number(app.cgpa) >= 7.0
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {Number(app.cgpa).toFixed(2)}
                          </span>
                        </td>

                        {/* Applied Date */}
                        <td className="px-4 py-4 text-slate-600">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              app.status === "Selected"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : app.status === "Shortlisted"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : app.status === "Interview"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : app.status === "Rejected"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          {app.studentId ? (
                            <Link
                              to={`/admin/students/${app.studentId}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
                            >
                              <Eye size={13} />
                              <span>View Student</span>
                            </Link>
                          ) : (
                            <span className="text-slate-400 italic">
                              Profile Unavailable
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {filteredApplicants.map((app) => (
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
                        <h3 className="text-sm font-bold text-slate-900">
                          {app.studentName}
                        </h3>
                        <p className="text-[11px] text-slate-400">{app.email}</p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        app.status === "Selected"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : app.status === "Shortlisted"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : app.status === "Interview"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : app.status === "Rejected"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-2.5">
                    <div>
                      <span className="text-[11px] text-slate-400 block">
                        Branch
                      </span>
                      <span className="font-semibold text-slate-700">
                        {app.branch}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">
                        CGPA
                      </span>
                      <span className="font-bold text-slate-800">
                        {Number(app.cgpa).toFixed(2)}
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 text-[11px] text-slate-500">
                      Applied on:{" "}
                      <strong>
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-1">
                    {app.studentId && (
                      <Link
                        to={`/admin/students/${app.studentId}`}
                        className="block w-full text-center rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                      >
                        View Student Profile
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

export default AdminDriveApplicants;
