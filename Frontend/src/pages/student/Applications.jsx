import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { applicationsAPI } from "../../services/api";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  BriefcaseBusiness,
  CalendarDays,
  Circle,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  const fallbackApplication = {
    _id: "demo-1",
    company: { companyName: "TechNova Solutions" },
    role: "MERN Stack Developer",
    package: "₹6 - 8 LPA",
    location: "College Campus",
    appliedAt: new Date(),
    drive: {
      applicationDeadline: "2026-10-12",
      driveDate: "2026-10-15",
      package: "₹6 - 8 LPA",
      location: "College Campus",
    },
    status: "Under Review",
  };

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationsAPI.getMyApplications();
      if (res.data.success && res.data.applications) {
        setApplications(res.data.applications);
        if (res.data.applications.length > 0) {
          setSelectedApp(res.data.applications[0]);
        } else {
          setSelectedApp(fallbackApplication);
        }
      } else {
        setSelectedApp(fallbackApplication);
      }
    } catch (err) {
      console.warn("Could not load student applications:", err);
      setSelectedApp(fallbackApplication);
    } finally {
      setLoading(false);
    }
  };

  const getTimelineSteps = (status) => {
    const isSubmitted = true;
    const isUnderReview = [
      "Under Review",
      "Shortlisted",
      "Interview",
      "Selected",
    ].includes(status);
    const isShortlisted = ["Shortlisted", "Interview", "Selected"].includes(
      status
    );
    const isInterview = ["Interview", "Selected"].includes(status);
    const isSelected = status === "Selected";
    const isRejected = status === "Rejected";

    return [
      {
        title: "Application Submitted",
        date: "Confirmed",
        description: "Your verified student profile was forwarded to corporate HR.",
        completed: isSubmitted,
      },
      {
        title: "Application Under Review",
        date: isUnderReview ? "Active" : "Pending",
        description: "Recruiter is evaluating your credentials against opening requirements.",
        completed: isUnderReview,
      },
      {
        title: "Shortlisted",
        date: isShortlisted ? "Passed" : isRejected ? "Not Selected" : "Pending",
        description: isShortlisted
          ? "Congratulations! You have been shortlisted for upcoming rounds."
          : "Company shortlisting decisions in progress.",
        completed: isShortlisted,
      },
      {
        title: "Technical Interview",
        date: isInterview ? "Scheduled" : "Pending",
        description: "Interview schedule will appear once notified by placement cell.",
        completed: isInterview,
      },
      {
        title: isRejected ? "Application Rejected" : "Final Selection",
        date: isSelected ? "Offer Extended" : isRejected ? "Closed" : "Pending",
        description: isSelected
          ? "Offer letter generated. Report to placement office."
          : isRejected
          ? "Candidate was not selected for this drive."
          : "Final selection results pending conclusion of interviews.",
        completed: isSelected || isRejected,
      },
    ];
  };

  const appToDisplay = selectedApp || fallbackApplication;
  const companyName =
    appToDisplay.company?.companyName || "TechNova Solutions";
  const initials = companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roleName = appToDisplay.role || appToDisplay.drive?.role || "Software Role";
  const status = appToDisplay.status || "Applied";
  const appliedDateStr = new Date(
    appToDisplay.appliedAt || appToDisplay.createdAt || Date.now()
  ).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const salary =
    appToDisplay.package || appToDisplay.drive?.package || "₹6 - 8 LPA";
  const location =
    appToDisplay.location ||
    appToDisplay.drive?.location ||
    "College Campus";
  const driveDate = appToDisplay.drive?.driveDate
    ? new Date(appToDisplay.drive.driveDate).toLocaleDateString()
    : "15 Oct 2026";

  const timeline = getTimelineSteps(status);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Navigation & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition mb-2"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              My Drive Applications
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track real-time status and recruitment milestones for your campus applications.
            </p>
          </div>

          <Link
            to="/student/drives"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm self-start sm:self-auto transition"
          >
            Explore More Drives &rarr;
          </Link>
        </div>

        {/* Applications Selector if user has multiple applications */}
        {applications.length > 1 && (
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
            {applications.map((app) => (
              <button
                key={app._id}
                type="button"
                onClick={() => setSelectedApp(app)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  selectedApp?._id === app._id
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{app.company?.companyName || "Company"}</span>
                <span className="text-[10px] opacity-80">({app.role})</span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-xs text-slate-400">Loading your applications...</p>
          </div>
        ) : (
          <>
            {/* Header Card */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-bold text-blue-600">
                      {initials}
                    </div>

                    <div>
                      <p className="text-sm text-blue-100">
                        Campus Recruitment Drive
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                        {roleName}
                      </h2>
                      <p className="mt-1 text-sm text-blue-100">
                        {companyName}
                      </p>
                    </div>
                  </div>

                  <span className="w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white">
                    Status: {status}
                  </span>
                </div>
              </div>

              {/* Quick Details */}
              <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                <Info icon={BriefcaseBusiness} label="Package" value={salary} />
                <Info icon={MapPin} label="Location" value={location} />
                <Info
                  icon={CalendarDays}
                  label="Applied On"
                  value={appliedDateStr}
                />
                <Info icon={Clock3} label="Drive Date" value={driveDate} />
              </div>
            </section>

            {/* Main Content */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Timeline */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
                <div className="mb-7">
                  <h2 className="text-lg font-bold text-slate-900">
                    Hiring Progress Timeline
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Live stage updates from the company HR review.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-2 h-[calc(100%-20px)] w-px bg-slate-200" />

                  <div className="space-y-7">
                    {timeline.map((item) => (
                      <div key={item.title} className="relative flex gap-4">
                        <div
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                            item.completed
                              ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                              : "border-slate-200 bg-white text-slate-300"
                          }`}
                        >
                          {item.completed ? (
                            <CheckCircle2 size={17} />
                          ) : (
                            <Circle size={15} />
                          )}
                        </div>

                        <div className="flex-1 pb-1">
                          <div className="flex flex-col justify-between gap-1 sm:flex-row">
                            <h3
                              className={`text-sm font-bold ${
                                item.completed
                                  ? "text-slate-900"
                                  : "text-slate-400"
                              }`}
                            >
                              {item.title}
                            </h3>

                            <span className="text-xs text-slate-400">
                              {item.date}
                            </span>
                          </div>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Right Side */}
              <aside className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FileText size={19} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Profile & Resume
                      </h2>
                      <p className="text-xs text-slate-500">
                        Submitted credentials
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                    Your verified CGPA and resume document attached to your student profile have been securely shared with{" "}
                    <span className="font-semibold text-slate-800">
                      {companyName}
                    </span>.
                  </p>

                  <Link
                    to="/student/profile"
                    className="mt-4 block w-full py-2.5 text-center text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
                  >
                    View / Edit Student Profile
                  </Link>
                </section>

                {/* Important Notes */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-bold text-slate-900 mb-2">
                    Placement Cell Notice
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Attendance for scheduled technical rounds is mandatory. Keep checking notifications for interview call letters.
                  </p>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

/* =========================
   INFO COMPONENT
========================= */
const Info = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
};

export default Applications;