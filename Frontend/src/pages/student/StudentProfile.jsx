import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { studentAPI } from "../../services/api";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const SKILL_SUGGESTIONS = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "Data Scientist",
  "AI / ML",
  "Java Developer",
  "Python Developer",
  "DevOps",
  "Cloud Computing",
  "UI / UX",
  "Cyber Security",
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

const StudentProfile = () => {
  /* =======================================================
     PROFILE STATE
  ======================================================= */

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    rollNumber: "",
    course: "B.Tech Computer Science",
    branch: "CSE - AI & ML",
    graduationYear: "2027",
    cgpa: "7.0",
  });

  /* =======================================================
     RESUME STATE
  ======================================================= */

  const [resume, setResume] = useState(null);

  /* =======================================================
     SKILLS STATE
  ======================================================= */

  const [selectedSkills, setSelectedSkills] = useState([
    "Full Stack Developer",
    "React.js",
    "Node.js",
    "MongoDB",
  ]);

  const [customSkill, setCustomSkill] = useState("");

  /* =======================================================
     ACHIEVEMENT STATE
  ======================================================= */

  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: "2nd Position - Project Exhibition",
      organization: "Tech Fusion 2.0",
      year: "2026",
    },
  ]);

  const [showAchievementForm, setShowAchievementForm] =
    useState(false);

  const [newAchievement, setNewAchievement] = useState({
    title: "",
    organization: "",
    year: "",
  });

  /* =======================================================
     PROJECT STATE
  ======================================================= */

  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "AI Trip Planner",
      description:
        "A MERN stack based AI travel planning application.",
      technologies:
        "React, Node.js, Express, MongoDB",
      link: "https://github.com/",
    },
  ]);

  const [showProjectForm, setShowProjectForm] =
    useState(false);

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    technologies: "",
    link: "",
  });

  /* =======================================================
     PROFESSIONAL LINKS STATE
  ======================================================= */

  const [professionalLinks, setProfessionalLinks] = useState([
    {
      id: 1,
      name: "GitHub",
      url: "https://github.com/",
    },
    {
      id: 2,
      name: "LinkedIn",
      url: "https://linkedin.com/",
    },
  ]);

  /* =======================================================
     FETCH PROFILE ON MOUNT
  ======================================================= */

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await studentAPI.getProfile();
      if (res.data?.success && res.data?.student) {
        const s = res.data.student;
        setProfile({
          name: s.userId?.name || "",
          email: s.userId?.email || "",
          phone: s.phone || "",
          rollNumber: s.rollNumber || "",
          course: s.course || "B.Tech Computer Science",
          branch: s.branch || "CSE - AI & ML",
          graduationYear: s.graduationYear ? String(s.graduationYear) : "2027",
          cgpa: s.cgpa !== undefined ? String(s.cgpa) : "7.0",
        });

        if (s.resume) {
          setResume({
            name:
              s.resumeOriginalName ||
              s.resume.split("/").pop() ||
              "Resume.pdf",
            url: s.resume,
          });
        } else {
          setResume(null);
        }

        if (s.skills && s.skills.length > 0) {
          setSelectedSkills(s.skills);
        }
        if (s.achievements && s.achievements.length > 0) {
          setAchievements(s.achievements);
        }
        if (s.projects && s.projects.length > 0) {
          setProjects(s.projects);
        }
        if (s.professionalLinks && s.professionalLinks.length > 0) {
          setProfessionalLinks(s.professionalLinks);
        }
      }
    } catch (err) {
      console.error("Error fetching student profile:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Could not load student profile. Please make sure you are logged in."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     PROFILE FUNCTIONS
  ======================================================= */

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      const payload = {
        name: profile.name,
        phone: profile.phone,
        rollNumber: profile.rollNumber,
        course: profile.course,
        branch: profile.branch,
        graduationYear: Number(profile.graduationYear) || 2027,
        cgpa: Number(profile.cgpa) || 7.0,
        skills: selectedSkills,
        achievements,
        projects,
        professionalLinks,
      };

      const res = await studentAPI.updateProfile(payload);
      if (res.data?.success) {
        setSuccessMsg("Profile saved successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg(res.data?.message || "Failed to save profile.");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to save profile changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrorMsg("");
  };

  /* =======================================================
     RESUME FUNCTIONS
  ======================================================= */

  const handleResumeChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMsg("Please upload a PDF file only.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Resume size should be less than 5 MB.");
      return;
    }

    try {
      setUploadingResume(true);
      setErrorMsg("");
      setSuccessMsg("");

      const formData = new FormData();
      formData.append("resume", file);

      const res = await studentAPI.uploadResume(formData);
      if (res.data?.success) {
        setResume({
          name: res.data.resumeOriginalName || file.name,
          url: res.data.resume,
          size: file.size,
        });
        setSuccessMsg(
          "Resume uploaded and saved to your profile successfully!"
        );
        setTimeout(() => setSuccessMsg(""), 5000);
      } else {
        setErrorMsg(res.data?.message || "Failed to upload resume.");
      }
    } catch (err) {
      console.error("Upload resume error:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Failed to upload resume. Please try again."
      );
    } finally {
      setUploadingResume(false);
      event.target.value = "";
    }
  };

  const handleViewResume = () => {
    if (!resume) {
      setErrorMsg("Resume is not available.");
      return;
    }

    let url = "";
    if (typeof resume === "string") {
      url = resume;
    } else if (resume.url) {
      url = resume.url;
    } else if (resume instanceof File) {
      url = URL.createObjectURL(resume);
    }

    if (url) {
      window.open(url, "_blank");
    } else {
      setErrorMsg("Resume URL not found.");
    }
  };

  /* =======================================================
     SKILL FUNCTIONS
  ======================================================= */

  const handleSkillToggle = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(
        selectedSkills.filter(
          (selectedSkill) => selectedSkill !== skill
        )
      );

      return;
    }

    setSelectedSkills([
      ...selectedSkills,
      skill,
    ]);
  };

  const handleAddCustomSkill = () => {
    const skill = customSkill.trim();

    if (!skill) return;

    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([
        ...selectedSkills,
        skill,
      ]);
    }

    setCustomSkill("");
  };

  /* =======================================================
     ACHIEVEMENT FUNCTIONS
  ======================================================= */

  const handleAchievementInputChange = (event) => {
    const { name, value } = event.target;

    setNewAchievement((previousAchievement) => ({
      ...previousAchievement,
      [name]: value,
    }));
  };

  const handleAddAchievement = () => {
    if (!newAchievement.title.trim()) {
      alert("Please enter achievement title.");
      return;
    }

    const achievement = {
      id: Date.now(),
      title: newAchievement.title,
      organization: newAchievement.organization,
      year: newAchievement.year,
    };

    setAchievements([
      ...achievements,
      achievement,
    ]);

    setNewAchievement({
      title: "",
      organization: "",
      year: "",
    });

    setShowAchievementForm(false);
  };

  const handleRemoveAchievement = (achievementId) => {
    setAchievements(
      achievements.filter(
        (achievement) =>
          achievement.id !== achievementId
      )
    );
  };

  /* =======================================================
     PROJECT FUNCTIONS
  ======================================================= */

  const handleProjectInputChange = (event) => {
    const { name, value } = event.target;

    setNewProject((previousProject) => ({
      ...previousProject,
      [name]: value,
    }));
  };

  const handleAddProject = () => {
    if (!newProject.name.trim()) {
      alert("Please enter project name.");
      return;
    }

    const project = {
      id: Date.now(),
      name: newProject.name,
      description: newProject.description,
      technologies: newProject.technologies,
      link: newProject.link,
    };

    setProjects([
      ...projects,
      project,
    ]);

    setNewProject({
      name: "",
      description: "",
      technologies: "",
      link: "",
    });

    setShowProjectForm(false);
  };

  const handleRemoveProject = (projectId) => {
    setProjects(
      projects.filter(
        (project) => project.id !== projectId
      )
    );
  };

  /* =======================================================
     PROFESSIONAL LINK FUNCTIONS
  ======================================================= */

  const handleAddProfessionalLink = () => {
    setProfessionalLinks([
      ...professionalLinks,
      {
        id: Date.now(),
        name: "",
        url: "",
      },
    ]);
  };

  const handleProfessionalLinkChange = (
    linkId,
    field,
    value
  ) => {
    setProfessionalLinks(
      professionalLinks.map((link) =>
        link.id === linkId
          ? {
              ...link,
              [field]: value,
            }
          : link
      )
    );
  };

  const handleRemoveProfessionalLink = (linkId) => {
    setProfessionalLinks(
      professionalLinks.filter(
        (link) => link.id !== linkId
      )
    );
  };

  /* =======================================================
     JSX
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            <AlertCircle size={18} className="shrink-0 text-red-500" />
            <span className="flex-1">{errorMsg}</span>
            <button
              onClick={() => setErrorMsg("")}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span className="flex-1">{successMsg}</span>
            <button
              onClick={() => setSuccessMsg("")}
              className="text-emerald-600 hover:text-emerald-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <PageHeader
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onCancel={handleCancelEdit}
          onSave={handleSaveProfile}
          saving={saving}
        />

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
            <p className="text-xs font-medium text-slate-500">
              Loading student profile...
            </p>
          </div>
        ) : (
          /* =================================================
              PROFILE CONTENT
          ================================================= */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* =================================================
                PROFILE SUMMARY
            ================================================= */}

            <ProfileSummary
              profile={profile}
              resume={resume}
              isEditing={isEditing}
              uploadingResume={uploadingResume}
              onResumeChange={handleResumeChange}
              onViewResume={handleViewResume}
            />


          {/* =================================================
              PROFILE DETAILS
          ================================================= */}

          <div className="space-y-6 lg:col-span-2">

            {/* PERSONAL INFORMATION */}

            <ProfileSection
              title="Personal Information"
              subtitle="Your basic contact information."
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <ProfileField
                  label="Full Name"
                  name="name"
                  value={profile.name}
                  isEditing={isEditing}
                  onChange={handleProfileChange}
                />

                <ProfileField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profile.email}
                  isEditing={isEditing}
                  onChange={handleProfileChange}
                />

                <ProfileField
                  label="Phone Number"
                  name="phone"
                  value={profile.phone}
                  isEditing={isEditing}
                  onChange={handleProfileChange}
                />

                <ProfileField
                  label="Roll Number"
                  name="rollNumber"
                  value={profile.rollNumber}
                  isEditing={isEditing}
                  onChange={handleProfileChange}
                />

              </div>
            </ProfileSection>


            {/* ACADEMIC INFORMATION */}

            <ProfileSection
              title="Academic Information"
              subtitle="Your educational details."
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <ProfileField
                  label="Course"
                  name="course"
                  value={profile.course}
                  isEditing={isEditing}
                  onChange={handleProfileChange}
                />

                <ProfileField
                  label="Branch"
                  name="branch"
                  value={profile.branch}
                  isEditing={isEditing}
                  onChange={handleProfileChange}
                />

                <ProfileField
                  label="Graduation Year"
                  name="graduationYear"
                  value={profile.graduationYear}
                  isEditing={isEditing}
                  onChange={handleProfileChange}
                />

                <ProfileField
                  label="CGPA"
                  name="cgpa"
                  value={profile.cgpa}
                  isEditing={isEditing}
                  onChange={handleProfileChange}
                />

              </div>
            </ProfileSection>


            {/* SKILLS */}

            <SkillsSection
              isEditing={isEditing}
              selectedSkills={selectedSkills}
              customSkill={customSkill}
              onToggleSkill={handleSkillToggle}
              onCustomSkillChange={setCustomSkill}
              onAddCustomSkill={handleAddCustomSkill}
            />


            {/* ACHIEVEMENTS */}

            <AchievementsSection
              isEditing={isEditing}
              achievements={achievements}
              showForm={showAchievementForm}
              newAchievement={newAchievement}
              onShowForm={() =>
                setShowAchievementForm(
                  !showAchievementForm
                )
              }
              onInputChange={
                handleAchievementInputChange
              }
              onAdd={handleAddAchievement}
              onRemove={handleRemoveAchievement}
            />


            {/* PROJECTS */}

            <ProjectsSection
              isEditing={isEditing}
              projects={projects}
              showForm={showProjectForm}
              newProject={newProject}
              onShowForm={() =>
                setShowProjectForm(
                  !showProjectForm
                )
              }
              onInputChange={
                handleProjectInputChange
              }
              onAdd={handleAddProject}
              onRemove={handleRemoveProject}
            />


            {/* PROFESSIONAL LINKS */}

            <ProfessionalLinksSection
              isEditing={isEditing}
              links={professionalLinks}
              onAdd={handleAddProfessionalLink}
              onChange={handleProfessionalLinkChange}
              onRemove={handleRemoveProfessionalLink}
            />

          </div>
        </div>
        )}
      </main>
    </div>
  );
};


/* =========================================================
   PAGE HEADER
========================================================= */

const PageHeader = ({
  isEditing,
  onEdit,
  onCancel,
  onSave,
  saving,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

      <div>
        <p className="text-sm font-medium text-blue-600">
          Student Profile
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your personal, academic and professional information.
        </p>
      </div>


      {!isEditing ? (
        <button
          type="button"
          onClick={onEdit}
          className="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
        >
          Edit Profile
        </button>
      ) : (
        <div className="flex w-full gap-3 sm:w-auto">

          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:flex-none"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 sm:flex-none"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>
      )}

    </div>
  );
};


/* =========================================================
   PROFILE SUMMARY
========================================================= */

const ProfileSummary = ({
  profile,
  resume,
  isEditing,
  uploadingResume,
  onResumeChange,
  onViewResume,
}) => {
  const completionPercentage = Math.min(
    100,
    (profile.name ? 15 : 0) +
      (profile.email ? 15 : 0) +
      (profile.phone ? 15 : 0) +
      (profile.branch ? 15 : 0) +
      (profile.cgpa ? 10 : 0) +
      (resume ? 20 : 0) +
      (profile.rollNumber ? 10 : 0)
  );

  const initials = profile.name
    ? profile.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  return (
    <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* Avatar */}

      <div className="flex flex-col items-center text-center">

        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
          {initials}
        </div>

        <h2 className="mt-4 text-xl font-bold text-slate-900">
          {profile.name || "Student Name"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {profile.branch || "Branch not specified"}
        </p>

        <span className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          Student
        </span>

      </div>


      {/* Profile Completion */}

      <div className="mt-7 border-t border-slate-100 pt-6">

        <div className="flex justify-between">

          <p className="text-sm font-medium text-slate-700">
            Profile Completion
          </p>

          <span className="text-sm font-bold text-blue-600">
            {completionPercentage}%
          </span>

        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          {completionPercentage >= 80
            ? "Great job! Your profile has sufficient information for campus drives."
            : "Complete your profile and upload your resume to apply for placement drives."}
        </p>

      </div>


      {/* Resume */}

      <div className="mt-6 border-t border-slate-100 pt-6">

        <h3 className="text-sm font-semibold text-slate-900">
          Resume
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Keep your latest resume updated.
        </p>


        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-xs font-bold text-red-500">
              PDF
            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-semibold text-slate-800">
                {resume
                  ? resume.name || "Resume.pdf"
                  : "No resume uploaded"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {resume
                  ? resume.size
                    ? `${(resume.size / 1024 / 1024).toFixed(2)} MB`
                    : "Uploaded PDF Document"
                  : "PDF • No file selected"}
              </p>

            </div>

          </div>


          <div className="mt-4 space-y-2">
            {resume && (
              <button
                type="button"
                onClick={onViewResume}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                View Resume
              </button>
            )}

            <label
              className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                resume
                  ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } ${uploadingResume ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {uploadingResume ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading Resume...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>{resume ? "Update Resume" : "Upload Resume"}</span>
                </>
              )}

              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                disabled={uploadingResume}
                onChange={onResumeChange}
              />
            </label>
          </div>

        </div>

        <p className="mt-2 text-center text-[11px] text-slate-400">
          PDF only • Maximum 5 MB
        </p>

      </div>

    </div>
  );
};


/* =========================================================
   SKILLS SECTION
========================================================= */

const SkillsSection = ({
  isEditing,
  selectedSkills,
  customSkill,
  onToggleSkill,
  onCustomSkillChange,
  onAddCustomSkill,
}) => {
  return (
    <ProfileSection
      title="Skills & Expertise"
      subtitle="Select your areas of expertise."
    >

      {/* NORMAL MODE */}

      {!isEditing && (
        <div className="flex flex-wrap gap-2">

          {selectedSkills.length > 0 ? (
            selectedSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-400">
              No skills added yet.
            </p>
          )}

        </div>
      )}


      {/* EDIT MODE */}

      {isEditing && (
        <>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Suggested Skills
          </p>

          <div className="flex flex-wrap gap-2">

            {SKILL_SUGGESTIONS.map((skill) => {

              const isSelected =
                selectedSkills.includes(skill);

              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() =>
                    onToggleSkill(skill)
                  }
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {skill}
                </button>
              );
            })}

          </div>


          {/* Selected Skills */}

          <div className="mt-6 border-t border-slate-100 pt-5">

            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Selected Skills
            </p>

            <div className="flex flex-wrap gap-2">

              {selectedSkills.length > 0 ? (
                selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  Select some skills above.
                </p>
              )}

            </div>

          </div>


          {/* Custom Skill */}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">

            <input
              type="text"
              value={customSkill}
              onChange={(event) =>
                onCustomSkillChange(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onAddCustomSkill();
                }
              }}
              placeholder="Add another skill..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            <button
              type="button"
              onClick={onAddCustomSkill}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add Skill
            </button>

          </div>
        </>
      )}

    </ProfileSection>
  );
};


/* =========================================================
   ACHIEVEMENTS SECTION
========================================================= */

const AchievementsSection = ({
  isEditing,
  achievements,
  showForm,
  newAchievement,
  onShowForm,
  onInputChange,
  onAdd,
  onRemove,
}) => {
  return (
    <ProfileSection
      title="Achievements"
      subtitle="Add your academic, technical or extracurricular achievements."
      action={
        isEditing && (
          <button
            type="button"
            onClick={onShowForm}
            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
          >
            + Add Achievement
          </button>
        )
      }
    >

      {/* ADD FORM */}

      {showForm && (
        <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <input
              type="text"
              name="title"
              value={newAchievement.title}
              onChange={onInputChange}
              placeholder="Achievement title"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="text"
              name="organization"
              value={newAchievement.organization}
              onChange={onInputChange}
              placeholder="Organization"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="text"
              name="year"
              value={newAchievement.year}
              onChange={onInputChange}
              placeholder="Year"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

          </div>

          <div className="mt-4 flex justify-end gap-2">

            <button
              type="button"
              onClick={onShowForm}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onAdd}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Add Achievement
            </button>

          </div>

        </div>
      )}


      {/* ACHIEVEMENT LIST */}

      {achievements.length === 0 ? (
        <EmptyState text="No achievements added yet." />
      ) : (
        <div className="space-y-3">

          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
            >

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                🏆
              </div>

              <div className="min-w-0 flex-1">

                <h3 className="text-sm font-semibold text-slate-800">
                  {achievement.title}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {achievement.organization}
                  {achievement.year &&
                    ` • ${achievement.year}`}
                </p>

              </div>

              {isEditing && (
                <button
                  type="button"
                  onClick={() =>
                    onRemove(achievement.id)
                  }
                  className="text-xs font-semibold text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}

            </div>
          ))}

        </div>
      )}

    </ProfileSection>
  );
};


/* =========================================================
   PROJECTS SECTION
========================================================= */

const ProjectsSection = ({
  isEditing,
  projects,
  showForm,
  newProject,
  onShowForm,
  onInputChange,
  onAdd,
  onRemove,
}) => {
  return (
    <ProfileSection
      title="Projects"
      subtitle="Showcase your important academic and personal projects."
      action={
        isEditing && (
          <button
            type="button"
            onClick={onShowForm}
            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
          >
            + Add Project
          </button>
        )
      }
    >

      {/* ADD PROJECT FORM */}

      {showForm && (
        <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">

          <div className="space-y-4">

            <input
              type="text"
              name="name"
              value={newProject.name}
              onChange={onInputChange}
              placeholder="Project name"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <textarea
              name="description"
              rows={3}
              value={newProject.description}
              onChange={onInputChange}
              placeholder="Project description"
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="text"
              name="technologies"
              value={newProject.technologies}
              onChange={onInputChange}
              placeholder="Technologies used"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="url"
              name="link"
              value={newProject.link}
              onChange={onInputChange}
              placeholder="Project / GitHub link"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

          </div>

          <div className="mt-4 flex justify-end gap-2">

            <button
              type="button"
              onClick={onShowForm}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onAdd}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Add Project
            </button>

          </div>

        </div>
      )}


      {/* PROJECT LIST */}

      {projects.length === 0 ? (
        <EmptyState text="No projects added yet." />
      ) : (
        <div className="space-y-4">

          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-slate-200 p-4"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0 flex-1">

                  <h3 className="font-semibold text-slate-900">
                    {project.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {project.description}
                  </p>

                  {project.technologies && (
                    <div className="mt-3 flex flex-wrap gap-2">

                      {project.technologies
                        .split(",")
                        .map((technology) => (
                          <span
                            key={technology.trim()}
                            className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                          >
                            {technology.trim()}
                          </span>
                        ))}

                    </div>
                  )}

                  {project.link && (
                    <a
                      href={
                        project.link.startsWith("http")
                          ? project.link
                          : `https://${project.link}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      View Project →
                    </a>
                  )}

                </div>

                {isEditing && (
                  <button
                    type="button"
                    onClick={() =>
                      onRemove(project.id)
                    }
                    className="shrink-0 text-xs font-semibold text-red-500"
                  >
                    Remove
                  </button>
                )}

              </div>

            </div>
          ))}

        </div>
      )}

    </ProfileSection>
  );
};


/* =========================================================
   PROFESSIONAL LINKS SECTION
========================================================= */

const ProfessionalLinksSection = ({
  isEditing,
  links,
  onAdd,
  onChange,
  onRemove,
}) => {
  return (
    <ProfileSection
      title="Professional Links"
      subtitle="Add GitHub, LinkedIn, portfolio or any other professional profile."
      action={
        isEditing && (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
          >
            + Add Professional Link
          </button>
        )
      }
    >

      {links.length === 0 ? (
        <EmptyState text="No professional links added yet." />
      ) : (
        <div className="space-y-4">

          {links.map((link) => (
            <div
              key={link.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >

              {isEditing ? (

                /* EDIT MODE */

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[180px_1fr_auto]">

                  <input
                    type="text"
                    value={link.name}
                    onChange={(event) =>
                      onChange(
                        link.id,
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Link name"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <input
                    type="url"
                    value={link.url}
                    onChange={(event) =>
                      onChange(
                        link.id,
                        "url",
                        event.target.value
                      )
                    }
                    placeholder="https://example.com"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      onRemove(link.id)
                    }
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                  >
                    Remove
                  </button>

                </div>

              ) : (

                /* NORMAL MODE */

                <div className="flex items-center justify-between gap-4">

                  <div className="min-w-0">

                    <p className="text-sm font-semibold text-slate-800">
                      {link.name || "Professional Link"}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {link.url}
                    </p>

                  </div>

                  {link.url && (
                    <a
                      href={
                        link.url.startsWith("http")
                          ? link.url
                          : `https://${link.url}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                    >
                      Visit
                    </a>
                  )}

                </div>
              )}

            </div>
          ))}

        </div>
      )}

      {isEditing && (
        <p className="mt-3 text-xs text-slate-400">
          You can add as many professional links as you want.
        </p>
      )}

    </ProfileSection>
  );
};


/* =========================================================
   REUSABLE PROFILE SECTION
========================================================= */

const ProfileSection = ({
  title,
  subtitle,
  action,
  children,
}) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {subtitle}
          </p>
        </div>

        {action}

      </div>

      {children}

    </section>
  );
};


/* =========================================================
   REUSABLE PROFILE FIELD
========================================================= */

const ProfileField = ({
  label,
  name,
  value,
  type = "text",
  isEditing,
  onChange,
}) => {
  return (
    <div>

      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      {isEditing ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
      ) : (
        <div className="break-all rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800">
          {value || "Not added"}
        </div>
      )}

    </div>
  );
};


/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({ text }) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">

      <p className="text-sm text-slate-400">
        {text}
      </p>

    </div>
  );
};


export default StudentProfile;