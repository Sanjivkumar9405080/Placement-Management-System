import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { adminAPI } from "../../services/api";
import {
  ArrowLeft,
  User,
  Building2,
  Briefcase,
  FileText,
  CalendarCheck,
  CalendarDays,
  Clock,
  Video,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Award,
  AlertCircle,
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

const AdminApplicationDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminAPI.getAdminApplicationDetails(id);
      if (res.data?.success && res.data?.application) {
        setData(res.data.application);
      } else {
        setError(res.data?.message || "Failed to load application details.");
      }
    } catch (err) {
      console.error("Fetch application details error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load application details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNavbar />
        <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center">
          <Loader2 size={36} className="animate-spin text-blue-600" />
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Loading candidate application record...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNavbar />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Application Record Not Found
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {error || "The requested application could not be found in MongoDB."}
            </p>
            <div className="pt-2">
              <Link
                to="/admin/applications"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
              >
                <ArrowLeft size={14} />
                <span>Return to Applications Directory</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const {
    student = {},
    company = {},
    drive = {},
    interview = null,
    status = "Applied",
    appliedAt,
    role,
  } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/admin/applications"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition"
          >
            <ArrowLeft size={14} />
            <span>Back to Applications</span>
          </Link>

          <div className="flex items-center gap-2">
            {student._id && (
              <Link
                to={`/admin/students/${student._id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-sm"
              >
                <User size={13} />
                <span>View Student Profile</span>
              </Link>
            )}

            {drive._id && (
              <Link
                to={`/admin/drives/${drive._id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition shadow-sm"
              >
                <Briefcase size={13} />
                <span>View Placement Drive</span>
              </Link>
            )}
          </div>
        </div>

        {/* Top Summary Ribbon */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-base font-bold text-blue-700 shadow-sm border border-blue-100">
                <FileText size={28} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    Application #{data._id?.slice(-6).toUpperCase()}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      status === "Selected"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : status === "Shortlisted"
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : status === "Interview"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : status === "Under Review"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : status === "Rejected"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 pt-0.5">
                  Applied for <strong>{role || drive.role}</strong> at{" "}
                  <strong>{company.companyName}</strong> on{" "}
                  {new Date(appliedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-right">
                <span className="text-[11px] text-slate-400 block">
                  Interview Stage
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {interview ? interview.status : "No interview scheduled"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars Grid: Student, Company, Drive, Interview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 1. STUDENT DETAILS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <User size={18} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Candidate Profile
                  </h2>
                </div>
                {student._id && (
                  <Link
                    to={`/admin/students/${student._id}`}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <span className="text-[11px] text-slate-400 block">Full Name</span>
                  <p className="text-sm font-bold text-slate-900">
                    {student.name || "Student"}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Email Address</span>
                  <div className="flex items-center gap-1 text-slate-700 truncate">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{student.email || "N/A"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Phone Number</span>
                  <div className="flex items-center gap-1 text-slate-700">
                    <Phone size={12} className="text-slate-400 shrink-0" />
                    <span>{student.phone || "Not set"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Branch & Course</span>
                  <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    {student.branch || "General"}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {student.course || "B.Tech"}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Academic CGPA</span>
                  <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    {Number(student.cgpa || 7.0).toFixed(2)} CGPA
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Passing Year</span>
                  <span className="font-semibold text-slate-800">
                    {student.passingYear || 2027} Batch
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              {student._id && (
                <Link
                  to={`/admin/students/${student._id}`}
                  className="block w-full text-center rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                >
                  View Full Student Academic Details
                </Link>
              )}
            </div>
          </div>

          {/* 2. COMPANY DETAILS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <Building2 size={18} className="text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Recruiting Partner
                  </h2>
                </div>
                {company._id && (
                  <Link
                    to={`/admin/companies/${company._id}`}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Company Details</span>
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <span className="text-[11px] text-slate-400 block">Company Name</span>
                  <p className="text-sm font-bold text-slate-900">
                    {company.companyName || "Company"}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Industry</span>
                  <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    {company.industry || "General Industry"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">HR / Recruiter</span>
                  <span className="font-semibold text-slate-800">
                    {company.hrName || "Recruitment HR"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Official Email</span>
                  <div className="flex items-center gap-1 text-slate-700 truncate">
                    <Mail size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{company.officialEmail || "N/A"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Location</span>
                  <div className="flex items-center gap-1 text-slate-700">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span>{company.location || "College Campus"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              {company._id && (
                <Link
                  to={`/admin/companies/${company._id}`}
                  className="block w-full text-center rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  View Corporate Profile & Analytics
                </Link>
              )}
            </div>
          </div>

          {/* 3. PLACEMENT DRIVE DETAILS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <Briefcase size={18} className="text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Placement Drive
                  </h2>
                </div>
                {drive._id && (
                  <Link
                    to={`/admin/drives/${drive._id}`}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Drive Details</span>
                    <ExternalLink size={12} />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Job Role</span>
                  <p className="text-sm font-bold text-slate-900">
                    {drive.role || role || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Salary Package</span>
                  <p className="text-sm font-bold text-emerald-600">
                    {drive.package || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Drive Date</span>
                  <div className="flex items-center gap-1 text-slate-700">
                    <CalendarDays size={12} className="text-slate-400" />
                    <span>
                      {drive.driveDate
                        ? new Date(drive.driveDate).toLocaleDateString()
                        : "TBD"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Deadline</span>
                  <div className="flex items-center gap-1 text-slate-700">
                    <Clock size={12} className="text-slate-400" />
                    <span>
                      {drive.applicationDeadline
                        ? new Date(drive.applicationDeadline).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="text-[11px] text-slate-400 block">Drive Status</span>
                  <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 mt-0.5">
                    {drive.status || "Active"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              {drive._id && (
                <Link
                  to={`/admin/drives/${drive._id}`}
                  className="block w-full text-center rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  View Full Placement Drive Page
                </Link>
              )}
            </div>
          </div>

          {/* 4. INTERVIEW DETAILS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <CalendarCheck size={18} className="text-purple-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Interview Details
                  </h2>
                </div>
                {interview && (
                  <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                    {interview.status}
                  </span>
                )}
              </div>

              {interview ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Date</span>
                    <div className="flex items-center gap-1 text-slate-800 font-semibold">
                      <CalendarDays size={12} className="text-slate-400" />
                      <span>{new Date(interview.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Time</span>
                    <div className="flex items-center gap-1 text-slate-800 font-semibold">
                      <Clock size={12} className="text-slate-400" />
                      <span>{interview.time}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Mode</span>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                      {interview.mode === "Online" ? (
                        <Video size={11} />
                      ) : (
                        <MapPin size={11} />
                      )}
                      {interview.mode}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block">Interviewer</span>
                    <span className="font-semibold text-slate-800">
                      {interview.interviewerName || "Recruitment Panel"}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[11px] text-slate-400 block">
                      Venue / Meeting Link
                    </span>
                    {interview.meetingLink ? (
                      <a
                        href={
                          interview.meetingLink.startsWith("http")
                            ? interview.meetingLink
                            : `https://${interview.meetingLink}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline text-xs font-semibold break-all"
                      >
                        {interview.meetingLink}
                      </a>
                    ) : (
                      <span className="text-slate-700">
                        {interview.venue || "Campus Interview Venue"}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-1">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <CalendarCheck size={20} />
                  </div>
                  <p className="text-xs font-bold text-slate-700 pt-2">
                    No interview scheduled
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    The company has not scheduled an interview round for this application yet.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Application ID: {data._id}</span>
              <span>Status: {status}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminApplicationDetails;
