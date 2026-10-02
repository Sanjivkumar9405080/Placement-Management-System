import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  X,
} from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "application",
      title: "Application Submitted",
      message:
        "Your application for MERN Stack Developer at TechNova Solutions has been submitted successfully.",
      time: "10 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "shortlisted",
      title: "You have been shortlisted!",
      message:
        "Congratulations! You have been shortlisted for the Associate Software Engineer position.",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 3,
      type: "interview",
      title: "Interview Scheduled",
      message:
        "Your technical interview with Microsoft is scheduled for 5 October 2026 at 11:00 AM.",
      time: "Yesterday",
      unread: true,
    },
    {
      id: 4,
      type: "drive",
      title: "New Placement Drive",
      message:
        "A new MERN Stack Developer placement drive has been added by TechNova Solutions.",
      time: "2 days ago",
      unread: false,
    },
    {
      id: 5,
      type: "deadline",
      title: "Application Deadline Reminder",
      message:
        "The application deadline for the Software Developer drive is approaching.",
      time: "3 days ago",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Header */}

        <div className="mb-6">

          <Link
            to="/student/dashboard"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Bell size={21} />
              </div>

              <div>
                <div className="flex items-center gap-2">

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Notifications
                  </h1>

                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Stay updated with your placement activities.
                </p>
              </div>

            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 sm:self-auto"
              >
                Mark all as read
              </button>
            )}

          </div>
        </div>


        {/* Notifications Card */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {notifications.length === 0 ? (
            <EmptyNotifications />
          ) : (
            <div className="divide-y divide-slate-100">

              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                  onRemove={removeNotification}
                />
              ))}

            </div>
          )}

        </section>

      </main>
    </div>
  );
};


/* =========================================================
   NOTIFICATION ITEM
========================================================= */

const NotificationItem = ({
  notification,
  onRead,
  onRemove,
}) => {
  const iconData = getNotificationIcon(notification.type);

  const Icon = iconData.icon;

  return (
    <div
      className={`group relative flex gap-4 p-4 transition sm:p-5 ${
        notification.unread
          ? "bg-blue-50/40"
          : "bg-white hover:bg-slate-50"
      }`}
    >

      {/* Unread indicator */}

      {notification.unread && (
        <span className="absolute left-0 top-0 h-full w-1 bg-blue-600" />
      )}


      {/* Icon */}

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconData.bg} ${iconData.text}`}
      >
        <Icon size={20} />
      </div>


      {/* Content */}

      <div className="min-w-0 flex-1">

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">

            <h3
              className={`text-sm ${
                notification.unread
                  ? "font-bold text-slate-900"
                  : "font-semibold text-slate-700"
              }`}
            >
              {notification.title}
            </h3>

            {notification.unread && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
            )}

          </div>

          <span className="text-[11px] text-slate-400">
            {notification.time}
          </span>

        </div>

        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
          {notification.message}
        </p>


        {/* Actions */}

        <div className="mt-3 flex items-center gap-4">

          {notification.unread && (
            <button
              type="button"
              onClick={() => onRead(notification.id)}
              className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Mark as read
            </button>
          )}

          <button
            type="button"
            onClick={() => onRemove(notification.id)}
            className="flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-red-500"
          >
            <X size={13} />
            Remove
          </button>

        </div>

      </div>

    </div>
  );
};


/* =========================================================
   ICON DATA
========================================================= */

const getNotificationIcon = (type) => {
  switch (type) {
    case "application":
      return {
        icon: FileText,
        bg: "bg-blue-50",
        text: "text-blue-600",
      };

    case "shortlisted":
      return {
        icon: CheckCircle2,
        bg: "bg-emerald-50",
        text: "text-emerald-600",
      };

    case "interview":
      return {
        icon: CalendarDays,
        bg: "bg-violet-50",
        text: "text-violet-600",
      };

    case "drive":
      return {
        icon: BriefcaseBusiness,
        bg: "bg-amber-50",
        text: "text-amber-600",
      };

    case "deadline":
      return {
        icon: Clock3,
        bg: "bg-red-50",
        text: "text-red-500",
      };

    default:
      return {
        icon: Bell,
        bg: "bg-slate-100",
        text: "text-slate-600",
      };
  }
};


/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyNotifications = () => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Bell size={28} />
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-900">
        No notifications
      </h2>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        You're all caught up. New placement updates will appear here.
      </p>

    </div>
  );
};

export default Notifications;