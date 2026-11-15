import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { roundTrackingAPI } from "../../services/api";
import {
  Sparkles,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  AlertCircle,
  ChevronRight,
  Award,
  ArrowRight,
  Info,
  BriefcaseBusiness,
} from "lucide-react";

const StudentPlacementJourney = () => {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDriveId, setActiveDriveId] = useState(null);

  useEffect(() => {
    fetchPlacementJourney();
  }, []);

  const fetchPlacementJourney = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await roundTrackingAPI.getStudentJourney();

      if (res.data?.success) {
        const list = res.data.journeys || [];
        setJourneys(list);
        if (list.length > 0) {
          setActiveDriveId(list[0].driveId);
        }
      }
    } catch (err) {
      console.error("Fetch journey error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load your placement journey records."
      );
    } finally {
      setLoading(false);
    }
  };

  const activeJourney =
    journeys.find((j) => j.driveId === activeDriveId) || journeys[0];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                <Sparkles size={14} />
                <span>Multi-Company Recruitment Roadmap</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Placement Journey
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Monitor your round-by-round selection progress, interview timings, instructions, and outcomes across all applied companies.
              </p>
            </div>

            <Link
              to="/student/drives"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Explore New Drives
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Loading your placement timelines...
            </p>
          </div>
        ) : journeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BriefcaseBusiness size={28} />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              No Placement Applications Yet
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              You haven't submitted applications for any active placement drives yet. Explore eligible companies to kickstart your journey.
            </p>
            <Link
              to="/student/drives"
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
            >
              View Active Drives
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Companies Selector Sidebar */}
            <div className="lg:col-span-4 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Applied Companies ({journeys.length})
              </h2>

              <div className="space-y-2">
                {journeys.map((j) => {
                  const isSelected = j.driveId === activeDriveId;
                  const isFinalSelected = j.overallStatus === "Selected";
                  const isRejected = j.overallStatus === "Rejected";

                  return (
                    <button
                      key={j.driveId}
                      type="button"
                      onClick={() => setActiveDriveId(j.driveId)}
                      className={`w-full text-left rounded-2xl border p-4 transition shadow-sm cursor-pointer ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700 text-xs">
                            {j.companyName ? j.companyName.slice(0, 2).toUpperCase() : "CO"}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-sm truncate">
                              {j.companyName}
                            </h3>
                            <p className="text-xs text-slate-500 truncate">
                              {j.role} • {j.package}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          size={16}
                          className={`shrink-0 transition-transform ${
                            isSelected ? "text-blue-600 translate-x-1" : "text-slate-300"
                          }`}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                        <span className="font-semibold text-slate-600">
                          {j.currentRoundName}
                        </span>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isFinalSelected
                              ? "bg-purple-100 text-purple-700"
                              : isRejected
                              ? "bg-rose-100 text-rose-700"
                              : j.overallStatus === "Shortlisted"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {isFinalSelected
                            ? "Selected 🎉"
                            : isRejected
                            ? "Rejected"
                            : j.currentRoundStatus || j.overallStatus}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Detailed Round-Wise Timeline */}
            {activeJourney && (
              <div className="lg:col-span-8 space-y-4">
                {/* Active Company Header Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 font-bold text-sm">
                        {activeJourney.companyName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-slate-900">
                            {activeJourney.companyName}
                          </h2>
                          {activeJourney.overallStatus === "Selected" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 border border-purple-200">
                              <Award size={12} /> Final Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {activeJourney.role} • {activeJourney.package} • {activeJourney.jobType}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-block self-start rounded-full px-3 py-1 text-xs font-bold ${
                        activeJourney.overallStatus === "Selected"
                          ? "bg-purple-100 text-purple-800"
                          : activeJourney.overallStatus === "Rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      Status: {activeJourney.overallStatus}
                    </span>
                  </div>
                </div>

                {/* Timeline Component */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Selection Process Timeline
                    </h3>
                    <p className="text-xs text-slate-500">
                      Step-by-step progress from application submission to final offer.
                    </p>
                  </div>

                  <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:bottom-3 before:top-3 before:left-3 sm:before:left-4 before:w-0.5 before:bg-slate-200">
                    {activeJourney.timeline.map((item, idx) => {
                      const isCleared = item.status === "Cleared" || item.status === "Selected";
                      const isRejected = item.status === "Rejected" || item.status === "Not Selected";
                      const isScheduled = item.status === "Round Scheduled";
                      const isInProgress = item.status === "In Progress";
                      const isUpcoming = item.status === "Upcoming";
                      const isNotReached = item.status === "Not Reached";

                      // Icon & Badge Colors
                      let dotColor = "bg-slate-300 text-white";
                      if (isCleared) dotColor = "bg-emerald-500 text-white ring-4 ring-emerald-50";
                      else if (isRejected) dotColor = "bg-rose-500 text-white ring-4 ring-rose-50";
                      else if (isScheduled) dotColor = "bg-blue-600 text-white ring-4 ring-blue-50 animate-pulse";
                      else if (isInProgress) dotColor = "bg-amber-500 text-white ring-4 ring-amber-50";

                      return (
                        <div key={idx} className="relative group">
                          {/* Dot / Marker */}
                          <div
                            className={`absolute -left-[30px] sm:-left-[35px] flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-transform ${dotColor}`}
                          >
                            {isCleared ? (
                              <CheckCircle2 size={16} />
                            ) : isRejected ? (
                              <XCircle size={16} />
                            ) : (
                              <span>{item.step}</span>
                            )}
                          </div>

                          {/* Content Card */}
                          <div
                            className={`rounded-2xl border p-4 sm:p-5 transition shadow-sm ${
                              isScheduled
                                ? "border-blue-300 bg-blue-50/30"
                                : isCleared
                                ? "border-emerald-200 bg-emerald-50/20"
                                : isRejected
                                ? "border-rose-200 bg-rose-50/30"
                                : isNotReached
                                ? "border-slate-100 bg-slate-50/40 opacity-60"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100/80 pb-2.5">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">
                                  {item.title}
                                </h4>
                                {item.roundDescription && (
                                  <p className="text-xs text-slate-500">
                                    {item.roundDescription}
                                  </p>
                                )}
                              </div>

                              <span
                                className={`self-start rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                  isCleared
                                    ? "bg-emerald-100 text-emerald-800"
                                    : isRejected
                                    ? "bg-rose-100 text-rose-800"
                                    : isScheduled
                                    ? "bg-blue-100 text-blue-800"
                                    : isInProgress
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>

                            {/* Round Details (Date, Location, Link) */}
                            {(item.scheduledDate || item.scheduledTime || item.location || item.meetingLink) && (
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {(item.scheduledDate || item.scheduledTime) && (
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <Calendar size={13} className="text-blue-600" />
                                    <span>
                                      {item.scheduledDate
                                        ? new Date(item.scheduledDate).toLocaleDateString()
                                        : "TBA"}{" "}
                                      {item.scheduledTime ? `• ${item.scheduledTime}` : ""}
                                    </span>
                                  </div>
                                )}

                                {item.location && (
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <MapPin size={13} className="text-red-500" />
                                    <span className="truncate">{item.location}</span>
                                  </div>
                                )}

                                {item.meetingLink && (
                                  <div className="sm:col-span-2 pt-1">
                                    <a
                                      href={item.meetingLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                                    >
                                      <Video size={13} />
                                      Join Interview Meeting
                                      <ExternalLink size={12} />
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Instructions from Recruiter */}
                            {item.instructions && (
                              <div className="mt-3 rounded-xl bg-blue-50/70 p-3 text-xs text-blue-900 border border-blue-100/60">
                                <strong className="font-semibold block mb-0.5">
                                  Instructions from Recruiter:
                                </strong>
                                <p>{item.instructions}</p>
                              </div>
                            )}

                            {/* Feedback if available */}
                            {item.feedback && (
                              <div className="mt-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-200">
                                <strong className="text-slate-800">Feedback: </strong>
                                {item.feedback}
                              </div>
                            )}

                            {item.description && !item.roundDescription && (
                              <p className="mt-2 text-xs text-slate-500">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentPlacementJourney;
