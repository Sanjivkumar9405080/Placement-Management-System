import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach Authorization Bearer token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Placement Drive API helpers
export const placementDrivesAPI = {
  getActive: () => api.get("/placement-drives/active"),
  getById: (id) => api.get(`/placement-drives/${id}`),
  getCompanyDrives: () => api.get("/placement-drives/company"),
  create: (driveData) => api.post("/placement-drives", driveData),
  update: (id, driveData) => api.put(`/placement-drives/${id}`, driveData),
  close: (id) => api.put(`/placement-drives/${id}/close`),
};

// Application API helpers
export const applicationsAPI = {
  apply: (driveId) => api.post("/applications/apply", { driveId }),
  getMyApplications: () => api.get("/applications/my-applications"),
  getCompanyApplications: () => api.get("/applications/company"),
  getApplicantDetails: (id) => api.get(`/applications/company/${id}`),
  updateStatus: (id, status) =>
    api.put(`/applications/company/${id}/status`, { status }),
};

// Interview API helpers
export const interviewsAPI = {
  scheduleInterview: (interviewData) => api.post("/interviews", interviewData),
  getCompanyInterviews: () => api.get("/interviews/company"),
  getCompanyInterviewById: (id) => api.get(`/interviews/company/${id}`),
  updateInterview: (id, data) => api.put(`/interviews/${id}`, data),
  updateInterviewStatus: (id, status) =>
    api.put(`/interviews/${id}/status`, { status }),
  cancelInterview: (id) => api.delete(`/interviews/${id}`),
  getMyInterviews: () => api.get("/interviews/my-interviews"),
};

// Company API helpers
export const companyAPI = {
  getProfile: () => api.get("/company/profile"),
  updateProfile: (data) => api.put("/company/profile", data),
};

// Student API helpers
export const studentAPI = {
  getProfile: () => api.get("/students/profile"),
  updateProfile: (data) => api.put("/students/profile", data),
  uploadResume: (formData) =>
    api.post("/students/upload-resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getEligibleDrives: () => api.get("/students/eligible-drives"),
};

// Admin API helpers
export const adminAPI = {
  getDashboardStats: () => api.get("/admin/dashboard"),
  getStudents: (params) => api.get("/admin/students", { params }),
  getStudentDetails: (id) => api.get(`/admin/students/${id}`),
  getCompanies: (params) => api.get("/admin/companies", { params }),
  getAdminCompanies: (params) => api.get("/admin/companies", { params }),
  getCompanyDetails: (id) => api.get(`/admin/companies/${id}`),
  getAdminCompanyDetails: (id) => api.get(`/admin/companies/${id}`),
  getCompanyStatistics: (id) => api.get(`/admin/companies/${id}/statistics`),
  getAdminCompanyStatistics: (id) =>
    api.get(`/admin/companies/${id}/statistics`),
  updateCompanyStatus: (id, status) =>
    api.put(`/admin/companies/${id}/status`, { status }),
  approveCompany: (id) => api.put(`/admin/companies/${id}/approve`),
  rejectCompany: (id) => api.put(`/admin/companies/${id}/reject`),
  getAdminPlacementDrives: (params) => api.get("/admin/drives", { params }),
  getPlacementDrives: (params) => api.get("/admin/drives", { params }),
  getAdminPlacementDriveDetails: (id) => api.get(`/admin/drives/${id}`),
  getAdminDriveApplicants: (id) => api.get(`/admin/drives/${id}/applicants`),
  closeAdminPlacementDrive: (id) => api.put(`/admin/drives/${id}/close`),
  getAdminApplications: (params) => api.get("/admin/applications", { params }),
  getApplications: (params) => api.get("/admin/applications", { params }),
  getAdminApplicationDetails: (id) => api.get(`/admin/applications/${id}`),
  getProfile: () => api.get("/admin/profile"),
};

export default api;