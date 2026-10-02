import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Download,
  IndianRupee,
  MapPin,
  Trophy,
  XCircle,
} from "lucide-react";

const PlacementResults = () => {
  const results = [
    {
      id: 1,
      company: "TechNova Solutions",
      shortName: "TN",
      role: "MERN Stack Developer",
      package: "₹7.5 LPA",
      location: "Noida, Uttar Pradesh",
      result: "Selected",
      resultDate: "18 October 2026",
      offerLetter: true,
    },
    {
      id: 2,
      company: "Microsoft",
      shortName: "MS",
      role: "Support Engineer",
      package: "₹14 LPA",
      location: "Hyderabad, Telangana",
      result: "Not Selected",
      resultDate: "12 October 2026",
      offerLetter: false,
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
        <div className="mb-7">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Trophy size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Placement Results
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View your placement selection and result history.
              </p>
            </div>

          </div>

        </div>


        {/* Result Cards */}

        <div className="space-y-5">

          {results.map((result) => (
            <ResultCard
              key={result.id}
              result={result}
            />
          ))}

        </div>


        {/* Empty Information */}

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
              <Trophy size={21} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Placement Results
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                Your placement results will be updated by the placement
                team after the completion of the selection process.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};


/* =========================================================
   RESULT CARD
========================================================= */

const ResultCard = ({ result }) => {
  const selected = result.result === "Selected";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Top Section */}

      <div className="p-5 sm:p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          {/* Company */}

          <div className="flex items-start gap-4">

            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                selected
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {result.shortName}
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="text-lg font-bold text-slate-900">
                  {result.company}
                </h2>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    selected
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-600"
                  }`}
                >
                  {selected ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <XCircle size={13} />
                  )}

                  {result.result}
                </span>

              </div>

              <p className="mt-1 text-sm font-medium text-slate-600">
                {result.role}
              </p>

            </div>

          </div>


          {/* Package */}

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3">

            <p className="text-xs text-slate-400">
              Annual CTC
            </p>

            <div className="mt-1 flex items-center gap-1.5">

              <IndianRupee
                size={15}
                className="text-slate-700"
              />

              <p className="text-lg font-bold text-slate-900">
                {result.package.replace("₹", "")}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* Details */}

      <div className="grid grid-cols-1 divide-y divide-slate-100 border-t border-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

        <Detail
          icon={BriefcaseBusiness}
          label="Job Role"
          value={result.role}
        />

        <Detail
          icon={MapPin}
          label="Location"
          value={result.location}
        />

        <Detail
          icon={CalendarDays}
          label="Result Date"
          value={result.resultDate}
        />

      </div>


      {/* Bottom */}

      {selected && (
        <div className="flex flex-col gap-4 border-t border-emerald-100 bg-emerald-50/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

          <div className="flex items-start gap-3">

            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <div>

              <p className="text-sm font-bold text-emerald-800">
                Congratulations! You have been selected.
              </p>

              <p className="mt-1 text-xs text-emerald-700">
                Your offer letter is available.
              </p>

            </div>

          </div>

          {result.offerLetter && (
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
            >
              <Download size={15} />
              Download Offer Letter
            </button>
          )}

        </div>
      )}

    </section>
  );
};


/* =========================================================
   DETAIL
========================================================= */

const Detail = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center gap-3 px-5 py-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0">

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-700">
          {value}
        </p>

      </div>

    </div>
  );
};

export default PlacementResults;