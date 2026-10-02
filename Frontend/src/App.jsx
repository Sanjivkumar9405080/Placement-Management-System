import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import PlacementDriveDetails from "./pages/student/PlacementDriveDetails";
import Drives from "./pages/student/Drives";
import Applications from "./pages/student/Applications";
import Notifications from "./pages/student/Notifications";

import InterviewSchedule from "./pages/student/InterviewSchedule";
import StudentInterviews from "./pages/student/StudentInterviews";
import PlacementResults from "./pages/student/PlacementResults";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyDrives from "./pages/company/CompanyDrives";
import CompanyApplicants from "./pages/company/CompanyApplicants";
import CompanyApplicantDetails from "./pages/company/CompanyApplicantDetails";
import CompanyInterviews from "./pages/company/CompanyInterviews";
import CompanyProfile from "./pages/company/CompanyProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminStudentDetails from "./pages/admin/AdminStudentDetails";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminCompanyDetails from "./pages/admin/AdminCompanyDetails";
import AdminPlacementDrives from "./pages/admin/AdminPlacementDrives";
import AdminPlacementDriveDetails from "./pages/admin/AdminPlacementDriveDetails";
import AdminDriveApplicants from "./pages/admin/AdminDriveApplicants";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminApplicationDetails from "./pages/admin/AdminApplicationDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student */}
        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/student/profile"
          element={<StudentProfile />}
        />

        {/* Placement Drive & Application Routes */}
        <Route
          path="/student/drives"
          element={<Drives />}
        />
        <Route
          path="/student/applications"
          element={<Applications />}
        />
        <Route
          path="/student/drive/:id"
          element={<PlacementDriveDetails />}
        />
        <Route
          path="/student/drive"
          element={<PlacementDriveDetails />}
        />
        <Route
          path="/placementDriveDetails"
          element={<PlacementDriveDetails />}
        />
        <Route
          path="/placement-drive-details"
          element={<PlacementDriveDetails />}
        />

        <Route
          path="/student/notifications"
          element={<Notifications />}
        />
        <Route
          path="/notifications"
          element={<Notifications />}
        />

        {/* Company */}
        <Route
         path="/company/dashboard"
        element={<CompanyDashboard />}
         />

         <Route
  path="/company/drives"
  element={<CompanyDrives />}
/>

<Route
  path="/company/applicants"
  element={<CompanyApplicants />}
/>

<Route
  path="/company/applicants/:id"
  element={<CompanyApplicantDetails />}
/>

<Route
  path="/company/interviews"
  element={<CompanyInterviews />}
/>

<Route
  path="/company/interviews/:id"
  element={<CompanyInterviews />}
/>

<Route
  path="/company/profile"
  element={<CompanyProfile />}
/>

        {/* Admin */}
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
        <Route
          path="/admin/students"
          element={<AdminStudents />}
        />
        <Route
          path="/admin/students/:id"
          element={<AdminStudentDetails />}
        />
        <Route
          path="/admin/companies"
          element={<AdminCompanies />}
        />
        <Route
          path="/admin/companies/:id"
          element={<AdminCompanyDetails />}
        />
        <Route
          path="/admin/drives"
          element={<AdminPlacementDrives />}
        />
        <Route
          path="/admin/drives/:id"
          element={<AdminPlacementDriveDetails />}
        />
        <Route
          path="/admin/drives/:id/applicants"
          element={<AdminDriveApplicants />}
        />
        <Route
          path="/admin/applications"
          element={<AdminApplications />}
        />
        <Route
          path="/admin/applications/:id"
          element={<AdminApplicationDetails />}
        />

        <Route
          path="/student/interviews"
          element={<StudentInterviews />}
        />
        <Route
          path="/student/interview-schedule"
          element={<StudentInterviews />}
        />
        <Route
          path="/student/interview"
          element={<StudentInterviews />}
        />
        <Route
          path="/interview-schedule"
          element={<StudentInterviews />}
        />

        <Route
          path="/student/results"
          element={<PlacementResults />}
        />
        <Route
          path="/student/placement-results"
          element={<PlacementResults />}
        />
        <Route
          path="/placement-results"
          element={<PlacementResults />}
        />
        <Route
          path="/results"
          element={<PlacementResults />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;