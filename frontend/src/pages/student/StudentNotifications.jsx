import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead } from '../../api/studentPortalApi';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchNotifs();
    } catch (err) {
      alert(err.message || 'Failed to mark as read');
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.is_read;
    return true;
  });

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        Loading notifications inbox...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Teacher Notifications Inbox
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Direct messages, feedback, and reminders sent to you by your instructor.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filter === 'ALL'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filter === 'UNREAD'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Unread ({notifications.filter((n) => !n.is_read).length})
          </button>
        </div>
      </div>

      {/* Notifications Cards */}
      <div className="space-y-4">
        {filteredNotifs.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-6 shadow-sm transition ${
              item.is_read
                ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800'
                : 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30'
            }`}
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center space-x-3">
                <span
                  className={`h-3 w-3 rounded-full ${
                    item.is_read ? 'bg-slate-300 dark:bg-slate-600' : 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                  }`}
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    From: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.sender_teacher_name || 'Instructor'}</span> | {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {!item.is_read && (
                <button
                  onClick={() => handleMarkRead(item.id)}
                  className="rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                >
                  Mark as Read
                </button>
              )}
            </div>

            <p className="mt-3 text-sm text-slate-700 leading-relaxed dark:text-slate-200">
              {item.message}
            </p>
          </div>
        ))}

        {filteredNotifs.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
            No notifications found.
          </div>
        )}
      </div>
    </div>
  );
}
