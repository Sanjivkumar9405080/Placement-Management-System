import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { interviewsAPI } from "../../services/api";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Video,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
  XCircle,
  UserCheck,
} from "lucide-react";

const StudentInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyInterviews();
  }, []);

  const fetchMyInterviews = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await interviewsAPI.getMyInterviews();
      if (res.data.success) {
        setInterviews(res.data.interviews || []);
      }
    } catch (err) {
      console.error("Error fetching student interviews:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load your interviews. Ensure you are signed in."
      );
    } finally {
      setLoading(false);
    }
  };

  const upcomingInterviews = interviews.filter(
    (i) => i.status === "Scheduled" || i.status === "Rescheduled"
  );

  const pastInterviews = interviews.filter(
    (i) => i.status === "Completed" || i.status === "Cancelled"
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Back Link */}
        <Link
          to="/student/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Placement Interviews
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View scheduled technical & HR interviews with campus recruiting partners.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5">
            <CalendarDays size={17} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">
              {upcomingInterviews.length} Upcoming Rounds
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-xs text-slate-400">Loading interview schedules...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ================= UPCOMING INTERVIEWS ================= */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Upcoming Interviews
                  </h2>
                  <p className="text-xs text-slate-400">
                    Rounds scheduled by company recruitment teams
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {upcomingInterviews.length} Scheduled
                </span>
              </div>

              {upcomingInterviews.length > 0 ? (
                <div className="space-y-4">
                  {upcomingInterviews.map((interview) => (
                    <StudentInterviewCard
                      key={interview._id}
                      interview={interview}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <CalendarDays
                    size={28}
                    className="mx-auto text-slate-400 mb-2"
                  />
                  <p className="text-sm font-bold text-slate-800">
                    No upcoming interviews scheduled
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    When companies shortlist your application, interview invitations will appear here.
                  </p>
                </div>
              )}
            </section>

            {/* ================= PAST INTERVIEWS ================= */}
            {pastInterviews.length > 0 && (
              <section>
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900">
                    Past Interviews
                  </h2>
                  <p className="text-xs text-slate-400">
                    Completed or cancelled placement rounds
                  </p>
                </div>

                <div className="space-y-4">
                  {pastInterviews.map((interview) => (
                    <StudentInterviewCard
                      key={interview._id}
                      interview={interview}
                      past
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

/* =========================================================
   STUDENT INTERVIEW CARD
========================================================= */
const StudentInterviewCard = ({ interview, past = false }) => {
  const companyName = interview.company?.companyName || "Recruiting Partner";
  const initials = companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const roleName =
    interview.drive?.role || interview.application?.role || "Software Role";
  const dateStr = new Date(interview.date).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
        past ? "border-slate-200 opacity-80" : "border-slate-200 hover:shadow-md"
      }`}
    >
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
              {initials}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {companyName}
                </h3>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                    interview.status === "Scheduled"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : interview.status === "Completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : interview.status === "Cancelled"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {interview.status}
                </span>
              </div>

              <p className="mt-0.5 text-xs font-semibold text-slate-700">
                {roleName}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-2 self-start sm:self-auto">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-blue-600" />
              <div>
                <p className="text-[10px] text-blue-500 uppercase font-semibold">
                  Date
                </p>
                <p className="text-xs font-bold text-blue-800">{dateStr}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0 bg-slate-50/50">
        <div className="p-4 flex items-center gap-3">
          <Clock3 size={17} className="text-slate-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Time</p>
            <p className="text-xs font-bold text-slate-800">{interview.time}</p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3">
          {interview.mode === "Online" ? (
            <Video size={17} className="text-blue-600 shrink-0" />
          ) : (
            <MapPin size={17} className="text-violet-600 shrink-0" />
          )}
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Mode</p>
            <p className="text-xs font-bold text-slate-800">
              {interview.mode === "Online" ? "Online Video Meeting" : "Offline Campus"}
            </p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3">
          <UserCheck size={17} className="text-slate-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-medium">Interviewer</p>
            <p className="text-xs font-bold text-slate-800 truncate">
              {interview.interviewerName}
            </p>
          </div>
        </div>
      </div>

      {/* Location / Action Bar */}
      <div className="p-5 sm:p-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {interview.mode === "Online" ? (
            <div>
              <p className="text-[11px] font-semibold text-slate-500">
                Online Meeting Link:
              </p>
              <p className="text-xs text-blue-600 break-all font-medium mt-0.5">
                {interview.meetingLink || "Link will be shared prior to start"}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-semibold text-slate-500">
                Interview Venue:
              </p>
              <p className="text-xs text-slate-800 font-bold mt-0.5">
                {interview.venue || "College Campus - Placement Cell"}
              </p>
            </div>
          )}

          {interview.remarks && (
            <p className="mt-2 text-xs text-slate-500 italic">
              Instructions: "{interview.remarks}"
            </p>
          )}
        </div>

        {interview.mode === "Online" && interview.meetingLink && !past && (
          <a
            href={interview.meetingLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 cursor-pointer self-start sm:self-auto"
          >
            Join Interview
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
};

export default StudentInterviews;
