import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";
import {
  applicationsAPI,
  interviewsAPI,
  placementDrivesAPI,
  studentAPI,
  notificationsAPI,
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
  Building2,
  Send,
  X,
  PlusCircle,
  Bell,
  Clock,
  XCircle,
  ExternalLink,
  Info,
  DollarSign,
  User,
  Mail,
  Phone,
  FileText,
} from "lucide-react";

const StudentDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [drives, setDrives] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [suggestedCompanies, setSuggestedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  // "Suggest a Company" Modal State (Requirement 4)
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestSubmitting, setSuggestSubmitting] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: "",
    website: "",
    hrName: "",
    hrEmail: "",
    contactNumber: "",
    jobRole: "",
    jobDescription: "",
    location: "",
    salaryPackage: "",
    additionalInfo: "",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appsRes, interviewsRes, drivesRes, notifsRes, suggestRes] =
        await Promise.allSettled([
          applicationsAPI.getMyApplications(),
          interviewsAPI.getMyInterviews(),
          placementDrivesAPI.getActive(),
          notificationsAPI.getNotifications(),
          studentAPI.getMySuggestedCompanies(),
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

      if (notifsRes.status === "fulfilled" && notifsRes.value?.data?.notifications) {
        setNotifications(notifsRes.value.data.notifications || []);
      }

      if (
        suggestRes.status === "fulfilled" &&
        suggestRes.value?.data?.suggestions
      ) {
        setSuggestedCompanies(suggestRes.value.data.suggestions || []);
      }
    } catch (err) {
      console.error("Student dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSuggestCompanySubmit = async (e) => {
    e.preventDefault();
    try {
      setSuggestSubmitting(true);
      const res = await studentAPI.suggestCompany(companyForm);
      if (res.data?.success) {
        showToast("Company information shared with Admin successfully!");
        setShowSuggestModal(false);
        setCompanyForm({
          companyName: "",
          website: "",
          hrName: "",
          hrEmail: "",
          contactNumber: "",
          jobRole: "",
          jobDescription: "",
          location: "",
          salaryPackage: "",
          additionalInfo: "",
        });
        // Refresh suggested companies list
        const updated = await studentAPI.getMySuggestedCompanies();
        if (updated.data?.suggestions) {
          setSuggestedCompanies(updated.data.suggestions);
        }
      } else {
        alert(res.data?.message || "Failed to submit company recommendation.");
      }
    } catch (err) {
      console.error("Suggest company error:", err);
      alert(
        err.response?.data?.message ||
          "Could not submit company details. Please ensure all required fields are filled."
      );
    } finally {
      setSuggestSubmitting(false);
    }
  };

  const upcomingInterviews = interviews.filter(
    (i) => i.status === "Scheduled" || i.status === "Rescheduled"
  );
  const nextInterview = upcomingInterviews[0];

  const shortlistedCount = applications.filter(
    (a) =>
      a.status === "Shortlisted" ||
      a.status === "Interview" ||
      a.status === "Selected"
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

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 space-y-6">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl ring-1 ring-white/10 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Welcome & Action Header */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-600">
              Student Placement Portal
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track your campus placement progress, drives, scheduled interview rounds, and suggest corporate hiring partners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {/* Suggest a Company Button (Requirement 4) */}
            <button
              type="button"
              onClick={() => setShowSuggestModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <Building2 size={14} className="text-blue-400" />
              Suggest a Company
            </button>

            <Link
              to="/student/profile"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm"
            >
              View / Edit Profile
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
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

        {/* Real-time Notifications Banner (Requirement 3) */}
        {notifications.length > 0 && (
          <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-blue-100/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Bell size={14} className="text-blue-600" />
                  Recent Placement Cell Notices
                </h3>
              </div>

              <Link
                to="/student/notifications"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                View all ({notifications.length}) &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {notifications.slice(0, 2).map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-white bg-white/90 p-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.title || "Placement Cell Notification"}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Main Grid: Profile + Upcoming Interview */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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

          {/* Upcoming Interview Card */}
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

        {/* =========================================================
            REQUIREMENT 4: SUGGEST A COMPANY SECTION & MY SUBMISSIONS
        ========================================================= */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Suggest a Company (Corporate Lead Sharing)
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Share hiring opportunities or recruiter contact info with the Placement Cell. Track your submission status below.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSuggestModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition self-start sm:self-auto"
            >
              <PlusCircle size={14} />
              Recommend New Company
            </button>
          </div>

          {/* Submissions List */}
          {suggestedCompanies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {suggestedCompanies.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5 hover:bg-white transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        {item.companyName}
                      </h4>
                      <p className="text-[11px] font-semibold text-blue-700 mt-0.5">
                        {item.jobRole}
                      </p>
                    </div>

                    {/* Status Badge (Requirement 4) */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : item.status === "Rejected"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.status === "Approved" ? (
                        <CheckCircle2 size={11} />
                      ) : item.status === "Rejected" ? (
                        <XCircle size={11} />
                      ) : (
                        <Clock size={11} />
                      )}
                      {item.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1">
                    <p>
                      <strong>HR:</strong> {item.hrName} ({item.hrEmail})
                    </p>
                    <p>
                      <strong>Location:</strong> {item.location}
                    </p>
                    {item.salaryPackage && (
                      <p>
                        <strong>Package:</strong> {item.salaryPackage}
                      </p>
                    )}
                  </div>

                  {item.adminNotes && (
                    <div className="rounded-lg bg-blue-50/70 p-2 text-[11px] text-blue-900 border border-blue-100">
                      <strong>Admin Note:</strong> {item.adminNotes}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <span>
                      Submitted: {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    {item.website && (
                      <a
                        href={
                          item.website.startsWith("http")
                            ? item.website
                            : `https://${item.website}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        Visit <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
              No companies suggested yet. Have a referral or know a hiring firm? Click "Recommend New Company" above to share details with the Admin!
            </div>
          )}
        </section>

        {/* Placement Drives Section */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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

        {/* =========================================================
            MODAL: SUGGEST A COMPANY (Requirement 4)
        ========================================================= */}
        {showSuggestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Suggest a Company to Admin
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Submit hiring lead details for placement cell verification
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSuggestModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form
                onSubmit={handleSuggestCompanySubmit}
                className="p-6 space-y-4 overflow-y-auto flex-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      placeholder="e.g. Acme Technologies"
                      value={companyForm.companyName}
                      onChange={handleCompanyInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Company Website */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Company Website *
                    </label>
                    <input
                      type="url"
                      name="website"
                      required
                      placeholder="https://acme.com"
                      value={companyForm.website}
                      onChange={handleCompanyInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* HR / Recruiter Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      HR / Recruiter Name *
                    </label>
                    <input
                      type="text"
                      name="hrName"
                      required
                      placeholder="e.g. John Doe"
                      value={companyForm.hrName}
                      onChange={handleCompanyInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* HR Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      HR Email *
                    </label>
                    <input
                      type="email"
                      name="hrEmail"
                      required
                      placeholder="recruiter@acme.com"
                      value={companyForm.hrEmail}
                      onChange={handleCompanyInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Contact Number (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      placeholder="+91 98765 43210"
                      value={companyForm.contactNumber}
                      onChange={handleCompanyInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Job Role */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Job Role / Designation *
                    </label>
                    <input
                      type="text"
                      name="jobRole"
                      required
                      placeholder="e.g. Software Engineer / Full Stack"
                      value={companyForm.jobRole}
                      onChange={handleCompanyInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Company Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Company Location / Office *
                    </label>
                    <input
                      type="text"
                      name="location"
                      required
                      placeholder="e.g. Bangalore / Remote"
                      value={companyForm.location}
                      onChange={handleCompanyInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Salary Package (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Salary Package (Optional)
                    </label>
                    <input
                      type="text"
                      name="salaryPackage"
                      placeholder="e.g. 8 - 12 LPA"
                      value={companyForm.salaryPackage}
                      onChange={handleCompanyInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Job Description & Hiring Criteria *
                  </label>
                  <textarea
                    rows={3}
                    name="jobDescription"
                    required
                    placeholder="Brief description of requirements, eligibility, tech stack, or job description link..."
                    value={companyForm.jobDescription}
                    onChange={handleCompanyInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs focus:border-blue-500 focus:bg-white focus:outline-none resize-none"
                  />
                </div>

                {/* Additional Information (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    rows={2}
                    name="additionalInfo"
                    placeholder="Any extra context, referral connection, or deadline details..."
                    value={companyForm.additionalInfo}
                    onChange={handleCompanyInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs focus:border-blue-500 focus:bg-white focus:outline-none resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSuggestModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={suggestSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {suggestSubmitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    {suggestSubmitting ? "Submitting..." : "Submit to Placement Cell"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
