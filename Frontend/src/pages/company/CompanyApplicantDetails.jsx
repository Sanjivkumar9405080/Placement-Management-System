import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import CompanyNavbar from "../../components/CompanyNavbar";
import { applicationsAPI } from "../../services/api";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  GraduationCap,
  Award,
  FileText,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Loader2,
} from "lucide-react";

const CompanyApplicantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState({ text: "", type: "" });

  const allowedStatuses = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview",
    "Selected",
    "Rejected",
  ];

  useEffect(() => {
    fetchApplicantDetails();
  }, [id]);

  const fetchApplicantDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await applicationsAPI.getApplicantDetails(id);
      if (res.data.success && res.data.application) {
        setApplication(res.data.application);
        setSelectedStatus(res.data.application.status || "Applied");
      } else {
        setError("Applicant details could not be retrieved.");
      }
    } catch (err) {
      console.error("Error fetching applicant details:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load applicant details. Ensure you are authorized."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === application?.status) return;

    try {
      setUpdatingStatus(true);
      setFeedbackMsg({ text: "", type: "" });
      const res = await applicationsAPI.updateStatus(id, selectedStatus);

      if (res.data.success) {
        setApplication((prev) => ({
          ...prev,
          status: selectedStatus,
        }));
        setFeedbackMsg({
          text: `Status successfully updated to "${selectedStatus}".`,
          type: "success",
        });
      }
    } catch (err) {
      console.error("Status update error:", err);
      setFeedbackMsg({
        text:
          err.response?.data?.message ||
          "Failed to update status. Please try again.",
        type: "error",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <CompanyNavbar />
        <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">
            Loading applicant profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-50">
        <CompanyNavbar />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Unable to load applicant
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {error || "Application not found or you are unauthorized to view it."}
            </p>
            <Link
              to="/company/applicants"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <ArrowLeft size={16} />
              Back to Applicants List
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Extract student details safely
  const student = application.student || {};
  const studentUser = student.userId || {};
  const studentName = studentUser.name || "Student Applicant";
  const studentEmail = studentUser.email || "No email available";
  const drive = application.drive || {};

  return (
    <div className="min-h-screen bg-slate-50">
      <CompanyNavbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/company/applicants"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft size={16} />
            Back to Applicants
          </Link>
        </div>

        {/* Feedback Message */}
        {feedbackMsg.text && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border p-4 text-xs font-medium ${
              feedbackMsg.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle size={18} className="shrink-0 text-red-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Top Header Card */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-600 shadow-inner">
                  {studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      {studentName}
                    </h1>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeStyle(
                        application.status
                      )}`}
                    >
                      {application.status}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    Applying for:{" "}
                    <span className="font-semibold text-blue-600">
                      {application.role || drive.role || "Placement Role"}
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Applied on:{" "}
                    {new Date(
                      application.appliedAt || application.createdAt
                    ).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="h-10 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 pr-10 text-xs font-semibold text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {allowedStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={
                    updatingStatus || selectedStatus === application.status
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Details Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Student Profile (2 cols) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Academic Information */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Academic Background
                  </h2>
                  <p className="text-xs text-slate-400">
                    Verified university qualifications
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                    Branch / Department
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {student.branch || "Not Specified"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                    CGPA
                  </p>
                  <p className="mt-1 text-lg font-bold text-emerald-600">
                    {student.cgpa !== undefined ? student.cgpa : "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                    Graduation Year
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {student.graduationYear || "N/A"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                    College / Campus
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {student.college || "College Campus"}
                  </p>
                </div>
              </div>
            </section>

            {/* Skills Profile */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Award size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Technical Skills & Competencies
                  </h2>
                  <p className="text-xs text-slate-400">
                    Skills listed on student candidate profile
                  </p>
                </div>
              </div>

              <div className="mt-5">
                {student.skills && student.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-1.5 text-xs font-semibold text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No specific skills listed on student profile.
                  </p>
                )}
              </div>
            </section>

            {/* Resume Card */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Candidate Resume
                  </h2>
                  <p className="text-xs text-slate-400">
                    Submitted CV/resume document
                  </p>
                </div>
              </div>

              <div className="mt-5">
                {student.resume ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-red-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">
                          {student.resume}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Uploaded PDF document
                        </p>
                      </div>
                    </div>

                    <a
                      href={
                        student.resume.startsWith("http")
                          ? student.resume
                          : `http://localhost:5000/uploads/${student.resume}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                    >
                      <ExternalLink size={14} />
                      View / Download Resume
                    </a>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
                    <p className="text-xs text-slate-400 italic">
                      No resume uploaded yet by the student.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Contact & Applied Drive Info */}
          <div className="space-y-6">
            {/* Contact Details */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">
                Contact Details
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Direct student communication
              </p>

              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-slate-400 uppercase">
                      Email
                    </p>
                    <a
                      href={`mailto:${studentEmail}`}
                      className="block truncate text-xs font-semibold text-slate-800 hover:text-blue-600"
                    >
                      {studentEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Phone size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-slate-400 uppercase">
                      Phone Number
                    </p>
                    <p className="text-xs font-semibold text-slate-800">
                      {student.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Applied Drive Summary */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <BriefcaseBusiness size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Placement Drive Details
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Applied position summary
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-[11px] text-slate-400">Role</p>
                  <p className="text-sm font-bold text-slate-800">
                    {application.role || drive.role || "Role"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-slate-400">CTC Package</p>
                  <p className="text-xs font-bold text-emerald-600">
                    {drive.package || "As per company policy"}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin size={14} className="text-slate-400" />
                  <span>{drive.location || "College Campus"}</span>
                </div>

                {drive.driveDate && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CalendarDays size={14} className="text-slate-400" />
                    <span>
                      Drive Date:{" "}
                      {new Date(drive.driveDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyApplicantDetails;
