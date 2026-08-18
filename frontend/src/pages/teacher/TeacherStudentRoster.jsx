import { useState, useEffect } from 'react';
import { getStudentsForGradebook } from '../../api/teacherApi';
import { sendTeacherNotification } from '../../api/studentPortalApi';

export default function TeacherStudentRoster() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Send Notification Modal State
  const [notifStudent, setNotifStudent] = useState(null);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState('');
  const [notifError, setNotifError] = useState('');

  useEffect(() => {
    let isMounted = true;
    getStudentsForGradebook()
      .then((data) => {
        if (isMounted) {
          setStudents(data || []);
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

  const openNotifModal = (student) => {
    setNotifStudent(student);
    setNotifTitle('');
    setNotifMessage('');
    setNotifSuccess('');
    setNotifError('');
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setNotifSuccess('');
    setNotifError('');

    if (!notifTitle.trim() || !notifMessage.trim()) {
      setNotifError('Title and message are required.');
      return;
    }

    try {
      setSendingNotif(true);
      await sendTeacherNotification({
        recipient_student_id: notifStudent.id,
        title: notifTitle,
        message: notifMessage,
      });

      setNotifSuccess(`Notification sent to ${notifStudent.name}!`);
      setTimeout(() => {
        setNotifStudent(null);
      }, 900);
    } catch (err) {
      setNotifError(err.message || 'Failed to send notification.');
    } finally {
      setSendingNotif(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.email && s.email.toLowerCase().includes(term)) ||
      (s.parent_name && s.parent_name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Read-Only Notice Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
        <div className="flex items-start space-x-3">
          <span className="text-xl">🔒</span>
          <div>
            <h4 className="text-sm font-bold">Teacher Access Scope — Read-Only Registration Details</h4>
            <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-400">
              Teachers have read-only permission to view student registration info and parent contact details. Student account creation, personal info modifications, and deletions are strictly managed by System Administrators.
            </p>
          </div>
        </div>
      </div>

      {/* Header + Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Student Registration Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total {students.length} student registration profiles listed
          </p>
        </div>

        <div className="w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student or parent name..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Student Registration Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-800"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{student.name}</h3>
                  <span className="mt-1 inline-block rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {student.grade}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    student.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {student.status || 'Active'}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between border-b border-slate-100 py-1 dark:border-slate-700/60">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{student.email || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 py-1 dark:border-slate-700/60">
                  <span className="text-slate-400">Parent Name:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{student.parent_name || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 py-1 dark:border-slate-700/60">
                  <span className="text-slate-400">Parent Phone:</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">{student.parent_phone || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 py-1 dark:border-slate-700/60">
                  <span className="text-slate-400">Address:</span>
                  <span className="font-medium text-slate-800 truncate dark:text-slate-200">{student.address || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 py-1 dark:border-slate-700/60">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Enrollment Date:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              {student.notes ? (
                <span className="text-xs text-slate-400 italic truncate max-w-[160px]">"{student.notes}"</span>
              ) : (
                <span className="text-xs text-slate-400">Read-Only Info</span>
              )}

              <button
                onClick={() => openNotifModal(student)}
                className="inline-flex items-center space-x-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/60 dark:text-indigo-300"
              >
                <span>🔔 Notify Student</span>
              </button>
            </div>
          </div>
        ))}

        {filteredStudents.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No student registration profiles found.
          </div>
        )}
      </div>

      {/* Send Notification Modal */}
      {notifStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Send Notification</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">To: {notifStudent.name} ({notifStudent.grade})</p>
              </div>
              <button
                onClick={() => setNotifStudent(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 p-6">
              {notifError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-300">
                  ⚠️ {notifError}
                </div>
              )}

              {notifSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-300">
                  ✅ {notifSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Project Feedback & Guidance"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
                  Notification Message
                </label>
                <textarea
                  rows="4"
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Write message content for the student..."
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNotifStudent(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingNotif}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                >
                  {sendingNotif ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
