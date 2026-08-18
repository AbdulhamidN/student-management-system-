import { useState, useEffect } from 'react';
import { getAnnouncements } from '../../api/studentPortalApi';

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getAnnouncements()
      .then((data) => {
        if (isMounted) {
          setAnnouncements(data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        Loading announcements...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          School Admin Announcements
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Official school-wide notices, event updates, and administrative bulletins.
        </p>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700/60">
              <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                Official Notice
              </span>
              <span className="text-xs text-slate-400">
                {new Date(item.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-slate-300">
              {item.content}
            </p>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
            No published announcements available at this time.
          </div>
        )}
      </div>
    </div>
  );
}
