import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  BriefcaseBusiness,
  FileText,
  CalendarCheck,
  UserCircle,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
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
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Students",
      path: "/admin/students",
      icon: GraduationCap,
    },
    {
      name: "Companies",
      path: "/admin/companies",
      icon: Building2,
    },
    {
      name: "Placement Drives",
      path: "/admin/drives",
      icon: BriefcaseBusiness,
    },
    {
      name: "Applications",
      path: "/admin/applications",
      icon: FileText,
    },
    {
      name: "Interviews",
      path: "/admin/interviews",
      icon: CalendarCheck,
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
        {/* Left: Brand Logo */}
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-2.5"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm ring-1 ring-slate-800">
            <ShieldCheck size={20} className="text-blue-400" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-slate-900">
                Placement Cell
              </h1>
              <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-700">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400">
              Campus Administration Portal
            </p>
          </div>
        </Link>

        {/* Center: Desktop Navigation */}
        <nav className="hidden items-center gap-1 xl:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={16} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Side: Profile & Mobile Toggle */}
        <div className="flex items-center gap-2">
          {/* Admin Profile Dropdown */}
          <div ref={profileRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 transition hover:bg-slate-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                AD
              </div>

              <div className="hidden text-left md:block">
                <p className="text-xs font-bold text-slate-800">
                  Campus Admin
                </p>
                <p className="text-[10px] text-slate-400">
                  Placement Officer
                </p>
              </div>

              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                <div className="border-b border-slate-100 px-3 py-2.5">
                  <p className="text-xs font-bold text-slate-900">
                    Administrator
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    sanjeev@placement.com
                  </p>
                </div>

                <Link
                  to="/admin/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  <UserCircle size={17} />
                  Admin Profile
                </Link>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 xl:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 xl:hidden">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.name}
                </NavLink>
              );
            })}

            <NavLink
              to="/admin/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <UserCircle size={18} />
              Admin Profile
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
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

export default AdminNavbar;
