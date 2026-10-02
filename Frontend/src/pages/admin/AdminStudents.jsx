import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { adminAPI } from "../../services/api";
import {
  GraduationCap,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Award,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);
  const [availablePassingYears, setAvailablePassingYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedPassingYear, setSelectedPassingYear] = useState("All");
  const [selectedCgpaFilter, setSelectedCgpaFilter] = useState("All");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminAPI.getStudents();
      if (res.data?.success && res.data?.students) {
        setStudents(res.data.students);
        if (res.data.availableBranches) {
          setAvailableBranches(res.data.availableBranches);
        }
        if (res.data.availablePassingYears) {
          setAvailablePassingYears(res.data.availablePassingYears);
        }
      } else {
        setError(res.data?.message || "Failed to load registered students.");
      }
    } catch (err) {
      console.error("Fetch students error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load students. Please check your admin connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering for fast, responsive UX
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = s.name?.toLowerCase().includes(q);
        const matchesEmail = s.email?.toLowerCase().includes(q);
        const matchesPhone = s.phone?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      // 2. Branch filter
      if (selectedBranch !== "All") {
        if (s.branch?.toLowerCase() !== selectedBranch.toLowerCase()) {
          return false;
        }
      }

      // 3. Passing Year filter
      if (selectedPassingYear !== "All") {
        if (String(s.graduationYear) !== String(selectedPassingYear)) {
          return false;
        }
      }

      // 4. CGPA filter
      const cgpa = Number(s.cgpa) || 0;
      if (selectedCgpaFilter === "below6" && cgpa >= 6.0) {
        return false;
      }
      if (selectedCgpaFilter === "6to7" && (cgpa < 6.0 || cgpa >= 7.0)) {
        return false;
      }
      if (selectedCgpaFilter === "7to8" && (cgpa < 7.0 || cgpa >= 8.0)) {
        return false;
      }
      if (selectedCgpaFilter === "above8" && cgpa < 8.0) {
        return false;
      }

      return true;
    });
  }, [
    students,
    searchQuery,
    selectedBranch,
    selectedPassingYear,
    selectedCgpaFilter,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBranch("All");
    setSelectedPassingYear("All");
    setSelectedCgpaFilter("All");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedBranch !== "All" ||
    selectedPassingYear !== "All" ||
    selectedCgpaFilter !== "All";

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
                Student Directory
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Registered Students
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Manage student candidates, track placement progress, and inspect verified profiles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              Total Enrolled: <span className="font-bold text-blue-600">{students.length}</span>
            </span>
            <button
              type="button"
              onClick={fetchStudents}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            {/* Search Input */}
            <div className="relative md:col-span-5">
              <Search
                size={16}
                className="absolute left-3.5 top-3 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name or email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Branch Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Branches</option>
                {availableBranches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Passing Year Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedPassingYear}
                onChange={(e) => setSelectedPassingYear(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Batches</option>
                {availablePassingYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Batch {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* CGPA Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedCgpaFilter}
                onChange={(e) => setSelectedCgpaFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All CGPA</option>
                <option value="above8">8.0 and above</option>
                <option value="7to8">7.0 – 8.0</option>
                <option value="6to7">6.0 – 7.0</option>
                <option value="below6">Below 6.0</option>
              </select>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-2">
                <span>
                  Showing <strong className="text-slate-900">{filteredStudents.length}</strong> of {students.length} students
                </span>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <X size={13} />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <div className="flex-1 font-medium">{error}</div>
            <button
              onClick={fetchStudents}
              className="rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content Display: Loading, Empty, or Table */}
        {loading ? (
          <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
            <p className="text-xs font-medium text-slate-500">
              Loading student roster from database...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <GraduationCap size={28} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              No students found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {hasActiveFilters
                ? "No student records match your current filter settings. Try adjusting search criteria or clearing filters."
                : "No registered students found in the college portal."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Contact</th>
                    <th className="px-4 py-3.5">Branch & Course</th>
                    <th className="px-4 py-3.5 text-center">Batch</th>
                    <th className="px-4 py-3.5 text-center">CGPA</th>
                    <th className="px-4 py-3.5 text-center">Applications</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => (
                    <tr
                      key={s._id}
                      className="hover:bg-slate-50/60 transition group"
                    >
                      {/* Name & Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600 shadow-sm">
                            {s.name
                              ? s.name
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
                              {s.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {s.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Phone size={13} className="text-slate-400 shrink-0" />
                          <span>{s.phone || "Not set"}</span>
                        </div>
                      </td>

                      {/* Branch & Course */}
                      <td className="px-4 py-4">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {s.branch}
                        </span>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {s.course}
                        </p>
                      </td>

                      {/* Batch */}
                      <td className="px-4 py-4 text-center font-semibold text-slate-700">
                        {s.graduationYear || "2027"}
                      </td>

                      {/* CGPA */}
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                            Number(s.cgpa) >= 8.0
                              ? "bg-emerald-50 text-emerald-700"
                              : Number(s.cgpa) >= 7.0
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {Number(s.cgpa).toFixed(2)}
                        </span>
                      </td>

                      {/* Applications */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          <FileText size={11} className="text-slate-400" />
                          {s.applicationsCount}
                        </span>
                      </td>

                      {/* Profile Status */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {s.profileStatus || "Active"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/admin/students/${s._id}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition shadow-sm"
                        >
                          <Eye size={13} />
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {filteredStudents.map((s) => (
                <div
                  key={s._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600">
                        {s.name
                          ? s.name
                              .split(" ")
                              .filter(Boolean)
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          : "ST"}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {s.name}
                        </h3>
                        <p className="text-xs text-slate-400">{s.email}</p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Branch
                      </span>
                      <p className="font-semibold text-slate-800">{s.branch}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Batch
                      </span>
                      <p className="font-semibold text-slate-800">
                        {s.graduationYear}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        CGPA
                      </span>
                      <p className="font-bold text-blue-600">
                        {Number(s.cgpa).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Applications
                      </span>
                      <p className="font-bold text-slate-800">
                        {s.applicationsCount}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" />
                      {s.phone || "No phone"}
                    </span>
                    <Link
                      to={`/admin/students/${s._id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                    >
                      <Eye size={13} />
                      View Profile
                    </Link>
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

export default AdminStudents;
