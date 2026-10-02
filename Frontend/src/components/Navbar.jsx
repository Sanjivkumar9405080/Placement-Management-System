import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Component states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Refs for click outside handling
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);

  // Mock placement notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Google Campus Drive 2026",
      desc: "Round 1 Online Assessment shortlist has been released.",
      time: "15m ago",
      unread: true,
      category: "Shortlist",
    },
    {
      id: 2,
      title: "Microsoft Technical Interview",
      desc: "Slot confirmed for tomorrow at 10:30 AM via Teams.",
      time: "2h ago",
      unread: true,
      category: "Interview",
    },
    {
      id: 3,
      title: "Placement Cell Notice",
      desc: "Resume verification deadline ends today at 6:00 PM.",
      time: "5h ago",
      unread: false,
      category: "Notice",
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setProfileDropdownOpen(false);
        setNotificationsOpen(false);
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate("/login");
  };

  // Primary navigation links
  const navLinks = [
    {
      name: "Dashboard",
      path: "/student/dashboard",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: "Drives",
      path: "/student/drives",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Applications",
      path: "/student/applications",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: "Interviews",
      path: "/student/interviews",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Results",
      path: "/student/results",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // User avatar initials
  const userDisplayName = user?.name || "Student User";
  const userEmail = user?.email || "student@placementhub.edu";
  const userRole = user?.role || "student";
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900 border-b border-slate-800 text-white select-none backdrop-blur-md bg-slate-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          
          {/* ================= LEFT: BRAND ================= */}
          <div className="flex items-center gap-6">
            <Link
              to="/student/dashboard"
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-extrabold text-xl tracking-tight group-hover:scale-105 transition-transform duration-200">
                P
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                  PlacementHub
                </span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
                  Campus Placement System
                </span>
              </div>
            </Link>

            {/* Subtle Divider (Desktop) */}
            <div className="h-7 w-px bg-slate-800 hidden lg:block" />
          </div>

          {/* ================= CENTER: NAVIGATION ================= */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent"
                  }`
                }
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>

          {/* ================= RIGHT: UTILITIES & PROFILE ================= */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Trigger */}
            <div className="relative" ref={searchRef}>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((prev) => !prev);
                  setNotificationsOpen(false);
                  setProfileDropdownOpen(false);
                }}
                className={`h-9 w-9 sm:w-auto sm:px-3 sm:h-9 rounded-lg border text-xs flex items-center gap-2 transition-all duration-150 cursor-pointer ${
                  searchOpen
                    ? "bg-slate-800 text-white border-blue-500/50 ring-2 ring-blue-500/20"
                    : "border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white"
                }`}
                aria-label="Search placement drives"
                aria-expanded={searchOpen}
              >
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline font-medium text-slate-300">Search drives...</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-700/80 rounded">
                  /
                </kbd>
              </button>

              {/* Quick Search Popover */}
              {searchOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-3 z-50 animate-fadeIn">
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search company, skill, role..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400 px-1 flex items-center justify-between">
                    <span>Press <kbd className="text-slate-300">Esc</kbd> to close</span>
                    <Link
                      to="/student/drives"
                      onClick={() => setSearchOpen(false)}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      View all drives &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setProfileDropdownOpen(false);
                  setSearchOpen(false);
                }}
                className={`relative h-9 w-9 rounded-lg border flex items-center justify-center transition-all duration-150 cursor-pointer ${
                  notificationsOpen
                    ? "bg-slate-800 text-white border-blue-500/50 ring-2 ring-blue-500/20"
                    : "border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white"
                }`}
                aria-label="View notifications"
                aria-expanded={notificationsOpen}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {/* Badge Indicator */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white ring-2 ring-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                  <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 hover:bg-slate-800/50 transition-colors flex items-start gap-3 ${
                          item.unread ? "bg-slate-800/20" : ""
                        }`}
                      >
                        <div
                          className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                            item.unread ? "bg-blue-500" : "bg-transparent"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-white truncate">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 border-t border-slate-800 text-center bg-slate-950/40">
                    <Link
                      to="/student/notifications"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View All Placement Alerts &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Subtle Divider (Desktop) */}
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            {/* Profile Avatar & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen((prev) => !prev);
                  setNotificationsOpen(false);
                  setSearchOpen(false);
                }}
                className={`flex items-center gap-2.5 p-1 sm:px-2 sm:py-1.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                  profileDropdownOpen
                    ? "bg-slate-800 text-white border-slate-700 ring-2 ring-blue-500/20"
                    : "border-transparent hover:border-slate-800 hover:bg-slate-800/60 text-slate-200"
                }`}
                aria-label="User menu"
                aria-expanded={profileDropdownOpen}
              >
                <div className="relative">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    {userInitial}
                  </div>
                  {/* Status Indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-100 max-w-[110px] truncate leading-tight">
                    {userDisplayName}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {userRole}
                  </span>
                </div>

                <svg
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
                    profileDropdownOpen ? "rotate-180 text-white" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                  {/* User Profile Brief */}
                  <div className="p-3 border-b border-slate-800 bg-slate-950/40 rounded-xl mb-1.5">
                    <p className="text-xs font-bold text-white truncate">
                      {userDisplayName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {userEmail}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {userRole}
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-0.5">
                    <Link
                      to="/student/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Student Dashboard
                    </Link>

                    <Link
                      to="/student/drives"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Campus Drives
                    </Link>

                    <Link
                      to="/student/applications"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      My Applications
                    </Link>

                    <Link
                      to="/student/interviews"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Interview Schedule
                    </Link>

                    <Link
                      to="/student/results"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Placement Results
                    </Link>

                    <Link
                      to="/student/notifications"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      Notifications
                    </Link>
                  </div>

                  {/* Sign Out Button */}
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen((prev) => !prev);
                setProfileDropdownOpen(false);
                setNotificationsOpen(false);
              }}
              className="md:hidden h-9 w-9 rounded-lg border border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE / TABLET DRAWER MENU ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur-xl px-4 pt-3 pb-5 space-y-4 shadow-2xl animate-fadeIn">
          {/* Mobile Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drives, companies, roles..."
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
              Navigation
            </div>
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                  }`
                }
              >
                {link.icon}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>

          {/* User Profile Info Card & Logout */}
          <div className="pt-3 border-t border-slate-800">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {userDisplayName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {userEmail}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                {userRole}
              </span>
            </div>

            

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out of PlacementHub
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
