import { useEffect, useState } from 'react';
import { FaArrowRight, FaBookOpen, FaChalkboardTeacher, FaPlus, FaUserGraduate, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getCourses } from '../../api/courses';
import { getDepartments } from '../../api/departments';
import { getStudents } from '../../api/students';
import { getTeachers } from '../../api/teachers';
import { useAuth } from '../../context/AuthContext';

const statConfig = [
  { key: 'students', label: 'Active students', icon: FaUserGraduate, color: 'bg-blue-600', link: '/admin/students' },
  { key: 'teachers', label: 'Teachers', icon: FaChalkboardTeacher, color: 'bg-emerald-600', link: '/admin/teachers' },
  { key: 'courses', label: 'Courses', icon: FaBookOpen, color: 'bg-amber-500', link: '/admin/courses' },
  { key: 'departments', label: 'Departments', icon: FaUsers, color: 'bg-slate-700', link: '/admin/departments' },
];

function formatDate(value) {
  if (!value) return 'Recently added';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Recently added' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ students: [], teachers: [], courses: [], departments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [students, teachers, courses, departments] = await Promise.all([
        getStudents(),
        getTeachers(),
        getCourses(),
        getDepartments(),
      ]);
      setData({ students, teachers, courses, departments });
    } catch (requestError) {
      setError(requestError.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = {
    students: data.students.length,
    teachers: data.teachers.length,
    courses: data.courses.length,
    departments: data.departments.length,
  };

  return (
    <div className="min-h-full bg-slate-50 -m-6 p-6 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Overview</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Good morning, {user?.name?.split(' ')[0] || 'Admin'}</h1>
            <p className="mt-2 max-w-2xl text-slate-600">A quick view of the academic system and the work that needs your attention.</p>
          </div>
          <Link to="/admin/students" className="action-primary w-fit">
            <FaPlus className="text-sm" /> Add student
          </Link>
        </header>

        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button type="button" onClick={loadDashboard} className="font-semibold underline">Try again</button>
          </div>
        )}

        <section aria-label="System totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statConfig.map(({ key, label, icon: Icon, color, link }) => (
            <Link key={key} to={link} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${color}`}><Icon /></div>
                <FaArrowRight className="text-sm text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{loading ? '—' : stats[key]}</p>
            </Link>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div><h2 className="font-bold text-slate-900">Recent students</h2><p className="mt-1 text-sm text-slate-500">The latest active student records.</p></div>
              <Link to="/admin/students" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View all</Link>
            </div>
            {loading ? <div className="p-10 text-center text-sm text-slate-500">Loading student records...</div> : data.students.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">No active students yet.</div> : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-semibold sm:px-6">Student</th><th className="px-5 py-3 font-semibold sm:px-6">Department</th><th className="px-5 py-3 font-semibold sm:px-6">Added</th></tr></thead>
                  <tbody>{data.students.slice(0, 5).map((student) => <tr key={student.id} className="border-t border-slate-100"><td className="px-5 py-4 sm:px-6"><p className="font-semibold text-slate-800">{student.name}</p><p className="mt-0.5 text-xs text-slate-500">{student.email}</p></td><td className="px-5 py-4 text-slate-600 sm:px-6">{student.department_name || 'Unassigned'}</td><td className="px-5 py-4 text-slate-500 sm:px-6">{formatDate(student.created_at)}</td></tr>)}</tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-300">Quick actions</p>
            <h2 className="mt-3 text-xl font-bold">Keep the system moving</h2>
            <div className="mt-6 space-y-3">
              <Link to="/admin/teachers" className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/15"><span>Manage teachers</span><FaArrowRight className="text-blue-300" /></Link>
              <Link to="/admin/courses" className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/15"><span>Review courses</span><FaArrowRight className="text-blue-300" /></Link>
              <Link to="/admin/departments" className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/15"><span>View departments</span><FaArrowRight className="text-blue-300" /></Link>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
