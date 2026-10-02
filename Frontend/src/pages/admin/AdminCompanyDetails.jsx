import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { adminAPI } from "../../services/api";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  Link2,
  MapPin,
  Briefcase,
  FileText,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Power,
  Loader2,
  AlertCircle,
  CalendarDays,
  Users,
  Video,
  UserCheck,
  Award,
} from "lucide-react";

const AdminCompanyDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("drives"); // "drives" | "applications" | "interviews"

  // Status toggle modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminAPI.getCompanyDetails(id);
      if (res.data?.success) {
        setData(res.data);
      } else {
        setError(res.data?.message || "Failed to load company details.");
      }
    } catch (err) {
      console.error("Fetch company details error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load company details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!data?.company) return;
    const currentStatus = data.company.status || "Active";
    const nextStatus = currentStatus === "Active" ? "Disabled" : "Active";

    try {
      setStatusSubmitting(true);
      const res = await adminAPI.updateCompanyStatus(id, nextStatus);
      if (res.data?.success) {
        setData((prev) => ({
          ...prev,
          company: {
            ...prev.company,
            status: nextStatus,
          },
        }));
        setStatusModalOpen(false);
      }
    } catch (err) {
      console.error("Toggle company status error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update company status. Please try again."
      );
    } finally {
      setStatusSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNavbar />
        <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center">
          <Loader2 size={36} className="animate-spin text-blue-600" />
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Loading company profile and placement analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.company) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNavbar />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Company Record Not Found
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {error || "The requested recruiting organization could not be located in MongoDB."}
            </p>
            <div className="pt-2">
              <Link
                to="/admin/companies"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
              >
                <ArrowLeft size={14} />
                <span>Return to Companies Directory</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const {
    company,
    placementDrives = [],
    applications = [],
    applicationStats = {
      total: 0,
      applied: 0,
      underReview: 0,
      shortlisted: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
    },
    interviews = [],
    interviewStats = {
      total: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
    },
  } = data;

  const isActive = company.status === "Active";

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/companies"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Companies</span>
          </Link>

          {/* Status Toggle Action */}
          <button
            type="button"
            onClick={() => setStatusModalOpen(true)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition ${
              isActive
                ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <Power size={13} />
            <span>{isActive ? "Disable Account" : "Enable Account"}</span>
          </button>
        </div>

        {/* Company Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-blue-700 shadow-sm border border-blue-100">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.companyName}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : company.companyName ? (
                  company.companyName.slice(0, 2).toUpperCase()
                ) : (
                  "CP"
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    {company.companyName}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
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
                    {company.status || "Active"}
                  </span>
                  <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                    {company.industry || "General / IT"}
                  </span>
                </div>

                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  {company.description ||
                    "Official corporate partner participating in campus placement drives."}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{company.location || "College Campus"}</span>
                  </div>

                  {company.website && (
                    <a
                      href={
                        company.website.startsWith("http")
                          ? company.website
                          : `https://${company.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-blue-600 hover:underline"
                    >
                      <Globe size={13} />
                      <span className="truncate max-w-[180px]">
                        {company.website.replace(/^https?:\/\//, "")}
                      </span>
                      <ExternalLink size={11} />
                    </a>
                  )}

                  {company.linkedin && (
                    <a
                      href={
                        company.linkedin.startsWith("http")
                          ? company.linkedin
                          : `https://${company.linkedin}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-blue-600 hover:underline"
                    >
                      <Link2 size={13} />
                      <span>LinkedIn Profile</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Recruiter / Contact Box */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-xs space-y-2 md:min-w-[240px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Primary Contact (HR)
              </span>
              <p className="font-bold text-slate-800 text-sm">
                {company.hrName || "Not Specified"}
              </p>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">{company.officialEmail || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={13} className="text-slate-400 shrink-0" />
                <span>{company.phone || "Not Specified"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics KPI Ribbon */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Placement Drives
            </span>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {placementDrives.length}
            </p>
            <span className="text-[10px] text-blue-600 font-semibold">
              {placementDrives.filter((d) => d.status === "Active").length} Active
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Total Applicants
            </span>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {applicationStats.total}
            </p>
            <span className="text-[10px] text-slate-500">Across all drives</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Shortlisted
            </span>
            <p className="mt-1 text-2xl font-bold text-indigo-600">
              {applicationStats.shortlisted}
            </p>
            <span className="text-[10px] text-indigo-500">Screened candidates</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Interviews
            </span>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {interviewStats.total}
            </p>
            <span className="text-[10px] text-blue-500">
              {interviewStats.upcoming} Scheduled
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Selected Offers
            </span>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {applicationStats.selected}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">
              Final job offers
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Rejected
            </span>
            <p className="mt-1 text-2xl font-bold text-rose-600">
              {applicationStats.rejected}
            </p>
            <span className="text-[10px] text-slate-400">Applications</span>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("drives")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "drives"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Briefcase size={14} />
            <span>Placement Drives ({placementDrives.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("applications")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "applications"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <FileText size={14} />
            <span>Candidate Applications ({applications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("interviews")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "interviews"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <CalendarCheck size={14} />
            <span>Scheduled Interviews ({interviews.length})</span>
          </button>
        </div>

        {/* TAB 1: PLACEMENT DRIVES */}
        {activeTab === "drives" && (
          <div className="space-y-4">
            {placementDrives.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-2">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Briefcase size={22} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  No Placement Drives Created Yet
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  This company has not scheduled or published any campus recruitment drives yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {placementDrives.map((drive) => {
                  const isDriveActive = drive.status === "Active";
                  const deadlinePassed =
                    drive.applicationDeadline &&
                    new Date(drive.applicationDeadline) < new Date();

                  return (
                    <div
                      key={drive._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">
                              {drive.role}
                            </h3>
                            <p className="text-xs font-semibold text-emerald-600">
                              {drive.package}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              isDriveActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                : drive.status === "Completed"
                                ? "bg-blue-50 text-blue-700 border border-blue-200/50"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {drive.status || "Active"}
                          </span>
                        </div>

                        {drive.description && (
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {drive.description}
                          </p>
                        )}

                        <div className="space-y-1.5 pt-2 text-xs text-slate-600 border-t border-slate-100">
                          {drive.driveDate && (
                            <div className="flex items-center gap-2 text-[11px]">
                              <CalendarDays size={13} className="text-slate-400" />
                              <span>
                                Drive Date:{" "}
                                <strong>
                                  {new Date(drive.driveDate).toLocaleDateString()}
                                </strong>
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-[11px]">
                            <Clock size={13} className="text-slate-400" />
                            <span
                              className={
                                deadlinePassed ? "text-rose-600 font-bold" : ""
                              }
                            >
                              Deadline:{" "}
                              {new Date(
                                drive.applicationDeadline
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px]">
                            <Users size={13} className="text-slate-400" />
                            <span>
                              Total Applicants:{" "}
                              <strong className="text-blue-600">
                                {drive.totalApplicants || 0}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Eligibility & Skills tags */}
                        {drive.eligibility?.branches?.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {drive.eligibility.branches.slice(0, 3).map((b, i) => (
                              <span
                                key={i}
                                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600"
                              >
                                {b}
                              </span>
                            ))}
                            {drive.eligibility.branches.length > 3 && (
                              <span className="text-[10px] text-slate-400">
                                +{drive.eligibility.branches.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Drive Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <Link
                          to={`/placement-drives/${drive._id}`}
                          className="flex-1 text-center rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-blue-50 hover:text-blue-700 transition"
                        >
                          View Drive
                        </Link>
                        <button
                          type="button"
                          onClick={() => setActiveTab("applications")}
                          className="flex-1 text-center rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                        >
                          View Applicants ({drive.totalApplicants || 0})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: APPLICATIONS */}
        {activeTab === "applications" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Applications Received
                </h3>
                <p className="text-xs text-slate-400">
                  All candidate submissions for {company.companyName} drives
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {applications.length} Submissions
              </span>
            </div>

            {applications.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400 italic">
                No candidates have applied to this company's drives yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Role Applied</th>
                      <th className="px-4 py-3">Applied Date</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {app.student?.userId?.name ||
                            app.student?.name ||
                            "Candidate"}
                          <span className="block text-[11px] font-normal text-slate-400">
                            {app.student?.userId?.email || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {app.drive?.role || app.role || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(
                            app.appliedAt || app.createdAt
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              app.status === "Selected"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : app.status === "Shortlisted"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : app.status === "Interview"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : app.status === "Rejected"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {app.student?._id && (
                            <Link
                              to={`/admin/students/${app.student._id}`}
                              className="text-xs font-bold text-blue-600 hover:underline"
                            >
                              View Profile
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INTERVIEWS */}
        {activeTab === "interviews" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Scheduled Interviews
                </h3>
                <p className="text-xs text-slate-400">
                  Interviews conducted by {company.companyName}
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {interviews.length} Total
              </span>
            </div>

            {interviews.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400 italic">
                No interviews have been scheduled by this company yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                      <th className="px-4 py-3">Candidate</th>
                      <th className="px-4 py-3">Role / Drive</th>
                      <th className="px-4 py-3">Mode</th>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">Interviewer</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {interviews.map((inv) => (
                      <tr key={inv._id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {inv.student?.userId?.name ||
                            inv.student?.name ||
                            "Candidate"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {inv.drive?.role || "Campus Drive"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {inv.mode === "Online" ? (
                              <Video size={10} />
                            ) : (
                              <MapPin size={10} />
                            )}
                            {inv.mode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(inv.date).toLocaleDateString()} at {inv.time}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {inv.interviewerName || "Recruitment Panel"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              inv.status === "Completed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : inv.status === "Cancelled"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirmation Modal for Enable / Disable */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  isActive
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <Power size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isActive ? "Disable Company Account" : "Enable Company Account"}
                </h3>
                <p className="text-xs text-slate-500">{company.companyName}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isActive ? (
                <>
                  Are you sure you want to disable this company? They will{" "}
                  <strong className="text-slate-900">
                    NOT be able to create new placement drives or access company dashboard operations
                  </strong>
                  . All existing applications, historical interviews, and candidate data will remain safely preserved.
                </>
              ) : (
                <>
                  Are you sure you want to re-enable this company account? They will regain access to create and manage placement drives.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                disabled={statusSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusSubmitting}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow transition disabled:opacity-50 ${
                  isActive
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {statusSubmitting && (
                  <Loader2 size={13} className="animate-spin" />
                )}
                <span>Confirm {isActive ? "Disable" : "Enable"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanyDetails;
