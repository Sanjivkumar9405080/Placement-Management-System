// ==========================================
// SMART STUDENT ELIGIBILITY & MATCHING UTILITY
// ==========================================

const deriveAcademicYear = (academicYear, graduationYear) => {
  if (
    academicYear &&
    ["1st Year", "2nd Year", "3rd Year", "4th Year"].includes(academicYear)
  ) {
    return academicYear;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  // In Indian/US college academic cycles: July-December of year Y belongs to AY Y-(Y+1),
  // meaning 4th-year students graduate in year Y+1.
  const seniorGradYear = now.getMonth() >= 5 ? currentYear + 1 : currentYear;
  const grad = Number(graduationYear) || seniorGradYear;
  const diff = grad - seniorGradYear;

  if (diff <= 0) return "4th Year";
  if (diff === 1) return "3rd Year";
  if (diff === 2) return "2nd Year";
  return "1st Year";
};

// Normalize skills for relaxed comparison (e.g. "react.js" vs "react", "node.js" vs "node")
const normalizeSkill = (skill) => {
  return String(skill || "")
    .toLowerCase()
    .replace(/[.\-_]/g, "")
    .trim();
};

const skillMatches = (studentSkills = [], driveSkill = "") => {
  if (Array.isArray(driveSkill)) {
    return driveSkill.every((singleSkill) => skillMatches(studentSkills, singleSkill));
  }
  const normDrive = normalizeSkill(driveSkill);
  if (!normDrive) return true;

  return studentSkills.some((s) => {
    const normStudent = normalizeSkill(s);
    return (
      normStudent === normDrive ||
      normStudent.includes(normDrive) ||
      normDrive.includes(normStudent)
    );
  });
};

const branchMatches = (studentBranch = "", allowedBranches = []) => {
  if (!allowedBranches || allowedBranches.length === 0) return true;
  if (!studentBranch) return false;

  const sBranch = studentBranch.trim().toLowerCase();

  return allowedBranches.some((b) => {
    const dBranch = b.trim().toLowerCase();
    if (dBranch === "all" || dBranch === "all branches") return true;
    if (dBranch === sBranch) return true;
    if (sBranch.includes(dBranch) || dBranch.includes(sBranch)) return true;

    // Cross-aliases
    const isCSEStudent =
      sBranch.includes("cse") ||
      sBranch.includes("computer") ||
      sBranch.includes("software");
    const isCSEDrive =
      dBranch.includes("cse") ||
      dBranch.includes("computer") ||
      dBranch.includes("software");
    if (isCSEStudent && isCSEDrive) return true;

    const isITStudent = sBranch.includes("it") || sBranch.includes("information");
    const isITDrive = dBranch.includes("it") || dBranch.includes("information");
    if (isITStudent && isITDrive) return true;

    const isAIMLStudent =
      sBranch.includes("ai") ||
      sBranch.includes("ml") ||
      sBranch.includes("artificial") ||
      sBranch.includes("machine learning");
    const isAIMLDrive =
      dBranch.includes("ai") ||
      dBranch.includes("ml") ||
      dBranch.includes("artificial") ||
      dBranch.includes("machine learning");
    if (isAIMLStudent && isAIMLDrive) return true;

    return false;
  });
};

/**
 * Evaluates whether a student is eligible for a given placement drive.
 *
 * @param {Object} student - Student document with cgpa, branch, academicYear, graduationYear, skills, backlogs
 * @param {Object} drive - PlacementDrive document with eligibility, skills
 * @returns {Object} result with isEligible, reasons, ineligibilityReason, breakdown
 */
const evaluateStudentEligibility = (student, drive) => {
  if (!student || !drive) {
    return {
      isEligible: false,
      reasons: ["Missing student profile or placement drive information."],
      ineligibilityReason: "Incomplete student profile or drive information.",
      breakdown: {},
    };
  }

  const eligibility = drive.eligibility || {};
  const reasons = [];
  const ineligibilityReasons = [];

  // 1. Minimum CGPA Check
  const minCGPA = Number(eligibility.minCGPA) || 0;
  const studentCGPA = Number(student.cgpa !== undefined ? student.cgpa : 7.0);
  let cgpaEligible = true;

  if (minCGPA > 0) {
    if (studentCGPA >= minCGPA) {
      reasons.push(`CGPA requirement met (${studentCGPA} >= ${minCGPA})`);
    } else {
      cgpaEligible = false;
      const msg = `CGPA below minimum requirement (Required: ${minCGPA}, Your CGPA: ${studentCGPA})`;
      reasons.push(msg);
      ineligibilityReasons.push(msg);
    }
  } else {
    reasons.push("No minimum CGPA requirement");
  }

  // 2. Branch Check
  const allowedBranches = Array.isArray(eligibility.branches)
    ? eligibility.branches.filter(Boolean)
    : [];
  let branchEligible = true;

  if (allowedBranches.length > 0) {
    if (branchMatches(student.branch, allowedBranches)) {
      reasons.push(`Branch matched (${student.branch || "General"})`);
    } else {
      branchEligible = false;
      const msg = `Branch not eligible (Allowed: ${allowedBranches.join(", ")}, Your Branch: ${student.branch || "Not specified"})`;
      reasons.push(msg);
      ineligibilityReasons.push(msg);
    }
  } else {
    reasons.push("Open to all branches");
  }

  // 3. Academic Year / Passing Year Check
  const studentAcademicYear = deriveAcademicYear(
    student.academicYear,
    student.graduationYear
  );
  const studentGradYear = Number(student.graduationYear) || 2027;

  let yearEligible = true;
  const allowedAcademicYears = Array.isArray(eligibility.academicYears)
    ? eligibility.academicYears.filter(Boolean)
    : [];
  const passingYearReq = Number(eligibility.passingYear);

  if (allowedAcademicYears.length > 0) {
    const matchesYear = allowedAcademicYears.some(
      (y) => y.toLowerCase() === studentAcademicYear.toLowerCase()
    );
    if (matchesYear) {
      reasons.push(`Academic Year matched (${studentAcademicYear})`);
    } else {
      yearEligible = false;
      const msg = `Academic year not eligible (Allowed: ${allowedAcademicYears.join(", ")}, Your Year: ${studentAcademicYear})`;
      reasons.push(msg);
      ineligibilityReasons.push(msg);
    }
  } else if (passingYearReq && passingYearReq > 0) {
    if (studentGradYear === passingYearReq) {
      reasons.push(`Graduation batch matched (${studentGradYear})`);
    } else {
      yearEligible = false;
      const msg = `Graduation batch not eligible (Allowed: ${passingYearReq}, Your Batch: ${studentGradYear})`;
      reasons.push(msg);
      ineligibilityReasons.push(msg);
    }
  } else {
    reasons.push("Open to all academic batches");
  }

  // 4. Backlog Criteria Check
  const maxBacklogs =
    eligibility.maxBacklogs !== undefined
      ? Number(eligibility.maxBacklogs)
      : eligibility.backlogCriteria &&
        eligibility.backlogCriteria.toLowerCase().includes("no active")
      ? 0
      : undefined;

  const studentBacklogs = Number(student.backlogs) || 0;
  let backlogEligible = true;

  if (maxBacklogs !== undefined) {
    if (studentBacklogs <= maxBacklogs) {
      reasons.push(
        `Backlog criteria met (${studentBacklogs} active backlogs <= max ${maxBacklogs})`
      );
    } else {
      backlogEligible = false;
      const msg = `Exceeds allowed backlogs (Max allowed: ${maxBacklogs}, Your active backlogs: ${studentBacklogs})`;
      reasons.push(msg);
      ineligibilityReasons.push(msg);
    }
  }

  // 5. Technical Skills Check
  const driveSkills = Array.isArray(drive.skills) ? drive.skills.filter(Boolean) : [];
  const studentSkills = Array.isArray(student.skills) ? student.skills : [];
  const matchedSkills = [];
  const missingSkills = [];

  if (driveSkills.length > 0) {
    driveSkills.forEach((skill) => {
      if (skillMatches(studentSkills, skill)) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    // If drive has skills, check if candidate has at least one matching core skill
    // or if strict skill requirement is enforced
    if (matchedSkills.length > 0) {
      reasons.push(`Matched skills: ${matchedSkills.join(", ")}`);
    }
    if (missingSkills.length > 0 && matchedSkills.length === 0) {
      // If student has 0 matched skills from required skills, mark as missing skills
      const msg = `Missing required skills: ${missingSkills.join(", ")}`;
      reasons.push(msg);
      ineligibilityReasons.push(msg);
    }
  }

  const skillsEligible =
    driveSkills.length === 0 ||
    matchedSkills.length > 0;

  const isEligible =
    cgpaEligible &&
    branchEligible &&
    yearEligible &&
    backlogEligible &&
    skillsEligible &&
    ineligibilityReasons.length === 0;

  return {
    isEligible,
    reasons,
    ineligibilityReason:
      ineligibilityReasons.length > 0
        ? ineligibilityReasons.join(" • ")
        : "Meets all criteria",
    breakdown: {
      cgpa: {
        eligible: cgpaEligible,
        required: minCGPA,
        actual: studentCGPA,
      },
      branch: {
        eligible: branchEligible,
        required: allowedBranches,
        actual: student.branch || "General",
      },
      year: {
        eligible: yearEligible,
        required: allowedAcademicYears.length > 0 ? allowedAcademicYears : [passingYearReq],
        actual: studentAcademicYear,
        graduationYear: studentGradYear,
      },
      passingYear: {
        eligible: yearEligible,
        required: passingYearReq || allowedAcademicYears,
        actual: studentGradYear,
      },
      backlogs: {
        eligible: backlogEligible,
        required: maxBacklogs,
        actual: studentBacklogs,
      },
      skills: {
        eligible: skillsEligible,
        required: driveSkills,
        matched: matchedSkills,
        missing: missingSkills,
      },
    },
  };
};

module.exports = {
  deriveAcademicYear,
  evaluateStudentEligibility,
  branchMatches,
  skillMatches,
};
