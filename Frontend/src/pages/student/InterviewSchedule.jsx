import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Video,
  MapPin,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

const InterviewSchedule = () => {
  const interviews = [
    {
      id: 1,
      company: "Microsoft",
      shortName: "MS",
      role: "Support Engineer",
      type: "Technical Interview",
      date: "05 October 2026",
      time: "11:00 AM - 12:00 PM",
      mode: "Online",
      meetingLink: "https://meet.google.com/",
      status: "Upcoming",
      statusStyle: "bg-blue-50 text-blue-700 border-blue-200",
      instructions: [
        "Join the meeting 10 minutes before the scheduled time.",
        "Keep your resume and required documents ready.",
        "Make sure your camera and microphone are working.",
      ],
    },
    {
      id: 2,
      company: "TechNova Solutions",
      shortName: "TN",
      role: "MERN Stack Developer",
      type: "HR Interview",
      date: "08 October 2026",
      time: "02:00 PM - 02:30 PM",
      mode: "Offline",
      venue: "Placement Cell, HIET Campus",
      status: "Upcoming",
      statusStyle: "bg-violet-50 text-violet-700 border-violet-200",
      instructions: [
        "Reach the venue at least 15 minutes before the interview.",
        "Carry your college ID card.",
        "Carry one printed copy of your updated resume.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Back */}
        <Link
          to="/student/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Interview Schedule
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              View and manage your upcoming placement interviews.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5">
            <CalendarDays
              size={17}
              className="text-blue-600"
            />

            <span className="text-xs font-semibold text-blue-700">
              {interviews.length} Upcoming Interviews
            </span>
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="space-y-6">

          {interviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
            />
          ))}

        </div>

        {/* Empty / Information */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Keep your profile updated
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Interview details will be updated here by the placement
                team when your application moves to the interview stage.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};


/* =========================================================
   INTERVIEW CARD
========================================================= */

const InterviewCard = ({ interview }) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Card Header */}

      <div className="border-b border-slate-100 p-5 sm:p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">

            {/* Company Logo */}

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
              {interview.shortName}
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="text-lg font-bold text-slate-900">
                  {interview.company}
                </h2>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${interview.statusStyle}`}
                >
                  {interview.status}
                </span>

              </div>

              <p className="mt-1 text-sm font-medium text-slate-600">
                {interview.role}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {interview.type}
              </p>

            </div>

          </div>

          {/* Interview Date */}

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">

            <div className="flex items-center gap-2">

              <CalendarDays
                size={17}
                className="text-blue-600"
              />

              <div>

                <p className="text-xs text-blue-500">
                  Interview Date
                </p>

                <p className="mt-0.5 text-sm font-bold text-blue-700">
                  {interview.date}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* Interview Details */}

      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">

        <Detail
          icon={Clock3}
          label="Time"
          value={interview.time}
        />

        <Detail
          icon={interview.mode === "Online" ? Video : MapPin}
          label="Mode"
          value={interview.mode}
        />

      </div>


      {/* Body */}

      <div className="border-t border-slate-100 p-5 sm:p-6">

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Meeting / Venue */}

          <div>

            <h3 className="text-sm font-bold text-slate-900">
              {interview.mode === "Online"
                ? "Meeting Details"
                : "Venue Details"}
            </h3>

            {interview.mode === "Online" ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600">
                    <Video size={17} />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs text-slate-400">
                      Online Interview
                    </p>

                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-700">
                      Google Meet
                    </p>

                  </div>

                </div>

                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Join Meeting
                  <ExternalLink size={14} />
                </a>

              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-violet-600">
                    <MapPin size={17} />
                  </div>

                  <div>

                    <p className="text-xs text-slate-400">
                      Interview Venue
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-slate-700">
                      {interview.venue}
                    </p>

                  </div>

                </div>

              </div>
            )}

          </div>


          {/* Instructions */}

          <div>

            <h3 className="text-sm font-bold text-slate-900">
              Important Instructions
            </h3>

            <div className="mt-3 space-y-3">

              {interview.instructions.map((instruction, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5"
                >

                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />

                  <p className="text-xs leading-5 text-slate-500">
                    {instruction}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};


/* =========================================================
   DETAIL
========================================================= */

const Detail = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center gap-3 px-5 py-4 sm:px-6">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0">

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
};

export default InterviewSchedule;