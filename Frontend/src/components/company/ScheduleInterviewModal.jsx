import { useState } from "react";
import { interviewsAPI } from "../../services/api";
import {
  CalendarDays,
  Clock3,
  Video,
  MapPin,
  User,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const ScheduleInterviewModal = ({
  isOpen,
  onClose,
  application,
  onSuccess,
}) => {
  if (!isOpen || !application) return null;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 AM");
  const [mode, setMode] = useState("Online");
  const [meetingLink, setMeetingLink] = useState("");
  const [venue, setVenue] = useState("College Campus - Placement Cell");
  const [interviewerName, setInterviewerName] = useState("");
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const studentName =
    application.student?.userId?.name ||
    application.student?.name ||
    "Student Applicant";
  const roleName = application.role || application.drive?.role || "Position";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!date || !time || !interviewerName.trim()) {
      setError("Please fill in the interview date, time, and interviewer name.");
      return;
    }

    if (mode === "Online" && !meetingLink.trim()) {
      setError("Meeting link is required for Online interviews.");
      return;
    }

    if (mode === "Offline" && !venue.trim()) {
      setError("Venue is required for Offline campus interviews.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        applicationId: application._id,
        date,
        time: time.trim(),
        mode,
        meetingLink: mode === "Online" ? meetingLink.trim() : "",
        venue: mode === "Offline" ? venue.trim() : "",
        interviewerName: interviewerName.trim(),
        remarks: remarks.trim(),
      };

      const res = await interviewsAPI.scheduleInterview(payload);

      if (res.data.success) {
        setSuccessMsg("Interview scheduled successfully! Application moved to Interview stage.");
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data.interview);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error("Schedule interview error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to schedule interview. Please verify candidate is shortlisted."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CalendarDays size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Schedule Interview
              </h3>
              <p className="text-xs text-slate-500">
                Candidate: <span className="font-semibold text-slate-700">{studentName}</span> ({roleName})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Interview Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Interview Time *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 11:00 AM or 02:30 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Interview Mode *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("Online")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  mode === "Online"
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Video size={16} />
                Online (Video Call)
              </button>

              <button
                type="button"
                onClick={() => setMode("Offline")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  mode === "Offline"
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MapPin size={16} />
                Offline (On Campus)
              </button>
            </div>
          </div>

          {/* Meeting Link if Online */}
          {mode === "Online" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meeting Link *
              </label>
              <input
                type="url"
                required
                placeholder="https://meet.google.com/xyz-abcd-efg or Teams link"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          )}

          {/* Venue if Offline */}
          {mode === "Offline" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Venue *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Placement Cell Room 204, Seminar Hall"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          )}

          {/* Interviewer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Interviewer Name / Panel *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rajesh Sharma (Lead Architect) / HR Team"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Remarks / Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instructions / Remarks (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Please keep government ID, laptop and resume ready."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Interview"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;
