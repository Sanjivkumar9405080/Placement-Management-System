import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCircle,
  Users,
  X,
} from "lucide-react";

const CompanyNavbar = () => {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  /* Close dropdown when clicking outside */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    {
      name: "Dashboard",
      path: "/company/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Placement Drives",
      path: "/company/drives",
      icon: BriefcaseBusiness,
    },
    {
      name: "Applicants",
      path: "/company/applicants",
      icon: Users,
    },
    {
      name: "Interviews",
      path: "/company/interviews",
      icon: CalendarDays,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}

        <Link
          to="/company/dashboard"
          className="flex items-center gap-2.5"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <BriefcaseBusiness size={19} />
          </div>

          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-slate-900">
              Placement Portal
            </h1>

            <p className="text-[10px] font-medium text-slate-400">
              Company Panel
            </p>
          </div>
        </Link>


        {/* Desktop Navigation */}

        <nav className="hidden items-center gap-1 lg:flex">

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={16} />
                {item.name}
              </NavLink>
            );
          })}

        </nav>


        {/* Right Side */}

        <div className="flex items-center gap-2">

          {/* Notifications */}

          <div
            ref={notificationRef}
            className="relative"
          >

            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((prev) => !prev);
                setProfileOpen(false);
              }}
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                notificationsOpen
                  ? "border-blue-200 bg-blue-50 text-blue-600"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
              aria-label="Notifications"
            >
              <Bell size={18} />

              {/* Notification Badge */}

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>


            {/* Notification Dropdown */}

            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Notifications
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      Recent placement updates
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                    3 New
                  </span>

                </div>


                <div className="divide-y divide-slate-100">

                  <Notification
                    title="New Application"
                    message="A student applied for MERN Stack Developer."
                  />

                  <Notification
                    title="Interview Scheduled"
                    message="Technical interview is scheduled tomorrow."
                  />

                  <Notification
                    title="New Applicant"
                    message="5 new applications received."
                  />

                </div>


                <Link
                  to="/company/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="block border-t border-slate-100 px-4 py-3 text-center text-xs font-semibold text-blue-600 hover:bg-blue-50"
                >
                  View all notifications
                </Link>

              </div>
            )}

          </div>


          {/* Profile */}

          <div
            ref={profileRef}
            className="relative hidden sm:block"
          >

            <button
              type="button"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 transition hover:bg-slate-50"
            >

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                TN
              </div>

              <div className="hidden text-left md:block">
                <p className="text-xs font-bold text-slate-800">
                  TechNova
                </p>

                <p className="text-[10px] text-slate-400">
                  Company
                </p>
              </div>

              <ChevronDown
                size={14}
                className="text-slate-400"
              />

            </button>


            {/* Profile Dropdown */}

            {profileOpen && (
              <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">

                <Link
                  to="/company/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  <UserCircle size={17} />
                  Company Profile
                </Link>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Logout
                </button>

              </div>
            )}

          </div>


          {/* Mobile Menu Button */}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={19} />
            ) : (
              <Menu size={19} />
            )}
          </button>

        </div>

      </div>


      {/* Mobile Navigation */}

      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">

          <nav className="space-y-1">

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.name}
                </NavLink>
              );
            })}


            {/* Mobile Profile */}

            <NavLink
              to="/company/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <UserCircle size={18} />
              Company Profile
            </NavLink>


            {/* Mobile Logout */}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-500 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>

          </nav>

        </div>
      )}

    </header>
  );
};


/* =========================================================
   NOTIFICATION ITEM
========================================================= */

const Notification = ({ title, message }) => {
  return (
    <div className="flex gap-3 px-4 py-3 hover:bg-slate-50">

      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />

      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
          {message}
        </p>
      </div>

    </div>
  );
};

export default CompanyNavbar;