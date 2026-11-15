import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import CompanyNavbar from "../../components/CompanyNavbar";
import { placementDrivesAPI, roundTrackingAPI } from "../../services/api";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  Video,
  FileText,
  Plus,
  ArrowRight,
  ExternalLink,
  Loader2,
  AlertCircle,
  HelpCircle,
  Filter,
  CheckSquare,
  Square,
  ChevronRight,
  BriefcaseBusiness,
  Award,
  Sparkles,
  Info,
  CalendarDays,
} from "lucide-react";

const STANDARD_ROUNDS = [
  "Online Assessment",
  "Technical Interview",
  "Technical Interview 2",
  "Group Discussion",
  "HR Interview",
  "Final Selection",
];

const CompanyRoundManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDriveId = searchParams.get("driveId") || "";

  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(initialDriveId);
  const [loadingDrives, setLoadingDrives] = useState(true);

  // Round data
  const [driveData, setDriveData] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedRoundNum, setSelectedRoundNum] = useState(1);
  const [loadingRounds, setLoadingRounds] = useState(false);

  // Selection
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

  // Modals
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // Notifications / feedback
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form states for Create/Edit Round
  const [roundForm, setRoundForm] = useState({
    roundName: "Online Assessment",
    customName: "",
    roundNumber: 1,
    roundDescription: "",
    scheduledDate: "",
    scheduledTime: "",
    location: "Campus / Online",
    meetingLink: "",
    instructions: "",
  });

  // Promote Form
  const [promoteForm, setPromoteForm] = useState({
    targetRoundNumber: 2,
    roundName: "Technical Interview",
    customName: "",
    scheduledDate: "",
    scheduledTime: "",
    location: "Online / Google Meet",
    meetingLink: "",
    instructions: "",
  });

  // Resume URL Helper
  const getResumeUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = (
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");
    return `${baseUrl}/uploads/resumes/${url}`;
  };

  // 1. Fetch Company Placement Drives
  useEffect(() => {
    const fetchDrives = async () => {
      try {
        setLoadingDrives(true);
        const res = await placementDrivesAPI.getCompanyDrives();
        const driveList = res.data?.drives || [];
        setDrives(driveList);

        if (driveList.length > 0 && !selectedDriveId) {
          setSelectedDriveId(driveList[0]._id);
        }
      } catch (err) {
        console.error("Error fetching company drives:", err);
        setErrorMsg("Failed to load your placement drives.");
      } finally {
        setLoadingDrives(false);
      }
    };

    fetchDrives();
  }, []);

  // 2. Fetch Rounds and Applicants when selectedDriveId changes
  useEffect(() => {
    if (!selectedDriveId) return;

    setSearchParams({ driveId: selectedDriveId });
    fetchDriveRoundsAndApplicants(selectedDriveId);
  }, [selectedDriveId]);

  const fetchDriveRoundsAndApplicants = async (driveId) => {
    try {
      setLoadingRounds(true);
      setErrorMsg("");
      const res = await roundTrackingAPI.getDriveRounds(driveId);

      if (res.data?.success) {
        setDriveData(res.data.drive);
        setRounds(res.data.rounds || []);
        setApplicants(res.data.applicants || []);
        setSelectedStudentIds(new Set());

        if (res.data.rounds && res.data.rounds.length > 0) {
          // If current selectedRoundNum doesn't exist, set to first
          const exists = res.data.rounds.some(
            (r) => r.roundNumber === selectedRoundNum
          );
          if (!exists) {
            setSelectedRoundNum(res.data.rounds[0].roundNumber);
          }
        }
      }
    } catch (err) {
      console.error("Fetch drive rounds error:", err);
      setErrorMsg(
        err.response?.data?.message || "Failed to load rounds for this drive."
      );
    } finally {
      setLoadingRounds(false);
    }
  };

  // Current active round object
  const activeRound =
    rounds.find((r) => r.roundNumber === selectedRoundNum) || rounds[0];

  // Filter applicants relevant to the selected round
  const roundApplicants = applicants.filter((a) => {
    if (selectedRoundNum === 1) return true;
    return a.currentRoundNumber >= selectedRoundNum;
  });

  // Toggle selection
  const toggleStudent = (sId) => {
    setSelectedStudentIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(sId)) updated.delete(sId);
      else updated.add(sId);
      return updated;
    });
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.size === roundApplicants.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(roundApplicants.map((a) => a.studentId)));
    }
  };

  // Handle Save / Configure Round
  const handleSaveRound = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg("");

      const finalName =
        roundForm.roundName === "Custom"
          ? roundForm.customName.trim() || `Round ${roundForm.roundNumber}`
          : roundForm.roundName;

      const payload = {
        ...roundForm,
        roundName: finalName,
      };

      const res = await roundTrackingAPI.configureRound(
        selectedDriveId,
        payload
      );

      if (res.data?.success) {
        setSuccessMsg(res.data.message || "Round configured successfully!");
        setConfigModalOpen(false);
        fetchDriveRoundsAndApplicants(selectedDriveId);
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Save round error:", err);
      setErrorMsg(err.response?.data?.message || "Failed to save round.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Configure Modal
  const openConfigureModal = (existingRound = null) => {
    if (existingRound) {
      const isStandard = STANDARD_ROUNDS.includes(existingRound.roundName);
      setRoundForm({
        roundName: isStandard ? existingRound.roundName : "Custom",
        customName: isStandard ? "" : existingRound.roundName,
        roundNumber: existingRound.roundNumber,
        roundDescription: existingRound.roundDescription || "",
        scheduledDate: existingRound.scheduledDate
          ? new Date(existingRound.scheduledDate).toISOString().split("T")[0]
          : "",
        scheduledTime: existingRound.scheduledTime || "",
        location: existingRound.location || "Campus / Online",
        meetingLink: existingRound.meetingLink || "",
        instructions: existingRound.instructions || "",
      });
    } else {
      const nextNum = rounds.length + 1;
      const defaultName =
        STANDARD_ROUNDS[nextNum - 1] || `Round ${nextNum}`;
      setRoundForm({
        roundName: STANDARD_ROUNDS.includes(defaultName) ? defaultName : "Custom",
        customName: STANDARD_ROUNDS.includes(defaultName) ? "" : defaultName,
        roundNumber: nextNum,
        roundDescription: "",
        scheduledDate: "",
        scheduledTime: "",
        location: "Online / Google Meet",
        meetingLink: "",
        instructions: "",
      });
    }
    setConfigModalOpen(true);
  };

  // Single / Bulk Update Candidate Results
  const triggerResultUpdate = (studentIdsArray, resultStatus) => {
    if (!studentIdsArray || studentIdsArray.length === 0) {
      setErrorMsg("Please select at least one student.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: `Confirm ${resultStatus} Action`,
      message: `Are you sure you want to mark ${studentIdsArray.length} candidate(s) as "${resultStatus}" for ${activeRound?.roundName}? Affected candidates will receive real-time email and portal notifications.`,
      onConfirm: async () => {
        try {
          setSubmitting(true);
          setErrorMsg("");
          const res = await roundTrackingAPI.updateRoundResults(
            activeRound._id,
            {
              studentIds: studentIdsArray,
              result: resultStatus,
            }
          );

          if (res.data?.success) {
            setSuccessMsg(res.data.message);
            setSelectedStudentIds(new Set());
            fetchDriveRoundsAndApplicants(selectedDriveId);
            setTimeout(() => setSuccessMsg(""), 5000);
          }
        } catch (err) {
          console.error("Result update error:", err);
          setErrorMsg(
            err.response?.data?.message || "Failed to update round results."
          );
        } finally {
          setSubmitting(false);
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
        }
      },
    });
  };

  // Open Promote Modal
  const openPromoteModal = () => {
    const clearedSelected = Array.from(selectedStudentIds).filter((sId) => {
      const app = applicants.find((a) => a.studentId === sId);
      const res = app?.roundHistory.find(
        (h) => h.roundNumber === selectedRoundNum
      );
      return res?.result === "Cleared";
    });

    if (clearedSelected.length === 0) {
      setErrorMsg(
        "Only students who have CLEARED the current round can be moved to the next round."
      );
      return;
    }

    const nextRoundNumber = selectedRoundNum + 1;
    const defaultNextName =
      STANDARD_ROUNDS[nextRoundNumber - 1] || `Round ${nextRoundNumber}`;

    setPromoteForm({
      targetRoundNumber: nextRoundNumber,
      roundName: STANDARD_ROUNDS.includes(defaultNextName)
        ? defaultNextName
        : "Custom",
      customName: STANDARD_ROUNDS.includes(defaultNextName)
        ? ""
        : defaultNextName,
      scheduledDate: "",
      scheduledTime: "",
      location: "Online / Google Meet",
      meetingLink: "",
      instructions: "",
    });

    setPromoteModalOpen(true);
  };

  // Submit Promote to Next Round
  const handlePromoteCandidates = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg("");

      const finalName =
        promoteForm.roundName === "Custom"
          ? promoteForm.customName.trim() || `Round ${promoteForm.targetRoundNumber}`
          : promoteForm.roundName;

      const eligibleStudentIds = Array.from(selectedStudentIds).filter((sId) => {
        const app = applicants.find((a) => a.studentId === sId);
        const res = app?.roundHistory.find(
          (h) => h.roundNumber === selectedRoundNum
        );
        return res?.result === "Cleared";
      });

      const payload = {
        studentIds: eligibleStudentIds,
        targetRoundNumber: promoteForm.targetRoundNumber,
        roundName: finalName,
        roundDescription: `Round ${promoteForm.targetRoundNumber} selection assessment`,
        scheduledDate: promoteForm.scheduledDate,
        scheduledTime: promoteForm.scheduledTime,
        location: promoteForm.location,
        meetingLink: promoteForm.meetingLink,
        instructions: promoteForm.instructions,
      };

      const res = await roundTrackingAPI.promoteCandidates(
        selectedDriveId,
        payload
      );

      if (res.data?.success) {
        setSuccessMsg(res.data.message);
        setPromoteModalOpen(false);
        setSelectedStudentIds(new Set());
        fetchDriveRoundsAndApplicants(selectedDriveId);
        setSelectedRoundNum(promoteForm.targetRoundNumber);
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch (err) {
      console.error("Promote error:", err);
      setErrorMsg(
        err.response?.data?.message || "Failed to promote candidates."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Final Selection
  const handleFinalSelection = (studentIdsArray) => {
    if (!studentIdsArray || studentIdsArray.length === 0) {
      setErrorMsg("Please select candidates for final selection.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Confirm Final Selection",
      message: `Are you sure you want to mark ${studentIdsArray.length} candidate(s) as FINALLY SELECTED for ${driveData?.role}? This extends formal placement selection status and delivers congratulatory notifications.`,
      onConfirm: async () => {
        try {
          setSubmitting(true);
          setErrorMsg("");
          const res = await roundTrackingAPI.markFinalSelection(
            selectedDriveId,
            {
              studentIds: studentIdsArray,
              additionalInfo:
                "Selected for full-time offer. Onboarding details will follow.",
            }
          );

          if (res.data?.success) {
            setSuccessMsg(res.data.message);
            setSelectedStudentIds(new Set());
            fetchDriveRoundsAndApplicants(selectedDriveId);
            setTimeout(() => setSuccessMsg(""), 5000);
          }
        } catch (err) {
          console.error("Final selection error:", err);
          setErrorMsg(
            err.response?.data?.message || "Failed to mark final selection."
          );
        } finally {
          setSubmitting(false);
          setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <CompanyNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header with Title & Drive Selector */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
              <Sparkles size={14} />
              <span>Multi-Stage Recruitment Workflow</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Round-Wise Placement Management
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Track candidate progression, schedule rounds, and record permanent round results with automated notifications.
            </p>
          </div>

          {/* Placement Drive Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">
              Select Drive:
            </span>
            <select
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(e.target.value)}
              disabled={loadingDrives || drives.length === 0}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
            >
              {drives.length === 0 && (
                <option value="">No Placement Drives</option>
              )}
              {drives.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.role} ({d.package || "N/A"}) • {d.status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Rounds Navigation Tabs */}
        {rounds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              {rounds.map((rd) => {
                const isActive = rd.roundNumber === selectedRoundNum;
                // Count candidates who have reached or cleared this round
                const countInRound = applicants.filter((a) => {
                  const h = a.roundHistory.find(
                    (rh) => rh.roundNumber === rd.roundNumber
                  );
                  return h && h.result !== "Rejected";
                }).length;

                return (
                  <button
                    key={rd._id}
                    type="button"
                    onClick={() => {
                      setSelectedRoundNum(rd.roundNumber);
                      setSelectedStudentIds(new Set());
                    }}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-blue-100"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                        isActive
                          ? "bg-white text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {rd.roundNumber}
                    </span>
                    <span>{rd.roundName}</span>
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isActive
                          ? "bg-blue-700 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {countInRound}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Add New Round Button */}
            <button
              type="button"
              onClick={() => openConfigureModal(null)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              Add Next Round
            </button>
          </div>
        )}

        {/* Active Round Info Banner */}
        {activeRound && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                    Round {activeRound.roundNumber}
                  </span>
                  <h2 className="text-base font-bold text-slate-900">
                    {activeRound.roundName}
                  </h2>
                </div>
                {activeRound.roundDescription && (
                  <p className="mt-1 text-xs text-slate-500">
                    {activeRound.roundDescription}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => openConfigureModal(activeRound)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
              >
                Edit Round Schedule & Instructions
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={14} className="text-slate-400" />
                <span>
                  Date:{" "}
                  <strong className="text-slate-800">
                    {activeRound.scheduledDate
                      ? new Date(activeRound.scheduledDate).toLocaleDateString()
                      : "Unscheduled"}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Clock size={14} className="text-slate-400" />
                <span>
                  Time:{" "}
                  <strong className="text-slate-800">
                    {activeRound.scheduledTime || "Flexible / TBA"}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <MapPin size={14} className="text-slate-400" />
                <span className="truncate">
                  Location:{" "}
                  <strong className="text-slate-800">
                    {activeRound.location || "Online"}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Video size={14} className="text-slate-400" />
                {activeRound.meetingLink ? (
                  <a
                    href={activeRound.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Meeting Link <ExternalLink size={11} />
                  </a>
                ) : (
                  <span className="text-slate-400">No meeting link set</span>
                )}
              </div>
            </div>

            {activeRound.instructions && (
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                <strong className="text-slate-800">Instructions: </strong>
                {activeRound.instructions}
              </div>
            )}
          </div>
        )}

        {/* Bulk Action Controls Bar */}
        {selectedStudentIds.size > 0 && (
          <div className="sticky top-20 z-40 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/90 p-4 shadow-md backdrop-blur-md animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-[11px]">
                {selectedStudentIds.size}
              </span>
              <span>Candidate(s) Selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  triggerResultUpdate(Array.from(selectedStudentIds), "Cleared")
                }
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={13} />
                Mark Cleared ({selectedStudentIds.size})
              </button>

              <button
                type="button"
                onClick={() =>
                  triggerResultUpdate(Array.from(selectedStudentIds), "Rejected")
                }
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
              >
                <XCircle size={13} />
                Mark Rejected ({selectedStudentIds.size})
              </button>

              <button
                type="button"
                onClick={openPromoteModal}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
              >
                <ArrowRight size={13} />
                Move to Next Round
              </button>

              <button
                type="button"
                onClick={() =>
                  handleFinalSelection(Array.from(selectedStudentIds))
                }
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
              >
                <Award size={13} />
                Final Selection
              </button>

              <button
                type="button"
                onClick={() => setSelectedStudentIds(new Set())}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Applicants Table */}
        {loadingRounds ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Loading candidates and round records...
            </p>
          </div>
        ) : roundApplicants.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center">
            <Users size={36} className="text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-800">
              No Candidates in Round {selectedRoundNum}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {selectedRoundNum === 1
                ? "No students have applied to this placement drive yet."
                : `Move shortlisted candidates who cleared Round ${selectedRoundNum - 1} to this round.`}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3.5 w-10 text-center">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-slate-400 hover:text-blue-600 cursor-pointer"
                      >
                        {selectedStudentIds.size > 0 &&
                        selectedStudentIds.size === roundApplicants.length ? (
                          <CheckSquare size={16} className="text-blue-600" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3.5">Student</th>
                    <th className="px-4 py-3.5">Branch / Course</th>
                    <th className="px-4 py-3.5 text-center">CGPA</th>
                    <th className="px-4 py-3.5 text-center">Resume</th>
                    <th className="px-4 py-3.5 text-center">Current Round Status</th>
                    <th className="px-4 py-3.5 text-center">Overall Stage</th>
                    <th className="px-5 py-3.5 text-right">Round Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roundApplicants.map((app) => {
                    const isSelected = selectedStudentIds.has(app.studentId);
                    const currentHistory = app.roundHistory.find(
                      (h) => h.roundNumber === selectedRoundNum
                    );
                    const roundResult = currentHistory ? currentHistory.result : "Pending";

                    return (
                      <tr
                        key={app._id}
                        className={`transition-colors ${
                          isSelected ? "bg-blue-50/50" : "hover:bg-slate-50/60"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleStudent(app.studentId)}
                            className="text-slate-400 hover:text-blue-600 cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-blue-600" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>

                        {/* Student Info */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700">
                              {app.studentName
                                ? app.studentName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()
                                : "ST"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">
                                {app.studentName}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {app.studentEmail} • Roll: {app.studentRoll}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Branch / Course */}
                        <td className="px-4 py-4">
                          <span className="font-semibold text-slate-700 block">
                            {app.studentBranch}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Batch of {app.studentGraduationYear}
                          </span>
                        </td>

                        {/* CGPA */}
                        <td className="px-4 py-4 text-center">
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                            {Number(app.studentCgpa).toFixed(2)}
                          </span>
                        </td>

                        {/* Resume */}
                        <td className="px-4 py-4 text-center">
                          {app.resume ? (
                            <a
                              href={getResumeUrl(app.resume)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition"
                            >
                              <FileText size={12} />
                              View
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[10px]">
                              None
                            </span>
                          )}
                        </td>

                        {/* Current Round Result Badge */}
                        <td className="px-4 py-4 text-center">
                          {roundResult === "Cleared" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={11} /> Cleared
                            </span>
                          )}
                          {roundResult === "Rejected" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                              <XCircle size={11} /> Rejected
                            </span>
                          )}
                          {roundResult === "Selected" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                              <Award size={11} /> Selected
                            </span>
                          )}
                          {roundResult === "Pending" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                              <Clock size={11} /> In Progress
                            </span>
                          )}
                        </td>

                        {/* Overall Stage */}
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                              app.overallStatus === "Selected"
                                ? "bg-purple-50 text-purple-700"
                                : app.overallStatus === "Rejected"
                                ? "bg-rose-50 text-rose-700"
                                : app.overallStatus === "Shortlisted"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {app.overallStatus}
                          </span>
                        </td>

                        {/* Row Quick Action Buttons */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                triggerResultUpdate([app.studentId], "Cleared")
                              }
                              title="Mark Cleared"
                              className="rounded-lg border border-emerald-200 bg-white p-1.5 text-emerald-600 hover:bg-emerald-50 transition shadow-sm cursor-pointer"
                            >
                              <CheckCircle2 size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                triggerResultUpdate([app.studentId], "Rejected")
                              }
                              title="Mark Rejected"
                              className="rounded-lg border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 transition shadow-sm cursor-pointer"
                            >
                              <XCircle size={14} />
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

      {/* MODAL 1: Configure / Add Round */}
      {configModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Configure Selection Round
              </h3>
              <p className="text-xs text-slate-500">
                Customize round schedule, interview link, and instructions for candidates.
              </p>
            </div>

            <form onSubmit={handleSaveRound} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Round Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={roundForm.roundNumber}
                    onChange={(e) =>
                      setRoundForm({
                        ...roundForm,
                        roundNumber: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Round Template
                  </label>
                  <select
                    value={roundForm.roundName}
                    onChange={(e) =>
                      setRoundForm({ ...roundForm, roundName: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    {STANDARD_ROUNDS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                    <option value="Custom">+ Custom Round Name</option>
                  </select>
                </div>
              </div>

              {roundForm.roundName === "Custom" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Custom Round Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. System Design Interview / Case Study"
                    value={roundForm.customName}
                    onChange={(e) =>
                      setRoundForm({
                        ...roundForm,
                        customName: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={roundForm.scheduledDate}
                    onChange={(e) =>
                      setRoundForm({
                        ...roundForm,
                        scheduledDate: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 1:00 PM"
                    value={roundForm.scheduledTime}
                    onChange={(e) =>
                      setRoundForm({
                        ...roundForm,
                        scheduledTime: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Location / Platform
                  </label>
                  <input
                    type="text"
                    placeholder="Campus Lab 3 / Google Meet"
                    value={roundForm.location}
                    onChange={(e) =>
                      setRoundForm({ ...roundForm, location: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Meeting Link (Online)
                  </label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={roundForm.meetingLink}
                    onChange={(e) =>
                      setRoundForm({
                        ...roundForm,
                        meetingLink: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Additional Instructions for Candidates
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Bring updated resume, college ID card, and laptop with IDE configured."
                  value={roundForm.instructions}
                  onChange={(e) =>
                    setRoundForm({
                      ...roundForm,
                      instructions: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfigModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Round Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Promote Candidates to Next Round */}
      {promoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Move Candidates to Next Round
              </h3>
              <p className="text-xs text-slate-500">
                Schedule the next round for the cleared candidates.
              </p>
            </div>

            <form onSubmit={handlePromoteCandidates} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Round Number
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={promoteForm.targetRoundNumber}
                    onChange={(e) =>
                      setPromoteForm({
                        ...promoteForm,
                        targetRoundNumber: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Round Template
                  </label>
                  <select
                    value={promoteForm.roundName}
                    onChange={(e) =>
                      setPromoteForm({
                        ...promoteForm,
                        roundName: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    {STANDARD_ROUNDS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                    <option value="Custom">+ Custom Name</option>
                  </select>
                </div>
              </div>

              {promoteForm.roundName === "Custom" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Custom Round Name
                  </label>
                  <input
                    type="text"
                    value={promoteForm.customName}
                    onChange={(e) =>
                      setPromoteForm({
                        ...promoteForm,
                        customName: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Round Date
                  </label>
                  <input
                    type="date"
                    value={promoteForm.scheduledDate}
                    onChange={(e) =>
                      setPromoteForm({
                        ...promoteForm,
                        scheduledDate: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Round Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2:00 PM"
                    value={promoteForm.scheduledTime}
                    onChange={(e) =>
                      setPromoteForm({
                        ...promoteForm,
                        scheduledTime: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Location / Platform
                  </label>
                  <input
                    type="text"
                    value={promoteForm.location}
                    onChange={(e) =>
                      setPromoteForm({
                        ...promoteForm,
                        location: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Meeting Link (Online)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={promoteForm.meetingLink}
                    onChange={(e) =>
                      setPromoteForm({
                        ...promoteForm,
                        meetingLink: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Instructions for Promoted Students
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Join the Google Meet 5 minutes before your scheduled slot."
                  value={promoteForm.instructions}
                  onChange={(e) =>
                    setPromoteForm({
                      ...promoteForm,
                      instructions: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPromoteModalOpen(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Promoting..." : "Confirm & Move to Round"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  setConfirmModal({
                    isOpen: false,
                    title: "",
                    message: "",
                    onConfirm: null,
                  })
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyRoundManagement;
