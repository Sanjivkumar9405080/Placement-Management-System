import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CompanyNavbar from "../../components/CompanyNavbar";
import {
  placementDrivesAPI,
  applicationsAPI,
  interviewsAPI,
} from "../../services/api";

import {
  Users,
  UserCheck,
  CalendarDays,
  Trophy,
  Clock3,
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  Loader2,
  Plus,
  Video,
  MapPin,
  CheckCircle2,
} from "lucide-react";

const CompanyDashboard = () => {
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [drivesRes, appsRes, interviewsRes] = await Promise.allSettled([
        placementDrivesAPI.getCompanyDrives(),
        applicationsAPI.getCompanyApplications(),
        interviewsAPI.getCompanyInterviews(),
      ]);

      if (drivesRes.status === "fulfilled" && drivesRes.value?.data?.success) {
        setDrives(drivesRes.value.data.drives || []);
      }

      if (appsRes.status === "fulfilled" && appsRes.value?.data?.success) {
        setApplications(appsRes.value.data.applications || []);
      }

      if (
        interviewsRes.status === "fulfilled" &&
        interviewsRes.value?.data?.success
      ) {
        setInterviews(interviewsRes.value.data.interviews || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalApplications = applications.length;
  const shortlistedCount = applications.filter(
    (a) => a.status === "Shortlisted"
  ).length;

  const upcomingInterviews = interviews.filter(
    (i) => i.status === "Scheduled" || i.status === "Rescheduled"
  );
  const completedInterviews = interviews.filter(
    (i) => i.status === "Completed"
  );
  const todayInterviews = interviews.filter(
    (i) =>
      new Date(i.date).toDateString() === new Date().toDateString() &&
      i.status !== "Cancelled"
  );

  const selectedCount = applications.filter(
    (a) => a.status === "Selected"
  ).length;

  const stats = [
    {
      title: "Students Applied",
      value: totalApplications,
      subtitle: "Total applications received",
      icon: Users,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      title: "Shortlisted",
      value: shortlistedCount,
      subtitle: "Eligible for interviews",
      icon: UserCheck,
      iconStyle: "bg-violet-50 text-violet-600",
    },
    {
      title: "Upcoming Interviews",
      value: upcomingInterviews.length,
      subtitle: `${todayInterviews.length} scheduled today`,
      icon: CalendarDays,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      title: "Selected",
      value: selectedCount,
      subtitle: `${completedInterviews.length} interviews completed`,
      icon: Trophy,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
  ];

  const recentApplications = applications.slice(0, 5);
  const activeDrives = drives.filter((d) => d.status === "Active");
  const currentDrive = activeDrives[0] || drives[0];

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Under Review":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Shortlisted":
        return "bg-violet-50 text-violet-700 border-violet-200";
      case "Interview":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Selected":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <CompanyNavbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ================= HEADER ================= */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Company Portal</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Recruitment Dashboard
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Manage your campus placement drives and track live student applications.
            </p>
          </div>

          <Link
            to="/company/drives"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={16} />
            Post New Drive
          </Link>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {stat.subtitle}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconStyle}`}
                  >
                    <Icon size={21} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= CURRENT DRIVE ================= */}
        {currentDrive ? (
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BriefcaseBusiness size={19} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Latest Placement Drive
                  </h2>
                  <p className="text-xs text-slate-400">
                    Currently open or most recently posted drive
                  </p>
                </div>
              </div>

              <span
                className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
                  currentDrive.status === "Active"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {currentDrive.status}
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {currentDrive.role}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    Package: {currentDrive.package}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Eligibility:{" "}
                    {currentDrive.eligibility?.branches?.length > 0
                      ? currentDrive.eligibility.branches.join(", ")
                      : "All Branches"}{" "}
                    {currentDrive.eligibility?.minCGPA
                      ? `• Min ${currentDrive.eligibility.minCGPA} CGPA`
                      : ""}
                  </p>
                </div>

                <Link
                  to="/company/drives"
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Manage Drives
                  <ArrowRight size={15} />
                </Link>
              </div>

              {/* Drive Statistics */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <DriveStat
                  label="Applications"
                  value={currentDrive.stats?.totalApplications || 0}
                  icon={Users}
                />
                <DriveStat
                  label="Shortlisted"
                  value={currentDrive.stats?.shortlisted || 0}
                  icon={UserCheck}
                />
                <DriveStat
                  label="Interviews"
                  value={currentDrive.stats?.interviews || 0}
                  icon={CalendarDays}
                />
                <DriveStat
                  label="Selected"
                  value={currentDrive.stats?.selected || 0}
                  icon={Trophy}
                />
              </div>

              {currentDrive.applicationDeadline && (
                <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                  <Clock3 size={14} />
                  <span>Application deadline:</span>
                  <span className="font-semibold text-slate-600">
                    {new Date(
                      currentDrive.applicationDeadline
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
            <BriefcaseBusiness
              size={32}
              className="mx-auto text-slate-400 mb-2"
            />
            <h3 className="text-base font-bold text-slate-900">
              No placement drives posted yet
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Create your first placement drive so university students can apply with their verified resumes and CGPAs.
            </p>
            <Link
              to="/company/drives"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={16} />
              Create First Drive
            </Link>
          </section>
        )}

        {/* ================= APPLICATIONS & INTERVIEWS ================= */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Recent Applications */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Recent Applications
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Students who recently submitted applications
                </p>
              </div>

              <Link
                to="/company/applicants"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View All
                <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : recentApplications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentApplications.map((app) => {
                  const student = app.student || {};
                  const user = student.userId || {};
                  const name = user.name || "Student Applicant";
                  const initials = name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={app._id}
                      className="flex flex-col gap-3 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                          {initials}
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {name}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {student.branch || "General"} • CGPA:{" "}
                            {student.cgpa !== undefined ? student.cgpa : "N/A"}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {app.role || app.drive?.role || "Drive Role"} •
                            Applied{" "}
                            {new Date(
                              app.appliedAt || app.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusBadgeStyle(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>

                        <Link
                          to={`/company/applicants/${app._id}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Review &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users size={24} className="mx-auto text-slate-400 mb-1" />
                <p className="text-xs text-slate-500">
                  No applications received yet.
                </p>
              </div>
            )}
          </section>

          {/* Upcoming / Today's Interviews */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Upcoming Interviews
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {upcomingInterviews.length} rounds scheduled
                  </p>
                </div>
                <CalendarDays size={19} className="text-blue-600" />
              </div>

              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : upcomingInterviews.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {upcomingInterviews.slice(0, 4).map((interview) => {
                    const studentUser = interview.student?.userId || {};
                    const name = studentUser.name || "Student";
                    const role =
                      interview.drive?.role ||
                      interview.application?.role ||
                      "Role";
                    const dateStr = new Date(
                      interview.date
                    ).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    });

                    return (
                      <div
                        key={interview._id}
                        className="p-4 transition hover:bg-slate-50 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-slate-900">
                            {name}
                          </p>
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            {interview.mode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{role}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={13} />
                            {dateStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock3 size={13} />
                            {interview.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <CalendarDays
                    size={24}
                    className="mx-auto text-slate-400 mb-1"
                  />
                  <p className="text-xs text-slate-500">
                    No upcoming interviews scheduled.
                  </p>
                  <Link
                    to="/company/applicants"
                    className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Shortlist students to interview
                  </Link>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 p-4">
              <Link
                to="/company/interviews"
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
              >
                View All Interviews
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

/* =========================================================
   DRIVE STAT
========================================================= */
const DriveStat = ({ label, value, icon: Icon }) => {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <Icon size={16} className="text-slate-400" />
      </div>
      <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
};

export default CompanyDashboard;