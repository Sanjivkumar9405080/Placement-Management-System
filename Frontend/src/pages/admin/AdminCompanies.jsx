import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { adminAPI } from "../../services/api";
import {
  Building2,
  Search,
  Filter,
  Eye,
  Power,
  RefreshCw,
  Briefcase,
  FileText,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  Globe,
} from "lucide-react";

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [availableIndustries, setAvailableIndustries] = useState([]);

  // Modal state for Disable / Enable toggle confirmation
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    company: null,
    nextStatus: "",
    loading: false,
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminAPI.getCompanies();
      if (res.data?.success && res.data?.companies) {
        setCompanies(res.data.companies);
        if (res.data.availableIndustries) {
          setAvailableIndustries(res.data.availableIndustries);
        }
      } else {
        setError(res.data?.message || "Failed to load registered companies.");
      }
    } catch (err) {
      console.error("Fetch companies error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load companies. Please check your admin network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // Status toggle handler
  const handleToggleStatus = async () => {
    if (!statusModal.company || !statusModal.nextStatus) return;

    try {
      setStatusModal((prev) => ({ ...prev, loading: true }));
      const res = await adminAPI.updateCompanyStatus(
        statusModal.company._id,
        statusModal.nextStatus
      );

      if (res.data?.success) {
        // Update local state immediately
        setCompanies((prev) =>
          prev.map((c) =>
            c._id === statusModal.company._id
              ? { ...c, status: statusModal.nextStatus }
              : c
          )
        );
        setStatusModal({
          isOpen: false,
          company: null,
          nextStatus: "",
          loading: false,
        });
      }
    } catch (err) {
      console.error("Update company status error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update company status. Please try again."
      );
      setStatusModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Filter companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      // 1. Search filter: Company Name, Email, HR Name
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = c.companyName?.toLowerCase().includes(query);
        const matchesEmail = c.officialEmail?.toLowerCase().includes(query);
        const matchesHr = c.hrName?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesHr) {
          return false;
        }
      }

      // 2. Industry filter
      if (selectedIndustry !== "All") {
        if (c.industry?.toLowerCase() !== selectedIndustry.toLowerCase()) {
          return false;
        }
      }

      // 3. Status filter
      if (selectedStatus !== "All") {
        if (c.status?.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [companies, searchQuery, selectedIndustry, selectedStatus]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedIndustry("All");
    setSelectedStatus("All");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedIndustry !== "All" ||
    selectedStatus !== "All";

  // Quick stats
  const activeCount = companies.filter((c) => c.status === "Active").length;
  const disabledCount = companies.filter((c) => c.status === "Disabled").length;
  const totalActiveDrives = companies.reduce(
    (acc, curr) => acc + (curr.activeDrivesCount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Corporate Partners
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Registered Companies
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Manage recruiting organizations, monitor placement drive activities, and control account access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              Total Partners:{" "}
              <span className="font-bold text-blue-600">{companies.length}</span>
            </span>
            <button
              type="button"
              onClick={fetchCompanies}
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
                Total Companies
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Building2 size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {companies.length}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Recruiting partners on campus
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Active Partners
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {activeCount}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Authorized to conduct drives
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Disabled Partners
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <XCircle size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-rose-600">
              {disabledCount}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Access suspended by admin
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Active Placement Drives
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Briefcase size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-indigo-600">
              {totalActiveDrives}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Live recruitment drives
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 shadow-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span className="flex-1">{error}</span>
            <button
              onClick={fetchCompanies}
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
                placeholder="Search by company name, email, or recruiter HR..."
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

            {/* Industry Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              >
                <option value="All">All Industries</option>
                {availableIndustries.map((ind, i) => (
                  <option key={i} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
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
                <option value="Disabled">Disabled</option>
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
                  {filteredCompanies.length}
                </span>{" "}
                of {companies.length} companies
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
              Loading company records from database...
            </p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Building2 size={24} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No Companies Found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {hasActiveFilters
                ? "No registered companies matched your current search and filter criteria."
                : "No company profiles have registered on the placement portal yet."}
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
                      <th className="px-5 py-3.5">Company Name</th>
                      <th className="px-4 py-3.5">HR / Recruiter</th>
                      <th className="px-4 py-3.5">Email</th>
                      <th className="px-4 py-3.5">Phone</th>
                      <th className="px-4 py-3.5">Industry</th>
                      <th className="px-4 py-3.5 text-center">Active Drives</th>
                      <th className="px-4 py-3.5 text-center">Applications</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredCompanies.map((c) => {
                      const isActive = c.status === "Active";
                      return (
                        <tr
                          key={c._id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          {/* Company Name & Monogram */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700 shadow-sm">
                                {c.companyName
                                  ? c.companyName.slice(0, 2).toUpperCase()
                                  : "CP"}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  to={`/admin/companies/${c._id}`}
                                  className="font-bold text-slate-900 hover:text-blue-600 transition truncate block"
                                >
                                  {c.companyName}
                                </Link>
                                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <MapPin size={11} className="shrink-0" />
                                  <span className="truncate">
                                    {c.location || "Campus"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* HR / Recruiter */}
                          <td className="px-4 py-4 text-slate-700 font-semibold">
                            {c.hrName || "N/A"}
                          </td>

                          {/* Email */}
                          <td className="px-4 py-4 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Mail size={13} className="text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {c.officialEmail || "N/A"}
                              </span>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="px-4 py-4 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Phone size={13} className="text-slate-400 shrink-0" />
                              <span>{c.phone || "N/A"}</span>
                            </div>
                          </td>

                          {/* Industry */}
                          <td className="px-4 py-4">
                            <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                              {c.industry || "General"}
                            </span>
                          </td>

                          {/* Active Drives */}
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                              <Briefcase size={11} className="text-blue-500" />
                              {c.activeDrivesCount || 0}
                            </span>
                          </td>

                          {/* Applications */}
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                              <FileText size={11} className="text-slate-400" />
                              {c.totalApplicationsCount || 0}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                isActive
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                  : "bg-rose-50 text-rose-700 border border-rose-200/60"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isActive ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              />
                              {c.status || "Active"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/admin/companies/${c._id}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
                              >
                                <Eye size={13} />
                                <span>View</span>
                              </Link>

                              <button
                                type="button"
                                onClick={() =>
                                  setStatusModal({
                                    isOpen: true,
                                    company: c,
                                    nextStatus: isActive ? "Disabled" : "Active",
                                    loading: false,
                                  })
                                }
                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-sm transition ${
                                  isActive
                                    ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                    : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                }`}
                              >
                                <Power size={12} />
                                <span>{isActive ? "Disable" : "Enable"}</span>
                              </button>
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
              {filteredCompanies.map((c) => {
                const isActive = c.status === "Active";
                return (
                  <div
                    key={c._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700 shadow-sm">
                          {c.companyName
                            ? c.companyName.slice(0, 2).toUpperCase()
                            : "CP"}
                        </div>
                        <div>
                          <Link
                            to={`/admin/companies/${c._id}`}
                            className="text-sm font-bold text-slate-900 hover:text-blue-600 transition"
                          >
                            {c.companyName}
                          </Link>
                          <p className="text-[11px] text-slate-400">
                            {c.industry || "General Industry"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : "bg-rose-50 text-rose-700 border border-rose-200/60"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isActive ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {c.status || "Active"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3">
                      <div>
                        <span className="text-[11px] text-slate-400 block">
                          HR Recruiter
                        </span>
                        <span className="font-semibold text-slate-700">
                          {c.hrName || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">
                          Location
                        </span>
                        <span className="font-semibold text-slate-700">
                          {c.location || "Campus"}
                        </span>
                      </div>
                      <div className="col-span-2 pt-1">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Mail size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">{c.officialEmail || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 mt-1">
                          <Phone size={12} className="text-slate-400 shrink-0" />
                          <span>{c.phone || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                          <Briefcase size={12} />
                          {c.activeDrivesCount || 0} Drives
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          <FileText size={12} />
                          {c.totalApplicationsCount || 0} Apps
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/companies/${c._id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setStatusModal({
                              isOpen: true,
                              company: c,
                              nextStatus: isActive ? "Disabled" : "Active",
                              loading: false,
                            })
                          }
                          className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm transition ${
                            isActive
                              ? "border border-rose-200 bg-rose-50 text-rose-700"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          <Power size={12} />
                          <span>{isActive ? "Disable" : "Enable"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Confirmation Modal for Enable / Disable */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  statusModal.nextStatus === "Disabled"
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <Power size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {statusModal.nextStatus === "Disabled"
                    ? "Disable Company Account"
                    : "Enable Company Account"}
                </h3>
                <p className="text-xs text-slate-500">
                  {statusModal.company?.companyName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {statusModal.nextStatus === "Disabled" ? (
                <>
                  Are you sure you want to disable this company? While disabled, the company will{" "}
                  <strong className="text-slate-900">
                    NOT be able to create new placement drives or access company dashboard operations
                  </strong>
                  . All existing applications, historical interviews, and candidate data will remain safely preserved.
                </>
              ) : (
                <>
                  Are you sure you want to re-enable this company account? They will regain access to manage their placement drives and candidate selection process.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  setStatusModal({
                    isOpen: false,
                    company: null,
                    nextStatus: "",
                    loading: false,
                  })
                }
                disabled={statusModal.loading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusModal.loading}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow transition disabled:opacity-50 ${
                  statusModal.nextStatus === "Disabled"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {statusModal.loading && (
                  <Loader2 size={13} className="animate-spin" />
                )}
                <span>
                  Confirm {statusModal.nextStatus === "Disabled" ? "Disable" : "Enable"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;
