import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CompanyNavbar from "../../components/CompanyNavbar";
import { applicationsAPI } from "../../services/api";
import ScheduleInterviewModal from "../../components/company/ScheduleInterviewModal";

import {
  Search,
  Users,
  UserCheck,
  Clock3,
  Eye,
  Download,
  ChevronDown,
  Loader2,
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
} from "lucide-react";

const CompanyApplicants = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State for scheduling interviews
  const [selectedAppForInterview, setSelectedAppForInterview] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await applicationsAPI.getCompanyApplications();
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error("Error fetching company applications:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load applications. Please ensure you are logged in as a company."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScheduleModal = (app) => {
    setSelectedAppForInterview(app);
    setIsScheduleModalOpen(true);
  };

  const filteredApplicants = applications.filter((app) => {
    const studentUser = app.student?.userId || {};
    const name = studentUser.name || "";
    const email = studentUser.email || "";
    const branch = app.student?.branch || "";
    const driveRole = app.drive?.role || app.role || "";

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      branch.toLowerCase().includes(search.toLowerCase()) ||
      driveRole.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalApplications = applications.length;

  const shortlisted = applications.filter(
    (app) => app.status === "Shortlisted"
  ).length;

  const interviews = applications.filter(
    (app) => app.status === "Interview"
  ).length;

  const selected = applications.filter(
    (app) => app.status === "Selected"
  ).length;

  const exportToCSV = () => {
    if (applications.length === 0) return;

    const headers = [
      "Student Name",
      "Email",
      "Phone",
      "Branch",
      "CGPA",
      "Applied Role",
      "Status",
      "Applied Date",
    ];

    const rows = applications.map((app) => {
      const student = app.student || {};
      const user = student.userId || {};
      return [
        `"${user.name || "N/A"}"`,
        `"${user.email || "N/A"}"`,
        `"${student.phone || "N/A"}"`,
        `"${student.branch || "N/A"}"`,
        `"${student.cgpa !== undefined ? student.cgpa : "N/A"}"`,
        `"${app.role || app.drive?.role || "N/A"}"`,
        `"${app.status || "Applied"}"`,
        `"${new Date(app.appliedAt || app.createdAt).toLocaleDateString()}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `placement_applicants_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <CompanyNavbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ================= HEADER ================= */}
        <div className="mb-7">
          <p className="text-sm font-semibold text-blue-600">Company Portal</p>

          <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Applicants
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Review verified students who have applied for your campus placement drives.
              </p>
            </div>

            <button
              type="button"
              onClick={exportToCSV}
              disabled={applications.length === 0}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              <Download size={15} />
              Export Applicants
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= SUMMARY ================= */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard
            title="Total Applications"
            value={totalApplications}
            icon={Users}
            iconStyle="bg-blue-50 text-blue-600"
          />
          <SummaryCard
            title="Shortlisted"
            value={shortlisted}
            icon={UserCheck}
            iconStyle="bg-violet-50 text-violet-600"
          />
          <SummaryCard
            title="Interviews"
            value={interviews}
            icon={Clock3}
            iconStyle="bg-amber-50 text-amber-600"
          />
          <SummaryCard
            title="Selected"
            value={selected}
            icon={UserCheck}
            iconStyle="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* ================= FILTERS ================= */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student, branch, or drive role..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-xs font-semibold text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-48"
              >
                <option value="All">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </section>

        {/* ================= APPLICANTS TABLE ================= */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Student Applications
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {filteredApplicants.length} applicants found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              <p className="text-xs text-slate-400">Loading student applicants...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        CGPA
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Drive Role
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredApplicants.map((app) => (
                      <ApplicantRow
                        key={app._id}
                        application={app}
                        onScheduleInterview={handleOpenScheduleModal}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="divide-y divide-slate-100 lg:hidden">
                {filteredApplicants.map((app) => (
                  <ApplicantMobileCard
                    key={app._id}
                    application={app}
                    onScheduleInterview={handleOpenScheduleModal}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredApplicants.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Users size={21} className="text-slate-400" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-slate-800">
                    No applicants found
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {applications.length === 0
                      ? "Students have not applied for your drives yet."
                      : "Try changing your search query or filter selection."}
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedAppForInterview(null);
        }}
        application={selectedAppForInterview}
        onSuccess={() => {
          fetchApplications();
        }}
      />
    </div>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */
const SummaryCard = ({ title, value, icon: Icon, iconStyle }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DESKTOP APPLICANT ROW
========================================================= */
const ApplicantRow = ({ application, onScheduleInterview }) => {
  const student = application.student || {};
  const user = student.userId || {};
  const name = user.name || "Student Applicant";
  const email = user.email || "N/A";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const driveRole = application.role || application.drive?.role || "Drive Role";
  const dateStr = new Date(
    application.appliedAt || application.createdAt
  ).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <tr className="transition hover:bg-slate-50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{name}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{email}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <p className="text-xs font-semibold text-slate-700">
          {student.branch || "General"}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Grad: {student.graduationYear || "N/A"}
        </p>
      </td>

      <td className="px-6 py-4">
        <span className="text-sm font-bold text-slate-800">
          {student.cgpa !== undefined ? student.cgpa : "N/A"}
        </span>
      </td>

      <td className="px-6 py-4">
        <p className="max-w-40 truncate text-xs font-semibold text-slate-700">
          {driveRole}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">{dateStr}</p>
      </td>

      <td className="px-6 py-4">
        <StatusBadge status={application.status} />
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Conditional Interview Actions based on status */}
          {application.status === "Shortlisted" && (
            <button
              type="button"
              onClick={() => onScheduleInterview(application)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 cursor-pointer"
            >
              <CalendarDays size={13} />
              Schedule Interview
            </button>
          )}

          {application.status === "Interview" && (
            <Link
              to="/company/interviews"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
            >
              <CalendarDays size={13} />
              View Interview
            </Link>
          )}

          <Link
            to={`/company/applicants/${application._id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            <Eye size={13} />
            Profile
          </Link>
        </div>
      </td>
    </tr>
  );
};

/* =========================================================
   MOBILE APPLICANT CARD
========================================================= */
const ApplicantMobileCard = ({ application, onScheduleInterview }) => {
  const student = application.student || {};
  const user = student.userId || {};
  const name = user.name || "Student Applicant";
  const email = user.email || "N/A";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const driveRole = application.role || application.drive?.role || "Drive Role";
  const dateStr = new Date(
    application.appliedAt || application.createdAt
  ).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
            {initials}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{name}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{email}</p>
          </div>
        </div>

        <StatusBadge status={application.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <InfoBox label="Branch" value={student.branch || "General"} />
        <InfoBox
          label="CGPA"
          value={student.cgpa !== undefined ? student.cgpa : "N/A"}
        />
        <InfoBox label="Drive" value={driveRole} />
        <InfoBox label="Applied" value={dateStr} />
      </div>

      {student.skills && student.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {student.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600"
            >
              {skill}
            </span>
          ))}
          {student.skills.length > 4 && (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-400">
              +{student.skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="mt-4 flex flex-col gap-2">
        {application.status === "Shortlisted" && (
          <button
            type="button"
            onClick={() => onScheduleInterview(application)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 cursor-pointer"
          >
            <CalendarDays size={14} />
            Schedule Interview
          </button>
        )}

        {application.status === "Interview" && (
          <Link
            to="/company/interviews"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-100 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
          >
            <CalendarDays size={14} />
            View Interview
          </Link>
        )}

        <Link
          to={`/company/applicants/${application._id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          <Eye size={14} />
          View Student Profile
        </Link>
      </div>
    </div>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */
const StatusBadge = ({ status }) => {
  const styles = {
    Applied: "bg-slate-50 text-slate-700 border-slate-200",
    "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
    Shortlisted: "bg-violet-50 text-violet-700 border-violet-200",
    Interview: "bg-blue-50 text-blue-700 border-blue-200",
    Selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
        styles[status] || "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {status || "Applied"}
    </span>
  );
};

/* =========================================================
   INFO BOX
========================================================= */
const InfoBox = ({ label, value }) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-medium text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
};

export default CompanyApplicants;