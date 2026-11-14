# 🎓 Placement Management System

A full-stack web application designed to simplify and manage the college placement process. The Placement Management System provides a centralized platform where students, companies, and administrators can manage placement activities, job opportunities, applications, and interview schedules.

## 🌐 Live Demo

**Live Application:** [Placement Management System](https://https://placifys.netlify.app/.vercel.app/)

**GitHub Repository:** [View Source Code](https://github.com/Sanjivkumar9405080/Placement-Management-System)

---

## 📌 Project Overview

Managing campus placements manually can be time-consuming for students, companies, and college placement departments.

The Placement Management System solves this problem by providing a digital platform that organizes the placement process.

It allows students to access placement opportunities, companies to manage recruitment activities, and administrators to manage placement drives and related information.

The main objective is to make the campus recruitment process more organized, efficient, and accessible.

## ✨ Key Features

### 👨‍🎓 Student Module
- Student registration and login.
- Manage student information.
- View available placement opportunities.
- Apply for placement opportunities.
- Track application status.
- Receive notifications.
- View interview schedules.

### 🏢 Company Module
- Company registration and login.
- Manage company information.
- Access placement drives.
- Manage recruitment activities.
- View student applications.
- Participate in the interview process.

### 👨‍💼 Admin Module
- Manage student and company information.
- Manage placement drives.
- Monitor placement activities.
- Manage applications and interviews.
- Access placement-related information.

### 🔐 Authentication & Security
- JWT-based authentication.
- Password hashing using bcryptjs.
- Protected backend API routes.
- Secure user authentication.

### 📂 File Management
- File upload handling using Multer.
- Cloudinary integration for cloud-based file storage.

### 📅 Interview Management
- Interview scheduling.
- Interview-related records.
- Application and interview tracking.

### 🔔 Notification Management
- Notification-related API functionality.
- Updates related to placement activities.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Frontend build tool |
| Tailwind CSS | UI styling |
| React Router | Client-side navigation |
| Axios | API communication |
| Node.js | Backend runtime |
| Express.js | Backend framework |
| MongoDB | NoSQL database |
| Mongoose | Database management |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Multer | File upload handling |
| Cloudinary | Cloud file storage |

---

## 🏗️ Project Architecture

The project follows a client-server architecture.

```text
Placement-Management-System/
│
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
└── README.md
```

*Note: The folder structure above illustrates the main application architecture.*

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/Sanjivkumar9405080/Placement-Management-System.git
```

```bash
cd Placement-Management-System
```

### 2. Setup Backend

Navigate to the backend directory:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure your environment variables according to the backend configuration.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:

```bash
npm run dev
```

### 3. Setup Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

---

## 🔄 How the System Works

1. **User Registration:** Students and companies create their accounts.
2. **Authentication:** Users log in through the authentication system.
3. **Placement Management:** Administrators manage placement drives and related information.
4. **Job Applications:** Students explore opportunities and submit applications.
5. **Application Tracking:** Application-related information is managed through the system.
6. **Interview Scheduling:** Interview schedules and related records are managed.
7. **Notifications:** Users can access placement-related notifications.

---

## 🎯 Project Objectives

- Digitize the college placement process.
- Reduce manual placement management work.
- Provide a centralized platform for students and companies.
- Improve communication and placement coordination.
- Make application and interview tracking easier.

## 🚀 Future Enhancements

- AI-based job recommendations.
- Resume analysis and skill matching.
- Real-time notifications.
- Advanced placement analytics dashboard.
- Automated eligibility checking.
- Interview performance tracking.

## 👨‍💻 Developer

**Sanjiv Kumar**

B.Tech – Computer Science

GitHub: [@Sanjivkumar9405080](https://github.com/Sanjivkumar9405080)

---

## 📄 License

This project is developed for educational and learning purposes.