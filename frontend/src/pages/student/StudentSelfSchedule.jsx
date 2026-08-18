import { useState, useEffect } from 'react';
import { getSelfSchedule, createSelfSchedule, deleteSelfSchedule } from '../../api/studentPortalApi';

export default function StudentSelfSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal Form State
  const [title, setTitle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await getSelfSchedule();
      setSchedules(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Schedule title is required.');
      return;
    }

    try {
      setSaving(true);
      await createSelfSchedule({
        title,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        description,
      });

      setTitle('');
      setDescription('');
      setShowAddModal(false);
      fetchSchedule();
    } catch (err) {
      setError(err.message || 'Failed to add schedule item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Are you sure you want to remove this schedule item?')) return;
    try {
      await deleteSelfSchedule(id);
      fetchSchedule();
    } catch (err) {
      alert(err.message || 'Failed to delete schedule item.');
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            My Self-Schedule & Study Planner
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create, manage, and customize your weekly study routines and revision sessions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95"
        >
          <span>+ Add Schedule Block</span>
        </button>
      </div>

      {/* Timetable Grid by Days */}
      <div className="space-y-6">
        {days.map((day) => {
          const dayItems = schedules.filter((s) => s.day_of_week === day);
          return (
            <div
              key={day}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-3.5 dark:border-slate-700/60 dark:bg-slate-900/60">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{day}</h3>
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {dayItems.length} Sessions
                </span>
              </div>

              <div className="divide-y divide-slate-100 p-4 dark:divide-slate-700/60">
                {dayItems.map((item) => (
                  <div key={item.id} className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                          {item.start_time} - {item.end_time}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      </div>
                      {item.description && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteSchedule(item.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                ))}

                {dayItems.length === 0 && (
                  <p className="py-4 text-xs text-slate-400 italic">No self-schedule blocks for {day}.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Self-Schedule Block</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-4 p-6">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-300">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
                  Session Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Algorithms Revision"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
                  Day of Week
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
                  Notes / Description
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional notes or goals for this study session..."
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'Adding...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
