import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { adminAPI } from "../../services/api";
import {
  ArrowLeft,
  Building2,
  Briefcase,
  MapPin,
  CalendarDays,
  Clock,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Power,
  ExternalLink,
  GraduationCap,
  Sparkles,
  FileText,
  CalendarCheck,
  Video,
} from "lucide-react";

const AdminPlacementDriveDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Close drive modal state
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closeSubmitting, setCloseSubmitting] = useState(false);

  useEffect(() => {
    fetchDriveDetails();
  }, [id]);

  const fetchDriveDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminAPI.getAdminPlacementDriveDetails(id);
      if (res.data?.success) {
        setData(res.data);
      } else {
        setError(res.data?.message || "Failed to load placement drive details.");
      }
    } catch (err) {
      console.error("Fetch drive details error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load drive details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDrive = async () => {
    try {
      setCloseSubmitting(true);
      const res = await adminAPI.closeAdminPlacementDrive(id);
      if (res.data?.success) {
        setData((prev) => ({
          ...prev,
          drive: {
            ...prev.drive,
            status: "Closed",
          },
        }));
        setCloseModalOpen(false);
      }
    } catch (err) {
      console.error("Close drive error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to close placement drive. Please try again."
      );
    } finally {
      setCloseSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNavbar />
        <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center">
          <Loader2 size={36} className="animate-spin text-blue-600" />
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Loading drive details and application breakdown...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data?.drive) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNavbar />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Placement Drive Not Found
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {error || "The requested placement drive could not be found in MongoDB."}
            </p>
            <div className="pt-2">
              <Link
                to="/admin/drives"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
              >
                <ArrowLeft size={14} />
                <span>Return to Placement Drives</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const {
    drive,
    applicationStats = {
      total: 0,
      applied: 0,
      underReview: 0,
      shortlisted: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
    },
    interviewStats = {
      total: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
    },
    interviews = [],
  } = data;

  const isDriveActive = drive.status === "Active";
  const deadlinePassed =
    drive.applicationDeadline &&
    new Date(drive.applicationDeadline) < new Date();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation & Top Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/admin/drives"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Placement Drives</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to={`/admin/drives/${drive._id}/applicants`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
            >
              <Users size={14} />
              <span>View Applicants ({applicationStats.total})</span>
            </Link>

            {isDriveActive && (
              <button
                type="button"
                onClick={() => setCloseModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 shadow-sm hover:bg-rose-100 transition"
              >
                <Power size={13} />
                <span>Close Drive</span>
              </button>
            )}
          </div>
        </div>

        {/* Drive Main Header Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-blue-700 shadow-sm border border-blue-100">
                {drive.company?.logo ? (
                  <img
                    src={drive.company.logo}
                    alt={drive.company?.companyName}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : drive.company?.companyName ? (
                  drive.company.companyName.slice(0, 2).toUpperCase()
                ) : (
                  "CP"
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    {drive.role}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      isDriveActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : drive.status === "Completed"
                        ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isDriveActive
                          ? "bg-emerald-500"
                          : drive.status === "Completed"
                          ? "bg-blue-500"
                          : "bg-slate-400"
                      }`}
                    />
                    {drive.status || "Active"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  {drive.company?._id ? (
                    <Link
                      to={`/admin/companies/${drive.company._id}`}
                      className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Building2 size={13} />
                      <span>{drive.company.companyName}</span>
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-800">
                      {drive.company?.companyName || "Recruiting Partner"}
                    </span>
                  )}

                  <span className="text-slate-300">•</span>

                  <span className="font-bold text-emerald-600 text-sm">
                    {drive.package}
                  </span>

                  <span className="text-slate-300">•</span>

                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={12} />
                    <span>{drive.location || "College Campus"}</span>
                  </div>
                </div>

                {drive.description && (
                  <p className="pt-2 text-xs text-slate-500 leading-relaxed max-w-3xl">
                    {drive.description}
                  </p>
                )}
              </div>
            </div>

            {/* Timeline & Important Dates Card */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-xs space-y-2.5 lg:min-w-[260px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Schedule & Milestones
              </span>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Drive Date:</span>
                <span className="font-bold text-slate-800">
                  {drive.driveDate
                    ? new Date(drive.driveDate).toLocaleDateString()
                    : "To Be Announced"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Application Deadline:</span>
                <span
                  className={`font-bold ${
                    deadlinePassed ? "text-rose-600" : "text-slate-800"
                  }`}
                >
                  {new Date(drive.applicationDeadline).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Created On:</span>
                <span className="text-slate-600">
                  {new Date(drive.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Statistics KPI Ribbon (Requirement 5 & 6) */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Application Breakdown (This Drive)
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {/* Total */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Total Applicants
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {applicationStats.total}
              </p>
              <span className="text-[10px] text-slate-400">Total received</span>
            </div>

            {/* Applied */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Applied
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-700">
                {applicationStats.applied}
              </p>
              <span className="text-[10px] text-slate-400">New submissions</span>
            </div>

            {/* Under Review */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Under Review
              </span>
              <p className="mt-1 text-2xl font-bold text-amber-600">
                {applicationStats.underReview}
              </p>
              <span className="text-[10px] text-amber-600">Screening</span>
            </div>

            {/* Shortlisted */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Shortlisted
              </span>
              <p className="mt-1 text-2xl font-bold text-indigo-600">
                {applicationStats.shortlisted}
              </p>
              <span className="text-[10px] text-indigo-500">Qualified</span>
            </div>

            {/* Interview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Interview
              </span>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {applicationStats.interview}
              </p>
              <span className="text-[10px] text-blue-500">In rounds</span>
            </div>

            {/* Selected */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Selected
              </span>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {applicationStats.selected}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">
                Job offers
              </span>
            </div>

            {/* Rejected */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Rejected
              </span>
              <p className="mt-1 text-2xl font-bold text-rose-600">
                {applicationStats.rejected}
              </p>
              <span className="text-[10px] text-rose-500">Not selected</span>
            </div>
          </div>
        </div>

        {/* Criteria & Requirements Details Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Eligibility Criteria */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <GraduationCap size={18} className="text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Eligibility Criteria
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-[11px] text-slate-400 block">
                  Minimum CGPA
                </span>
                <span className="text-base font-bold text-slate-900">
                  {drive.eligibility?.minCGPA || 0.0} CGPA
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-[11px] text-slate-400 block">
                  Passing Batch
                </span>
                <span className="text-base font-bold text-slate-900">
                  {drive.eligibility?.passingYear
                    ? `${drive.eligibility.passingYear} Batch`
                    : "Any Passing Batch"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-2">
                Eligible Branches:
              </span>
              {drive.eligibility?.branches?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {drive.eligibility.branches.map((b, i) => (
                    <span
                      key={i}
                      className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Open to all eligible branches.
                </p>
              )}
            </div>
          </div>

          {/* Required Skills & Competencies */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Sparkles size={18} className="text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">
                Required Technical Skills
              </h2>
            </div>

            {drive.skills && drive.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {drive.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No specific skill tags required for this role.
              </p>
            )}

            {/* Quick Actions Panel */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 pt-3 mt-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Drive Quick Management
              </span>
              <p className="text-xs text-slate-600">
                Inspect verified student applications or close registration for this placement drive.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Link
                  to={`/admin/drives/${drive._id}/applicants`}
                  className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
                >
                  View All Applicants
                </Link>
                {isDriveActive && (
                  <button
                    type="button"
                    onClick={() => setCloseModalOpen(true)}
                    className="rounded-lg border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition"
                  >
                    Close This Drive
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interviews Conducted for this Drive */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <CalendarCheck size={18} className="text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Interviews for this Drive
                </h3>
                <p className="text-[11px] text-slate-400">
                  Candidate interview rounds scheduled specifically for this placement drive
                </p>
              </div>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {interviews.length} Interviews
            </span>
          </div>

          {interviews.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400 italic">
              No interview rounds have been scheduled for this drive yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                    <th className="px-4 py-3">Candidate</th>
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
                          "Student"}
                        <span className="block text-[11px] font-normal text-slate-400">
                          {inv.student?.userId?.email || "N/A"}
                        </span>
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
      </main>

      {/* Close Drive Modal */}
      {closeModalOpen && (
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
                  {drive.role} • {drive.company?.companyName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to close this placement drive? Students will no longer be able to submit new applications. All existing applications, interview schedules, candidate resumes, and historical records will remain safely preserved.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCloseModalOpen(false)}
                disabled={closeSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCloseDrive}
                disabled={closeSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-rose-700 transition disabled:opacity-50"
              >
                {closeSubmitting && (
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

export default AdminPlacementDriveDetails;
