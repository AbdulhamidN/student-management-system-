import { useState, useEffect } from 'react';
import { getStudentsForGradebook } from '../../api/teacherApi';

export default function TeacherStudentRoster() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

            {student.notes && (
              <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-500 italic dark:bg-slate-900/60 dark:text-slate-400">
                "{student.notes}"
              </div>
            )}
          </div>
        ))}

        {filteredStudents.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No student registration profiles found.
          </div>
        )}
      </div>
    </div>
  );
}
