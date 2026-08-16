import { useEffect, useState } from 'react';
import { API_BASE } from '../../api/config';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${API_BASE}/announcements`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to load announcements');
        setAnnouncements(data.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Announcements</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">Latest updates from the campus</h1>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading announcements...</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      ) : announcements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-700">No recent announcement</p>
          <p className="mt-2 text-sm text-slate-500">There are no announcements posted yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <article key={announcement.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-slate-900">{announcement.title}</h2>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Update
                </span>
              </div>
              <p className="text-slate-600">{announcement.content}</p>
              <div className="mt-4 text-sm text-slate-500">
                {new Date(announcement.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
