import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { notificationsAPI } from "../../services/api";
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await notificationsAPI.getNotifications();
      if (res.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
      setError("Could not load notifications. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const removeNotification = async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Delete notification error:", err);
      // Fallback local remove
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    }
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
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Stay updated with campus placement alerts, interview schedules, and announcements.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={fetchNotifications}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
                title="Refresh notifications"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Notifications Card */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-48 flex-col items-center justify-center p-8 text-center">
              <Loader2 size={24} className="animate-spin text-blue-600 mb-2" />
              <p className="text-xs text-slate-400">Loading your notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <EmptyNotifications />
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
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

const NotificationItem = ({ notification, onRead, onRemove }) => {
  const iconData = getNotificationIcon(notification.type);
  const Icon = iconData.icon;
  const isUnread = !notification.isRead;

  const timeFormatted = notification.createdAt
    ? new Date(notification.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently";

  return (
    <div
      className={`group relative flex gap-4 p-4 transition sm:p-5 ${
        isUnread ? "bg-blue-50/40" : "bg-white hover:bg-slate-50"
      }`}
    >
      {/* Unread indicator bar */}
      {isUnread && (
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
                isUnread
                  ? "font-bold text-slate-900"
                  : "font-semibold text-slate-700"
              }`}
            >
              {notification.title || "Placement Cell Notification"}
            </h3>

            {isUnread && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
            )}
          </div>

          <span className="text-[11px] text-slate-400">{timeFormatted}</span>
        </div>

        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-600 sm:text-sm">
          {notification.message}
        </p>

        {/* Audience badge if targeted */}
        {notification.targetCriteria && (
          <div className="mt-2">
            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              Target: {notification.targetCriteria}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-4">
          {isUnread && (
            <button
              type="button"
              onClick={() => onRead(notification._id)}
              className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Mark as read
            </button>
          )}

          <button
            type="button"
            onClick={() => onRemove(notification._id)}
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
        You're all caught up. Announcements and placement updates from the Admin will appear here.
      </p>
    </div>
  );
};

export default Notifications;
