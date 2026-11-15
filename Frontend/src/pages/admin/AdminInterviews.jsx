import { useState, useEffect, useMemo } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import { adminInterviewsAPI } from "../../services/api";
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Clock3,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Video,
  MapPin,
  User,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Star,
  Award,
  Send,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  BarChart3,
  LayoutGrid,
  List,
  Sparkles,
  Info,
  HelpCircle,
  ExternalLink,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Check,
  MessageSquare,
  AlertTriangle,
  FileText,
} from "lucide-react";

const AdminInterviews = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState("interviews"); // 'interviews', 'calendar', 'analytics', 'rounds'

  // Interviews Table State
  const [interviews, setInterviews] = useState([]);
  const [metrics, setMetrics] = useState({
    totalInterviews: 0,
    upcomingInterviews: 0,
    completedInterviews: 0,
    selectedStudents: 0,
    rejectedStudents: 0,
    rescheduledInterviews: 0,
    onHoldInterviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [roundFilter, setRoundFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Options for Modals
  const [formOptions, setFormOptions] = useState({
    companies: [],
    drives: [],
    applications: [],
    existingRounds: [],
    defaultRounds: [],
  });

  // Modal States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected Item for Modals
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Schedule Form State
  const [scheduleForm, setScheduleForm] = useState({
    companyId: "",
    driveId: "",
    studentId: "",
    roundNumber: 1,
    roundName: "Technical Round",
    date: "",
    time: "10:00 AM",
    mode: "Online",
    meetingLink: "",
    venue: "",
    interviewerName: "",
    interviewerEmail: "",
    interviewerPhone: "",
    interviewerDesignation: "",
    instructions: "",
    remarks: "",
  });

  // Reschedule Form State
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: "",
    newTime: "",
    mode: "Online",
    meetingLink: "",
    venue: "",
    reason: "",
  });

  // Feedback Form State
  const [feedbackForm, setFeedbackForm] = useState({
    technicalRating: 8,
    communicationRating: 8,
    problemSolvingRating: 8,
    overallRating: 8,
    comments: "",
    remarks: "",
    recommendation: "Cleared",
  });

  // Publish Form State
  const [publishForm, setPublishForm] = useState({
    decision: "Selected",
    adminNotes: "",
    packageAmount: "",
  });

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Drive Rounds Configuration State
  const [selectedDriveForRounds, setSelectedDriveForRounds] = useState("");
  const [driveRounds, setDriveRounds] = useState([]);
  const [roundsLoading, setRoundsLoading] = useState(false);

  // Helper notification alert
  const showSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(""), 4500);
  };

  // 1. Fetch Interviews List
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        search,
        status: statusFilter,
        mode: modeFilter,
        companyId: companyFilter,
        roundName: roundFilter,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      };

      const res = await adminInterviewsAPI.getInterviews(params);
      if (res.data.success) {
        setInterviews(res.data.interviews || []);
        setMetrics(res.data.metrics || metrics);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Error fetching admin interviews:", err);
      setError(err.response?.data?.message || "Failed to load interviews.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Form Options (Companies, Drives, Applicants)
  const fetchFormOptions = async () => {
    try {
      const res = await adminInterviewsAPI.getOptions();
      if (res.data.success) {
        setFormOptions(res.data);
      }
    } catch (err) {
      console.error("Error fetching options:", err);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [search, statusFilter, modeFilter, companyFilter, roundFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchFormOptions();
  }, []);

  // 3. Calendar Fetch
  const fetchCalendar = async () => {
    try {
      setCalendarLoading(true);
      const res = await adminInterviewsAPI.getCalendar({
        month: calendarDate.getMonth(),
        year: calendarDate.getFullYear(),
      });
      if (res.data.success) {
        setCalendarEvents(res.data.events || []);
      }
    } catch (err) {
      console.error("Calendar fetch error:", err);
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "calendar") {
      fetchCalendar();
    }
  }, [activeTab, calendarDate]);

  // 4. Analytics Fetch
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await adminInterviewsAPI.getAnalytics();
      if (res.data.success) {
        setAnalyticsData(res.data.analytics);
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [activeTab]);

  // 5. Rounds Fetch for a Drive
  const fetchDriveRounds = async (driveId) => {
    if (!driveId) return;
    try {
      setRoundsLoading(true);
      const res = await adminInterviewsAPI.getDriveRounds(driveId);
      if (res.data.success) {
        setDriveRounds(res.data.rounds || []);
      }
    } catch (err) {
      console.error("Drive rounds fetch error:", err);
    } finally {
      setRoundsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "rounds" && selectedDriveForRounds) {
      fetchDriveRounds(selectedDriveForRounds);
    }
  }, [activeTab, selectedDriveForRounds]);

  // Reset form when opening Schedule Modal
  const openScheduleModal = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    setScheduleForm({
      companyId: formOptions.companies[0]?._id || "",
      driveId: "",
      studentId: "",
      roundNumber: 1,
      roundName: "Technical Round",
      date: dateStr,
      time: "10:30 AM",
      mode: "Online",
      meetingLink: "https://meet.google.com/new",
      venue: "",
      interviewerName: "",
      interviewerEmail: "",
      interviewerPhone: "",
      interviewerDesignation: "Technical Lead",
      instructions: "Please be ready 10 minutes prior with your camera enabled and resume open.",
      remarks: "",
    });
    setIsScheduleModalOpen(true);
  };

  // Open Details Modal
  const openDetailsModal = async (interview) => {
    setSelectedInterview(interview);
    setIsDetailsModalOpen(true);
    setModalLoading(true);
    try {
      const res = await adminInterviewsAPI.getInterviewById(interview._id);
      if (res.data.success) {
        setInterviewDetails(res.data.interview);
        setRoundHistory(res.data.roundHistory || []);
      }
    } catch (err) {
      console.error("Error loading interview details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  // Open Reschedule Modal
  const openRescheduleModal = (interview) => {
    setSelectedInterview(interview);
    const curDateStr = interview.date
      ? new Date(interview.date).toISOString().split("T")[0]
      : "";

    setRescheduleForm({
      newDate: curDateStr,
      newTime: interview.time || "11:00 AM",
      mode: interview.mode || "Online",
      meetingLink: interview.meetingLink || "",
      venue: interview.venue || "",
      reason: "",
    });
    setIsRescheduleModalOpen(true);
  };

  // Open Feedback Modal
  const openFeedbackModal = (interview) => {
    setSelectedInterview(interview);
    const existing = interview.feedback || {};
    setFeedbackForm({
      technicalRating: existing.technicalRating || 8,
      communicationRating: existing.communicationRating || 8,
      problemSolvingRating: existing.problemSolvingRating || 8,
      overallRating: existing.overallRating || 8,
      comments: existing.comments || "",
      remarks: existing.remarks || "",
      recommendation: existing.recommendation || "Cleared",
    });
    setIsFeedbackModalOpen(true);
  };

  // Open Publish Modal
  const openPublishModal = (interview) => {
    setSelectedInterview(interview);
    setPublishForm({
      decision: interview.status === "Selected" ? "Selected" : "Cleared",
      adminNotes: "",
      packageAmount: interview.drive?.package || "",
    });
    setIsPublishModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (interview) => {
    setSelectedInterview(interview);
    setIsDeleteModalOpen(true);
  };

  // Submit Schedule Form
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");

      const res = await adminInterviewsAPI.scheduleInterview(scheduleForm);
      if (res.data.success) {
        showSuccess(res.data.message || "Interview scheduled successfully!");
        setIsScheduleModalOpen(false);
        fetchInterviews();
      }
    } catch (err) {
      console.error("Error scheduling interview:", err);
      setError(err.response?.data?.message || "Failed to schedule interview.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Reschedule Form
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInterview) return;
    try {
      setSubmitting(true);
      setError("");

      const res = await adminInterviewsAPI.rescheduleInterview(
        selectedInterview._id,
        rescheduleForm
      );
      if (res.data.success) {
        showSuccess(res.data.message || "Interview rescheduled successfully!");
        setIsRescheduleModalOpen(false);
        fetchInterviews();
      }
    } catch (err) {
      console.error("Error rescheduling interview:", err);
      setError(err.response?.data?.message || "Failed to reschedule interview.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Feedback Form
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInterview) return;
    try {
      setSubmitting(true);
      setError("");

      const res = await adminInterviewsAPI.submitFeedback(
        selectedInterview._id,
        feedbackForm
      );
      if (res.data.success) {
        showSuccess("Interview evaluation and ratings saved successfully!");
        setIsFeedbackModalOpen(false);
        fetchInterviews();
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError(err.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Publish Result Form
  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInterview) return;
    try {
      setSubmitting(true);
      setError("");

      const res = await adminInterviewsAPI.publishResult(
        selectedInterview._id,
        publishForm
      );
      if (res.data.success) {
        showSuccess(res.data.message || "Interview result published!");
        setIsPublishModalOpen(false);
        fetchInterviews();
      }
    } catch (err) {
      console.error("Error publishing result:", err);
      setError(err.response?.data?.message || "Failed to publish result.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Delete / Cancel
  const handleDeleteSubmit = async () => {
    if (!selectedInterview) return;
    try {
      setSubmitting(true);
      const res = await adminInterviewsAPI.deleteInterview(selectedInterview._id);
      if (res.data.success) {
        showSuccess("Interview record deleted successfully.");
        setIsDeleteModalOpen(false);
        fetchInterviews();
      }
    } catch (err) {
      console.error("Error deleting interview:", err);
      setError(err.response?.data?.message || "Failed to delete interview.");
    } finally {
      setSubmitting(false);
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const res = await adminInterviewsAPI.exportCSV({
        status: statusFilter,
        mode: modeFilter,
        companyId: companyFilter,
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Interviews_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSuccess("Interviews report exported as CSV.");
    } catch (err) {
      console.error("Error exporting CSV:", err);
      setError("Failed to export CSV report.");
    }
  };

  // Filtered drives based on chosen company in Schedule Form
  const eligibleDrivesForForm = useMemo(() => {
    if (!scheduleForm.companyId) return formOptions.drives || [];
    return formOptions.drives.filter(
      (d) =>
        d.company?._id === scheduleForm.companyId ||
        d.company === scheduleForm.companyId
    );
  }, [scheduleForm.companyId, formOptions.drives]);

  // Filtered applicants based on chosen drive in Schedule Form
  const eligibleStudentsForForm = useMemo(() => {
    if (!scheduleForm.driveId) return [];
    return formOptions.applications.filter(
      (a) =>
        a.drive?._id === scheduleForm.driveId ||
        a.drive === scheduleForm.driveId
    );
  }, [scheduleForm.driveId, formOptions.applications]);

  // Badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10";
      case "Completed":
        return "bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10";
      case "Selected":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10";
      case "Rescheduled":
        return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10";
      case "On Hold":
        return "bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/10";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/10";
    }
  };

  // Calendar rendering helpers
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday
    const totalDays = lastDay.getDate();

    // Previous month padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, currentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = dateObj.toISOString().split("T")[0];
      const eventsForDay = calendarEvents.filter((ev) => {
        if (!ev.date) return false;
        return new Date(ev.date).toISOString().split("T")[0] === dateStr;
      });

      days.push({
        day: d,
        date: dateObj,
        currentMonth: true,
        events: eventsForDay,
        isToday:
          new Date().toISOString().split("T")[0] === dateStr,
      });
    }

    return days;
  }, [calendarDate, calendarEvents]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 space-y-6">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                <CalendarCheck size={12} />
                Campus Placements
              </span>
              <span className="text-xs text-slate-400 font-medium">• Placement Cell</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Interview Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Schedule student interviews, assign evaluators, manage selection rounds, record feedback, and publish verified results.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer"
            >
              <Download size={14} />
              Export CSV
            </button>

            <button
              onClick={openScheduleModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 cursor-pointer shadow-blue-500/20"
            >
              <Plus size={15} />
              Schedule Interview
            </button>
          </div>
        </div>

        {/* ================= ALERTS ================= */}
        {actionSuccess && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 shadow-sm animate-fadeIn">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span className="flex-1 font-semibold">{actionSuccess}</span>
            <button
              onClick={() => setActionSuccess("")}
              className="text-emerald-600 font-bold hover:text-emerald-800 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 shadow-sm">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError("")}
              className="text-rose-600 font-bold hover:text-rose-800 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* ================= NAVIGATION TABS ================= */}
        <div className="flex border-b border-slate-200 bg-white rounded-2xl px-3 py-2 shadow-sm gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("interviews")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "interviews"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <List size={14} />
            All Interviews ({totalCount})
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "calendar"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Calendar size={14} />
            Calendar View
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "analytics"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BarChart3 size={14} />
            Reports & Analytics
          </button>

          <button
            onClick={() => setActiveTab("rounds")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "rounds"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles size={14} />
            Drive Rounds Setup
          </button>
        </div>

        {/* ================= TAB 1: ALL INTERVIEWS ================= */}
        {activeTab === "interviews" && (
          <div className="space-y-6">
            {/* KPI METRIC CARDS */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total</span>
                  <CalendarCheck size={16} className="text-blue-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {metrics.totalInterviews}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">All registered slots</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Upcoming</span>
                  <Clock3 size={16} className="text-blue-500" />
                </div>
                <div className="mt-2 text-2xl font-bold text-blue-600">
                  {metrics.upcomingInterviews}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">Scheduled ahead</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
                  <CheckCircle2 size={16} className="text-purple-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-purple-600">
                  {metrics.completedInterviews}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">Feedback logged</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Selected</span>
                  <Award size={16} className="text-emerald-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-emerald-600">
                  {metrics.selectedStudents}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">Job offers made</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Rejected</span>
                  <XCircle size={16} className="text-rose-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-rose-600">
                  {metrics.rejectedStudents}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">Not selected</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Rescheduled</span>
                  <RotateCcw size={16} className="text-amber-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-amber-600">
                  {metrics.rescheduledInterviews}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">Adjusted slots</div>
              </div>
            </div>

            {/* SEARCH AND FILTERS TOOLBAR */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                {/* Search */}
                <div className="relative md:col-span-4">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search candidate, company, role, interviewer..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="md:col-span-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                {/* Mode Filter */}
                <div className="md:col-span-2">
                  <select
                    value={modeFilter}
                    onChange={(e) => {
                      setModeFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="All">All Modes</option>
                    <option value="Online">Online (Virtual)</option>
                    <option value="Offline">Offline (Campus)</option>
                  </select>
                </div>

                {/* Company Filter */}
                <div className="md:col-span-2">
                  <select
                    value={companyFilter}
                    onChange={(e) => {
                      setCompanyFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="All">All Companies</option>
                    {formOptions.companies?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sorting */}
                <div className="md:col-span-2 flex items-center gap-1.5">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="date">Sort: Date</option>
                    <option value="status">Sort: Status</option>
                    <option value="createdAt">Sort: Created</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    title={`Order: ${sortOrder.toUpperCase()}`}
                  >
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </button>
                </div>
              </div>
            </div>

            {/* INTERVIEW TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                  <Loader2 size={32} className="animate-spin text-blue-600" />
                  <p className="mt-3 text-sm font-medium">Loading interview schedules...</p>
                </div>
              ) : interviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <CalendarDays size={48} className="text-slate-300" />
                  <h3 className="mt-3 text-base font-semibold text-slate-800">
                    No interviews found
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-sm">
                    {search || statusFilter !== "All"
                      ? "No records matched your search or filters. Try adjusting them."
                      : "No interviews scheduled yet. Click 'Schedule Interview' to create your first session."}
                  </p>
                  <button
                    onClick={openScheduleModal}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 cursor-pointer"
                  >
                    <Plus size={14} />
                    Schedule Interview
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-4">Company & Role</th>
                          <th className="py-3 px-4">Round</th>
                          <th className="py-3 px-4">Schedule</th>
                          <th className="py-3 px-4">Mode / Venue</th>
                          <th className="py-3 px-4">Interviewer</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {interviews.map((item) => {
                          const studentName =
                            item.student?.fullName ||
                            item.student?.user?.name ||
                            "Student";
                          const studentRoll =
                            item.student?.rollNo ||
                            item.student?.studentId ||
                            "ID N/A";
                          const studentBranch = item.student?.branch || "B.Tech";
                          const compName = item.company?.name || "Company";
                          const role = item.drive?.role || "Position";
                          const roundLabel =
                            item.roundName || `Round ${item.roundNumber || 1}`;
                          const formattedDate = item.date
                            ? new Date(item.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "N/A";

                          return (
                            <tr
                              key={item._id}
                              className="hover:bg-slate-50/80 transition group"
                            >
                              {/* Student */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs uppercase shadow-sm">
                                    {studentName.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                                      {studentName}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                      {studentRoll} • {studentBranch}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Company & Role */}
                              <td className="py-3.5 px-4">
                                <div>
                                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                    <Building2 size={13} className="text-slate-400" />
                                    {compName}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {role}
                                  </div>
                                </div>
                              </td>

                              {/* Round */}
                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                                  <Sparkles size={11} className="text-purple-600" />
                                  {roundLabel}
                                </span>
                              </td>

                              {/* Schedule */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="font-medium text-slate-800 flex items-center gap-1">
                                  <Calendar size={13} className="text-slate-400" />
                                  {formattedDate}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Clock size={11} className="text-slate-400" />
                                  {item.time}
                                </div>
                              </td>

                              {/* Mode / Venue */}
                              <td className="py-3.5 px-4">
                                {item.mode === "Online" ? (
                                  <div>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                                      <Video size={12} />
                                      Online
                                    </span>
                                    {item.meetingLink && (
                                      <a
                                        href={item.meetingLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block text-[11px] text-slate-400 hover:text-blue-600 hover:underline truncate max-w-[140px]"
                                        title={item.meetingLink}
                                      >
                                        Open Link ↗
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                                      <MapPin size={12} className="text-rose-500" />
                                      Offline
                                    </span>
                                    <div
                                      className="text-[11px] text-slate-500 truncate max-w-[140px]"
                                      title={item.venue}
                                    >
                                      {item.venue || "Campus Venue"}
                                    </div>
                                  </div>
                                )}
                              </td>

                              {/* Interviewer */}
                              <td className="py-3.5 px-4">
                                <div className="font-medium text-slate-800">
                                  {item.interviewerName}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                                  {item.interviewerEmail || item.interviewerDesignation || "Interviewer"}
                                </div>
                              </td>

                              {/* Status */}
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ring-1 ring-inset ${getStatusBadge(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => openDetailsModal(item)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                                    title="View Details"
                                  >
                                    <Eye size={15} />
                                  </button>

                                  <button
                                    onClick={() => openRescheduleModal(item)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition cursor-pointer"
                                    title="Reschedule / Edit"
                                  >
                                    <RotateCcw size={15} />
                                  </button>

                                  <button
                                    onClick={() => openFeedbackModal(item)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-purple-50 hover:text-purple-600 transition cursor-pointer"
                                    title="Submit Evaluation / Feedback"
                                  >
                                    <Star size={15} />
                                  </button>

                                  <button
                                    onClick={() => openPublishModal(item)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition cursor-pointer"
                                    title="Publish Final Decision"
                                  >
                                    <Award size={15} />
                                  </button>

                                  <button
                                    onClick={() => openDeleteModal(item)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                    title="Delete Schedule"
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

                  {/* Mobile Cards */}
                  <div className="lg:hidden divide-y divide-slate-100">
                    {interviews.map((item) => {
                      const studentName =
                        item.student?.fullName ||
                        item.student?.user?.name ||
                        "Student";
                      const studentRoll =
                        item.student?.rollNo ||
                        item.student?.studentId ||
                        "ID N/A";
                      const compName = item.company?.name || "Company";
                      const role = item.drive?.role || "Position";

                      return (
                        <div key={item._id} className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs uppercase">
                                {studentName.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {studentName}
                                </h4>
                                <p className="text-xs text-slate-400">
                                  {studentRoll} • {item.student?.branch || "B.Tech"}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold border ${getStatusBadge(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-2.5 text-xs space-y-1 text-slate-600">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Opportunity:</span>
                              <span className="font-semibold text-slate-800">
                                {compName} ({role})
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Round:</span>
                              <span className="font-medium text-purple-700">
                                {item.roundName || `Round ${item.roundNumber || 1}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Time:</span>
                              <span className="font-medium">
                                {item.date ? new Date(item.date).toLocaleDateString() : ""} at {item.time}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Mode:</span>
                              <span className="font-medium">
                                {item.mode} {item.venue ? `(${item.venue})` : ""}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Interviewer:</span>
                              <span className="font-medium">{item.interviewerName}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                            <button
                              onClick={() => openDetailsModal(item)}
                              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                            >
                              View Details
                            </button>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openRescheduleModal(item)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => openFeedbackModal(item)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 cursor-pointer"
                              >
                                Evaluate
                              </button>
                              <button
                                onClick={() => openPublishModal(item)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                              >
                                Result
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-4 py-3 gap-2">
                    <span className="text-xs text-slate-500">
                      Showing page <span className="font-bold">{page}</span> of{" "}
                      <span className="font-bold">{totalPages}</span> (Total{" "}
                      <span className="font-bold">{totalCount}</span> interviews)
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                        Previous
                      </button>

                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                      >
                        Next
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: CALENDAR VIEW ================= */}
        {activeTab === "calendar" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">
                  {calendarDate.toLocaleString("default", { month: "long" })}{" "}
                  {calendarDate.getFullYear()}
                </h2>
                <button
                  onClick={() => setCalendarDate(new Date())}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const prev = new Date(calendarDate);
                    prev.setMonth(prev.getMonth() - 1);
                    setCalendarDate(prev);
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => {
                    const next = new Date(calendarDate);
                    next.setMonth(next.getMonth() + 1);
                    setCalendarDate(next);
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            {calendarLoading ? (
              <div className="flex items-center justify-center p-12 text-slate-400">
                <Loader2 size={32} className="animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-px rounded-xl border border-slate-200 bg-slate-200 overflow-hidden text-xs">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                  <div
                    key={dayName}
                    className="bg-slate-100 py-2 text-center font-bold text-slate-600 text-[11px] uppercase tracking-wider"
                  >
                    {dayName}
                  </div>
                ))}

                {calendarDays.map((cell, idx) => (
                  <div
                    key={idx}
                    className={`min-h-[110px] p-1.5 bg-white flex flex-col justify-between transition ${
                      !cell.currentMonth ? "bg-slate-50/50 opacity-40" : ""
                    } ${cell.isToday ? "ring-2 ring-blue-500 ring-inset" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold inline-block rounded-md px-1.5 py-0.5 ${
                          cell.isToday
                            ? "bg-blue-600 text-white font-bold"
                            : "text-slate-700"
                        }`}
                      >
                        {cell.day || ""}
                      </span>
                      {cell.events && cell.events.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-400">
                          {cell.events.length} slot{cell.events.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 space-y-1 overflow-y-auto max-h-[75px] scrollbar-thin">
                      {cell.events?.map((ev) => (
                        <button
                          key={ev._id}
                          onClick={() => openDetailsModal(ev)}
                          className={`w-full text-left rounded-md px-1.5 py-1 text-[10px] font-semibold truncate transition cursor-pointer block border ${getStatusBadge(
                            ev.status
                          )}`}
                          title={`${ev.time} - ${ev.student?.fullName || "Student"} (${ev.company?.name})`}
                        >
                          <span className="font-bold">{ev.time}</span> •{" "}
                          {ev.student?.fullName || "Student"} ({ev.company?.name})
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: ANALYTICS & REPORTS ================= */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {analyticsLoading || !analyticsData ? (
              <div className="flex items-center justify-center p-12 text-slate-400">
                <Loader2 size={32} className="animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Completion Rate
                    </p>
                    <p className="mt-2 text-3xl font-extrabold text-blue-600">
                      {analyticsData.completionRate}%
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Interviews completed</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Selection Rate
                    </p>
                    <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                      {analyticsData.selectionRate}%
                    </p>
                    <p className="text-xs text-slate-400 mt-1">From total interviews</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Selected Candidates
                    </p>
                    <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                      {analyticsData.selected}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Received job offers</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      On-Hold / In-Review
                    </p>
                    <p className="mt-2 text-3xl font-extrabold text-orange-600">
                      {analyticsData.onHold + analyticsData.scheduled}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Awaiting decision</p>
                  </div>
                </div>

                {/* Company-wise distribution */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Building2 size={16} className="text-blue-600" />
                      Company-Wise Interview Statistics
                    </h3>
                    <div className="space-y-3">
                      {analyticsData.companyStats?.map((cs) => (
                        <div key={cs.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-800">{cs.name}</span>
                            <span className="text-slate-500">
                              {cs.completed} done / {cs.total} total ({cs.selected} selected)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                            <div
                              className="bg-emerald-500 h-2"
                              style={{ width: `${(cs.selected / cs.total) * 100}%` }}
                              title="Selected"
                            />
                            <div
                              className="bg-blue-500 h-2"
                              style={{ width: `${(cs.completed / cs.total) * 100}%` }}
                              title="Completed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Round-wise distribution */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Sparkles size={16} className="text-purple-600" />
                      Round-Wise Selection Funnel
                    </h3>
                    <div className="space-y-3">
                      {analyticsData.roundStats?.map((rs) => (
                        <div
                          key={rs.roundName}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{rs.roundName}</span>
                            <p className="text-[11px] text-slate-400">
                              Total candidates evaluated: {rs.total}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                              {rs.selected} Selected
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">
                              {rs.rejected} Rejected
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Batch / Year-wise statistics */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <GraduationCap size={16} className="text-emerald-600" />
                    Passing Year / Cohort Placement Interview Breakdown
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {analyticsData.yearStats?.map((ys) => (
                      <div
                        key={ys.year}
                        className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-center"
                      >
                        <div className="text-xs font-bold text-slate-400">Class of</div>
                        <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                          {ys.year}
                        </div>
                        <div className="mt-2 text-xs font-semibold text-emerald-700">
                          {ys.selected} Placed Offers
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {ys.total} Total Interviews
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= TAB 4: DRIVE ROUNDS SETUP ================= */}
        {activeTab === "rounds" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Drive Rounds Configuration
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure standard or custom evaluation rounds (Aptitude, Technical, Coding, HR, Final) for any active placement drive.
              </p>
            </div>

            <div className="max-w-md">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Placement Drive
              </label>
              <select
                value={selectedDriveForRounds}
                onChange={(e) => setSelectedDriveForRounds(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium focus:border-blue-500 focus:bg-white focus:outline-none"
              >
                <option value="">-- Choose a Placement Drive --</option>
                {formOptions.drives?.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.company?.name || "Company"} - {d.role} ({d.package || "Package"})
                  </option>
                ))}
              </select>
            </div>

            {roundsLoading ? (
              <div className="flex items-center justify-center p-10 text-slate-400">
                <Loader2 size={28} className="animate-spin text-blue-600" />
              </div>
            ) : selectedDriveForRounds && driveRounds.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Configured Selection Sequence
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {driveRounds.map((r, idx) => (
                    <div
                      key={r._id || idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
                          Round #{r.roundNumber}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Status: {r.status || "Scheduled"}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{r.roundName}</h4>
                      <p className="text-slate-500 text-[11px]">{r.roundDescription}</p>
                      {r.instructions && (
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                          <strong>Instructions:</strong> {r.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-8">
                Please select an active placement drive from the dropdown to review and manage its evaluation rounds.
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= MODAL 1: SCHEDULE INTERVIEW ================= */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck size={18} className="text-blue-600" />
                  Schedule Candidate Interview
                </h3>
                <p className="text-xs text-slate-400">
                  Assign student, company, selection round, date, and evaluator credentials.
                </p>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              {/* Company & Drive */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Company *
                  </label>
                  <select
                    required
                    value={scheduleForm.companyId}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        companyId: e.target.value,
                        driveId: "",
                        studentId: "",
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="">-- Choose Company --</option>
                    {formOptions.companies?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Position / Placement Drive *
                  </label>
                  <select
                    required
                    value={scheduleForm.driveId}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        driveId: e.target.value,
                        studentId: "",
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="">-- Choose Drive --</option>
                    {eligibleDrivesForForm.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.role} ({d.package || "Package"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Candidate */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Student Candidate *
                </label>
                <select
                  required
                  value={scheduleForm.studentId}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({ ...prev, studentId: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
                >
                  <option value="">-- Choose Student Candidate --</option>
                  {eligibleStudentsForForm.length > 0 ? (
                    eligibleStudentsForForm.map((a) => (
                      <option key={a.student?._id} value={a.student?._id}>
                        {a.student?.fullName || a.student?.user?.name} (
                        {a.student?.rollNo || "Roll N/A"} • {a.student?.branch || "B.Tech"})
                      </option>
                    ))
                  ) : (
                    <option disabled value="">
                      (No applicants found for selected drive)
                    </option>
                  )}
                </select>
              </div>

              {/* Round Details */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Interview Round *
                  </label>
                  <select
                    value={scheduleForm.roundName}
                    onChange={(e) => {
                      const val = e.target.value;
                      let num = 1;
                      if (val.includes("Aptitude")) num = 1;
                      else if (val.includes("Coding")) num = 2;
                      else if (val.includes("Technical")) num = 3;
                      else if (val.includes("HR")) num = 4;
                      else if (val.includes("Final")) num = 5;
                      setScheduleForm((prev) => ({
                        ...prev,
                        roundName: val,
                        roundNumber: num,
                      }));
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="Aptitude Test">Round 1: Aptitude Test</option>
                    <option value="Coding Round">Round 2: Coding Round</option>
                    <option value="Technical Round">Round 3: Technical Round</option>
                    <option value="HR Interview">Round 4: HR Interview</option>
                    <option value="Final Interview">Round 5: Final Interview</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Round Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={scheduleForm.roundNumber}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        roundNumber: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Interview Date * (Cannot be in the past)
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={scheduleForm.date}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Interview Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:30 AM or 02:00 PM"
                    value={scheduleForm.time}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({ ...prev, time: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Mode & Meeting Link / Venue */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Interview Mode *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          mode: "Online",
                          meetingLink: prev.meetingLink || "https://meet.google.com/new",
                        }))
                      }
                      className={`flex-1 rounded-xl py-2 font-bold transition cursor-pointer ${
                        scheduleForm.mode === "Online"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Online (Virtual)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          mode: "Offline",
                          venue: prev.venue || "Placement Cell, Admin Block Room 204",
                        }))
                      }
                      className={`flex-1 rounded-xl py-2 font-bold transition cursor-pointer ${
                        scheduleForm.mode === "Offline"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Offline (Campus)
                    </button>
                  </div>
                </div>

                <div>
                  {scheduleForm.mode === "Online" ? (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Meeting Link *
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://meet.google.com/xyz or Teams link"
                        value={scheduleForm.meetingLink}
                        onChange={(e) =>
                          setScheduleForm((prev) => ({
                            ...prev,
                            meetingLink: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Interview Location / Venue *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Placement Cell Conference Hall A"
                        value={scheduleForm.venue}
                        onChange={(e) =>
                          setScheduleForm((prev) => ({
                            ...prev,
                            venue: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Interviewer Details */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3 space-y-3">
                <span className="font-bold text-slate-700 block">
                  Interviewer & Evaluator Credentials
                </span>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5">
                      Interviewer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh Kumar or Jane Doe"
                      value={scheduleForm.interviewerName}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          interviewerName: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5">
                      Interviewer Email
                    </label>
                    <input
                      type="email"
                      placeholder="interviewer@company.com"
                      value={scheduleForm.interviewerEmail}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          interviewerEmail: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5">
                      Contact Phone (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="+91 9876543210"
                      value={scheduleForm.interviewerPhone}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          interviewerPhone: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5">
                      Designation / Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Tech Lead / HR Manager"
                      value={scheduleForm.interviewerDesignation}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          interviewerDesignation: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Additional Instructions for Candidate
                </label>
                <textarea
                  rows={2}
                  placeholder="Instructions for the student (e.g. Bring hard copies, prepare portfolio)..."
                  value={scheduleForm.instructions}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      instructions: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Confirm Schedule
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: INTERVIEW DETAILS ================= */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Interview Dossier
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedInterview?.student?.fullName || "Candidate"} &bull;{" "}
                  {selectedInterview?.company?.name || "Company"}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {modalLoading || !interviewDetails ? (
              <div className="flex items-center justify-center p-10 text-slate-400">
                <Loader2 size={30} className="animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Status Banner */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Current Status</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border mt-0.5 ${getStatusBadge(
                        interviewDetails.status
                      )}`}
                    >
                      {interviewDetails.status}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Result Published</span>
                    <span className="font-bold text-slate-800">
                      {interviewDetails.resultPublished ? "Yes (Notified)" : "Pending Admin Publish"}
                    </span>
                  </div>
                </div>

                {/* Candidate & Opportunity */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-1">
                    <span className="font-bold text-slate-700 block">Student Profile</span>
                    <p className="font-semibold text-slate-900">
                      {interviewDetails.student?.fullName || interviewDetails.student?.user?.name}
                    </p>
                    <p className="text-slate-500">
                      Roll: {interviewDetails.student?.rollNo || "N/A"} &bull; Branch:{" "}
                      {interviewDetails.student?.branch || "N/A"}
                    </p>
                    <p className="text-slate-500">
                      Email: {interviewDetails.student?.user?.email || interviewDetails.student?.email}
                    </p>
                    <p className="text-slate-500">
                      CGPA: {interviewDetails.student?.cgpa || "N/A"} &bull; Year:{" "}
                      {interviewDetails.student?.passingYear || "2027"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-1">
                    <span className="font-bold text-slate-700 block">Placement Drive</span>
                    <p className="font-semibold text-slate-900">
                      {interviewDetails.company?.name}
                    </p>
                    <p className="text-slate-500">Role: {interviewDetails.drive?.role}</p>
                    <p className="text-slate-500">
                      Package: {interviewDetails.drive?.package || "As per policy"}
                    </p>
                    <p className="text-slate-500">
                      Round: {interviewDetails.roundName || `Round ${interviewDetails.roundNumber}`}
                    </p>
                  </div>
                </div>

                {/* Interview Session Specs */}
                <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-1.5">
                  <span className="font-bold text-slate-700 block">Session Details</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-slate-400 block">Date & Time</span>
                      <span className="font-medium text-slate-900">
                        {interviewDetails.date
                          ? new Date(interviewDetails.date).toLocaleDateString()
                          : "N/A"}{" "}
                        at {interviewDetails.time}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Mode</span>
                      <span className="font-medium text-slate-900">
                        {interviewDetails.mode}{" "}
                        {interviewDetails.venue ? `(${interviewDetails.venue})` : ""}
                      </span>
                    </div>
                  </div>

                  {interviewDetails.meetingLink && (
                    <div className="pt-1">
                      <span className="text-slate-400 block">Meeting URL:</span>
                      <a
                        href={interviewDetails.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue-600 hover:underline break-all"
                      >
                        {interviewDetails.meetingLink}
                      </a>
                    </div>
                  )}

                  {interviewDetails.instructions && (
                    <div className="pt-1 border-t border-slate-200 mt-2">
                      <span className="text-slate-400 block">Instructions:</span>
                      <p className="text-slate-700">{interviewDetails.instructions}</p>
                    </div>
                  )}
                </div>

                {/* Evaluator Info */}
                <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70">
                  <span className="font-bold text-slate-700 block mb-1">
                    Assigned Interviewer
                  </span>
                  <p className="font-semibold text-slate-900">
                    {interviewDetails.interviewerName}
                  </p>
                  <p className="text-slate-500">
                    {interviewDetails.interviewerEmail || "No email listed"} &bull;{" "}
                    {interviewDetails.interviewerDesignation || "Evaluator"}
                  </p>
                </div>

                {/* Evaluation Ratings if available */}
                {interviewDetails.feedback && interviewDetails.feedback.overallRating > 0 && (
                  <div className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/40 space-y-2">
                    <span className="font-bold text-purple-900 block flex items-center gap-1.5">
                      <Star size={14} className="text-purple-600 fill-purple-600" />
                      Interviewer Evaluation & Scorecard
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-purple-900">
                      <div>Technical Knowledge: <strong>{interviewDetails.feedback.technicalRating}/10</strong></div>
                      <div>Communication Skills: <strong>{interviewDetails.feedback.communicationRating}/10</strong></div>
                      <div>Problem Solving: <strong>{interviewDetails.feedback.problemSolvingRating}/10</strong></div>
                      <div>Overall Rating: <strong>{interviewDetails.feedback.overallRating}/10</strong></div>
                    </div>
                    {interviewDetails.feedback.comments && (
                      <div className="mt-1 text-slate-700 bg-white p-2.5 rounded-xl border border-purple-100">
                        <strong>Feedback:</strong> {interviewDetails.feedback.comments}
                      </div>
                    )}
                    <div className="text-[11px] font-semibold text-purple-800">
                      Recommendation: {interviewDetails.feedback.recommendation}
                    </div>
                  </div>
                )}

                {/* Past Round History */}
                {roundHistory.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold text-slate-700 block">
                      Placement Round History
                    </span>
                    <div className="space-y-1.5">
                      {roundHistory.map((rh) => (
                        <div
                          key={rh._id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800">
                              Round {rh.roundNumber}: {rh.roundName}
                            </span>
                            <span className="text-slate-400 ml-2">
                              {rh.feedback || "Progress recorded"}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                              rh.result === "Cleared" || rh.result === "Selected"
                                ? "bg-emerald-100 text-emerald-800"
                                : rh.result === "Rejected"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {rh.result}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-white hover:bg-slate-800 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 3: RESCHEDULE ================= */}
      {isRescheduleModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw size={16} className="text-amber-600" />
                Reschedule Interview Slot
              </h3>
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  New Date * (Must be today or in the future)
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={rescheduleForm.newDate}
                  onChange={(e) =>
                    setRescheduleForm((prev) => ({ ...prev, newDate: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  New Time *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 11:30 AM"
                  value={rescheduleForm.newTime}
                  onChange={(e) =>
                    setRescheduleForm((prev) => ({ ...prev, newTime: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reschedule Reason / Notice to Student
                </label>
                <textarea
                  rows={2}
                  placeholder="Reason for adjustment (student will be notified automatically via email)..."
                  value={rescheduleForm.reason}
                  onChange={(e) =>
                    setRescheduleForm((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Rescheduling..." : "Save New Slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: FEEDBACK & EVALUATION ================= */}
      {isFeedbackModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star size={16} className="text-purple-600" />
                Interview Evaluation & Rating
              </h3>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Technical Rating: {feedbackForm.technicalRating}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={feedbackForm.technicalRating}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({
                        ...prev,
                        technicalRating: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Communication: {feedbackForm.communicationRating}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={feedbackForm.communicationRating}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({
                        ...prev,
                        communicationRating: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Problem Solving: {feedbackForm.problemSolvingRating}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={feedbackForm.problemSolvingRating}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({
                        ...prev,
                        problemSolvingRating: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Overall Score: {feedbackForm.overallRating}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={feedbackForm.overallRating}
                    onChange={(e) =>
                      setFeedbackForm((prev) => ({
                        ...prev,
                        overallRating: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Interviewer Comments
                </label>
                <textarea
                  rows={2}
                  placeholder="Detailed feedback regarding technical aptitude, answers, and attitude..."
                  value={feedbackForm.comments}
                  onChange={(e) =>
                    setFeedbackForm((prev) => ({ ...prev, comments: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-purple-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Recommendation
                </label>
                <select
                  value={feedbackForm.recommendation}
                  onChange={(e) =>
                    setFeedbackForm((prev) => ({
                      ...prev,
                      recommendation: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-purple-500 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="Cleared">Cleared (Advance to Next Stage)</option>
                  <option value="Selected">Selected (Recommend for Final Offer)</option>
                  <option value="On Hold">On Hold (Borderline candidate)</option>
                  <option value="Rejected">Rejected (Did not meet standards)</option>
                  <option value="Needs Second Review">Needs Second Review</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-purple-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Evaluation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: PUBLISH RESULT ================= */}
      {isPublishModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award size={16} className="text-emerald-600" />
                Publish Verified Result
              </h3>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Publishing the result verifies the candidate decision, updates the student’s Placement Journey roadmap, and dispatches an official email/in-app alert.
            </p>

            <form onSubmit={handlePublishSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Official Decision *
                </label>
                <select
                  value={publishForm.decision}
                  onChange={(e) =>
                    setPublishForm((prev) => ({ ...prev, decision: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-bold focus:border-emerald-500 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="Selected">🎉 Selected (Official Job Offer)</option>
                  <option value="Cleared">✅ Cleared (Promote to next round)</option>
                  <option value="Rejected">❌ Rejected (Did not qualify)</option>
                  <option value="On Hold">⏸ On Hold (Decision deferred)</option>
                </select>
              </div>

              {publishForm.decision === "Selected" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Offered Package / CTC
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14.5 LPA"
                    value={publishForm.packageAmount}
                    onChange={(e) =>
                      setPublishForm((prev) => ({
                        ...prev,
                        packageAmount: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Notes / Feedback message to student
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes to appear on student's placement dashboard..."
                  value={publishForm.adminNotes}
                  onChange={(e) =>
                    setPublishForm((prev) => ({
                      ...prev,
                      adminNotes: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 focus:border-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Publishing..." : "Publish & Notify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: DELETE CONFIRMATION ================= */}
      {isDeleteModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <Trash2 size={24} />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete Interview Slot?
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Are you sure you want to remove this interview session for{" "}
                <span className="font-bold text-slate-800">
                  {selectedInterview.student?.fullName || "Candidate"}
                </span>{" "}
                at{" "}
                <span className="font-bold text-slate-800">
                  {selectedInterview.company?.name}
                </span>
                ? This cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={submitting}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInterviews;
