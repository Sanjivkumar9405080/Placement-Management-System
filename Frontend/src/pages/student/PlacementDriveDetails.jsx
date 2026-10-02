import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { placementDrivesAPI, applicationsAPI } from "../../services/api";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  MapPin,
  Users,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

const PlacementDriveDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ text: "", type: "" });

  // Catalog fallback for mockup / default viewing
  const fallbackCatalog = {
    company: "TechNova Solutions",
    shortName: "TN",
    role: "MERN Stack Developer",
    package: "₹6 - 8 LPA",
    location: "College Campus",
    workMode: "On-site",
    deadline: "12 October 2026",
    driveDate: "15 October 2026",
    vacancies: "10 Positions",
    description:
      "TechNova Solutions is looking for enthusiastic software developers who have a strong interest in full-stack web development. The selected candidates will work on real-world web applications and collaborate with experienced development teams.",
    skills: [
      "JavaScript",
      "React.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "REST API",
      "Git & GitHub",
    ],
    eligibilityList: [
      "B.Tech in Computer Science, IT, or related branch",
      "Minimum CGPA: 6.0",
      "No active backlogs",
      "2027 graduating batch",
    ],
    selectionProcess: [
      "Resume Shortlisting",
      "Online / Technical Assessment",
      "Technical Interview",
      "HR Interview",
      "Final Selection",
    ],
    responsibilities: [
      "Develop and maintain web applications",
      "Work with frontend and backend technologies",
      "Build and integrate REST APIs",
      "Debug and improve application performance",
      "Collaborate with the development team",
    ],
  };

  useEffect(() => {
    fetchDriveDetails();
    checkIfAlreadyApplied();
  }, [id]);

  const fetchDriveDetails = async () => {
    try {
      setLoading(true);
      if (id && id.length === 24) {
        // Valid MongoDB ObjectId
        const res = await placementDrivesAPI.getById(id);
        if (res.data.success && res.data.drive) {
          const d = res.data.drive;
          const companyName = d.company?.companyName || "TechNova Solutions";
          const shortName = companyName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          const eligibilityList = [];
          if (d.eligibility?.branches?.length > 0) {
            eligibilityList.push(
              `Branches: ${d.eligibility.branches.join(", ")}`
            );
          }
          if (d.eligibility?.minCGPA > 0) {
            eligibilityList.push(
              `Minimum CGPA required: ${d.eligibility.minCGPA}`
            );
          }
          if (d.eligibility?.passingYear) {
            eligibilityList.push(`Batch of ${d.eligibility.passingYear}`);
          }
          if (eligibilityList.length === 0) {
            eligibilityList.push("Open to all graduating students");
          }

          setDrive({
            _id: d._id,
            company: companyName,
            shortName,
            role: d.role,
            package: d.package,
            location: d.location || "College Campus",
            workMode: "On-site",
            deadline: d.applicationDeadline
              ? new Date(d.applicationDeadline).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Ongoing",
            driveDate: d.driveDate
              ? new Date(d.driveDate).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "To be announced",
            vacancies: "Campus Hiring",
            description:
              d.description ||
              "Exciting campus placement opportunity with our corporate partner.",
            skills:
              d.skills && d.skills.length > 0
                ? d.skills
                : ["Problem Solving", "Core CS", "Communication"],
            eligibilityList,
            selectionProcess: [
              "Profile & Resume Screening",
              "Technical Assessment / Interview",
              "HR Interaction",
              "Final Offer",
            ],
            responsibilities: [
              "Work alongside engineering mentors on production software",
              "Develop scalable features and participate in agile sprints",
              "Adhere to best development and testing practices",
            ],
            status: d.status,
          });
          return;
        }
      }
      // If not MongoDB ID or request fails, fallback gracefully
      setDrive(fallbackCatalog);
    } catch (err) {
      console.warn("Using fallback drive details:", err.message);
      setDrive(fallbackCatalog);
    } finally {
      setLoading(false);
    }
  };

  const checkIfAlreadyApplied = async () => {
    try {
      const res = await applicationsAPI.getMyApplications();
      if (res.data.success && res.data.applications) {
        const hasApplied = res.data.applications.some(
          (app) => app.drive?._id === id || app.drive === id
        );
        if (hasApplied) {
          setApplied(true);
        }
      }
    } catch (err) {
      // Ignore if unauthenticated
    }
  };

  const handleApply = () => {
    setAlertInfo({ text: "", type: "" });
    setIsApplyModalOpen(true);
  };

  const handleConfirmApply = async () => {
    try {
      setSubmitting(true);
      setAlertInfo({ text: "", type: "" });

      const driveIdToApply = drive?._id || id;
      if (!driveIdToApply || driveIdToApply.length !== 24) {
        setAlertInfo({
          text: "Demo drive applied successfully! (Note: Live applications require a real registered drive from the database).",
          type: "success",
        });
        setApplied(true);
        setIsApplyModalOpen(false);
        return;
      }

      const res = await applicationsAPI.apply(driveIdToApply);
      if (res.data.success) {
        setApplied(true);
        setAlertInfo({
          text: "Your application was submitted successfully! The company recruitment team can now view your verified profile and resume.",
          type: "success",
        });
        setIsApplyModalOpen(false);
      }
    } catch (err) {
      console.error("Apply error:", err);
      const msg =
        err.response?.data?.message ||
        "Failed to apply. Make sure you meet the criteria and have uploaded your profile.";
      setAlertInfo({
        text: msg,
        type: "error",
      });
      setIsApplyModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const currentDrive = drive || fallbackCatalog;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ================= BACK BUTTON ================= */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/student/drives")}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600 cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Placement Drives
          </button>
        </div>

        {/* Alert Feedback */}
        {alertInfo.text && (
          <div
            className={`mb-6 flex items-center justify-between rounded-xl border p-4 text-xs font-semibold ${
              alertInfo.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {alertInfo.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-red-600 shrink-0" />
              )}
              <span>{alertInfo.text}</span>
            </div>
            <button
              onClick={() => setAlertInfo({ text: "", type: "" })}
              className="text-slate-500 hover:text-slate-700"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500">Loading drive details...</p>
          </div>
        ) : (
          <>
            {/* ================= COMPANY HEADER ================= */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-7 sm:px-8 sm:py-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-bold text-blue-600 shadow-sm sm:h-16 sm:w-16 sm:text-xl">
                      {currentDrive.shortName}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-blue-100">
                        Campus Placement Drive
                      </p>
                      <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                        {currentDrive.role}
                      </h1>
                      <p className="mt-2 text-sm font-medium text-blue-100">
                        {currentDrive.company}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/10 px-5 py-4 backdrop-blur-sm">
                    <p className="text-xs text-blue-100">Expected Package</p>
                    <p className="mt-1 text-xl font-bold text-white">
                      {currentDrive.package}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Details */}
              <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                <QuickDetail
                  icon={MapPin}
                  label="Location"
                  value={currentDrive.location}
                />
                <QuickDetail
                  icon={BriefcaseBusiness}
                  label="Work Mode"
                  value={currentDrive.workMode}
                />
                <QuickDetail
                  icon={Users}
                  label="Vacancies"
                  value={currentDrive.vacancies}
                />
                <QuickDetail
                  icon={CalendarDays}
                  label="Application Deadline"
                  value={currentDrive.deadline}
                />
              </div>
            </section>

            {/* ================= CONTENT GRID ================= */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column (2 cols) */}
              <div className="space-y-6 lg:col-span-2">
                {/* Job Description */}
                <ContentCard icon={FileText} title="Job Description">
                  <p className="text-sm leading-7 text-slate-600">
                    {currentDrive.description}
                  </p>
                </ContentCard>

                {/* Responsibilities */}
                <ContentCard
                  icon={BriefcaseBusiness}
                  title="Key Responsibilities"
                >
                  <div className="space-y-3">
                    {currentDrive.responsibilities.map((item, index) => (
                      <ListItem key={index} text={item} />
                    ))}
                  </div>
                </ContentCard>

                {/* Required Skills */}
                <ContentCard icon={GraduationCap} title="Required Skills">
                  <div className="flex flex-wrap gap-2">
                    {currentDrive.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </ContentCard>

                {/* Selection Process */}
                <ContentCard icon={Users} title="Selection Process">
                  <div className="space-y-4">
                    {currentDrive.selectionProcess.map((step, index) => (
                      <div key={step} className="flex items-center gap-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div className="h-px flex-1 bg-slate-100 last:hidden" />
                        <p className="flex-1 text-sm font-medium text-slate-700">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </ContentCard>
              </div>

              {/* Right Sidebar (1 col) */}
              <aside className="space-y-6">
                {/* Apply Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-lg font-bold text-slate-900">
                    Apply for this Drive
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Your student profile, CGPA, and resume document will be
                    automatically forwarded to {currentDrive.company}.
                  </p>

                  <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-red-500">
                        <Clock3 size={19} />
                      </div>
                      <div>
                        <p className="text-xs text-red-500">
                          Application Deadline
                        </p>
                        <p className="mt-1 text-sm font-bold text-red-700">
                          {currentDrive.deadline}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={applied}
                    className={`mt-5 w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.99] cursor-pointer ${
                      applied
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {applied ? "Application Submitted ✓" : "Apply Now"}
                  </button>
                </div>

                {/* Eligibility Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900">
                        Eligibility Criteria
                      </h2>
                      <p className="text-xs text-slate-500">
                        Verified before applying
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {currentDrive.eligibilityList.map((item) => (
                      <div key={item} className="flex items-start gap-2.5">
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        />
                        <p className="text-xs leading-5 text-slate-600">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Drive Date */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <CalendarDays size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">
                        Placement Drive Date
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {currentDrive.driveDate}
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>

      {/* ================= CONFIRM APPLY MODAL ================= */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Confirm Application
                </h3>
                <p className="text-xs text-slate-500">
                  {currentDrive.company} — {currentDrive.role}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              By confirming, your verified student profile, CGPA, academic branch, and uploaded resume will be submitted to the corporate recruitment team of{" "}
              <span className="font-semibold text-slate-800">
                {currentDrive.company}
              </span>.
            </p>

            <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl mb-5 space-y-1.5 text-xs text-blue-900">
              <div className="flex justify-between">
                <span className="text-blue-600">Expected CTC:</span>
                <span className="font-bold">{currentDrive.package}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Location:</span>
                <span className="font-semibold">{currentDrive.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Drive Date:</span>
                <span className="font-semibold">{currentDrive.driveDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApply}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-1.5 justify-center">
                    <Loader2 size={14} className="animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Confirm & Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   QUICK DETAIL
========================================================= */
const QuickDetail = ({ icon: Icon, label, value }) => {
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

/* =========================================================
   CONTENT CARD
========================================================= */
const ContentCard = ({ icon: Icon, title, children }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={20} />
        </div>
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
};

/* =========================================================
   LIST ITEM
========================================================= */
const ListItem = ({ text }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
      <p className="text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
};

export default PlacementDriveDetails;