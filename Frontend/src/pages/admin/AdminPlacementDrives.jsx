import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { adminAPI } from "../../services/api";
import {
  Briefcase,
  Search,
  Filter,
  Eye,
  Users,
  Power,
  RefreshCw,
  Building2,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  Award,
} from "lucide-react";

const AdminPlacementDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [availableCompanies, setAvailableCompanies] = useState([]);

  // Close drive modal state
  const [closeModal, setCloseModal] = useState({
    isOpen: false,
    drive: null,
    submitting: false,
  });

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminAPI.getAdminPlacementDrives();
      if (res.data?.success && res.data?.drives) {
        setDrives(res.data.drives);
        if (res.data.availableCompanies) {
          setAvailableCompanies(res.data.availableCompanies);
        }
      } else {
        setError(res.data?.message || "Failed to load placement drives.");
      }
    } catch (err) {
      console.error("Fetch drives error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load placement drives. Please check your network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDrive = async () => {
    if (!closeModal.drive) return;

    try {
      setCloseModal((prev) => ({ ...prev, submitting: true }));
      const res = await adminAPI.closeAdminPlacementDrive(closeModal.drive._id);
      if (res.data?.success) {
        // Update local state immediately
        setDrives((prev) =>
          prev.map((d) =>
            d._id === closeModal.drive._id ? { ...d, status: "Closed" } : d
          )
        );
        setCloseModal({ isOpen: false, drive: null, submitting: false });
      }
    } catch (err) {
      console.error("Close drive error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to close placement drive. Please try again."
      );
      setCloseModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      // 1. Search filter: Company Name or Role
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesCompany = d.companyName?.toLowerCase().includes(q);
        const matchesRole = d.role?.toLowerCase().includes(q);
        if (!matchesCompany && !matchesRole) {
          return false;
        }
      }

      // 2. Status filter
      if (selectedStatus !== "All") {
        if (d.status?.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      // 3. Company filter
      if (selectedCompany !== "All") {
        if (d.companyName?.toLowerCase() !== selectedCompany.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [drives, searchQuery, selectedStatus, selectedCompany]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("All");
    setSelectedCompany("All");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedStatus !== "All" ||
    selectedCompany !== "All";

  // Quick stats
  const activeCount = drives.filter((d) => d.status === "Active").length;
  const closedCount = drives.filter((d) => d.status === "Closed").length;
  const completedCount = drives.filter((d) => d.status === "Completed").length;
  const totalApplicantsAll = drives.reduce(
    (acc, curr) => acc + (curr.applicantsCount || 0),
    0
  );

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
                Campus Recruitment
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Placement Drives
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Oversee campus recruitment events across all partner companies, track candidate applications, and close drives.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              Total Drives:{" "}
              <span className="font-bold text-blue-600">{drives.length}</span>
            </span>
            <button
              type="button"
              onClick={fetchDrives}
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

        {/* Quick KPI Overview Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Total Drives
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Briefcase size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {drives.length}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Across all recruiting partners
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Active Drives
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {activeCount}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Open for student applications
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Closed Drives
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Clock size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-700">
              {closedCount}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Application window ended
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Total Applicants
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-indigo-600">
              {totalApplicantsAll}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Submissions across all roles
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 shadow-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span className="flex-1">{error}</span>
            <button
              onClick={fetchDrives}
              className="font-bold underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            {/* Search Input */}
            <div className="relative md:col-span-6">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company name or job role..."
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
            <div className="md:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Company Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              >
                <option value="All">All Companies</option>
                {availableCompanies.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
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
                  {filteredDrives.length}
                </span>{" "}
                of {drives.length} placement drives
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
              Loading placement drives from database...
            </p>
          </div>
        ) : filteredDrives.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Briefcase size={24} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No Placement Drives Found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {hasActiveFilters
                ? "No placement drives matched your current search and filter criteria."
                : "No corporate recruitment drives have been created yet."}
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
                      <th className="px-5 py-3.5">Company</th>
                      <th className="px-4 py-3.5">Role</th>
                      <th className="px-4 py-3.5">Package</th>
                      <th className="px-4 py-3.5">Drive Date</th>
                      <th className="px-4 py-3.5">Deadline</th>
                      <th className="px-4 py-3.5 text-center">Applicants</th>
                      <th className="px-4 py-3.5 text-center">Shortlisted</th>
                      <th className="px-4 py-3.5 text-center">Selected</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredDrives.map((d) => {
                      const isDriveActive = d.status === "Active";
                      const deadlinePassed =
                        d.applicationDeadline &&
                        new Date(d.applicationDeadline) < new Date();

                      return (
                        <tr
                          key={d._id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          {/* Company Name & Monogram */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700 shadow-sm border border-blue-100">
                                {d.companyLogo ? (
                                  <img
                                    src={d.companyLogo}
                                    alt={d.companyName}
                                    className="h-full w-full rounded-xl object-cover"
                                  />
                                ) : d.companyName ? (
                                  d.companyName.slice(0, 2).toUpperCase()
                                ) : (
                                  "CP"
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 block truncate">
                                  {d.companyName}
                                </span>
                                <span className="text-[11px] text-slate-400 block truncate">
                                  {d.location || "Campus"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-4 py-4 font-semibold text-slate-800">
                            {d.role}
                          </td>

                          {/* Package */}
                          <td className="px-4 py-4 font-bold text-emerald-600">
                            {d.package}
                          </td>

                          {/* Drive Date */}
                          <td className="px-4 py-4 text-slate-600">
                            {d.driveDate ? (
                              new Date(d.driveDate).toLocaleDateString()
                            ) : (
                              <span className="text-slate-400 italic">TBD</span>
                            )}
                          </td>

                          {/* Deadline */}
                          <td className="px-4 py-4 text-slate-600">
                            <span
                              className={
                                deadlinePassed ? "text-rose-600 font-semibold" : ""
                              }
                            >
                              {new Date(
                                d.applicationDeadline
                              ).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Applicants */}
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                              <Users size={11} className="text-slate-400" />
                              {d.applicantsCount || 0}
                            </span>
                          </td>

                          {/* Shortlisted */}
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                              <UserCheck size={11} className="text-indigo-500" />
                              {d.shortlistedCount || 0}
                            </span>
                          </td>

                          {/* Selected */}
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                              <Award size={11} className="text-emerald-500" />
                              {d.selectedCount || 0}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                isDriveActive
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                  : d.status === "Completed"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isDriveActive
                                    ? "bg-emerald-500"
                                    : d.status === "Completed"
                                    ? "bg-blue-500"
                                    : "bg-slate-400"
                                }`}
                              />
                              {d.status || "Active"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/admin/drives/${d._id}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
                              >
                                <Eye size={13} />
                                <span>Details</span>
                              </Link>

                              <Link
                                to={`/admin/drives/${d._id}/applicants`}
                                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                              >
                                <Users size={13} />
                                <span>Applicants</span>
                              </Link>

                              {isDriveActive && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCloseModal({
                                      isOpen: true,
                                      drive: d,
                                      submitting: false,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-sm"
                                >
                                  <Power size={12} />
                                  <span>Close</span>
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
            </div>

            {/* Mobile Responsive Cards */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {filteredDrives.map((d) => {
                const isDriveActive = d.status === "Active";
                const deadlinePassed =
                  d.applicationDeadline &&
                  new Date(d.applicationDeadline) < new Date();

                return (
                  <div
                    key={d._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700 shadow-sm border border-blue-100">
                          {d.companyLogo ? (
                            <img
                              src={d.companyLogo}
                              alt={d.companyName}
                              className="h-full w-full rounded-xl object-cover"
                            />
                          ) : d.companyName ? (
                            d.companyName.slice(0, 2).toUpperCase()
                          ) : (
                            "CP"
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {d.role}
                          </h3>
                          <p className="text-xs text-slate-500 font-semibold">
                            {d.companyName}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isDriveActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : d.status === "Completed"
                            ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isDriveActive
                              ? "bg-emerald-500"
                              : d.status === "Completed"
                              ? "bg-blue-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {d.status || "Active"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3">
                      <div>
                        <span className="text-[11px] text-slate-400 block">
                          Package
                        </span>
                        <span className="font-bold text-emerald-600">
                          {d.package}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">
                          Deadline
                        </span>
                        <span
                          className={`font-semibold ${
                            deadlinePassed ? "text-rose-600" : "text-slate-700"
                          }`}
                        >
                          {new Date(d.applicationDeadline).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="col-span-2 pt-1 flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">
                          Applicants: <strong>{d.applicantsCount || 0}</strong>
                        </span>
                        <span className="text-indigo-600 text-[11px]">
                          Shortlisted: <strong>{d.shortlistedCount || 0}</strong>
                        </span>
                        <span className="text-emerald-600 text-[11px]">
                          Selected: <strong>{d.selectedCount || 0}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        to={`/admin/drives/${d._id}`}
                        className="flex-1 text-center rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 shadow-sm"
                      >
                        Details
                      </Link>
                      <Link
                        to={`/admin/drives/${d._id}/applicants`}
                        className="flex-1 text-center rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-700"
                      >
                        Applicants ({d.applicantsCount || 0})
                      </Link>
                      {isDriveActive && (
                        <button
                          type="button"
                          onClick={() =>
                            setCloseModal({
                              isOpen: true,
                              drive: d,
                              submitting: false,
                            })
                          }
                          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Confirmation Modal for Closing a Drive */}
      {closeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Power size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Close Placement Drive
                </h3>
                <p className="text-xs text-slate-500">
                  {closeModal.drive?.role} • {closeModal.drive?.companyName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to close this placement drive? Students will no longer be able to submit new applications. All existing applications, interview schedules, candidate resumes, and historical records will remain safely preserved.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  setCloseModal({ isOpen: false, drive: null, submitting: false })
                }
                disabled={closeModal.submitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCloseDrive}
                disabled={closeModal.submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-rose-700 transition disabled:opacity-50"
              >
                {closeModal.submitting && (
                  <Loader2 size={13} className="animate-spin" />
                )}
                <span>Close Drive</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlacementDrives;
