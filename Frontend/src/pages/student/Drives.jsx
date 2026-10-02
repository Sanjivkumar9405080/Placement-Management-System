import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { placementDrivesAPI } from "../../services/api";
import { Loader2 } from "lucide-react";

const Drives = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [drivesList, setDrivesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackCatalog = [
    {
      id: "1",
      company: "TechNova Solutions",
      shortName: "TN",
      role: "MERN Stack Developer",
      package: "₹6 - 8 LPA",
      location: "College Campus",
      workMode: "On-site",
      deadline: "12 Oct 2026",
      vacancies: "10 Positions",
      category: "fullstack",
      skills: ["React.js", "Node.js", "MongoDB", "Express", "REST API"],
    },
    {
      id: "2",
      company: "CloudWorks India",
      shortName: "CW",
      role: "Software Developer",
      package: "₹7 - 9 LPA",
      location: "Bengaluru, Karnataka",
      workMode: "Hybrid",
      deadline: "15 Oct 2026",
      vacancies: "15 Positions",
      category: "software",
      skills: ["Java", "Spring Boot", "AWS", "SQL", "Docker"],
    },
    {
      id: "3",
      company: "InnovateX",
      shortName: "IX",
      role: "Frontend Developer",
      package: "₹5 - 7 LPA",
      location: "Hyderabad, Telangana",
      workMode: "Remote",
      deadline: "18 Oct 2026",
      vacancies: "8 Positions",
      category: "frontend",
      skills: ["React.js", "TypeScript", "Tailwind CSS", "Redux"],
    },
  ];

  useEffect(() => {
    fetchActiveDrives();
  }, []);

  const fetchActiveDrives = async () => {
    try {
      setLoading(true);
      const res = await placementDrivesAPI.getActive();
      if (res.data.success && res.data.drives && res.data.drives.length > 0) {
        const formatted = res.data.drives.map((d) => {
          const compName = d.company?.companyName || "TechNova Solutions";
          const shortName = compName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return {
            id: d._id,
            company: compName,
            shortName,
            role: d.role,
            package: d.package,
            location: d.location || "College Campus",
            workMode: "On-site",
            deadline: d.applicationDeadline
              ? new Date(d.applicationDeadline).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Ongoing",
            vacancies: "Campus Hiring",
            category: "all",
            skills: d.skills || [],
          };
        });
        setDrivesList(formatted);
      } else {
        setDrivesList(fallbackCatalog);
      }
    } catch (err) {
      console.warn("Could not load backend drives, using catalog:", err);
      setDrivesList(fallbackCatalog);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrives = drivesList.filter((drive) => {
    const matchesSearch =
      drive.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.skills.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilter =
      selectedFilter === "all" || drive.category === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Campus Placement Drives
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Explore active campus hiring opportunities and apply with your verified profile.
              </p>
            </div>

            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors self-start sm:self-auto"
            >
              &larr; Back to Dashboard
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Active Drives</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {drivesList.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Total Openings</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">30+</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Highest Package</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">₹10 LPA</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Min. Eligibility</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">6.0 CGPA</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, role or skill (e.g. React, Java)..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Drives" },
              { id: "fullstack", label: "Full Stack" },
              { id: "software", label: "Software Dev" },
              { id: "frontend", label: "Frontend" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedFilter === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            <p className="text-xs text-slate-400">Loading placement drives...</p>
          </div>
        ) : (
          /* Drives Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDrives.map((drive) => (
              <div
                key={drive.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  {/* Company Logo and Mode */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-base flex items-center justify-center border border-blue-100 shrink-0">
                        {drive.shortName}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {drive.company}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {drive.location}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                      {drive.workMode}
                    </span>
                  </div>

                  {/* Role Title */}
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Role
                    </span>
                    <h4 className="text-base font-bold text-slate-800 mt-0.5">
                      {drive.role}
                    </h4>
                  </div>

                  {/* Package & Vacancies */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                    <div>
                      <span className="text-[11px] text-slate-500">Package:</span>
                      <p className="text-xs font-bold text-emerald-600 mt-0.5">
                        {drive.package}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">Openings:</span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {drive.vacancies}
                      </p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Required Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {drive.skills && drive.skills.length > 0 ? (
                        drive.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">
                          General Engineering
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 sm:px-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400">Apply by</p>
                    <p className="text-xs font-semibold text-slate-700">
                      {drive.deadline}
                    </p>
                  </div>

                  <Link
                    to={`/student/drive/${drive.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredDrives.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-base font-semibold text-slate-800">
              No matching drives found
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try searching with a different term or clear filters.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Drives;
