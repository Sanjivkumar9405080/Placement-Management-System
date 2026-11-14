import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { adminAPI } from "../../services/api";
import {
  GraduationCap,
  Building2,
  BriefcaseBusiness,
  FileText,
  UserCheck,
  Trophy,
  CalendarCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Check,
  X,
  Send,
  User,
  Mail,
  Phone,
  DollarSign,
  Tag,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Student Company Suggestions State (Requirement 4)
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState("All"); // All | Pending | Approved | Rejected
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    suggestion: null,
    status: "",
    adminNotes: "",
    loading: false,
  });

  useEffect(() => {
    fetchDashboardStats();
    fetchCompanySuggestions();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const fetchCompanySuggestions = async () => {
    try {
      setSuggestionsLoading(true);
      const res = await adminAPI.getCompanySuggestions();
      if (res.data?.success && res.data?.suggestions) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      console.error("Fetch company suggestions error:", err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const openReviewModal = (suggestion, nextStatus) => {
    setReviewModal({
      isOpen: true,
      suggestion,
      status: nextStatus,
      adminNotes:
        nextStatus === "Approved"
          ? "Approved by Placement Cell. Corporate outreach initiated."
          : nextStatus === "Rejected"
          ? "Not aligned with current placement policy / unverified contact."
          : "",
      loading: false,
    });
  };

  const handleUpdateSuggestionStatus = async (e) => {
    e.preventDefault();
    if (!reviewModal.suggestion || !reviewModal.status) return;

    try {
      setReviewModal((prev) => ({ ...prev, loading: true }));
      const res = await adminAPI.updateCompanySuggestionStatus(
        reviewModal.suggestion._id,
        reviewModal.status,
        reviewModal.adminNotes
      );

      if (res.data?.success) {
        showToast(
          `Company suggestion for "${reviewModal.suggestion.companyName}" marked as ${reviewModal.status}!`
        );
        setReviewModal({
          isOpen: false,
          suggestion: null,
          status: "",
          adminNotes: "",
          loading: false,
        });
        fetchCompanySuggestions();
      } else {
        alert(res.data?.message || "Failed to update suggestion status.");
      }
    } catch (err) {
      console.error("Update suggestion error:", err);
      alert(
        err.response?.data?.message ||
          "Could not update suggestion status. Please check your admin connection."
      );
    } finally {
      setReviewModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchDashboardStats = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const res = await adminAPI.getDashboardStats();
      if (res.data?.success && res.data?.stats) {
        setStats(res.data.stats);
      } else {
        setError(res.data?.message || "Failed to load admin dashboard statistics.");
      }
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      if (err.response?.status === 403) {
        setError("Access Denied: You must be an administrator to view this portal.");
      } else {
        setError(
          err.response?.data?.message ||
            "Could not connect to placement server. Please verify your admin session."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const primaryCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      subtitle: "Registered on campus portal",
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      link: "/admin/students",
    },
    {
      title: "Total Companies",
      value: stats?.totalCompanies ?? 0,
      subtitle: "Corporate recruitment partners",
      icon: Building2,
      color: "bg-violet-50 text-violet-600 border-violet-100",
      link: "/admin/companies",
    },
    {
      title: "Active Drives",
      value: stats?.activeDrives ?? 0,
      subtitle: "Currently accepting applications",
      icon: BriefcaseBusiness,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      link: "/admin/drives",
    },
    {
      title: "Total Applications",
      value: stats?.totalApplications ?? 0,
      subtitle: "Submitted by students",
      icon: FileText,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      link: "/admin/applications",
    },
    {
      title: "Shortlisted Students",
      value: stats?.shortlistedStudents ?? 0,
      subtitle: "Selected for interview rounds",
      icon: UserCheck,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      link: "/admin/applications",
    },
    {
      title: "Selected / Placed",
      value: stats?.selectedStudents ?? 0,
      subtitle: "Received job offers",
      icon: Trophy,
      color: "bg-green-50 text-green-600 border-green-100",
      link: "/admin/applications",
    },
    {
      title: "Upcoming Interviews",
      value: stats?.upcomingInterviews ?? 0,
      subtitle: "Scheduled assessment rounds",
      icon: CalendarCheck,
      color: "bg-rose-50 text-rose-600 border-rose-100",
      link: "/admin/interviews",
    },
  ];

  const placement = stats?.placementOverview || {
    totalDrives: 0,
    activeDrives: 0,
    closedDrives: 0,
    completedDrives: 0,
  };

  const applications = stats?.applicationOverview || {
    totalApplications: 0,
    applied: 0,
    underReview: 0,
    shortlisted: 0,
    interview: 0,
    selected: 0,
    rejected: 0,
  };

  const interviews = stats?.interviewOverview || {
    upcomingInterviews: 0,
    completedInterviews: 0,
    cancelledInterviews: 0,
  };

  const recentActivities = stats?.recentActivities || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Live Placement Cell Overview
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Campus Administration Dashboard
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Real-time monitoring of campus drives, student applications, and recruitment metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchDashboardStats(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin text-blue-600" : "text-slate-500"}
              />
              {refreshing ? "Updating..." : "Refresh Stats"}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="font-bold">Error loading dashboard</p>
              <p className="mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => fetchDashboardStats()}
              className="rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2" />
              <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-6" />
            </div>
          </div>
        ) : (
          <>
            {/* Primary Metrics Grid */}
            <section>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                {primaryCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={idx}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-500">
                            {card.title}
                          </p>
                          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                            {card.value.toLocaleString()}
                          </h3>
                        </div>

                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${card.color} shadow-sm`}
                        >
                          <Icon size={20} />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                        <span>{card.subtitle}</span>
                        <span className="font-semibold text-blue-600 group-hover:underline">
                          View →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Overview Breakdowns Grid */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Placement Overview (Col 1) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <BriefcaseBusiness size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Placement Overview
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Campus placement drive pipeline
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {placement.totalDrives} Total
                  </span>
                </div>

                <div className="mt-5 space-y-3.5">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-slate-700">
                        Active Drives
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">
                      {placement.activeDrives}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-xs font-semibold text-slate-700">
                        Closed Drives
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-600">
                      {placement.closedDrives}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-semibold text-slate-700">
                        Completed Drives
                      </span>
                    </div>
                    <span className="text-xs font-bold text-blue-600">
                      {placement.completedDrives}
                    </span>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <Link
                    to="/admin/drives"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-50 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition"
                  >
                    Manage Placement Drives
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Application Overview (Col 2) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Application Overview
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Candidate recruitment funnel
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {applications.totalApplications} Total
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">
                      Applied
                    </span>
                    <p className="mt-1 text-base font-bold text-slate-800">
                      {applications.applied}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">
                      Under Review
                    </span>
                    <p className="mt-1 text-base font-bold text-amber-600">
                      {applications.underReview}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">
                      Shortlisted
                    </span>
                    <p className="mt-1 text-base font-bold text-indigo-600">
                      {applications.shortlisted}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">
                      Interview
                    </span>
                    <p className="mt-1 text-base font-bold text-rose-600">
                      {applications.interview}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">
                      Selected
                    </span>
                    <p className="mt-1 text-base font-bold text-emerald-600">
                      {applications.selected}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">
                      Rejected
                    </span>
                    <p className="mt-1 text-base font-bold text-slate-500">
                      {applications.rejected}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <Link
                    to="/admin/applications"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-50 py-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
                  >
                    View All Applications
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Interview Overview (Col 3) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                      <CalendarCheck size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Interview Overview
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Corporate assessment rounds
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3.5">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span className="text-xs font-semibold text-slate-700">
                        Upcoming / Scheduled
                      </span>
                    </div>
                    <span className="text-xs font-bold text-blue-600">
                      {interviews.upcomingInterviews}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-slate-700">
                        Completed Rounds
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">
                      {interviews.completedInterviews}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      <span className="text-xs font-semibold text-slate-700">
                        Cancelled Rounds
                      </span>
                    </div>
                    <span className="text-xs font-bold text-rose-600">
                      {interviews.cancelledInterviews}
                    </span>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <Link
                    to="/admin/interviews"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-rose-50 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                  >
                    View Interview Schedules
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </section>

            {/* Recent Activities Section */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Recent Placement Activities
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Latest submissions, schedule updates, and drive events
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600">
                  Live Feed
                </span>
              </div>

              {recentActivities.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                    <Clock size={24} />
                  </div>
                  <h3 className="mt-3 text-xs font-bold text-slate-800">
                    No recent activities recorded yet
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Activities will appear automatically as companies publish drives and students apply.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-2">
                  {recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 transition px-2 rounded-xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${
                            act.type === "application"
                              ? "bg-amber-50 text-amber-600"
                              : act.type === "interview"
                              ? "bg-rose-50 text-rose-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {act.type === "application" ? (
                            <FileText size={16} />
                          ) : act.type === "interview" ? (
                            <CalendarCheck size={16} />
                          ) : (
                            <BriefcaseBusiness size={16} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-800">
                            {act.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {act.timestamp
                              ? new Date(act.timestamp).toLocaleString("en-US", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "Just now"}
                          </p>
                        </div>
                      </div>

                      {act.status && (
                        <span
                          className={`ml-4 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            act.status === "Selected" || act.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : act.status === "Shortlisted"
                              ? "bg-indigo-50 text-indigo-700"
                              : act.status === "Active"
                              ? "bg-blue-50 text-blue-700"
                              : act.status === "Rejected" || act.status === "Cancelled"
                              ? "bg-red-50 text-red-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {act.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* =========================================================
                REQUIREMENT 4: STUDENT-SUGGESTED COMPANIES SECTION
            ========================================================= */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 size={18} className="text-blue-600" />
                    <h2 className="text-base font-bold text-slate-900">
                      Student-Submitted Company Suggestions
                    </h2>
                    {suggestions.filter((s) => s.status === "Pending").length > 0 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        {suggestions.filter((s) => s.status === "Pending").length} Pending
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Review and verify company recommendations submitted by students. Approve, reject, or mark pending.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  {["All", "Pending", "Approved", "Rejected"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSuggestionFilter(tab)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        suggestionFilter === tab
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {suggestionsLoading ? (
                <div className="flex h-36 items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                </div>
              ) : suggestions.filter((s) =>
                  suggestionFilter === "All" ? true : s.status === suggestionFilter
                ).length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  No company recommendations found for the "{suggestionFilter}" filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {suggestions
                    .filter((s) =>
                      suggestionFilter === "All"
                        ? true
                        : s.status === suggestionFilter
                    )
                    .map((item) => (
                      <div
                        key={item._id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 flex flex-col justify-between hover:bg-white transition shadow-xs"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">
                                {item.companyName}
                              </h3>
                              <p className="text-xs font-semibold text-blue-700 mt-0.5">
                                {item.jobRole}
                              </p>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                item.status === "Approved"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : item.status === "Rejected"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 space-y-1">
                            <p>
                              <strong>HR:</strong> {item.hrName} ({item.hrEmail})
                            </p>
                            {item.contactNumber && (
                              <p>
                                <strong>Phone:</strong> {item.contactNumber}
                              </p>
                            )}
                            <p>
                              <strong>Location:</strong> {item.location}
                            </p>
                            {item.salaryPackage && (
                              <p>
                                <strong>Package:</strong> {item.salaryPackage}
                              </p>
                            )}
                          </div>

                          <div className="rounded-xl bg-white border border-slate-200/80 p-2.5 text-xs text-slate-600">
                            <span className="font-semibold text-slate-700 block mb-0.5 text-[11px]">
                              Description:
                            </span>
                            <p className="line-clamp-3 leading-relaxed">
                              {item.jobDescription}
                            </p>
                          </div>

                          {/* Student Submitter Info */}
                          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                            <span>
                              Suggested by:{" "}
                              <strong className="text-slate-700">
                                {item.studentUser?.name || "Student"}
                              </strong>{" "}
                              ({item.student?.branch || "Student"})
                            </span>
                          </div>

                          {item.adminNotes && (
                            <div className="rounded-lg bg-blue-50 p-2 text-[11px] text-blue-900 border border-blue-100">
                              <strong>Admin Feedback:</strong> {item.adminNotes}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons (Requirement 4) */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                          {item.website ? (
                            <a
                              href={
                                item.website.startsWith("http")
                                  ? item.website
                                  : `https://${item.website}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                            >
                              Website <ExternalLink size={11} />
                            </a>
                          ) : (
                            <span />
                          )}

                          <div className="flex items-center gap-1.5">
                            {item.status !== "Approved" && (
                              <button
                                type="button"
                                onClick={() =>
                                  openReviewModal(item, "Approved")
                                }
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                              >
                                Approve
                              </button>
                            )}

                            {item.status !== "Rejected" && (
                              <button
                                type="button"
                                onClick={() =>
                                  openReviewModal(item, "Rejected")
                                }
                                className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                              >
                                Reject
                              </button>
                            )}

                            {item.status !== "Pending" && (
                              <button
                                type="button"
                                onClick={() =>
                                  openReviewModal(item, "Pending")
                                }
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>

            {/* Review Company Suggestion Modal (Requirement 4) */}
            {reviewModal.isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                    <h3 className="text-sm font-bold text-slate-900">
                      Review Company: {reviewModal.suggestion?.companyName}
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setReviewModal((prev) => ({ ...prev, isOpen: false }))
                      }
                      className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form
                    onSubmit={handleUpdateSuggestionStatus}
                    className="p-6 space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Updated Review Status *
                      </label>
                      <select
                        value={reviewModal.status}
                        onChange={(e) =>
                          setReviewModal((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800"
                      >
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Feedback / Notes for the Student *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={reviewModal.adminNotes}
                        onChange={(e) =>
                          setReviewModal((prev) => ({
                            ...prev,
                            adminNotes: e.target.value,
                          }))
                        }
                        placeholder="Explain approval reason or feedback to the student..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 resize-none focus:border-blue-500 focus:bg-white focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        This feedback note and status will be delivered directly to the submitting student's dashboard.
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() =>
                          setReviewModal((prev) => ({
                            ...prev,
                            isOpen: false,
                          }))
                        }
                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={reviewModal.loading}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {reviewModal.loading ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Check size={13} />
                        )}
                        {reviewModal.loading
                          ? "Updating..."
                          : "Save & Notify Student"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Floating Toast Notification */}
            {toastMessage && (
              <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl ring-1 ring-white/10 animate-fadeIn">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
