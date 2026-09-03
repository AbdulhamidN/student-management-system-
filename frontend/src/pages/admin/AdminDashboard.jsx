import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiActivity,
  FiAlertTriangle,
  FiBookOpen,
  FiBriefcase,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiGrid,
  FiPlus,
  FiRefreshCw,
  FiSettings,
  FiShield,
  FiUsers,
} from 'react-icons/fi';
import { getAdminDashboard } from '../../api/dashboard';
import Loader from '../../components/Common/Loader';

const formatRelativeTime = (value) => {
  if (!value) return 'Unknown time';
  const date = new Date(value);
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const formatMonth = (value) => {
  if (!value) return '';
  const [year, month] = value.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
  });
};

function MetricCard({ title, value, subtext, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtext}</p>
        </div>
        <div className={`rounded-xl p-3 ${tone}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300">
          <Icon size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError('');
      setDashboard(await getAdminDashboard());
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const maxDepartmentCount = useMemo(
    () => Math.max(...(dashboard?.departmentDistribution || []).map((item) => item.studentCount), 1),
    [dashboard]
  );

  const maxEnrollment = useMemo(
    () => Math.max(...(dashboard?.enrollmentTrend || []).map((item) => item.registrations), 1),
    [dashboard]
  );

  if (loading) return <Loader />;

  if (error && !dashboard) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
        <p className="font-semibold">Unable to load the Admin Dashboard.</p>
        <p className="mt-1 text-sm">{error}</p>
        <button onClick={() => loadDashboard()} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
          Try again
        </button>
      </div>
    );
  }

  const metrics = dashboard?.metrics || {};
  const notifications = dashboard?.notifications || {};
  const pendingCount =
    notifications.studentsWithoutDepartment +
    notifications.studentsWithoutCourses +
    notifications.teachersWithoutCourses;

  return (
    <div className="space-y-6 pb-8">
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-lg md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-blue-100">
              <FiShield size={18} />
              <span className="text-xs font-bold uppercase tracking-[0.15em]">Administration Center</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Welcome back, Admin</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
              Monitor your student management system, review recent activity, and jump directly into the tasks that need your attention.
            </p>
          </div>
          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25 disabled:opacity-60"
          >
            <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
            Refresh data
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Students" value={metrics.totalStudents} subtext={`+${metrics.recentStudents} this week`} icon={FiUsers} tone="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300" />
        <MetricCard title="Total Teachers" value={metrics.totalTeachers} subtext="Active teaching staff" icon={FiBriefcase} tone="bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300" />
        <MetricCard title="Active Courses" value={metrics.activeCourses} subtext="Courses in the catalog" icon={FiBookOpen} tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300" />
        <MetricCard title="Departments" value={metrics.departments} subtext="Active academic units" icon={FiGrid} tone="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 dark:border-slate-700 dark:bg-slate-800">
          <SectionHeader icon={FiActivity} title="Recent Activity" subtitle="The latest changes recorded in the system" action={<Link to="/admin/students" className="hidden items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 sm:flex dark:text-blue-300">View students <FiChevronRight /></Link>} />
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {(dashboard?.activities || []).length ? dashboard.activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.type === 'teacher' ? 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300'}`}>
                  {activity.type === 'teacher' ? <FiBriefcase size={17} /> : <FiUsers size={17} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{activity.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{activity.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                  <FiClock size={13} />
                  {formatRelativeTime(activity.timestamp)}
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-sm text-slate-500">No recent activity yet.</div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <SectionHeader icon={FiPlus} title="Quick Actions" subtitle="Common admin tasks" />
          <div className="space-y-3">
            <Link to="/admin/students" className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/30">
              <span className="rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"><FiUsers /></span>
              <span className="flex-1"><span className="block text-sm font-semibold text-slate-800 dark:text-white">Add New Student</span><span className="text-xs text-slate-500 dark:text-slate-400">Register a student</span></span>
              <FiChevronRight className="text-slate-400 transition group-hover:translate-x-1" />
            </Link>
            <Link to="/admin/teachers" className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/30">
              <span className="rounded-lg bg-violet-100 p-2 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"><FiBriefcase /></span>
              <span className="flex-1"><span className="block text-sm font-semibold text-slate-800 dark:text-white">Assign Teacher</span><span className="text-xs text-slate-500 dark:text-slate-400">Manage staff and courses</span></span>
              <FiChevronRight className="text-slate-400 transition group-hover:translate-x-1" />
            </Link>
            <Link to="/admin/courses" className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/30">
              <span className="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"><FiBookOpen /></span>
              <span className="flex-1"><span className="block text-sm font-semibold text-slate-800 dark:text-white">Create Course</span><span className="text-xs text-slate-500 dark:text-slate-400">Add to course catalog</span></span>
              <FiChevronRight className="text-slate-400 transition group-hover:translate-x-1" />
            </Link>
            <Link to="/admin/departments" className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/30">
              <span className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"><FiGrid /></span>
              <span className="flex-1"><span className="block text-sm font-semibold text-slate-800 dark:text-white">Manage Departments</span><span className="text-xs text-slate-500 dark:text-slate-400">Maintain academic units</span></span>
              <FiChevronRight className="text-slate-400 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <SectionHeader icon={FiUsers} title="Enrollment by Department" subtitle="Current student distribution" />
          <div className="space-y-5">
            {(dashboard?.departmentDistribution || []).map((item) => (
              <div key={item.id}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{item.studentCount}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div className="h-full rounded-full bg-blue-600 transition-all duration-700" style={{ width: `${Math.max((item.studentCount / maxDepartmentCount) * 100, item.studentCount ? 8 : 0)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <SectionHeader icon={FiActivity} title="Enrollment Overview" subtitle="Student registrations over the last six months" />
          <div className="flex h-52 items-end gap-3 border-b border-l border-slate-200 px-2 pb-0 pt-4 dark:border-slate-700">
            {(dashboard?.enrollmentTrend || []).map((item) => {
              const height = item.registrations ? Math.max((item.registrations / maxEnrollment) * 100, 8) : 3;
              return (
                <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{item.registrations}</span>
                  <div className="w-full max-w-12 rounded-t-lg bg-blue-500 transition-all duration-700 hover:bg-blue-600" style={{ height: `${height}%` }} title={`${item.registrations} registrations`} />
                  <span className="text-xs text-slate-400 dark:text-slate-500">{formatMonth(item.month)}</span>
                </div>
              );
            })}
            {!(dashboard?.enrollmentTrend || []).length && <p className="mb-8 w-full text-center text-sm text-slate-500">No enrollment history available yet.</p>}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <SectionHeader icon={pendingCount ? FiAlertTriangle : FiCheckCircle} title="System Status & Notifications" subtitle={pendingCount ? `${pendingCount} item${pendingCount === 1 ? '' : 's'} need administrative attention` : 'Everything is up to date'} />
        <div className="grid gap-3 md:grid-cols-3">
          <Link to="/admin/students" className="rounded-xl border border-slate-200 p-4 transition hover:border-amber-300 hover:bg-amber-50/50 dark:border-slate-700 dark:hover:border-amber-800 dark:hover:bg-amber-950/20">
            <div className="flex items-center justify-between"><span className="text-2xl font-bold text-slate-900 dark:text-white">{notifications.studentsWithoutDepartment}</span><FiSettings className="text-amber-500" /></div>
            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Students without department</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Assign a department to complete registration.</p>
          </Link>
          <Link to="/admin/students" className="rounded-xl border border-slate-200 p-4 transition hover:border-amber-300 hover:bg-amber-50/50 dark:border-slate-700 dark:hover:border-amber-800 dark:hover:bg-amber-950/20">
            <div className="flex items-center justify-between"><span className="text-2xl font-bold text-slate-900 dark:text-white">{notifications.studentsWithoutCourses}</span><FiBookOpen className="text-amber-500" /></div>
            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Students without courses</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Assign courses before the term begins.</p>
          </Link>
          <Link to="/admin/teachers" className="rounded-xl border border-slate-200 p-4 transition hover:border-amber-300 hover:bg-amber-50/50 dark:border-slate-700 dark:hover:border-amber-800 dark:hover:bg-amber-950/20">
            <div className="flex items-center justify-between"><span className="text-2xl font-bold text-slate-900 dark:text-white">{notifications.teachersWithoutCourses}</span><FiBriefcase className="text-amber-500" /></div>
            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">Teachers without courses</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Review teaching assignments.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
