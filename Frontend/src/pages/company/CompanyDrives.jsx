import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import CompanyNavbar from "../../components/CompanyNavbar";
import { placementDrivesAPI } from "../../services/api";

import {
  BriefcaseBusiness,
  Users,
  UserCheck,
  CalendarDays,
  Plus,
  ArrowRight,
  Clock3,
  CheckCircle2,
  XCircle,
  MapPin,
  Loader2,
  AlertCircle,
  X,
  FileText,
  Clock,
  Sparkles,
  HelpCircle,
} from "lucide-react";

const CompanyDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'active', 'pending', 'closed'

  // Create Form State (Requirement 3)
  const [formData, setFormData] = useState({
    role: "",
    package: "",
    jobType: "Full-Time",
    vacancies: "Open",
    experience: "Fresher",
    location: "College Campus",
    description: "",
    additionalInstructions: "",
    branches: "Computer Science, CSE AI & ML, IT",
    minCGPA: "6.0",
    passingYear: "2027",
    academicYears: ["3rd Year", "4th Year"],
    backlogCriteria: "No active backlogs",
    skills: "React.js, Node.js, MongoDB",
    selectionProcess: ["Online Assessment", "Technical Interview", "HR Interview"],
    driveDate: "",
    applicationDeadline: "",
  });

  useEffect(() => {
    fetchDrives();
  }, []);

  const showSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(""), 4500);
  };

  const fetchDrives = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await placementDrivesAPI.getCompanyDrives();
      if (res.data.success) {
        setDrives(res.data.drives || []);
      }
    } catch (err) {
      console.error("Error loading company drives:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load drives. Ensure you are signed in as an approved company."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionRoundToggle = (round) => {
    setFormData((prev) => {
      const exists = prev.selectionProcess.includes(round);
      if (exists) {
        return {
          ...prev,
          selectionProcess: prev.selectionProcess.filter((r) => r !== round),
        };
      } else {
        return {
          ...prev,
          selectionProcess: [...prev.selectionProcess, round],
        };
      }
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role || !formData.package || !formData.applicationDeadline) {
      alert("Role, salary package, and application deadline are required.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        role: formData.role.trim(),
        package: formData.package.trim(),
        jobType: formData.jobType,
        vacancies: formData.vacancies.trim(),
        experience: formData.experience.trim(),
        location: formData.location.trim() || "College Campus",
        description: formData.description.trim(),
        additionalInstructions: formData.additionalInstructions.trim(),
        eligibility: {
          branches: formData.branches
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean),
          minCGPA: Number(formData.minCGPA) || 0,
          passingYear: Number(formData.passingYear) || undefined,
          academicYears: Array.isArray(formData.academicYears)
            ? formData.academicYears
            : formData.academicYears.split(",").map((y) => y.trim()).filter(Boolean),
          backlogCriteria: formData.backlogCriteria,
        },
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        selectionProcess: formData.selectionProcess,
        driveDate: formData.driveDate || undefined,
        applicationDeadline: formData.applicationDeadline,
        // Status will be strictly set to 'Pending Approval' by the backend
      };

      const res = await placementDrivesAPI.create(payload);
      if (res.data.success) {
        showSuccess(
          "Placement drive submitted successfully! It is now Pending Approval by the Placement Cell."
        );
        setIsCreateModalOpen(false);
        setFormData({
          role: "",
          package: "",
          jobType: "Full-Time",
          vacancies: "Open",
          experience: "Fresher",
          location: "College Campus",
          description: "",
          additionalInstructions: "",
          branches: "Computer Science, CSE AI & ML, IT",
          minCGPA: "6.0",
          passingYear: "2027",
          academicYears: ["3rd Year", "4th Year"],
          backlogCriteria: "No active backlogs",
          skills: "React.js, Node.js, MongoDB",
          selectionProcess: ["Online Assessment", "Technical Interview", "HR Interview"],
          driveDate: "",
          applicationDeadline: "",
        });
        fetchDrives();
      }
    } catch (err) {
      console.error("Error creating drive:", err);
      alert(
        err.response?.data?.message ||
          "Failed to create placement drive. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDrive = async (driveId) => {
    if (
      !window.confirm(
        "Are you sure you want to close this placement drive? Students will no longer be able to apply."
      )
    ) {
      return;
    }

    try {
      const res = await placementDrivesAPI.close(driveId);
      if (res.data.success) {
        showSuccess("Placement drive closed successfully.");
        fetchDrives();
      }
    } catch (err) {
      console.error("Error closing drive:", err);
      alert(err.response?.data?.message || "Failed to close drive.");
    }
  };

  // Filtered drives by tab
  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      const statusLower = (d.status || "").toLowerCase();
      if (activeTab === "active") {
        return statusLower === "active" || statusLower === "approved";
      }
      if (activeTab === "pending") {
        return statusLower === "pending approval";
      }
      if (activeTab === "closed") {
        return statusLower === "closed" || statusLower === "completed";
      }
      return true;
    });
  }, [drives, activeTab]);

  const activeCount = drives.filter(
    (d) => d.status === "Active" || d.status === "Approved"
  ).length;
  const pendingCount = drives.filter(
    (d) => (d.status || "").toLowerCase() === "pending approval"
  ).length;
  const closedCount = drives.filter(
    (d) => d.status === "Closed" || d.status === "Completed"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <CompanyNavbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 space-y-6">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Company Portal</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Placement Drives
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Create and manage recruitment drives. Drives submitted here undergo Placement Cell approval before being published to students.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 cursor-pointer"
          >
            <Plus size={16} />
            Create Placement Drive
          </button>
        </div>

        {/* Success Alert */}
        {actionSuccess && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-sm animate-fadeIn">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span className="flex-1 font-semibold">{actionSuccess}</span>
            <button
              onClick={() => setActionSuccess("")}
              className="text-emerald-600 font-bold hover:text-emerald-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 shadow-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* ================= SUMMARY STATS ================= */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryCard
            title="Total Drives"
            value={drives.length}
            icon={BriefcaseBusiness}
            iconStyle="bg-blue-50 text-blue-600"
          />
          <SummaryCard
            title="Active / Approved"
            value={activeCount}
            icon={CheckCircle2}
            iconStyle="bg-emerald-50 text-emerald-600"
          />
          <SummaryCard
            title="Pending Approval"
            value={pendingCount}
            icon={Clock}
            iconStyle="bg-amber-50 text-amber-600"
          />
          <SummaryCard
            title="Closed Drives"
            value={closedCount}
            icon={XCircle}
            iconStyle="bg-slate-100 text-slate-600"
          />
        </div>

        {/* ================= TABS ================= */}
        <div className="border-b border-slate-200">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`border-b-2 py-3 text-xs font-bold transition cursor-pointer ${
                activeTab === "all"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              All Drives ({drives.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`border-b-2 py-3 text-xs font-bold transition cursor-pointer ${
                activeTab === "active"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Active & Approved ({activeCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`border-b-2 py-3 text-xs font-bold transition cursor-pointer ${
                activeTab === "pending"
                  ? "border-amber-500 text-amber-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Pending Approval ({pendingCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("closed")}
              className={`border-b-2 py-3 text-xs font-bold transition cursor-pointer ${
                activeTab === "closed"
                  ? "border-slate-600 text-slate-800"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Closed ({closedCount})
            </button>
          </div>
        </div>

        {/* ================= DRIVES LIST ================= */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            <p className="text-xs text-slate-400">Loading your placement drives...</p>
          </div>
        ) : filteredDrives.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BriefcaseBusiness size={24} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No placement drives found
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Get started by creating a new placement drive to begin receiving student applications.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus size={14} />
              Create Placement Drive
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filteredDrives.map((drive) => (
              <CompanyDriveCard
                key={drive._id}
                drive={drive}
                onCloseDrive={handleCloseDrive}
              />
            ))}
          </div>
        )}
      </main>

      {/* =========================================================
          MODAL: CREATE PLACEMENT DRIVE (Requirement 3)
      ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Create New Placement Drive
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Drive will be submitted for administrative approval before publishing.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Approval Workflow Notice */}
            <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Pending Approval Workflow</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  After you submit this drive, its status will be <strong>"Pending Approval"</strong>. It will automatically be matched with eligible students once reviewed and approved by the Placement Cell.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="overflow-y-auto p-6 space-y-4">
              {/* Row 1: Role & Package */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Title / Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
                    placeholder="e.g. Full Stack Developer / Cloud Engineer"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Salary Package / CTC *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.package}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, package: e.target.value }))
                    }
                    placeholder="e.g. ₹8 - 12 LPA"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Row 2: Job Type, Vacancies, Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Internship or Full-Time
                  </label>
                  <select
                    value={formData.jobType}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, jobType: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Internship + PPO">Internship + PPO</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Number of Vacancies
                  </label>
                  <input
                    type="text"
                    value={formData.vacancies}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, vacancies: e.target.value }))
                    }
                    placeholder="e.g. 10 Positions"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Required Experience
                  </label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, experience: e.target.value }))
                    }
                    placeholder="e.g. Fresher / 0-1 yr"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Row 3: Job Location & Application Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="e.g. Bengaluru / Campus / Hybrid"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.applicationDeadline}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        applicationDeadline: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Row 4: Eligibility Criteria (Smart Matching) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Student Eligibility Criteria
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Minimum CGPA
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={formData.minCGPA}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, minCGPA: e.target.value }))
                      }
                      placeholder="6.0"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Graduation Batch (Year)
                    </label>
                    <input
                      type="number"
                      value={formData.passingYear}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, passingYear: e.target.value }))
                      }
                      placeholder="2027"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Backlog Criteria
                    </label>
                    <select
                      value={formData.backlogCriteria}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, backlogCriteria: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                    >
                      <option value="No active backlogs">No active backlogs (0)</option>
                      <option value="Up to 1 active backlog allowed">Up to 1 active backlog allowed</option>
                      <option value="Up to 2 active backlogs allowed">Up to 2 active backlogs allowed</option>
                      <option value="No backlog restrictions">No backlog restrictions</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Eligible Branches (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.branches}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, branches: e.target.value }))
                    }
                    placeholder="Computer Science, CSE AI & ML, IT, Electrical"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Technical Skills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Technical Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, skills: e.target.value }))
                  }
                  placeholder="React.js, Node.js, MongoDB, Java, Python, SQL"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              {/* Selection Process Rounds */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Selection Process Rounds
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Online Assessment",
                    "Technical Interview",
                    "HR Interview",
                    "Group Discussion",
                    "Coding Challenge",
                    "Aptitude Test",
                  ].map((round) => {
                    const isSelected = formData.selectionProcess.includes(round);
                    return (
                      <button
                        key={round}
                        type="button"
                        onClick={() => handleSelectionRoundToggle(round)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {round}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Description & Roles
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe day-to-day responsibilities, technologies used, growth opportunities..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              {/* Additional Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Instructions for Candidates
                </label>
                <input
                  type="text"
                  value={formData.additionalInstructions}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      additionalInstructions: e.target.value,
                    }))
                  }
                  placeholder="e.g. Bring 2 printed copies of resume, laptop required for assessment"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Submitting for Approval...
                    </>
                  ) : (
                    "Submit Placement Drive"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */
const SummaryCard = ({ title, value, icon: Icon, iconStyle }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   COMPANY DRIVE CARD (With Status & Feedback)
========================================================= */
const CompanyDriveCard = ({ drive, onCloseDrive }) => {
  const stats = drive.stats || {
    totalApplications: 0,
    shortlisted: 0,
    interviews: 0,
    selected: 0,
  };

  const isPending = (drive.status || "").toLowerCase() === "pending approval";
  const isApproved =
    (drive.status || "").toLowerCase() === "active" ||
    (drive.status || "").toLowerCase() === "approved";
  const isRejected = (drive.status || "").toLowerCase() === "rejected";
  const isClosed =
    (drive.status || "").toLowerCase() === "closed" ||
    (drive.status || "").toLowerCase() === "completed";

  const branches = drive.eligibility?.branches || [];
  const minCGPA = drive.eligibility?.minCGPA || 0;
  const passingYear = drive.eligibility?.passingYear;

  const eligibilitySummary = [
    branches.length > 0 ? branches.join(" / ") : "All Branches",
    minCGPA > 0 ? `Min ${minCGPA} CGPA` : null,
    passingYear ? `${passingYear} Batch` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  const deadlineStr = drive.applicationDeadline
    ? new Date(drive.applicationDeadline).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Ongoing";

  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm transition ${
        isClosed
          ? "border-slate-200 opacity-80"
          : isPending
          ? "border-amber-200 hover:shadow-md"
          : "border-slate-200 hover:border-blue-200 hover:shadow-md"
      }`}
    >
      {/* Header */}
      <div className="border-b border-slate-100 p-5 sm:p-6 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-extrabold text-sm">
              <BriefcaseBusiness size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{drive.role}</h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" />
                  {drive.location || "College Campus"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-semibold text-slate-700">
                  {drive.jobType || "Full-Time"}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            {isPending && (
              <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                <Clock size={12} />
                Pending Approval
              </span>
            )}
            {isApproved && (
              <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 size={12} />
                Approved & Live
              </span>
            )}
            {isRejected && (
              <span className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700">
                <XCircle size={12} />
                Rejected
              </span>
            )}
            {isClosed && (
              <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                Closed
              </span>
            )}
          </div>
        </div>

        {/* Rejection Reason Banner if any */}
        {drive.rejectionReason && (
          <div className="rounded-xl border border-red-200 bg-red-50/90 p-3 text-xs text-red-900">
            <span className="font-bold">Placement Cell Feedback / Reason: </span>
            {drive.rejectionReason}
          </div>
        )}

        {/* Change Request Banner if any */}
        {drive.changeRequests && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <span className="font-bold">Revisions Requested: </span>
            {drive.changeRequests}
          </div>
        )}

        {/* Package & Eligibility */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Salary Package
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              {drive.package}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Eligibility
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-700 truncate" title={eligibilitySummary}>
              {eligibilitySummary}
            </p>
          </div>
        </div>

        {/* Skills */}
        {drive.skills && drive.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {drive.skills.slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
              >
                {s}
              </span>
            ))}
            {drive.skills.length > 4 && (
              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                +{drive.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">
        <DriveMetric
          icon={Users}
          label="Applied"
          value={stats.totalApplications}
        />
        <DriveMetric
          icon={UserCheck}
          label="Shortlisted"
          value={stats.shortlisted}
        />
        <DriveMetric
          icon={CalendarDays}
          label="Interviews"
          value={stats.interviews}
        />
        <DriveMetric
          icon={CheckCircle2}
          label="Selected"
          value={stats.selected}
        />
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock3 size={14} />
          <span>Deadline:</span>
          <span className="font-semibold text-slate-700">{deadlineStr}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/company/rounds?driveId=${drive._id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3.5 py-2 text-xs font-bold text-purple-600 transition hover:bg-purple-600 hover:text-white"
          >
            Manage Rounds
            <ArrowRight size={14} />
          </Link>

          <Link
            to="/company/applicants"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white"
          >
            Manage Applicants
            <ArrowRight size={14} />
          </Link>

          {!isClosed && (
            <button
              type="button"
              onClick={() => onCloseDrive(drive._id)}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const DriveMetric = ({ icon: Icon, label, value }) => {
  return (
    <div className="p-3.5 text-center sm:text-left">
      <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-400">
        <Icon size={13} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 text-base font-bold text-slate-900">{value}</p>
    </div>
  );
};

export default CompanyDrives;
