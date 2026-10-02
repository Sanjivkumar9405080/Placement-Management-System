import { useState, useEffect } from "react";
import CompanyNavbar from "../../components/CompanyNavbar";
import { interviewsAPI } from "../../services/api";

import {
  CalendarDays,
  Clock3,
  Video,
  MapPin,
  Search,
  User,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  X,
  Filter,
} from "lucide-react";

const CompanyInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // View / Edit Modal state
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await interviewsAPI.getCompanyInterviews();
      if (res.data.success) {
        setInterviews(res.data.interviews || []);
      }
    } catch (err) {
      console.error("Error fetching interviews:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load company interviews. Ensure you are signed in."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInterview = async (interviewId) => {
    if (!window.confirm("Are you sure you want to cancel this interview?")) {
      return;
    }
    try {
      const res = await interviewsAPI.cancelInterview(interviewId);
      if (res.data.success) {
        fetchInterviews();
      }
    } catch (err) {
      console.error("Cancel interview error:", err);
      alert(err.response?.data?.message || "Failed to cancel interview.");
    }
  };

  const handleOpenEdit = (interview) => {
    setSelectedInterview(interview);
    setEditFormData({
      date: new Date(interview.date).toISOString().slice(0, 10),
      time: interview.time,
      mode: interview.mode,
      meetingLink: interview.meetingLink || "",
      venue: interview.venue || "",
      interviewerName: interview.interviewerName || "",
      status: interview.status || "Scheduled",
      remarks: interview.remarks || "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      const res = await interviewsAPI.updateInterview(
        selectedInterview._id,
        editFormData
      );
      if (res.data.success) {
        setIsEditModalOpen(false);
        fetchInterviews();
      }
    } catch (err) {
      console.error("Update interview error:", err);
      alert(err.response?.data?.message || "Failed to update interview.");
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredInterviews = interviews.filter((item) => {
    const studentUser = item.student?.userId || {};
    const name = studentUser.name || "";
    const role = item.drive?.role || item.application?.role || "";

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      role.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const scheduledCount = interviews.filter(
    (i) => i.status === "Scheduled"
  ).length;
  const completedCount = interviews.filter(
    (i) => i.status === "Completed"
  ).length;
  const cancelledCount = interviews.filter(
    (i) => i.status === "Cancelled"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <CompanyNavbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-7">
          <p className="text-sm font-semibold text-blue-600">Company Portal</p>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Interview Management
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Track, conduct, and manage scheduled candidate interviews.
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
          <MetricCard
            title="Total Interviews"
            value={interviews.length}
            icon={CalendarDays}
            iconStyle="bg-blue-50 text-blue-600"
          />
          <MetricCard
            title="Scheduled / Upcoming"
            value={scheduledCount}
            icon={Clock3}
            iconStyle="bg-amber-50 text-amber-600"
          />
          <MetricCard
            title="Completed"
            value={completedCount}
            icon={CheckCircle2}
            iconStyle="bg-emerald-50 text-emerald-600"
          />
          <MetricCard
            title="Cancelled"
            value={cancelledCount}
            icon={XCircle}
            iconStyle="bg-red-50 text-red-600"
          />
        </div>

        {/* Filter and Search Bar */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 mb-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate name or drive role..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {[
                "All",
                "Scheduled",
                "Completed",
                "Cancelled",
                "Rescheduled",
              ].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === tab
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Interviews List / Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Scheduled Interviews
              </h2>
              <p className="text-xs text-slate-400">
                {filteredInterviews.length} interviews found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              <p className="text-xs text-slate-400">Loading interviews...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Student Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Drive Role
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Mode & Venue / Link
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Interviewer
                      </th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredInterviews.map((item) => {
                      const studentUser = item.student?.userId || {};
                      const name = studentUser.name || "Student";
                      const email = studentUser.email || "N/A";
                      const role =
                        item.drive?.role ||
                        item.application?.role ||
                        "Position";
                      const dateStr = new Date(item.date).toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      );

                      return (
                        <tr
                          key={item._id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-800">
                              {name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {email}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-xs font-semibold text-slate-700">
                              {role}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-slate-800">
                              {dateStr}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {item.time}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              {item.mode === "Online" ? (
                                <>
                                  <Video size={14} className="text-blue-600" />
                                  <span>Online</span>
                                  {item.meetingLink && (
                                    <a
                                      href={item.meetingLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 hover:underline inline-flex items-center gap-0.5 ml-1"
                                      title={item.meetingLink}
                                    >
                                      (Link <ExternalLink size={11} />)
                                    </a>
                                  )}
                                </>
                              ) : (
                                <>
                                  <MapPin size={14} className="text-violet-600" />
                                  <span>Offline: {item.venue || "Campus"}</span>
                                </>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-xs font-medium text-slate-700">
                              {item.interviewerName}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <InterviewStatusBadge status={item.status} />
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedInterview(item);
                                  setIsViewModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="View Details"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                title="Edit Interview"
                              >
                                <Edit2 size={15} />
                              </button>

                              {item.status !== "Cancelled" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCancelInterview(item._id)
                                  }
                                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Cancel Interview"
                                >
                                  <XCircle size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Layout */}
              <div className="divide-y divide-slate-100 lg:hidden">
                {filteredInterviews.map((item) => {
                  const studentUser = item.student?.userId || {};
                  const name = studentUser.name || "Student";
                  const role =
                    item.drive?.role || item.application?.role || "Position";
                  const dateStr = new Date(item.date).toLocaleDateString(
                    "en-US",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  );

                  return (
                    <div key={item._id} className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {name}
                          </p>
                          <p className="text-xs text-slate-500">{role}</p>
                        </div>
                        <InterviewStatusBadge status={item.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Date & Time
                          </span>
                          <span className="font-semibold text-slate-800">
                            {dateStr} at {item.time}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">
                            Interviewer
                          </span>
                          <span className="font-semibold text-slate-800">
                            {item.interviewerName}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-700">
                        {item.mode === "Online" ? (
                          <div className="flex items-center gap-1.5">
                            <Video size={14} className="text-blue-600" />
                            <span>Online: </span>
                            {item.meetingLink ? (
                              <a
                                href={item.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline truncate max-w-[200px]"
                              >
                                {item.meetingLink}
                              </a>
                            ) : (
                              <span>Link not provided</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-violet-600" />
                            <span>Venue: {item.venue || "College Campus"}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInterview(item);
                            setIsViewModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                        >
                          Edit
                        </button>
                        {item.status !== "Cancelled" && (
                          <button
                            type="button"
                            onClick={() => handleCancelInterview(item._id)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredInterviews.length === 0 && (
                <div className="p-12 text-center">
                  <CalendarDays size={28} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-800">
                    No interviews found
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Schedule interviews for shortlisted students from the Applicants page.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* ================= VIEW DETAILS MODAL ================= */}
      {isViewModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Interview Details
              </h3>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <p className="text-slate-400 font-medium text-[11px]">
                  CANDIDATE
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {selectedInterview.student?.userId?.name || "Student"}
                </p>
                <p className="text-slate-500">
                  {selectedInterview.student?.userId?.email || "N/A"}
                </p>
                <p className="text-slate-500">
                  Branch: {selectedInterview.student?.branch || "General"} •
                  CGPA: {selectedInterview.student?.cgpa || "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Date
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {new Date(selectedInterview.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Time
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {selectedInterview.time}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Mode & Location
                </span>
                <p className="font-bold text-slate-800">
                  {selectedInterview.mode}
                </p>
                {selectedInterview.mode === "Online" ? (
                  <a
                    href={selectedInterview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline mt-1 break-all"
                  >
                    {selectedInterview.meetingLink}{" "}
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <p className="text-slate-700">{selectedInterview.venue}</p>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Interviewer
                </span>
                <p className="font-semibold text-slate-800">
                  {selectedInterview.interviewerName}
                </p>
                {selectedInterview.remarks && (
                  <p className="text-slate-500 italic mt-1">
                    "{selectedInterview.remarks}"
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {isEditModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Edit Interview
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Interview Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.date}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        date: e.target.value,
                      })
                    }
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
                    value={editFormData.time}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        time: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mode *
                  </label>
                  <select
                    value={editFormData.mode}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        mode: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rescheduled">Rescheduled</option>
                  </select>
                </div>
              </div>

              {editFormData.mode === "Online" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meeting Link *
                  </label>
                  <input
                    type="url"
                    required
                    value={editFormData.meetingLink}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        meetingLink: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.venue}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        venue: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Interviewer Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.interviewerName}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      interviewerName: e.target.value,
                    })
                  }
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Remarks / Instructions
                </label>
                <textarea
                  rows="2"
                  value={editFormData.remarks}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      remarks: e.target.value,
                    })
                  }
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   METRIC CARD
========================================================= */
const MetricCard = ({ title, value, icon: Icon, iconStyle }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */
const InterviewStatusBadge = ({ status }) => {
  const styles = {
    Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
    Rescheduled: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
        styles[status] || "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {status || "Scheduled"}
    </span>
  );
};

export default CompanyInterviews;
