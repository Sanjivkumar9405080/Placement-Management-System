import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import { adminAPI } from "../../services/api";
import {
  GraduationCap,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Award,
  ChevronRight,
  SlidersHorizontal,
  X,
  Download,
  Share2,
  Bell,
  CheckSquare,
  Square,
  Building2,
  Send,
  CheckCircle2,
  UserCheck,
  ExternalLink,
  Sparkles,
  Layers,
  History,
  ArrowRight,
  Check,
  User,
  Briefcase,
  Calendar,
} from "lucide-react";

/* =========================================================
   FILTER CONSTANTS (Requirements 1 & 2)
========================================================= */

const TECHNICAL_SKILL_CATEGORIES = [
  "All Skills",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Java Developer",
  "Python Developer",
  "AI/ML Developer",
  "Data Analyst",
  "Other Skills",
];

const ACADEMIC_YEARS = [
  "All Years",
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
];

const BRANCH_CATEGORIES = [
  "All Branches",
  "Computer Science",
  "CSE AI & ML",
  "IT",
  "Other Branches",
];

/* =========================================================
   HELPER FUNCTIONS FOR CATEGORIZATION & FILTERING
========================================================= */

const deriveAcademicYear = (student) => {
  if (
    student?.academicYear &&
    ["1st Year", "2nd Year", "3rd Year", "4th Year"].includes(
      student.academicYear
    )
  ) {
    return student.academicYear;
  }
  const yearNum = Number(student?.graduationYear);
  if (!yearNum) return "3rd Year";
  if (yearNum <= 2026) return "4th Year";
  if (yearNum === 2027) return "3rd Year";
  if (yearNum === 2028) return "2nd Year";
  return "1st Year";
};

const matchesSkillCategory = (skills, category) => {
  if (!category || category === "All Skills" || category === "All") return true;
  if (!skills || !Array.isArray(skills)) return category === "Other Skills";

  const skillLower = skills.map((sk) => String(sk).toLowerCase());
  const hasSkill = (keywords) =>
    keywords.some((kw) =>
      skillLower.some((s) => s.includes(kw.toLowerCase()))
    );

  switch (category) {
    case "Full Stack Developer":
      return hasSkill(["full stack", "fullstack", "mern", "mean"]);
    case "Frontend Developer":
      return hasSkill([
        "frontend",
        "front-end",
        "react",
        "vue",
        "angular",
        "html",
        "css",
        "next.js",
        "tailwind",
      ]);
    case "Backend Developer":
      return hasSkill([
        "backend",
        "back-end",
        "node",
        "express",
        "django",
        "spring boot",
        "fastapi",
        "flask",
      ]);
    case "Java Developer":
      return hasSkill(["java", "spring", "hibernate", "core java"]);
    case "Python Developer":
      return hasSkill(["python", "django", "flask", "fastapi", "pandas"]);
    case "AI/ML Developer":
      return hasSkill([
        "ai/ml",
        "ai / ml",
        "ai",
        "machine learning",
        "deep learning",
        "pytorch",
        "tensorflow",
        "nlp",
        "data science",
      ]);
    case "Data Analyst":
      return hasSkill([
        "data analyst",
        "data analytics",
        "data analysis",
        "powerbi",
        "power bi",
        "tableau",
        "sql",
      ]);
    case "Other Skills": {
      const known = [
        "full stack",
        "fullstack",
        "mern",
        "mean",
        "frontend",
        "front-end",
        "react",
        "vue",
        "angular",
        "html",
        "css",
        "backend",
        "back-end",
        "node",
        "express",
        "django",
        "spring boot",
        "java",
        "python",
        "ai",
        "ml",
        "machine learning",
        "deep learning",
        "data analyst",
        "powerbi",
        "tableau",
      ];
      return !hasSkill(known) || skills.length === 0;
    }
    default:
      return hasSkill([category]);
  }
};

const matchesBranchCategory = (studentBranch, branchFilter) => {
  if (
    !branchFilter ||
    branchFilter === "All Branches" ||
    branchFilter === "All"
  ) {
    return true;
  }
  if (!studentBranch) return branchFilter === "Other Branches";

  const b = studentBranch.trim().toLowerCase();
  switch (branchFilter) {
    case "Computer Science":
      return (
        (b.includes("computer science") || b.includes("cse")) &&
        !b.includes("ai") &&
        !b.includes("ml")
      );
    case "CSE AI & ML":
      return (
        b.includes("ai & ml") ||
        b.includes("ai/ml") ||
        b.includes("ai and ml") ||
        b.includes("artificial intelligence")
      );
    case "IT":
      return b === "it" || b.includes("information technology");
    case "Other Branches":
      return (
        !b.includes("computer science") &&
        !b.includes("cse") &&
        !b.includes("ai") &&
        !b.includes("ml") &&
        b !== "it" &&
        !b.includes("information technology")
      );
    default:
      return b === branchFilter.toLowerCase();
  }
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AdminStudents = () => {
  // Main data states
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Filters state (Categorization & Multi-filter combination)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillCategory, setSelectedSkillCategory] = useState("All Skills");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("All Years");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedCgpaFilter, setSelectedCgpaFilter] = useState("All");

  // Selection state for batch actions
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

  // Modal states
  // 1. Company Profile Sharing Modal
  const [shareModal, setShareModal] = useState({
    isOpen: false,
    selectedCompanyId: "",
    customCompanyName: "",
    customCompanyEmail: "",
    customHrName: "",
    subject: "",
    message: "",
    targetStudentIds: [],
    loading: false,
  });

  // 2. Notification Broadcast Modal
  const [notificationModal, setNotificationModal] = useState({
    isOpen: false,
    targetAudience: "all", // "all" | "student" | "selected" | "year" | "skill"
    targetStudentId: "",
    targetStudentIds: [],
    targetAcademicYear: "2nd Year",
    targetSkillCategory: "Full Stack Developer",
    title: "",
    message: "",
    type: "general", // "general" | "interview" | "application" | "schedule"
    loading: false,
  });

  // 3. History Modal (Notifications or Shares)
  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    tab: "notifications", // "notifications" | "shares"
    data: [],
    loading: false,
  });

  // 4. Student Quick Preview Modal
  const [previewStudent, setPreviewStudent] = useState(null);

  // 5. Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  /* =======================================================
     FETCH DATA ON MOUNT
  ======================================================= */

  useEffect(() => {
    fetchStudents();
    fetchCompanies();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminAPI.getStudents();
      if (res.data?.success && res.data?.students) {
        setStudents(res.data.students);
      } else {
        setError(res.data?.message || "Failed to load registered students.");
      }
    } catch (err) {
      console.error("Fetch students error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load students. Please check your admin connection."
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
      }
    } catch (err) {
      console.error("Fetch companies for sharing error:", err);
    }
  };

  /* =======================================================
     ADVANCED FILTERING & SEARCH COMBINATION (Requirement 2)
  ======================================================= */

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const sYear = deriveAcademicYear(s);

      // 1. Search filter: Name, Email, Enrollment/Roll No, Skills, Branch, Year
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = s.name?.toLowerCase().includes(q);
        const matchesEmail = s.email?.toLowerCase().includes(q);
        const matchesPhone = s.phone?.toLowerCase().includes(q);
        const matchesRoll = s.rollNumber?.toLowerCase().includes(q);
        const matchesBranchStr = s.branch?.toLowerCase().includes(q);
        const matchesYearStr =
          sYear.toLowerCase().includes(q) ||
          String(s.graduationYear || "").includes(q);
        const matchesSkills =
          s.skills &&
          Array.isArray(s.skills) &&
          s.skills.some((sk) => sk.toLowerCase().includes(q));

        if (
          !matchesName &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesRoll &&
          !matchesBranchStr &&
          !matchesYearStr &&
          !matchesSkills
        ) {
          return false;
        }
      }

      // 2. Technical Skills Filter (Requirement 2)
      if (
        selectedSkillCategory !== "All Skills" &&
        !matchesSkillCategory(s.skills, selectedSkillCategory)
      ) {
        return false;
      }

      // 3. Academic Year Filter (Requirement 2)
      if (
        selectedAcademicYear !== "All Years" &&
        sYear !== selectedAcademicYear
      ) {
        return false;
      }

      // 4. Branch Filter (Requirement 2)
      if (
        selectedBranch !== "All Branches" &&
        !matchesBranchCategory(s.branch, selectedBranch)
      ) {
        return false;
      }

      // 5. CGPA Filter
      const cgpa = Number(s.cgpa) || 0;
      if (selectedCgpaFilter === "above8" && cgpa < 8.0) return false;
      if (selectedCgpaFilter === "7to8" && (cgpa < 7.0 || cgpa >= 8.0))
        return false;
      if (selectedCgpaFilter === "6to7" && (cgpa < 6.0 || cgpa >= 7.0))
        return false;
      if (selectedCgpaFilter === "below6" && cgpa >= 6.0) return false;

      return true;
    });
  }, [
    students,
    searchQuery,
    selectedSkillCategory,
    selectedAcademicYear,
    selectedBranch,
    selectedCgpaFilter,
  ]);

  // Dynamic counts for quick chips
  const skillCounts = useMemo(() => {
    const counts = {};
    TECHNICAL_SKILL_CATEGORIES.forEach((cat) => {
      counts[cat] = students.filter((s) => matchesSkillCategory(s.skills, cat)).length;
    });
    return counts;
  }, [students]);

  const yearCounts = useMemo(() => {
    const counts = {};
    ACADEMIC_YEARS.forEach((yr) => {
      if (yr === "All Years") {
        counts[yr] = students.length;
      } else {
        counts[yr] = students.filter((s) => deriveAcademicYear(s) === yr).length;
      }
    });
    return counts;
  }, [students]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedSkillCategory("All Skills");
    setSelectedAcademicYear("All Years");
    setSelectedBranch("All Branches");
    setSelectedCgpaFilter("All");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedSkillCategory !== "All Skills" ||
    selectedAcademicYear !== "All Years" ||
    selectedBranch !== "All Branches" ||
    selectedCgpaFilter !== "All";

  /* =======================================================
     SELECTION HANDLERS (Requirement 1 & 5)
  ======================================================= */

  const isAllFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedStudentIds.has(s._id));

  const toggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedStudentIds(new Set());
    } else {
      const newSet = new Set(selectedStudentIds);
      filteredStudents.forEach((s) => newSet.add(s._id));
      setSelectedStudentIds(newSet);
    }
  };

  const toggleSelectStudent = (id) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedStudentIds(newSet);
  };

  const clearSelection = () => {
    setSelectedStudentIds(new Set());
  };

  /* =======================================================
     RESUME DOWNLOAD HANDLERS (Requirement 1)
  ======================================================= */

  const getResumeUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");
    return `${baseUrl}/uploads/resumes/${url}`;
  };

  const downloadSingleResume = (resumeUrl, studentName = "Student") => {
    if (!resumeUrl) {
      showToast(`No resume document uploaded for ${studentName}.`);
      return;
    }
    const safeName = studentName.replace(/[^a-zA-Z0-9]/g, "_");
    const targetUrl = getResumeUrl(resumeUrl);
    const link = document.createElement("a");
    link.href = targetUrl;
    link.download = `${safeName}_Resume.pdf`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloading resume for ${studentName}...`);
  };

  const downloadBatchResumes = () => {
    const selectedList = students.filter((s) => selectedStudentIds.has(s._id));
    const withResume = selectedList.filter((s) => s.resume);

    if (withResume.length === 0) {
      showToast("None of the selected students have uploaded a resume yet.");
      return;
    }

    showToast(
      `Downloading ${withResume.length} resume(s) for selected students...`
    );

    withResume.forEach((s, idx) => {
      setTimeout(() => {
        downloadSingleResume(s.resume, s.name);
      }, idx * 400);
    });
  };

  /* =======================================================
     COMPANY PROFILE SHARING (Requirements 1 & 5)
  ======================================================= */

  const openShareModal = (targetIds = []) => {
    const idsToShare =
      targetIds.length > 0
        ? targetIds
        : Array.from(selectedStudentIds);

    if (idsToShare.length === 0) {
      showToast("Please select at least one student to share.");
      return;
    }

    const firstCompany = companies[0];

    setShareModal({
      isOpen: true,
      selectedCompanyId: firstCompany?._id || "",
      customCompanyName: "",
      customCompanyEmail: "",
      customHrName: "",
      subject: `Placement Cell - Candidate Dossier (${idsToShare.length} Students)`,
      message: `Dear Recruiter,\n\nPlease find the verified academic profiles, skill sets, and resumes for ${idsToShare.length} student candidate(s) recommended by the Placement Cell for your recruitment review.\n\nBest regards,\nCampus Placement Cell`,
      targetStudentIds: idsToShare,
      loading: false,
    });
  };

  const handleExecuteShare = async (e) => {
    e.preventDefault();
    try {
      setShareModal((prev) => ({ ...prev, loading: true }));

      let companyName = shareModal.customCompanyName;
      let companyEmail = shareModal.customCompanyEmail;
      let hrName = shareModal.customHrName;

      if (shareModal.selectedCompanyId && shareModal.selectedCompanyId !== "custom") {
        const comp = companies.find(
          (c) => c._id === shareModal.selectedCompanyId
        );
        if (comp) {
          companyName = comp.companyName;
          companyEmail = comp.officialEmail || comp.email;
          hrName = comp.hrName || "";
        }
      }

      if (!companyEmail) {
        alert("Please provide a valid recipient company email address.");
        setShareModal((prev) => ({ ...prev, loading: false }));
        return;
      }

      const payload = {
        companyId:
          shareModal.selectedCompanyId !== "custom"
            ? shareModal.selectedCompanyId
            : null,
        companyName: companyName || "Corporate Partner",
        companyEmail: companyEmail.trim(),
        hrName: hrName ? hrName.trim() : "",
        subject: shareModal.subject,
        message: shareModal.message,
        studentIds: shareModal.targetStudentIds,
      };

      const res = await adminAPI.shareStudentsWithCompany(payload);
      if (res.data?.success) {
        showToast(
          res.data.message ||
            `Shared ${shareModal.targetStudentIds.length} profile(s) with ${companyName}!`
        );
        setShareModal({
          isOpen: false,
          selectedCompanyId: "",
          customCompanyName: "",
          customCompanyEmail: "",
          customHrName: "",
          subject: "",
          message: "",
          targetStudentIds: [],
          loading: false,
        });
        clearSelection();
      } else {
        alert(res.data?.message || "Failed to share profiles with company.");
      }
    } catch (err) {
      console.error("Execute share error:", err);
      alert(
        err.response?.data?.message ||
          "Could not dispatch student profiles. Please check company details."
      );
    } finally {
      setShareModal((prev) => ({ ...prev, loading: false }));
    }
  };

  /* =======================================================
     ADMIN NOTIFICATION SYSTEM (Requirement 3)
  ======================================================= */

  const openNotificationModal = (preset = {}) => {
    setNotificationModal({
      isOpen: true,
      targetAudience: preset.targetAudience || (selectedStudentIds.size > 0 ? "selected" : "all"),
      targetStudentId: preset.studentId || "",
      targetStudentIds: preset.studentIds || Array.from(selectedStudentIds),
      targetAcademicYear: preset.academicYear || "2nd Year",
      targetSkillCategory: preset.skillCategory || "Full Stack Developer",
      title: preset.title || "",
      message: preset.message || "",
      type: preset.type || "general",
      loading: false,
    });
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notificationModal.title.trim() || !notificationModal.message.trim()) {
      alert("Please enter both a title and message for the notification.");
      return;
    }

    try {
      setNotificationModal((prev) => ({ ...prev, loading: true }));

      const payload = {
        title: notificationModal.title.trim(),
        message: notificationModal.message.trim(),
        type: notificationModal.type,
        targetAudience: notificationModal.targetAudience,
        studentId: notificationModal.targetStudentId,
        studentIds: notificationModal.targetStudentIds,
        academicYear: notificationModal.targetAcademicYear,
        skillCategory: notificationModal.targetSkillCategory,
      };

      const res = await adminAPI.sendNotification(payload);
      if (res.data?.success) {
        showToast(
          res.data.message ||
            `Notification sent successfully to ${res.data.recipientsCount} student(s)!`
        );
        setNotificationModal({
          isOpen: false,
          targetAudience: "all",
          targetStudentId: "",
          targetStudentIds: [],
          targetAcademicYear: "2nd Year",
          targetSkillCategory: "Full Stack Developer",
          title: "",
          message: "",
          type: "general",
          loading: false,
        });
        clearSelection();
      } else {
        alert(res.data?.message || "Failed to send notification.");
      }
    } catch (err) {
      console.error("Send notification error:", err);
      alert(
        err.response?.data?.message ||
          "Could not dispatch notification to student cohort."
      );
    } finally {
      setNotificationModal((prev) => ({ ...prev, loading: false }));
    }
  };

  /* =======================================================
     HISTORY MODAL (Requirement 3 & 5)
  ======================================================= */

  const openHistoryModal = async (tab = "notifications") => {
    try {
      setHistoryModal({
        isOpen: true,
        tab,
        data: [],
        loading: true,
      });

      if (tab === "notifications") {
        const res = await adminAPI.getNotificationHistory();
        if (res.data?.success) {
          setHistoryModal({
            isOpen: true,
            tab: "notifications",
            data: res.data.history || [],
            loading: false,
          });
        }
      } else {
        const res = await adminAPI.getSharedProfilesHistory();
        if (res.data?.success) {
          setHistoryModal({
            isOpen: true,
            tab: "shares",
            data: res.data.shares || [],
            loading: false,
          });
        }
      }
    } catch (err) {
      console.error("Open history modal error:", err);
      setHistoryModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const switchHistoryTab = async (newTab) => {
    openHistoryModal(newTab);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl ring-1 ring-white/10 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header & Quick Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Placement Cell Administration
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Student Directory & Categorization
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Manage candidate profiles, categorize by skill & year, dispatch resumes, and notify student cohorts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View History Button */}
            <button
              type="button"
              onClick={() => openHistoryModal("notifications")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
              title="View past notifications & company share records"
            >
              <History size={14} className="text-slate-500" />
              Activity History
            </button>

            {/* Broadcast Notification Button */}
            <button
              type="button"
              onClick={() => openNotificationModal()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <Bell size={14} className="text-blue-400" />
              Send Notification
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchStudents}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* =========================================================
            REQUIREMENT 2: QUICK CATEGORIZATION PILLS
        ========================================================= */}
        <div className="space-y-3">
          {/* Technical Skills Quick Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-600" />
                Technical Skill Category:
              </span>
              <span className="text-[11px] text-slate-400">
                Click any category to filter students instantly
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {TECHNICAL_SKILL_CATEGORIES.map((cat) => {
                const isActive = selectedSkillCategory === cat;
                const count = skillCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedSkillCategory(cat)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        isActive
                          ? "bg-blue-800 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Academic Year Quick Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <GraduationCap size={15} className="text-indigo-600" />
                Academic Year Category:
              </span>
              <span className="text-[11px] text-slate-400">
                Combine with skills for targeted shortlisting
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {ACADEMIC_YEARS.map((yr) => {
                const isActive = selectedAcademicYear === yr;
                const count = yearCounts[yr] || 0;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedAcademicYear(yr)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{yr}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        isActive
                          ? "bg-indigo-800 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================
            SEARCH & DETAILED FILTER TOOLBAR (Requirements 1 & 2)
        ========================================================= */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            {/* Search Input: Name, Email, Enrollment Number, Skills, Branch, Year */}
            <div className="relative md:col-span-6">
              <Search
                size={16}
                className="absolute left-3.5 top-3 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, enrollment no., skills, branch, year..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Branch Filter Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {BRANCH_CATEGORIES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* CGPA Filter Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedCgpaFilter}
                onChange={(e) => setSelectedCgpaFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All CGPA</option>
                <option value="above8">8.0 and above</option>
                <option value="7to8">7.0 – 8.0</option>
                <option value="6to7">6.0 – 7.0</option>
                <option value="below6">Below 6.0</option>
              </select>
            </div>
          </div>

          {/* Active Filter Indicators & Clear Controls */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span>Active Filters:</span>
                {selectedSkillCategory !== "All Skills" && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                    Skill: {selectedSkillCategory}
                  </span>
                )}
                {selectedAcademicYear !== "All Years" && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700">
                    Year: {selectedAcademicYear}
                  </span>
                )}
                {selectedBranch !== "All Branches" && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
                    Branch: {selectedBranch}
                  </span>
                )}
                {selectedCgpaFilter !== "All" && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                    CGPA: {selectedCgpaFilter}
                  </span>
                )}
                <span className="text-slate-400 pl-1">
                  (Showing {filteredStudents.length} of {students.length} students)
                </span>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <X size={13} />
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* =========================================================
            REQUIREMENT 1 & 5: BATCH ACTION TOOLBAR
        ========================================================= */}
        {selectedStudentIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-white shadow-xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                {selectedStudentIds.size}
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {selectedStudentIds.size} student profile(s) selected
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Batch Download Resumes */}
              <button
                type="button"
                onClick={downloadBatchResumes}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                <Download size={14} className="text-emerald-400" />
                Download Resumes ({selectedStudentIds.size})
              </button>

              {/* Batch Share with Company */}
              <button
                type="button"
                onClick={() => openShareModal()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <Share2 size={14} />
                Share with Company ({selectedStudentIds.size})
              </button>

              {/* Batch Notification */}
              <button
                type="button"
                onClick={() =>
                  openNotificationModal({
                    targetAudience: "selected",
                    studentIds: Array.from(selectedStudentIds),
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-violet-700 transition"
              >
                <Bell size={14} />
                Notify Selected ({selectedStudentIds.size})
              </button>

              {/* Deselect */}
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <div className="flex-1 font-medium">{error}</div>
            <button
              onClick={fetchStudents}
              className="rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* =========================================================
            STUDENT TABLE VIEW (Requirements 1, 2, 5)
        ========================================================= */}
        {loading ? (
          <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
            <p className="text-xs font-medium text-slate-500">
              Loading student directory and categorization...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <GraduationCap size={28} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              No matching students found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {hasActiveFilters
                ? "No student records match your current filter combination. Try adjusting your skill, year, or branch filter."
                : "No registered students found in the college portal."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3.5 w-10 text-center">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-slate-500 hover:text-slate-900"
                        title={isAllFilteredSelected ? "Deselect all" : "Select all on page"}
                      >
                        {isAllFilteredSelected ? (
                          <CheckSquare size={16} className="text-blue-600" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3.5">Student & Contact</th>
                    <th className="px-4 py-3.5">Academic & Batch</th>
                    <th className="px-4 py-3.5">Technical Skills</th>
                    <th className="px-4 py-3.5 text-center">CGPA</th>
                    <th className="px-4 py-3.5 text-center">Resume</th>
                    <th className="px-4 py-3.5 text-center">Applications</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => {
                    const isSelected = selectedStudentIds.has(s._id);
                    const sYear = deriveAcademicYear(s);
                    return (
                      <tr
                        key={s._id}
                        className={`transition group ${
                          isSelected ? "bg-blue-50/50" : "hover:bg-slate-50/60"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSelectStudent(s._id)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {isSelected ? (
                              <CheckSquare
                                size={16}
                                className="text-blue-600"
                              />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>

                        {/* Name & Contact */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600 shadow-sm">
                              {s.name
                                ? s.name
                                    .split(" ")
                                    .filter(Boolean)
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()
                                : "ST"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">
                                {s.name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {s.email}
                              </p>
                              {s.rollNumber && s.rollNumber !== "N/A" && (
                                <span className="inline-block mt-0.5 rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono text-slate-600">
                                  Roll: {s.rollNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Branch, Academic Year & Batch */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                              {s.branch}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                                {sYear}
                              </span>
                              <span>• Batch {s.graduationYear || 2027}</span>
                            </div>
                          </div>
                        </td>

                        {/* Skills */}
                        <td className="px-4 py-4 max-w-[220px]">
                          {s.skills && s.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {s.skills.slice(0, 3).map((sk, idx) => (
                                <span
                                  key={idx}
                                  className="rounded bg-blue-50/80 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-100"
                                >
                                  {sk}
                                </span>
                              ))}
                              {s.skills.length > 3 && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                                  +{s.skills.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              No skills listed
                            </span>
                          )}
                        </td>

                        {/* CGPA */}
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${
                              Number(s.cgpa) >= 8.0
                                ? "bg-emerald-50 text-emerald-700"
                                : Number(s.cgpa) >= 7.0
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {Number(s.cgpa).toFixed(2)}
                          </span>
                        </td>

                        {/* Resume View & Download (Requirement 1) */}
                        <td className="px-4 py-4 text-center">
                          {s.resume ? (
                            <div className="inline-flex items-center gap-1">
                              {/* View */}
                              <a
                                href={getResumeUrl(s.resume)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-sm"
                                title="View Resume in New Tab"
                              >
                                <Eye size={13} />
                              </a>
                              {/* Download */}
                              <button
                                type="button"
                                onClick={() =>
                                  downloadSingleResume(s.resume, s.name)
                                }
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition shadow-sm"
                                title="Download Resume"
                              >
                                <Download size={13} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              No resume
                            </span>
                          )}
                        </td>

                        {/* Applications Count */}
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                            <FileText size={11} className="text-slate-400" />
                            {s.applicationsCount}
                          </span>
                        </td>

                        {/* Actions (Share, Notify, Profile) */}
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Share this individual student profile */}
                            <button
                              type="button"
                              onClick={() => openShareModal([s._id])}
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                              title="Share profile with a company"
                            >
                              <Share2 size={13} className="text-blue-600" />
                              <span className="hidden xl:inline">Share</span>
                            </button>

                            {/* Notify this student */}
                            <button
                              type="button"
                              onClick={() =>
                                openNotificationModal({
                                  targetAudience: "student",
                                  studentId: s._id,
                                  title: `Placement Update for ${s.name}`,
                                })
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-sm"
                              title="Send Notification to this student"
                            >
                              <Bell size={13} />
                            </button>

                            {/* View Profile */}
                            <button
                              type="button"
                              onClick={() => setPreviewStudent(s)}
                              className="inline-flex h-8 items-center gap-1 rounded-lg bg-blue-50 px-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition shadow-sm"
                              title="Quick Profile Preview"
                            >
                              <Eye size={13} />
                              <span>Preview</span>
                            </button>

                            {/* Full Dossier Link */}
                            <Link
                              to={`/admin/students/${s._id}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition shadow-sm"
                              title="Open Full Profile Page"
                            >
                              <ChevronRight size={14} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Cards View */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {filteredStudents.map((s) => {
                const isSelected = selectedStudentIds.has(s._id);
                const sYear = deriveAcademicYear(s);
                return (
                  <div
                    key={s._id}
                    className={`rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                      isSelected
                        ? "border-blue-300 bg-blue-50/40 ring-1 ring-blue-500/20"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleSelectStudent(s._id)}
                          className="text-slate-400"
                        >
                          {isSelected ? (
                            <CheckSquare size={18} className="text-blue-600" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600">
                          {s.name
                            ? s.name
                                .split(" ")
                                .filter(Boolean)
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            : "ST"}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            {s.name}
                          </h3>
                          <p className="text-xs text-slate-400">{s.email}</p>
                          {s.rollNumber && s.rollNumber !== "N/A" && (
                            <p className="text-[10px] font-mono text-slate-500">
                              Roll: {s.rollNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        {sYear}
                      </span>
                    </div>

                    {/* Academic info grid */}
                    <div className="grid grid-cols-3 gap-2 text-xs border-y border-slate-100 py-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Branch
                        </span>
                        <p className="font-semibold text-slate-800 truncate">
                          {s.branch}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          CGPA
                        </span>
                        <p className="font-bold text-blue-600">
                          {Number(s.cgpa).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Applications
                        </span>
                        <p className="font-semibold text-slate-800">
                          {s.applicationsCount}
                        </p>
                      </div>
                    </div>

                    {/* Skills pills */}
                    {s.skills && s.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {s.skills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions bar */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        {s.resume ? (
                          <>
                            <a
                              href={getResumeUrl(s.resume)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                            >
                              <Eye size={12} />
                              Resume
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                downloadSingleResume(s.resume, s.name)
                              }
                              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                            >
                              <Download size={12} />
                              Download
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            No resume
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openShareModal([s._id])}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Share2 size={13} className="text-blue-600 inline mr-1" />
                          Share
                        </button>
                        <Link
                          to={`/admin/students/${s._id}`}
                          className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                          Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* =========================================================
            MODAL 1: SHARE STUDENT PROFILES WITH COMPANY (Req 1 & 5)
        ========================================================= */}
        {shareModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <Share2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Share Student Profiles with Company
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Dispatch selected candidate profiles & resumes to corporate recruiters
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShareModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleExecuteShare} className="p-6 space-y-4">
                {/* Selected Students Preview Banner */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <UserCheck size={14} className="text-blue-600" />
                      Candidate Profiles to Share:
                    </span>
                    <span className="font-bold text-blue-700">
                      {shareModal.targetStudentIds.length} Candidate(s)
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {shareModal.targetStudentIds.map((id) => {
                      const st = students.find((s) => s._id === id);
                      if (!st) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-slate-800 border border-blue-200 shadow-xs"
                        >
                          <span>{st.name}</span>
                          <span className="text-[10px] text-slate-400">
                            ({st.branch})
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Company Selection Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Target Recruiting Partner *
                  </label>
                  <select
                    value={shareModal.selectedCompanyId}
                    onChange={(e) =>
                      setShareModal((prev) => ({
                        ...prev,
                        selectedCompanyId: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                    required
                  >
                    <option value="">-- Choose Registered Company --</option>
                    {companies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.companyName} ({c.officialEmail || c.email || "No email"} - {c.location || "Campus"})
                      </option>
                    ))}
                    <option value="custom">+ Enter Custom Company / HR Details</option>
                  </select>
                </div>

                {/* Custom Company Details if "custom" selected */}
                {shareModal.selectedCompanyId === "custom" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shareModal.customCompanyName}
                        onChange={(e) =>
                          setShareModal((prev) => ({
                            ...prev,
                            customCompanyName: e.target.value,
                          }))
                        }
                        placeholder="e.g. Google India"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        HR / Recruiter Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={shareModal.customCompanyEmail}
                        onChange={(e) =>
                          setShareModal((prev) => ({
                            ...prev,
                            customCompanyEmail: e.target.value,
                          }))
                        }
                        placeholder="recruiter@company.com"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        HR Contact Name
                      </label>
                      <input
                        type="text"
                        value={shareModal.customHrName}
                        onChange={(e) =>
                          setShareModal((prev) => ({
                            ...prev,
                            customHrName: e.target.value,
                          }))
                        }
                        placeholder="e.g. Sarah Miller"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Email Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    value={shareModal.subject}
                    onChange={(e) =>
                      setShareModal((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Email / Sharing Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Message / Recruitment Notes *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={shareModal.message}
                    onChange={(e) =>
                      setShareModal((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      setShareModal((prev) => ({ ...prev, isOpen: false }))
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={shareModal.loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {shareModal.loading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    {shareModal.loading ? "Sharing Profiles..." : "Confirm & Share Profiles"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 2: SEND NOTIFICATIONS (Requirement 3)
        ========================================================= */}
        {notificationModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                    <Bell size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Send Placement Notification
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Deliver instant dashboard alerts to all or targeted student cohorts
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNotificationModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSendNotification} className="p-6 space-y-4">
                {/* Target Audience Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Recipient Audience *
                  </label>
                  <select
                    value={notificationModal.targetAudience}
                    onChange={(e) =>
                      setNotificationModal((prev) => ({
                        ...prev,
                        targetAudience: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="all">All Registered Students (Broadcast)</option>
                    <option value="year">By Academic Year (1st, 2nd, 3rd, 4th)</option>
                    <option value="skill">By Technical Skill Category</option>
                    <option value="selected">
                      Selected Students from Table ({notificationModal.targetStudentIds.length})
                    </option>
                    <option value="student">A Particular Student</option>
                  </select>
                </div>

                {/* Sub-selector based on audience */}
                {notificationModal.targetAudience === "year" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Choose Academic Year
                    </label>
                    <select
                      value={notificationModal.targetAcademicYear}
                      onChange={(e) =>
                        setNotificationModal((prev) => ({
                          ...prev,
                          targetAcademicYear: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800"
                    >
                      <option value="1st Year">1st Year Students</option>
                      <option value="2nd Year">2nd Year Students</option>
                      <option value="3rd Year">3rd Year Students</option>
                      <option value="4th Year">4th Year Students</option>
                    </select>
                  </div>
                )}

                {notificationModal.targetAudience === "skill" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Choose Technical Skill Category
                    </label>
                    <select
                      value={notificationModal.targetSkillCategory}
                      onChange={(e) =>
                        setNotificationModal((prev) => ({
                          ...prev,
                          targetSkillCategory: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800"
                    >
                      {TECHNICAL_SKILL_CATEGORIES.filter((c) => c !== "All Skills").map(
                        (cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}

                {notificationModal.targetAudience === "student" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Individual Student
                    </label>
                    <select
                      value={notificationModal.targetStudentId}
                      onChange={(e) =>
                        setNotificationModal((prev) => ({
                          ...prev,
                          targetStudentId: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800"
                      required
                    >
                      <option value="">-- Choose Student --</option>
                      {students.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.name} ({st.email} • {st.branch})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Notification Type & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Notification Category
                    </label>
                    <select
                      value={notificationModal.type}
                      onChange={(e) =>
                        setNotificationModal((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800"
                    >
                      <option value="general">General Notice</option>
                      <option value="interview">Interview Alert</option>
                      <option value="drive">Placement Drive Alert</option>
                      <option value="schedule">Schedule / Timeline</option>
                      <option value="application">Application Update</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Notification Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amazon Round 1 Interview Scheduled"
                      value={notificationModal.title}
                      onChange={(e) =>
                        setNotificationModal((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>

                {/* Notification Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notification Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter full notice or details to be shown in the student's dashboard..."
                    value={notificationModal.message}
                    onChange={(e) =>
                      setNotificationModal((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 resize-none focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      setNotificationModal((prev) => ({ ...prev, isOpen: false }))
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={notificationModal.loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                  >
                    {notificationModal.loading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                    {notificationModal.loading ? "Sending..." : "Dispatch Notification"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 3: ACTIVITY HISTORY (Notifications & Shares)
        ========================================================= */}
        {historyModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <History size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Admin Activity & Dispatch History
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Audit past notification dispatches and corporate profile shares
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setHistoryModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-100 px-6 pt-3">
                <button
                  type="button"
                  onClick={() => switchHistoryTab("notifications")}
                  className={`pb-2.5 text-xs font-bold border-b-2 transition ${
                    historyModal.tab === "notifications"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Notification Broadcasts ({historyModal.tab === "notifications" ? historyModal.data.length : ""})
                </button>
                <button
                  type="button"
                  onClick={() => switchHistoryTab("shares")}
                  className={`pb-2.5 text-xs font-bold border-b-2 transition ${
                    historyModal.tab === "shares"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Profiles Shared with Companies ({historyModal.tab === "shares" ? historyModal.data.length : ""})
                </button>
              </div>

              {/* Content List */}
              <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100">
                {historyModal.loading ? (
                  <div className="flex h-48 items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                  </div>
                ) : historyModal.data.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No records found for this activity tab yet.
                  </div>
                ) : historyModal.tab === "notifications" ? (
                  historyModal.data.map((item) => (
                    <div key={item._id} className="py-3.5 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">
                            {item.title}
                          </span>
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                            {item.targetCriteria || item.targetAudience}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.message}
                      </p>
                      <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-2">
                        <span>Recipients: <strong>{item.recipientsCount}</strong> student(s)</span>
                        <span>•</span>
                        <span>Type: {item.type}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  historyModal.data.map((item) => (
                    <div key={item._id} className="py-3.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">
                            {item.companyName}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({item.companyEmail})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-blue-700">
                        {item.subject}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.message}
                      </p>
                      <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-2">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {item.students?.length || 0} Student Profile(s) Shared
                        </span>
                        <span>Status: {item.status || "Dispatched"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            MODAL 4: STUDENT QUICK PREVIEW MODAL
        ========================================================= */}
        {previewStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
                    {previewStudent.name
                      ? previewStudent.name
                          .split(" ")
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "ST"}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {previewStudent.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {previewStudent.email} • {previewStudent.phone || "No phone"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewStudent(null)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {/* Academic Quick Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      CGPA
                    </span>
                    <p className="text-base font-bold text-blue-600">
                      {Number(previewStudent.cgpa).toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Year / Batch
                    </span>
                    <p className="text-sm font-bold text-slate-800">
                      {deriveAcademicYear(previewStudent)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Applications
                    </span>
                    <p className="text-base font-bold text-slate-800">
                      {previewStudent.applicationsCount || 0}
                    </p>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-2 border-y border-slate-100 py-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Branch:</span>
                    <span className="font-semibold text-slate-800">
                      {previewStudent.branch}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Enrollment / Roll No:</span>
                    <span className="font-semibold text-slate-800">
                      {previewStudent.rollNumber || "Not recorded"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Course / Degree:</span>
                    <span className="font-semibold text-slate-800">
                      {previewStudent.course}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">College:</span>
                    <span className="font-semibold text-slate-800">
                      {previewStudent.college}
                    </span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                    Technical Skills & Competencies
                  </span>
                  {previewStudent.skills && previewStudent.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {previewStudent.skills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-100"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No skills specified.</p>
                  )}
                </div>

                {/* Resume Status */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-slate-500" />
                    <div>
                      <p className="font-bold text-slate-800 text-xs">
                        {previewStudent.resumeOriginalName || "Resume Document"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {previewStudent.resume ? "Attached & Verified" : "Not uploaded yet"}
                      </p>
                    </div>
                  </div>

                  {previewStudent.resume ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={previewStudent.resume}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        View
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          downloadSingleResume(previewStudent.resume, previewStudent.name)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Download
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const id = previewStudent._id;
                      setPreviewStudent(null);
                      openShareModal([id]);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Share2 size={13} className="text-blue-600" />
                    Share with Company
                  </button>

                  <Link
                    to={`/admin/students/${previewStudent._id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
                  >
                    Open Full Dossier
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminStudents;
