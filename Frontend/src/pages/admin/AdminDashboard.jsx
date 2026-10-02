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
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
