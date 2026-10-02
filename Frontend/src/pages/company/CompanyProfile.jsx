import { useState, useEffect } from "react";
import CompanyNavbar from "../../components/CompanyNavbar";
import { companyAPI } from "../../services/api";
import {
  Building2,
  Mail,
  User,
  Phone,
  Briefcase,
  MapPin,
  Globe,
  Link2,
  FileText,
  Image,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

const CompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    officialEmail: "",
    hrName: "",
    phone: "",
    industry: "",
    location: "",
    website: "",
    linkedin: "",
    description: "",
    logo: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await companyAPI.getProfile();
      if (res.data?.success && res.data?.company) {
        const comp = res.data.company;
        setProfile(comp);
        setFormData({
          companyName: comp.companyName || "",
          officialEmail: comp.officialEmail || "",
          hrName: comp.hrName || "",
          phone: comp.phone || "",
          industry: comp.industry || "",
          location: comp.location || "",
          website: comp.website || "",
          linkedin: comp.linkedin || "",
          description: comp.description || "",
          logo: comp.logo || "",
        });
      } else {
        setError(res.data?.message || "Failed to load company profile.");
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError(
        err.response?.data?.message ||
          "Could not load company profile. Please ensure you are logged in as a company."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccessMsg("");
      const res = await companyAPI.updateProfile(formData);
      if (res.data?.success && res.data?.company) {
        setProfile(res.data.company);
        setSuccessMsg("Profile updated successfully!");
        setIsEditing(false);
        // Clear success message after 4s
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setError(res.data?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update company profile. Please check your inputs and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || "",
        officialEmail: profile.officialEmail || "",
        hrName: profile.hrName || "",
        phone: profile.phone || "",
        industry: profile.industry || "",
        location: profile.location || "",
        website: profile.website || "",
        linkedin: profile.linkedin || "",
        description: profile.description || "",
        logo: profile.logo || "",
      });
    }
    setIsEditing(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <CompanyNavbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <span className="flex-1 font-medium">{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700 font-semibold"
            >
              ✕
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 size={20} className="shrink-0 text-green-500" />
            <span className="flex-1 font-medium">{successMsg}</span>
            <button
              onClick={() => setSuccessMsg("")}
              className="text-green-500 hover:text-green-700 font-semibold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <Loader2 size={36} className="animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">
              Loading company profile...
            </p>
          </div>
        ) : !profile ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Profile Not Available
            </h2>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              We could not find an associated company profile for your account.
            </p>
            <button
              onClick={fetchProfile}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Banner Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-800" />
              <div className="relative px-6 pb-6 pt-0 sm:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 sm:-mt-14">
                  {/* Logo / Initials */}
                  <div className="flex items-center gap-4">
                    {profile.logo ? (
                      <img
                        src={profile.logo}
                        alt={profile.companyName}
                        className="h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-md"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 text-2xl font-bold text-white shadow-md">
                        {profile.companyName
                          ? profile.companyName.substring(0, 2).toUpperCase()
                          : "CO"}
                      </div>
                    )}
                    <div className="pt-2 sm:pt-14">
                      <h1 className="text-2xl font-bold text-slate-900">
                        {profile.companyName || "Company Name"}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          <Briefcase size={12} />
                          {profile.industry || "General Industry"}
                        </span>
                        {profile.location && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <MapPin size={12} />
                            {profile.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Action Button */}
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                    >
                      <Edit3 size={15} />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                      >
                        <X size={15} />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Save size={15} />
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Content: Edit vs View Mode */}
            {isEditing ? (
              <form
                onSubmit={handleSave}
                className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Edit Company Information
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your corporate identity and contact details visible to students and administrators.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Building2
                        size={16}
                        className="absolute left-3.5 top-3 text-slate-400"
                      />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. Acme Technologies"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Official Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Official Email *
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-3 text-slate-400"
                      />
                      <input
                        type="email"
                        name="officialEmail"
                        value={formData.officialEmail}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g. hr@acme.com"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* HR / Contact Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      HR / Point of Contact Name
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3.5 top-3 text-slate-400"
                      />
                      <input
                        type="text"
                        name="hrName"
                        value={formData.hrName}
                        onChange={handleInputChange}
                        placeholder="e.g. Jane Doe"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-3.5 top-3 text-slate-400"
                      />
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. +91 9876543210"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Industry
                    </label>
                    <div className="relative">
                      <Briefcase
                        size={16}
                        className="absolute left-3.5 top-3 text-slate-400"
                      />
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        placeholder="e.g. Information Technology / Fintech"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Headquarters / Location
                    </label>
                    <div className="relative">
                      <MapPin
                        size={16}
                        className="absolute left-3.5 top-3 text-slate-400"
                      />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g. Bengaluru, India"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Website URL
                    </label>
                    <div className="relative">
                      <Globe
                        size={16}
                        className="absolute left-3.5 top-3 text-slate-400"
                      />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      LinkedIn Profile / Page
                    </label>
                    <div className="relative">
                      <Link2
                        size={16}
                        className="absolute left-3.5 top-3 text-slate-400"
                      />
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/company/example"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Logo URL */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Logo Image URL
                    </label>
                    <div className="relative">
                      <Image
                        size={16}
                        className="absolute left-3.5 top-3 text-slate-400"
                      />
                      <input
                        type="url"
                        name="logo"
                        value={formData.logo}
                        onChange={handleInputChange}
                        placeholder="https://example.com/logo.png"
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Company Description / About
                    </label>
                    <div className="relative">
                      <FileText
                        size={16}
                        className="absolute left-3.5 top-3 text-slate-400"
                      />
                      <textarea
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Provide an overview of your organization, mission, and work culture..."
                        className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    {saving ? "Saving Changes..." : "Save Profile"}
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Left 2 Cols: Details */}
                <div className="md:col-span-2 space-y-6">
                  {/* About Section */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900">
                      About the Company
                    </h2>
                    <p className="mt-3 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
                      {profile.description || (
                        <span className="italic text-slate-400">
                          No company description added yet. Click &quot;Edit Profile&quot; to add details about your company culture, technology stack, and hiring goals.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Corporate Overview Grid */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900 mb-4">
                      Corporate Details
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Industry
                        </span>
                        <p className="mt-1 text-xs font-bold text-slate-800">
                          {profile.industry || "Not specified"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Headquarters
                        </span>
                        <p className="mt-1 text-xs font-bold text-slate-800">
                          {profile.location || "Not specified"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          HR Contact
                        </span>
                        <p className="mt-1 text-xs font-bold text-slate-800">
                          {profile.hrName || "Not specified"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Phone
                        </span>
                        <p className="mt-1 text-xs font-bold text-slate-800">
                          {profile.phone || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 1 Col: Contact & Web Links */}
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900 mb-4">
                      Contact & Links
                    </h2>

                    <div className="space-y-3.5">
                      {/* Email */}
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Mail size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-slate-400">
                            Official Email
                          </p>
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {profile.officialEmail || "Not specified"}
                          </p>
                        </div>
                      </div>

                      {/* Website */}
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <Globe size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-slate-400">
                            Website
                          </p>
                          {profile.website ? (
                            <a
                              href={
                                profile.website.startsWith("http")
                                  ? profile.website
                                  : `https://${profile.website}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline truncate"
                            >
                              Visit Website
                              <ExternalLink size={11} />
                            </a>
                          ) : (
                            <p className="text-xs font-bold text-slate-800">
                              Not specified
                            </p>
                          )}
                        </div>
                      </div>

                      {/* LinkedIn */}
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Link2 size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-slate-400">
                            LinkedIn
                          </p>
                          {profile.linkedin ? (
                            <a
                              href={
                                profile.linkedin.startsWith("http")
                                  ? profile.linkedin
                                  : `https://${profile.linkedin}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline truncate"
                            >
                              View Profile
                              <ExternalLink size={11} />
                            </a>
                          ) : (
                            <p className="text-xs font-bold text-slate-800">
                              Not specified
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Status Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900 mb-2">
                      Approval Status
                    </h2>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          profile.isApproved
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            profile.isApproved ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        {profile.isApproved ? "Verified Partner" : "Pending Verification"}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                      {profile.isApproved
                        ? "Your company profile is verified by the campus placement cell."
                        : "Campus admin verification allows you to publish placement drives visible to all eligible students."}
                    </p>
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

export default CompanyProfile;
