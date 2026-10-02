import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { adminAPI } from "../../services/api";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  GraduationCap,
  Award,
  FileText,
  CalendarCheck,
  Building2,
  ExternalLink,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Briefcase,
  FolderGit2,
  Globe,
  Loader2,
  AlertCircle,
  Video,
  MapPin,
  CalendarDays,
} from "lucide-react";

const AdminStudentDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminAPI.getStudentDetails(id);
      if (res.data?.success && res.data?.student) {
        setData(res.data);
      } else {
        setError(res.data?.message || "Student details could not be retrieved.");
      }
    } catch (err) {
      console.error("Fetch student details error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load student profile. Please check if ID is valid."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Selected":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Shortlisted":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Interview":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Under Review":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Rejected":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getInterviewStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "Rescheduled":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const student = data?.student;
  const applications = data?.applications || [];
  const interviews = data?.interviews || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/admin/students"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft size={16} />
            Back to All Students
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <div className="flex-1 font-medium">{error}</div>
            <button
              onClick={fetchStudentDetails}
              className="rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <Loader2 size={36} className="animate-spin text-blue-600 mb-3" />
            <p className="text-xs font-medium text-slate-500">
              Loading student dossier...
            </p>
          </div>
        ) : !student ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <AlertCircle size={32} className="text-slate-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-900">
              Student not found
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              The requested student ID does not correspond to an active candidate.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Profile Header Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-28 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900" />
              <div className="relative px-6 pb-6 pt-0 sm:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 sm:-mt-14">
                  {/* Avatar & Identifiers */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 text-2xl font-bold text-white shadow-md">
                      {student.name
                        ? student.name
                            .split(" ")
                            .filter(Boolean)
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "ST"}
                    </div>
                    <div className="pt-2 sm:pt-14">
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-900">
                          {student.name}
                        </h1>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active Student
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {student.email} • {student.phone || "No phone listed"}
                      </p>
                    </div>
                  </div>

                  {/* Top Stats Tags */}
                  <div className="flex items-center gap-3 pt-2 sm:pt-0">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 text-center">
                      <span className="text-[10px] font-semibold uppercase text-slate-400">
                        CGPA
                      </span>
                      <p className="text-base font-bold text-blue-600">
                        {Number(student.cgpa).toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 text-center">
                      <span className="text-[10px] font-semibold uppercase text-slate-400">
                        Batch
                      </span>
                      <p className="text-base font-bold text-slate-800">
                        {student.graduationYear}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 text-center">
                      <span className="text-[10px] font-semibold uppercase text-slate-400">
                        Applications
                      </span>
                      <p className="text-base font-bold text-slate-800">
                        {applications.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content 2-Column Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column (Academic & Personal & Resume) */}
              <div className="space-y-6">
                {/* Academic Information */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <GraduationCap size={18} className="text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Academic Details
                    </h2>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        Institution
                      </span>
                      <p className="font-bold text-slate-800">
                        {student.college || "College of Engineering"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        Degree / Course
                      </span>
                      <p className="font-bold text-slate-800">
                        {student.course}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        Branch / Specialization
                      </span>
                      <p className="font-bold text-slate-800">
                        {student.branch}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          Roll Number
                        </span>
                        <p className="font-bold text-slate-800">
                          {student.rollNumber || "Not registered"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">
                          Passing Year
                        </span>
                        <p className="font-bold text-slate-800">
                          {student.graduationYear}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate Resume */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <FileText size={18} className="text-red-500" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Candidate Resume
                    </h2>
                  </div>

                  {student.resume ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-600">
                          PDF
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-800">
                            {student.resumeOriginalName || "Student_Resume.pdf"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Verified Upload
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={student.resume}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm"
                        >
                          <Eye size={13} />
                          View Resume
                        </a>
                        <a
                          href={student.resume}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                          title="Download PDF"
                        >
                          <Download size={13} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center">
                      <p className="text-xs text-slate-400 italic">
                        No resume document uploaded yet by student.
                      </p>
                    </div>
                  )}
                </div>

                {/* Technical Skills */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <Award size={18} className="text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Skills & Expertise
                    </h2>
                  </div>

                  {student.skills && student.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {student.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="rounded-lg border border-blue-100 bg-blue-50/70 px-2.5 py-1 text-xs font-semibold text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No technical skills listed.
                    </p>
                  )}
                </div>

                {/* Professional Links */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <Globe size={18} className="text-emerald-600" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Professional Links
                    </h2>
                  </div>

                  {student.professionalLinks &&
                  student.professionalLinks.length > 0 ? (
                    <div className="space-y-2 pt-1 text-xs">
                      {student.professionalLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={
                            link.url?.startsWith("http")
                              ? link.url
                              : `https://${link.url}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2.5 hover:bg-blue-50/60 transition group"
                        >
                          <span className="font-semibold text-slate-700 group-hover:text-blue-700">
                            {link.name || "Portfolio Link"}
                          </span>
                          <ExternalLink
                            size={13}
                            className="text-slate-400 group-hover:text-blue-600"
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No external profiles linked.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Applications, Interviews, Projects, Achievements (Col 2-3) */}
              <div className="space-y-6 lg:col-span-2">
                {/* Applications History */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Briefcase size={18} className="text-blue-600" />
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">
                          Placement Drive Applications
                        </h2>
                        <p className="text-[11px] text-slate-400">
                          Total drives applied by this student
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {applications.length} Total
                    </span>
                  </div>

                  {applications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 italic">
                      This student has not submitted applications for any placement drives yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {applications.map((app) => (
                        <div
                          key={app._id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 hover:bg-slate-50/50 px-2 rounded-xl transition"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                              <Building2 size={18} className="text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-xs truncate">
                                {app.role || app.drive?.role || "Campus Drive"}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {app.company?.companyName || "Corporate Partner"}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Applied:{" "}
                                {new Date(
                                  app.appliedAt || app.createdAt
                                ).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <span
                              className={`rounded-full border px-3 py-0.5 text-xs font-bold ${getStatusBadge(
                                app.status
                              )}`}
                            >
                              {app.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interview Schedules */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <CalendarCheck size={18} className="text-rose-600" />
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">
                          Scheduled Interviews
                        </h2>
                        <p className="text-[11px] text-slate-400">
                          Interview rounds conducted or queued
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                      {interviews.length} Scheduled
                    </span>
                  </div>

                  {interviews.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 italic">
                      No interviews currently scheduled for this candidate.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {interviews.map((item) => (
                        <div
                          key={item._id}
                          className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-xs text-slate-900">
                                {item.company?.companyName || "Hiring Partner"}
                              </p>
                              <p className="text-[11px] text-blue-600 font-semibold">
                                {item.drive?.role || "Assessment Round"}
                              </p>
                            </div>
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getInterviewStatusBadge(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs border-t border-slate-200/70 pt-2.5">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <CalendarDays size={13} className="text-slate-400" />
                              <span>
                                {new Date(item.date).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Clock size={13} className="text-slate-400" />
                              <span>{item.time}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                              {item.mode === "Online" ? (
                                <Video size={13} className="text-blue-500" />
                              ) : (
                                <MapPin size={13} className="text-emerald-500" />
                              )}
                              <span>{item.mode}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projects Section */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <FolderGit2 size={18} className="text-violet-600" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Projects & Work Portfolio
                    </h2>
                  </div>

                  {student.projects && student.projects.length > 0 ? (
                    <div className="space-y-3">
                      {student.projects.map((proj, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xs text-slate-900">
                              {proj.name}
                            </h3>
                            {proj.link && (
                              <a
                                href={
                                  proj.link.startsWith("http")
                                    ? proj.link
                                    : `https://${proj.link}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                              >
                                View Project
                                <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                          {proj.description && (
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {proj.description}
                            </p>
                          )}
                          {proj.technologies && (
                            <p className="text-[11px] text-slate-400">
                              Tech: {proj.technologies}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No academic projects added.
                    </p>
                  )}
                </div>

                {/* Achievements Section */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                    <Award size={18} className="text-amber-500" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Honors & Achievements
                    </h2>
                  </div>

                  {student.achievements && student.achievements.length > 0 ? (
                    <div className="space-y-2">
                      {student.achievements.map((ach, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50 p-3"
                        >
                          <div>
                            <p className="font-bold text-xs text-slate-800">
                              {ach.title}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {ach.organization}
                            </p>
                          </div>
                          {ach.year && (
                            <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                              {ach.year}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No achievements recorded.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminStudentDetails;
