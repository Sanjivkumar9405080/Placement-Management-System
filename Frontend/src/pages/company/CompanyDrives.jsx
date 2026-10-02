import { useState, useEffect } from "react";
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
} from "lucide-react";

const CompanyDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  // Create Form State
  const [formData, setFormData] = useState({
    role: "",
    package: "",
    description: "",
    branches: "CSE, IT, AI & ML",
    minCGPA: "6.0",
    passingYear: "2027",
    skills: "React, Node.js, Express, MongoDB",
    location: "College Campus",
    driveDate: "",
    applicationDeadline: "",
  });

  useEffect(() => {
    fetchDrives();
  }, []);

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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role || !formData.package || !formData.applicationDeadline) {
      alert("Role, salary package, and application deadline are required.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        role: formData.role,
        package: formData.package,
        description: formData.description,
        eligibility: {
          branches: formData.branches
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean),
          minCGPA: Number(formData.minCGPA) || 0,
          passingYear: Number(formData.passingYear) || undefined,
        },
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        location: formData.location || "College Campus",
        driveDate: formData.driveDate || undefined,
        applicationDeadline: formData.applicationDeadline,
        status: "Active",
      };

      const res = await placementDrivesAPI.create(payload);
      if (res.data.success) {
        setActionSuccess("Placement drive created successfully!");
        setIsCreateModalOpen(false);
        setFormData({
          role: "",
          package: "",
          description: "",
          branches: "CSE, IT, AI & ML",
          minCGPA: "6.0",
          passingYear: "2027",
          skills: "React, Node.js, Express, MongoDB",
          location: "College Campus",
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
        setActionSuccess("Placement drive closed successfully.");
        fetchDrives();
      }
    } catch (err) {
      console.error("Error closing drive:", err);
      alert(err.response?.data?.message || "Failed to close drive.");
    }
  };

  const activeDrives = drives.filter((d) => d.status === "Active");
  const closedDrives = drives.filter(
    (d) => d.status === "Closed" || d.status === "Completed"
  );

  const totalApplications = drives.reduce(
    (acc, d) => acc + (d.stats?.totalApplications || 0),
    0
  );

  const totalSelected = drives.reduce(
    (acc, d) => acc + (d.stats?.selected || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <CompanyNavbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ================= HEADER ================= */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Company Portal</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Placement Drives
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Manage your campus placement drives and track applicant progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 cursor-pointer"
          >
            <Plus size={16} />
            Create Placement Drive
          </button>
        </div>

        {/* Action Success Alert */}
        {actionSuccess && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess("")}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= SUMMARY ================= */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Active Drives"
            value={activeDrives.length}
            icon={BriefcaseBusiness}
            iconStyle="bg-blue-50 text-blue-600"
          />
          <SummaryCard
            title="Total Applications"
            value={totalApplications}
            icon={Users}
            iconStyle="bg-violet-50 text-violet-600"
          />
          <SummaryCard
            title="Students Selected"
            value={totalSelected}
            icon={UserCheck}
            iconStyle="bg-emerald-50 text-emerald-600"
          />
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500">Loading placement drives...</p>
          </div>
        ) : (
          <>
            {/* ================= ACTIVE DRIVES ================= */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Active Drives
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Currently open campus placement drives
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {activeDrives.length} Active
                </span>
              </div>

              {activeDrives.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {activeDrives.map((drive) => (
                    <DriveCard
                      key={drive._id}
                      drive={drive}
                      onCloseDrive={handleCloseDrive}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                  <BriefcaseBusiness
                    size={28}
                    className="mx-auto text-slate-400 mb-2"
                  />
                  <p className="text-sm font-bold text-slate-800">
                    No active drives found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Create a new placement drive above to start receiving campus
                    applications.
                  </p>
                </div>
              )}
            </section>

            {/* ================= CLOSED DRIVES ================= */}
            {closedDrives.length > 0 && (
              <section className="mt-8">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900">
                    Closed / Completed Drives
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Previous placement opportunities
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {closedDrives.map((drive) => (
                    <DriveCard
                      key={drive._id}
                      drive={drive}
                      closed
                      onCloseDrive={handleCloseDrive}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* ================= CREATE DRIVE MODAL ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BriefcaseBusiness size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Create Campus Placement Drive
                  </h3>
                  <p className="text-xs text-slate-400">
                    Specify role details, package, and student eligibility criteria
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MERN Stack Developer"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Salary Package (CTC) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹6 - 8 LPA"
                    value={formData.package}
                    onChange={(e) =>
                      setFormData({ ...formData, package: e.target.value })
                    }
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Eligible Branches
                  </label>
                  <input
                    type="text"
                    placeholder="CSE, IT, ECE"
                    value={formData.branches}
                    onChange={(e) =>
                      setFormData({ ...formData, branches: e.target.value })
                    }
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimum CGPA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="6.0"
                    value={formData.minCGPA}
                    onChange={(e) =>
                      setFormData({ ...formData, minCGPA: e.target.value })
                    }
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Passing Batch Year
                  </label>
                  <input
                    type="number"
                    placeholder="2027"
                    value={formData.passingYear}
                    onChange={(e) =>
                      setFormData({ ...formData, passingYear: e.target.value })
                    }
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. JavaScript, React, Node.js, MongoDB"
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Drive Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Drive Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.driveDate}
                    onChange={(e) =>
                      setFormData({ ...formData, driveDate: e.target.value })
                    }
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
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
                      setFormData({
                        ...formData,
                        applicationDeadline: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Job Description & Roles
                </label>
                <textarea
                  rows="3"
                  placeholder="Detail responsibilities, project expectations, and selection process..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Drive"
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
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
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
   DRIVE CARD
========================================================= */
const DriveCard = ({ drive, closed = false, onCloseDrive }) => {
  const stats = drive.stats || {
    totalApplications: 0,
    shortlisted: 0,
    interviews: 0,
    selected: 0,
  };

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
    : "No deadline";

  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm transition ${
        closed
          ? "border-slate-200 opacity-80"
          : "border-slate-200 hover:border-blue-200 hover:shadow-md"
      }`}
    >
      {/* Card Header */}
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BriefcaseBusiness size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{drive.role}</h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin size={13} className="text-slate-400" />
                <span>{drive.location || "College Campus"}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          {closed ? (
            <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
              <XCircle size={13} />
              Closed
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 size={13} />
              Active
            </span>
          )}
        </div>

        {/* Job Details */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Salary Package
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {drive.package}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Eligibility Criteria
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-700 truncate">
              {eligibilitySummary}
            </p>
          </div>
        </div>

        {drive.skills && drive.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
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
      <div className="flex flex-col gap-4 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock3 size={14} />
          <span>Deadline:</span>
          <span className="font-semibold text-slate-600">{deadlineStr}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/company/applicants"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
          >
            View Applicants
            <ArrowRight size={14} />
          </Link>

          {!closed && (
            <button
              type="button"
              onClick={() => onCloseDrive(drive._id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
            >
              Close Drive
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DRIVE METRIC
========================================================= */
const DriveMetric = ({ icon: Icon, label, value }) => {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-slate-400" />
        <span className="text-[11px] font-medium text-slate-400">{label}</span>
      </div>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
};

export default CompanyDrives;