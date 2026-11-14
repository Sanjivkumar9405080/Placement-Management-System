import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { adminAPI } from "../../services/api";
import {
  Briefcase,
  Search,
  Filter,
  Eye,
  Users,
  Power,
  RefreshCw,
  Building2,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  Award,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  FileCheck,
  Send,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Info,
} from "lucide-react";

const AdminPlacementDrives = () => {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'pending', 'approved', 'rejected', 'completed'
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedSource, setSelectedSource] = useState("all"); // 'all', 'admin', 'company'
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    adminCreated: 0,
    companyCreated: 0,
  });

  // Modal States
  // 1. Create Drive on Behalf of Company Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createCompanyMode, setCreateCompanyMode] = useState("existing"); // 'existing' | 'new'
  const [driveForm, setDriveForm] = useState({
    companyId: "",
    companyName: "",
    officialEmail: "",
    hrName: "",
    phone: "",
    website: "",
    location: "College Campus",
    role: "",
    package: "",
    jobType: "Full-Time",
    vacancies: "Open",
    experience: "Fresher",
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

  // 2. View Details Modal
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    drive: null,
  });

  // 3. Edit Drive Modal
  const [editModal, setEditModal] = useState({
    isOpen: false,
    drive: null,
    submitting: false,
    formData: {},
  });

  // 4. Reject Drive Modal (with Reason)
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    drive: null,
    reason: "",
    submitting: false,
  });

  // 5. Request Changes Modal
  const [changesModal, setChangesModal] = useState({
    isOpen: false,
    drive: null,
    notes: "",
    submitting: false,
  });

  // 6. Delete Drive Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    drive: null,
    submitting: false,
  });

  // 7. Eligible Students Preview Modal
  const [eligibleModal, setEligibleModal] = useState({
    isOpen: false,
    drive: null,
    loading: false,
    students: [],
  });

  useEffect(() => {
    fetchDrives();
    fetchCompanies();
  }, []);

  const showSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(""), 4500);
  };

  const fetchDrives = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminAPI.getAdminPlacementDrives();
      if (res.data?.success && res.data?.drives) {
        setDrives(res.data.drives);
        if (res.data.tabCounts) setTabCounts(res.data.tabCounts);
        if (res.data.availableCompanies) {
          setAvailableCompanies(res.data.availableCompanies);
        }
      } else {
        setError(res.data?.message || "Failed to load placement drives.");
      }
    } catch (err) {
      console.error("Fetch drives error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load placement drives. Please check your network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await adminAPI.getCompanies();
      if (res.data?.success && res.data?.companies) {
        setCompanies(res.data.companies);
        if (res.data.companies.length > 0 && !driveForm.companyId) {
          setDriveForm((prev) => ({
            ...prev,
            companyId: res.data.companies[0]._id,
            companyName: res.data.companies[0].companyName,
          }));
        }
      }
    } catch (err) {
      console.warn("Could not load companies list for dropdown:", err);
    }
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  // Approve Drive
  const handleApproveDrive = async (drive) => {
    if (
      !window.confirm(
        `Are you sure you want to approve "${drive.role}" by ${drive.companyName}? It will become immediately visible to all eligible students.`
      )
    ) {
      return;
    }

    try {
      const res = await adminAPI.approvePlacementDrive(drive._id);
      if (res.data?.success) {
        showSuccess(
          `Placement drive "${drive.role}" approved successfully! Eligible students have been notified.`
        );
        fetchDrives();
      }
    } catch (err) {
      console.error("Approve drive error:", err);
      alert(err.response?.data?.message || "Failed to approve placement drive.");
    }
  };

  // Reject Drive
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModal.drive) return;
    if (!rejectModal.reason.trim()) {
      alert("Please provide a rejection reason so the company can review it.");
      return;
    }

    try {
      setRejectModal((prev) => ({ ...prev, submitting: true }));
      const res = await adminAPI.rejectPlacementDrive(
        rejectModal.drive._id,
        rejectModal.reason.trim()
      );
      if (res.data?.success) {
        showSuccess(
          `Drive rejected. Company has been notified with the reason.`
        );
        setRejectModal({ isOpen: false, drive: null, reason: "", submitting: false });
        fetchDrives();
      }
    } catch (err) {
      console.error("Reject drive error:", err);
      alert(err.response?.data?.message || "Failed to reject placement drive.");
      setRejectModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Request Changes
  const handleChangesSubmit = async (e) => {
    e.preventDefault();
    if (!changesModal.drive) return;
    if (!changesModal.notes.trim()) {
      alert("Please enter the revisions requested from the company.");
      return;
    }

    try {
      setChangesModal((prev) => ({ ...prev, submitting: true }));
      const res = await adminAPI.requestDriveChanges(
        changesModal.drive._id,
        changesModal.notes.trim()
      );
      if (res.data?.success) {
        showSuccess("Change request sent to company successfully.");
        setChangesModal({ isOpen: false, drive: null, notes: "", submitting: false });
        fetchDrives();
      }
    } catch (err) {
      console.error("Request changes error:", err);
      alert(err.response?.data?.message || "Failed to send change request.");
      setChangesModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Delete Drive
  const handleDeleteSubmit = async () => {
    if (!deleteModal.drive) return;
    try {
      setDeleteModal((prev) => ({ ...prev, submitting: true }));
      const res = await adminAPI.deletePlacementDrive(deleteModal.drive._id);
      if (res.data?.success) {
        showSuccess("Placement drive deleted successfully.");
        setDeleteModal({ isOpen: false, drive: null, submitting: false });
        fetchDrives();
      }
    } catch (err) {
      console.error("Delete drive error:", err);
      alert(err.response?.data?.message || "Failed to delete placement drive.");
      setDeleteModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // View Eligible Students Preview
  const handleOpenEligibleModal = async (drive) => {
    setEligibleModal({
      isOpen: true,
      drive,
      loading: true,
      students: [],
    });

    try {
      const res = await adminAPI.getDriveEligibleStudents(drive._id);
      if (res.data?.success) {
        setEligibleModal((prev) => ({
          ...prev,
          loading: false,
          students: res.data.eligibleStudents || [],
        }));
      }
    } catch (err) {
      console.error("Error fetching eligible students:", err);
      setEligibleModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Edit Drive Open
  const handleOpenEditModal = (drive) => {
    setEditModal({
      isOpen: true,
      drive,
      submitting: false,
      formData: {
        role: drive.role || "",
        package: drive.package || "",
        jobType: drive.jobType || "Full-Time",
        vacancies: drive.vacancies || "Open",
        experience: drive.experience || "Fresher",
        location: drive.location || "College Campus",
        description: drive.description || "",
        additionalInstructions: drive.additionalInstructions || "",
        branches: Array.isArray(drive.eligibility?.branches)
          ? drive.eligibility.branches.join(", ")
          : "",
        minCGPA: drive.eligibility?.minCGPA || 0,
        passingYear: drive.eligibility?.passingYear || "",
        academicYears: Array.isArray(drive.eligibility?.academicYears)
          ? drive.eligibility.academicYears.join(", ")
          : "",
        backlogCriteria: drive.eligibility?.backlogCriteria || "No active backlogs",
        skills: Array.isArray(drive.skills) ? drive.skills.join(", ") : "",
        selectionProcess: Array.isArray(drive.selectionProcess)
          ? drive.selectionProcess.join(", ")
          : "Online Assessment, Technical Interview, HR Interview",
        applicationDeadline: drive.applicationDeadline
          ? new Date(drive.applicationDeadline).toISOString().slice(0, 10)
          : "",
        status: drive.status || "Active",
      },
    });
  };

  // Edit Drive Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.drive) return;

    try {
      setEditModal((prev) => ({ ...prev, submitting: true }));
      const form = editModal.formData;
      const payload = {
        role: form.role,
        package: form.package,
        jobType: form.jobType,
        vacancies: form.vacancies,
        experience: form.experience,
        location: form.location,
        description: form.description,
        additionalInstructions: form.additionalInstructions,
        eligibility: {
          branches: form.branches
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean),
          minCGPA: Number(form.minCGPA) || 0,
          passingYear: Number(form.passingYear) || undefined,
          academicYears: form.academicYears
            .split(",")
            .map((y) => y.trim())
            .filter(Boolean),
          backlogCriteria: form.backlogCriteria,
        },
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        selectionProcess: form.selectionProcess
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
        applicationDeadline: form.applicationDeadline,
        status: form.status,
      };

      const res = await adminAPI.updatePlacementDrive(
        editModal.drive._id,
        payload
      );
      if (res.data?.success) {
        showSuccess("Placement drive details updated successfully.");
        setEditModal({ isOpen: false, drive: null, submitting: false, formData: {} });
        fetchDrives();
      }
    } catch (err) {
      console.error("Edit drive error:", err);
      alert(err.response?.data?.message || "Failed to update placement drive.");
      setEditModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Create Drive on Behalf of Company Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!driveForm.role || !driveForm.package || !driveForm.applicationDeadline) {
      alert("Role, salary package, and application deadline are required.");
      return;
    }

    if (createCompanyMode === "existing" && !driveForm.companyId) {
      alert("Please select an existing registered company.");
      return;
    }

    if (createCompanyMode === "new" && !driveForm.companyName.trim()) {
      alert("Please enter the new company name.");
      return;
    }

    try {
      setCreateSubmitting(true);
      const payload = {
        companyId: createCompanyMode === "existing" ? driveForm.companyId : undefined,
        companyName:
          createCompanyMode === "new"
            ? driveForm.companyName.trim()
            : undefined,
        officialEmail: driveForm.officialEmail.trim(),
        hrName: driveForm.hrName.trim(),
        phone: driveForm.phone.trim(),
        website: driveForm.website.trim(),
        location: driveForm.location.trim() || "College Campus",
        role: driveForm.role.trim(),
        package: driveForm.package.trim(),
        jobType: driveForm.jobType,
        vacancies: driveForm.vacancies,
        experience: driveForm.experience,
        description: driveForm.description.trim(),
        additionalInstructions: driveForm.additionalInstructions.trim(),
        eligibility: {
          branches: driveForm.branches
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean),
          minCGPA: Number(driveForm.minCGPA) || 0,
          passingYear: Number(driveForm.passingYear) || undefined,
          academicYears: Array.isArray(driveForm.academicYears)
            ? driveForm.academicYears
            : driveForm.academicYears.split(",").map((y) => y.trim()).filter(Boolean),
          backlogCriteria: driveForm.backlogCriteria,
        },
        skills: driveForm.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        selectionProcess: Array.isArray(driveForm.selectionProcess)
          ? driveForm.selectionProcess
          : driveForm.selectionProcess.split(",").map((r) => r.trim()).filter(Boolean),
        driveDate: driveForm.driveDate || undefined,
        applicationDeadline: driveForm.applicationDeadline,
      };

      const res = await adminAPI.createPlacementDrive(payload);
      if (res.data?.success) {
        showSuccess(
          `Placement drive published successfully on behalf of ${
            createCompanyMode === "new" ? driveForm.companyName : "company"
          }!`
        );
        setIsCreateModalOpen(false);
        // Reset form
        setDriveForm({
          companyId: companies[0]?._id || "",
          companyName: "",
          officialEmail: "",
          hrName: "",
          phone: "",
          website: "",
          location: "College Campus",
          role: "",
          package: "",
          jobType: "Full-Time",
          vacancies: "Open",
          experience: "Fresher",
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
        fetchCompanies();
      }
    } catch (err) {
      console.error("Create drive error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to create placement drive on behalf of company."
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Filtered Drives
  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      // 1. Tab Status Filter
      if (activeTab === "pending") {
        if (d.status?.toLowerCase() !== "pending approval") return false;
      } else if (activeTab === "approved") {
        if (
          d.status?.toLowerCase() !== "active" &&
          d.status?.toLowerCase() !== "approved"
        )
          return false;
      } else if (activeTab === "rejected") {
        if (d.status?.toLowerCase() !== "rejected") return false;
      } else if (activeTab === "completed") {
        if (
          d.status?.toLowerCase() !== "completed" &&
          d.status?.toLowerCase() !== "closed"
        )
          return false;
      }

      // 2. Search Query (Company name, role, skills)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesComp = d.companyName?.toLowerCase().includes(q);
        const matchesRole = d.role?.toLowerCase().includes(q);
        const matchesSkills =
          d.skills && d.skills.some((sk) => sk.toLowerCase().includes(q));
        if (!matchesComp && !matchesRole && !matchesSkills) return false;
      }

      // 3. Company Dropdown Filter
      if (selectedCompany !== "All") {
        if (d.companyName?.toLowerCase() !== selectedCompany.toLowerCase()) {
          return false;
        }
      }

      // 4. Source Filter
      if (selectedSource !== "all") {
        if (d.createdSource?.toLowerCase() !== selectedSource.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [drives, activeTab, searchQuery, selectedCompany, selectedSource]);

  const resetFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setSelectedCompany("All");
    setSelectedSource("all");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    activeTab !== "all" ||
    selectedCompany !== "All" ||
    selectedSource !== "all";

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* ================= TOP HEADER ================= */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Administration & Placement Drives
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Placement Drive Management
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Review company drive submissions, approve or reject with feedback, create drives on behalf of companies, and track eligible students.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus size={16} />
              Create Drive (On Behalf of Company)
            </button>

            <button
              type="button"
              onClick={fetchDrives}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin text-blue-600" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
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

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 shadow-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span className="flex-1">{error}</span>
            <button
              onClick={fetchDrives}
              className="font-bold underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ================= STATUS TABS (Requirement 4) ================= */}
        <div className="border-b border-slate-200">
          <div className="flex overflow-x-auto space-x-2 pb-px scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "all"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <span>All Placement Drives</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {tabCounts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "pending"
                  ? "border-amber-500 text-amber-700 bg-amber-50/40 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <Clock size={14} className={tabCounts.pending > 0 ? "text-amber-500 animate-pulse" : ""} />
              <span>Pending Approval</span>
              {tabCounts.pending > 0 && (
                <span className="rounded-full bg-amber-500 text-white font-extrabold px-2 py-0.5 text-[10px]">
                  {tabCounts.pending} New
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("approved")}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "approved"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Approved Drives</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                {tabCounts.approved}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rejected")}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "rejected"
                  ? "border-red-600 text-red-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <XCircle size={14} className="text-red-500" />
              <span>Rejected Drives</span>
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                {tabCounts.rejected}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "completed"
                  ? "border-slate-700 text-slate-900"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <span>Completed / Closed</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                {tabCounts.completed}
              </span>
            </button>
          </div>
        </div>

        {/* ================= SEARCH & ADVANCED FILTERS ================= */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            {/* Search Input */}
            <div className="relative md:col-span-6">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company name, job role, or required skill..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            {/* Company Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              >
                <option value="All">All Companies</option>
                {availableCompanies.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              >
                <option value="all">All Sources (Admin & Company)</option>
                <option value="admin">Created by Admin</option>
                <option value="company">Submitted by Company</option>
              </select>
            </div>
          </div>

          {/* Filter Status Summary & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={13} className="text-slate-400" />
              <span>
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {filteredDrives.length}
                </span>{" "}
                of {drives.length} drives
              </span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* ================= DRIVES LIST / TABLE (Requirement 4) ================= */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Loading placement drives...
            </p>
          </div>
        ) : filteredDrives.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Briefcase size={24} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900">
              No Placement Drives Found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {hasActiveFilters
                ? "No drives matched your filter selection."
                : "No placement drives have been created yet."}
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus size={14} />
              Create First Placement Drive
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Company & Role</th>
                    <th className="px-4 py-3.5">Eligibility & Batch</th>
                    <th className="px-4 py-3.5">Package & Location</th>
                    <th className="px-4 py-3.5">Skills</th>
                    <th className="px-4 py-3.5">Deadline</th>
                    <th className="px-4 py-3.5">Source & Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredDrives.map((drive) => {
                    const isPending =
                      drive.status?.toLowerCase() === "pending approval";
                    const isApproved =
                      drive.status?.toLowerCase() === "active" ||
                      drive.status?.toLowerCase() === "approved";
                    const isRejected =
                      drive.status?.toLowerCase() === "rejected";
                    const isClosed =
                      drive.status?.toLowerCase() === "closed" ||
                      drive.status?.toLowerCase() === "completed";

                    const branchesStr =
                      drive.eligibility?.branches?.length > 0
                        ? drive.eligibility.branches.join(", ")
                        : "All Branches";

                    const academicYearsStr =
                      drive.eligibility?.academicYears?.length > 0
                        ? drive.eligibility.academicYears.join(", ")
                        : drive.eligibility?.passingYear
                        ? `${drive.eligibility.passingYear} Batch`
                        : "All Years";

                    return (
                      <tr
                        key={drive._id}
                        className={`hover:bg-slate-50/80 transition ${
                          isPending ? "bg-amber-50/20" : ""
                        }`}
                      >
                        {/* Company & Role */}
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-extrabold text-blue-600 text-sm">
                              {drive.companyName ? drive.companyName[0] : "C"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">
                                {drive.role}
                              </p>
                              <p className="font-medium text-slate-600 text-xs mt-0.5">
                                {drive.companyName}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  {drive.jobType || "Full-Time"}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Vacancies: {drive.vacancies || "Open"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Eligibility & Batch */}
                        <td className="px-4 py-4 max-w-[200px]">
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-800 truncate" title={academicYearsStr}>
                              Year: {academicYearsStr}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate" title={branchesStr}>
                              Branch: {branchesStr}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="font-bold text-blue-600">
                                Min CGPA: {drive.eligibility?.minCGPA || "0"}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">
                                {drive.eligibility?.backlogCriteria || "0 Backlogs"}
                              </span>
                            </div>
                            {/* Eligible Students Pill */}
                            <button
                              type="button"
                              onClick={() => handleOpenEligibleModal(drive)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 mt-1 cursor-pointer"
                            >
                              <Sparkles size={11} />
                              <span>{drive.eligibleStudentsCount || 0} Eligible Students</span>
                            </button>
                          </div>
                        </td>

                        {/* Package & Location */}
                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-900">
                            {drive.package}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {drive.location || "College Campus"}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Users size={12} />
                            <span>
                              <strong>{drive.applicantsCount || 0}</strong> applied
                            </span>
                          </div>
                        </td>

                        {/* Skills */}
                        <td className="px-4 py-4 max-w-[180px]">
                          <div className="flex flex-wrap gap-1">
                            {drive.skills && drive.skills.length > 0 ? (
                              drive.skills.slice(0, 3).map((sk, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700"
                                >
                                  {sk}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                General
                              </span>
                            )}
                            {drive.skills && drive.skills.length > 3 && (
                              <span className="text-[10px] text-slate-400">
                                +{drive.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Deadline */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800">
                              {drive.applicationDeadline
                                ? new Date(drive.applicationDeadline).toLocaleDateString()
                                : "N/A"}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Created: {new Date(drive.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </td>

                        {/* Source & Status */}
                        <td className="px-4 py-4">
                          <div className="space-y-1.5">
                            {/* Status Badge */}
                            <div>
                              {isPending && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                                  <Clock size={11} />
                                  Pending Approval
                                </span>
                              )}
                              {isApproved && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 size={11} />
                                  Approved
                                </span>
                              )}
                              {isRejected && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
                                  <XCircle size={11} />
                                  Rejected
                                </span>
                              )}
                              {isClosed && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                                  Closed
                                </span>
                              )}
                            </div>

                            {/* Source Badge */}
                            <div>
                              {drive.createdSource === "admin" ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100">
                                  <ShieldCheck size={11} />
                                  Created by Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                  Submitted by Company
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* View Full Details */}
                            <button
                              type="button"
                              onClick={() => setViewModal({ isOpen: true, drive })}
                              title="View Complete Drive Details"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Approve (if pending or rejected) */}
                            {(isPending || isRejected) && (
                              <button
                                type="button"
                                onClick={() => handleApproveDrive(drive)}
                                title="Approve Placement Drive"
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                              >
                                <CheckCircle2 size={13} />
                                Approve
                              </button>
                            )}

                            {/* Reject / Request Changes (if pending or approved) */}
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRejectModal({
                                      isOpen: true,
                                      drive,
                                      reason: "",
                                      submitting: false,
                                    })
                                  }
                                  title="Reject Placement Drive"
                                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700 border border-red-200 hover:bg-red-100 transition cursor-pointer"
                                >
                                  <XCircle size={13} />
                                  Reject
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setChangesModal({
                                      isOpen: true,
                                      drive,
                                      notes: "",
                                      submitting: false,
                                    })
                                  }
                                  title="Request Revisions"
                                  className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
                                >
                                  <MessageSquare size={13} />
                                  Changes
                                </button>
                              </>
                            )}

                            {/* View Applicants Link */}
                            <Link
                              to={`/admin/drives/${drive._id}/applicants`}
                              title="View Applicants"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                            >
                              <Users size={15} />
                            </Link>

                            {/* Edit Drive */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(drive)}
                              title="Edit Drive Details"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                            >
                              <Edit size={15} />
                            </button>

                            {/* Delete Drive */}
                            <button
                              type="button"
                              onClick={() => setDeleteModal({ isOpen: true, drive, submitting: false })}
                              title="Delete Drive"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================
          MODAL 1: CREATE DRIVE ON BEHALF OF COMPANY (Requirement 2)
      ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Create Placement Drive (On Behalf of Company)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish a verified campus recruitment drive immediately under a partner company's identity.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="overflow-y-auto p-6 space-y-5">
              {/* Company Selection Mode Toggle */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  1. Company Identity Selection
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateCompanyMode("existing")}
                    className={`rounded-xl p-2.5 text-xs font-bold border transition ${
                      createCompanyMode === "existing"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Select Registered Company
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateCompanyMode("new")}
                    className={`rounded-xl p-2.5 text-xs font-bold border transition ${
                      createCompanyMode === "new"
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Enter New / Unregistered Company
                  </button>
                </div>

                {createCompanyMode === "existing" ? (
                  <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Registered Corporate Partner *
                    </label>
                    <select
                      value={driveForm.companyId}
                      onChange={(e) => {
                        const comp = companies.find((c) => c._id === e.target.value);
                        setDriveForm((prev) => ({
                          ...prev,
                          companyId: e.target.value,
                          companyName: comp ? comp.companyName : "",
                          location: comp?.location || prev.location,
                        }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {companies.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.companyName} ({c.officialEmail || "Active Partner"})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        New Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={driveForm.companyName}
                        onChange={(e) =>
                          setDriveForm((prev) => ({ ...prev, companyName: e.target.value }))
                        }
                        placeholder="e.g. Google Cloud / Oracle"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Company HR Official Email (Invite Access)
                      </label>
                      <input
                        type="email"
                        value={driveForm.officialEmail}
                        onChange={(e) =>
                          setDriveForm((prev) => ({ ...prev, officialEmail: e.target.value }))
                        }
                        placeholder="hr@company.com"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        HR / Recruiter Name
                      </label>
                      <input
                        type="text"
                        value={driveForm.hrName}
                        onChange={(e) =>
                          setDriveForm((prev) => ({ ...prev, hrName: e.target.value }))
                        }
                        placeholder="e.g. Emily Zhang"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Company Website URL
                      </label>
                      <input
                        type="url"
                        value={driveForm.website}
                        onChange={(e) =>
                          setDriveForm((prev) => ({ ...prev, website: e.target.value }))
                        }
                        placeholder="https://company.com"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Job Details */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  2. Role & Offer Particulars
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Job Title / Role *
                    </label>
                    <input
                      type="text"
                      required
                      value={driveForm.role}
                      onChange={(e) =>
                        setDriveForm((prev) => ({ ...prev, role: e.target.value }))
                      }
                      placeholder="e.g. Full Stack Developer"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Salary Package / CTC *
                    </label>
                    <input
                      type="text"
                      required
                      value={driveForm.package}
                      onChange={(e) =>
                        setDriveForm((prev) => ({ ...prev, package: e.target.value }))
                      }
                      placeholder="e.g. ₹8 - 12 LPA"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Job Type
                    </label>
                    <select
                      value={driveForm.jobType}
                      onChange={(e) =>
                        setDriveForm((prev) => ({ ...prev, jobType: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="Full-Time">Full-Time</option>
                      <option value="Internship">Internship</option>
                      <option value="Internship + PPO">Internship + PPO</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Job Location
                    </label>
                    <input
                      type="text"
                      value={driveForm.location}
                      onChange={(e) =>
                        setDriveForm((prev) => ({ ...prev, location: e.target.value }))
                      }
                      placeholder="College Campus / Hybrid"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Vacancies Count
                    </label>
                    <input
                      type="text"
                      value={driveForm.vacancies}
                      onChange={(e) =>
                        setDriveForm((prev) => ({ ...prev, vacancies: e.target.value }))
                      }
                      placeholder="e.g. 15 Positions"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Required Experience
                    </label>
                    <input
                      type="text"
                      value={driveForm.experience}
                      onChange={(e) =>
                        setDriveForm((prev) => ({ ...prev, experience: e.target.value }))
                      }
                      placeholder="Fresher (0 years)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Eligibility Criteria */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  3. Eligibility & Filtering Criteria
                </label>
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
                      value={driveForm.minCGPA}
                      onChange={(e) =>
                        setDriveForm((prev) => ({ ...prev, minCGPA: e.target.value }))
                      }
                      placeholder="6.0"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Eligible Graduation Batch
                    </label>
                    <input
                      type="number"
                      value={driveForm.passingYear}
                      onChange={(e) =>
                        setDriveForm((prev) => ({ ...prev, passingYear: e.target.value }))
                      }
                      placeholder="2027"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Backlog Criteria
                    </label>
                    <select
                      value={driveForm.backlogCriteria}
                      onChange={(e) =>
                        setDriveForm((prev) => ({ ...prev, backlogCriteria: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="No active backlogs">No active backlogs (0)</option>
                      <option value="Up to 1 active backlog allowed">Up to 1 active backlog allowed</option>
                      <option value="Up to 2 active backlogs allowed">Up to 2 active backlogs allowed</option>
                      <option value="No backlog restrictions">No backlog restrictions</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Eligible Branches (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={driveForm.branches}
                    onChange={(e) =>
                      setDriveForm((prev) => ({ ...prev, branches: e.target.value }))
                    }
                    placeholder="Computer Science, CSE AI & ML, IT, Electrical"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Required Technical Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={driveForm.skills}
                    onChange={(e) =>
                      setDriveForm((prev) => ({ ...prev, skills: e.target.value }))
                    }
                    placeholder="React.js, Node.js, MongoDB, Java, Python, SQL"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Deadlines & Selection Process */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  4. Selection Schedule & Process
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Application Deadline *
                    </label>
                    <input
                      type="date"
                      required
                      value={driveForm.applicationDeadline}
                      onChange={(e) =>
                        setDriveForm((prev) => ({
                          ...prev,
                          applicationDeadline: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Drive / Interview Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={driveForm.driveDate}
                      onChange={(e) =>
                        setDriveForm((prev) => ({ ...prev, driveDate: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Job Description & Role Summary
                  </label>
                  <textarea
                    rows="3"
                    value={driveForm.description}
                    onChange={(e) =>
                      setDriveForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Key responsibilities, team structure, tech stack, and benefits..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {createSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Publishing Drive...
                    </>
                  ) : (
                    "Save & Publish Placement Drive"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: COMPLETE DRIVE DETAILS MODAL
      ========================================================= */}
      {viewModal.isOpen && viewModal.drive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Drive #{viewModal.drive._id.slice(-6)}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {viewModal.drive.role}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewModal.drive.companyName}
                </p>
              </div>
              <button
                onClick={() => setViewModal({ isOpen: false, drive: null })}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Salary Package</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{viewModal.drive.package}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Job Type & Vacancies</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {viewModal.drive.jobType || "Full-Time"} ({viewModal.drive.vacancies || "Open"})
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Location</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{viewModal.drive.location}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{viewModal.drive.status}</p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500">Eligibility Breakdown</span>
                <div className="mt-1.5 space-y-1 rounded-xl border border-slate-200 bg-white p-3">
                  <p><strong>Minimum CGPA:</strong> {viewModal.drive.eligibility?.minCGPA || 0}</p>
                  <p><strong>Allowed Branches:</strong> {viewModal.drive.eligibility?.branches?.join(", ") || "All"}</p>
                  <p><strong>Graduation / Academic Years:</strong> {viewModal.drive.eligibility?.academicYears?.join(", ") || viewModal.drive.eligibility?.passingYear || "All"}</p>
                  <p><strong>Backlog Policy:</strong> {viewModal.drive.eligibility?.backlogCriteria || "No active backlogs"}</p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500">Required Skills</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {viewModal.drive.skills?.map((sk, idx) => (
                    <span key={idx} className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {viewModal.drive.description && (
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-500">Job Description</span>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap">
                    {viewModal.drive.description}
                  </p>
                </div>
              )}

              {viewModal.drive.rejectionReason && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900">
                  <p className="font-bold text-xs text-red-700">Rejection Reason Provided to Company:</p>
                  <p className="mt-1 text-xs">{viewModal.drive.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <span className="text-xs text-slate-400">
                Created: {new Date(viewModal.drive.createdAt).toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => setViewModal({ isOpen: false, drive: null })}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: REJECT DRIVE MODAL (With Reason) (Requirement 4)
      ========================================================= */}
      {rejectModal.isOpen && rejectModal.drive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reject Placement Drive
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {rejectModal.drive.role} • {rejectModal.drive.companyName}
                </p>
              </div>
              <button
                onClick={() =>
                  setRejectModal({ isOpen: false, drive: null, reason: "", submitting: false })
                }
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Reason for Rejection * (Will be notified to company)
              </label>
              <textarea
                required
                rows="4"
                value={rejectModal.reason}
                onChange={(e) =>
                  setRejectModal((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="e.g. Salary package below campus benchmark, missing selection round details, or eligibility criteria needs adjustment..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setRejectModal({ isOpen: false, drive: null, reason: "", submitting: false })
                  }
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectModal.submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-red-700 transition disabled:opacity-50"
                >
                  {rejectModal.submitting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: REQUEST REVISIONS / CHANGES MODAL
      ========================================================= */}
      {changesModal.isOpen && changesModal.drive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Request Changes from Company
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {changesModal.drive.role} • {changesModal.drive.companyName}
                </p>
              </div>
              <button
                onClick={() =>
                  setChangesModal({ isOpen: false, drive: null, notes: "", submitting: false })
                }
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangesSubmit} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Requested Adjustments & Feedback *
              </label>
              <textarea
                required
                rows="4"
                value={changesModal.notes}
                onChange={(e) =>
                  setChangesModal((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="e.g. Please update the application deadline to at least 7 days from today, or expand eligible branches to IT..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setChangesModal({ isOpen: false, drive: null, notes: "", submitting: false })
                  }
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changesModal.submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {changesModal.submitting ? "Sending..." : "Send Change Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 5: DELETE DRIVE CONFIRMATION
      ========================================================= */}
      {deleteModal.isOpen && deleteModal.drive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                Delete Placement Drive?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete "{deleteModal.drive.role}" by {deleteModal.drive.companyName}? This will also delete any student applications for this drive.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  setDeleteModal({ isOpen: false, drive: null, submitting: false })
                }
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={deleteModal.submitting}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteModal.submitting ? "Deleting..." : "Yes, Delete Drive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 6: ELIGIBLE STUDENTS PREVIEW (Requirement 5)
      ========================================================= */}
      {eligibleModal.isOpen && eligibleModal.drive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Smart Eligibility Preview
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {eligibleModal.drive.role} • {eligibleModal.drive.companyName}
                </p>
              </div>
              <button
                onClick={() => setEligibleModal({ isOpen: false, drive: null, loading: false, students: [] })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-3">
              {eligibleModal.loading ? (
                <div className="py-12 text-center">
                  <Loader2 size={24} className="animate-spin text-blue-600 mx-auto" />
                  <p className="text-xs text-slate-500 mt-2">Computing student matches from database...</p>
                </div>
              ) : eligibleModal.students.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No registered students currently meet all the criteria for this drive.
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700">
                    {eligibleModal.students.length} Student(s) Meet All Criteria:
                  </p>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {eligibleModal.students.map((st) => (
                      <div key={st._id} className="p-3 bg-white flex items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{st.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {st.email} • {st.branch} • {st.academicYear}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-blue-600">CGPA: {st.cgpa}</span>
                          <span className="block text-[10px] text-emerald-600 font-semibold">✓ Fully Eligible</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 px-6 py-3">
              <button
                type="button"
                onClick={() => setEligibleModal({ isOpen: false, drive: null, loading: false, students: [] })}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 7: EDIT DRIVE DETAILS MODAL
      ========================================================= */}
      {editModal.isOpen && editModal.drive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Placement Drive Details
                </h3>
                <p className="text-xs text-slate-500">
                  {editModal.drive.companyName} • #{editModal.drive._id.slice(-6)}
                </p>
              </div>
              <button
                onClick={() => setEditModal({ isOpen: false, drive: null, submitting: false, formData: {} })}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Job Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editModal.formData.role || ""}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        formData: { ...prev.formData, role: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Salary Package *
                  </label>
                  <input
                    type="text"
                    required
                    value={editModal.formData.package || ""}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        formData: { ...prev.formData, package: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Minimum CGPA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editModal.formData.minCGPA || ""}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        formData: { ...prev.formData, minCGPA: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={editModal.formData.applicationDeadline || ""}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        formData: { ...prev.formData, applicationDeadline: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={editModal.formData.status || "Active"}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        formData: { ...prev.formData, status: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="Active">Active (Approved)</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Closed">Closed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Required Technical Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={editModal.formData.skills || ""}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, skills: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Job Description
                </label>
                <textarea
                  rows="3"
                  value={editModal.formData.description || ""}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, description: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setEditModal({ isOpen: false, drive: null, submitting: false, formData: {} })
                  }
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editModal.submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {editModal.submitting ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlacementDrives;
