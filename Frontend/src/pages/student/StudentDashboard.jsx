import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";
import {
  applicationsAPI,
  interviewsAPI,
  placementDrivesAPI,
} from "../../services/api";
import {
  CalendarDays,
  Clock3,
  Video,
  MapPin,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from "lucide-react";

const StudentDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appsRes, interviewsRes, drivesRes] = await Promise.allSettled([
        applicationsAPI.getMyApplications(),
        interviewsAPI.getMyInterviews(),
        placementDrivesAPI.getActive(),
      ]);

      if (appsRes.status === "fulfilled" && appsRes.value?.data?.success) {
        setApplications(appsRes.value.data.applications || []);
      }

      if (
        interviewsRes.status === "fulfilled" &&
        interviewsRes.value?.data?.success
      ) {
        setInterviews(interviewsRes.value.data.interviews || []);
      }

      if (drivesRes.status === "fulfilled" && drivesRes.value?.data?.success) {
        setDrives(drivesRes.value.data.drives || []);
      }
    } catch (err) {
      console.error("Student dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const upcomingInterviews = interviews.filter(
    (i) => i.status === "Scheduled" || i.status === "Rescheduled"
  );
  const nextInterview = upcomingInterviews[0];

  const shortlistedCount = applications.filter(
    (a) => a.status === "Shortlisted" || a.status === "Interview" || a.status === "Selected"
  ).length;

  const stats = [
    {
      title: "Applications",
      value: applications.length,
      subtitle: "Total drives applied",
      icon: "📄",
      path: "/student/applications",
    },
    {
      title: "Shortlisted",
      value: shortlistedCount,
      subtitle: "Shortlisted / in progress",
      icon: "✓",
      path: "/student/applications",
    },
    {
      title: "Interviews",
      value: upcomingInterviews.length,
      subtitle: "Scheduled upcoming rounds",
      icon: "◷",
      path: "/student/interviews",
    },
    {
      title: "Eligible Drives",
      value: drives.length,
      subtitle: "Open campus drives",
      icon: "▣",
      path: "/student/drives",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Welcome Section */}
        <section className="mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-600">
              Student Portal
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track your campus placement progress, drives, and scheduled interview rounds.
            </p>
          </div>

          <Link
            to="/student/profile"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 self-start sm:self-auto shadow-sm"
          >
            View / Edit Profile
          </Link>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.title}
              to={stat.path}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    {stat.value}
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600">
                  {stat.icon}
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">{stat.subtitle}</p>
            </Link>
          ))}
        </section>

        {/* Main Grid: Profile + Upcoming Interview */}
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Profile Verification
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Resume & academic profile
                  </p>
                </div>
                <span className="text-sm font-bold text-blue-600">Active</span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>College Campus Verified</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Verified CGPA Records</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span>Official Resume Attached</span>
                </div>
              </div>
            </div>

            <Link
              to="/student/profile"
              className="mt-6 block w-full text-center rounded-xl bg-blue-50 py-2.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              Update Credentials
            </Link>
          </div>

          {/* Upcoming Interview Card (Requirement 16) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Upcoming Interview
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Latest scheduled recruitment round
                  </p>
                </div>

                <Link
                  to="/student/interviews"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  View all interviews &rarr;
                </Link>
              </div>

              {loading ? (
                <div className="flex h-36 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : nextInterview ? (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {nextInterview.company?.companyName || "Recruiting Partner"}
                      </h3>
                      <p className="text-xs font-semibold text-blue-700 mt-0.5">
                        {nextInterview.drive?.role ||
                          nextInterview.application?.role ||
                          "Role"}
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-blue-600 text-white text-[11px] font-bold px-3 py-1">
                      {nextInterview.mode === "Online"
                        ? "Online Video"
                        : "Campus Offline"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-600 border-t border-blue-100">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} className="text-blue-600" />
                      <span>
                        {new Date(nextInterview.date).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock3 size={15} className="text-blue-600" />
                      <span>{nextInterview.time}</span>
                    </div>
                  </div>

                  {nextInterview.mode === "Offline" && nextInterview.venue && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                      <MapPin size={15} className="text-violet-600" />
                      <span>Venue: {nextInterview.venue}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <CalendarDays
                    size={28}
                    className="mx-auto text-slate-300 mb-2"
                  />
                  <p className="text-sm font-semibold text-slate-700">
                    No upcoming interviews
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    You currently have no scheduled interview rounds. Apply for placement drives and keep an eye on shortlists.
                  </p>
                </div>
              )}
            </div>

            {nextInterview && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <Link
                  to="/student/interviews"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  View Interview
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Placement Drives Section */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Active Placement Drives
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Campus opportunities currently open for application.
              </p>
            </div>

            <Link
              to="/student/drives"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View all drives &rarr;
            </Link>
          </div>

          {drives.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {drives.slice(0, 4).map((drive) => (
                <div
                  key={drive._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 gap-3 hover:bg-slate-50 transition"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {drive.role}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {drive.company?.companyName || "Company Partner"} • {drive.location || "College Campus"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {drive.package}
                    </span>

                    <Link
                      to={`/student/drive/${drive._id}`}
                      className="rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No active drives posted currently.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;