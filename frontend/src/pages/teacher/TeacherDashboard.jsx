import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getStudentsForGradebook } from '../../api/teacherApi';
import {
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineTrendingUp,
  HiOutlineBadgeCheck,
  HiOutlineChartPie,
  HiOutlineArrowRight,
  HiOutlineSparkles,
} from 'react-icons/hi';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { profile } = useOutletContext() || {};
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Calculate Metrics
  const totalStudents = students.length;
  const avgScore =
    totalStudents > 0
      ? (students.reduce((acc, curr) => acc + Number(curr.total_mark || 0), 0) / totalStudents).toFixed(1)
      : 0;

  const passingCount = students.filter((s) => Number(s.total_mark || 0) >= 60).length;
  const passRate = totalStudents > 0 ? Math.round((passingCount / totalStudents) * 100) : 0;

  const topStudent = students[0] || null;

  // Grade Counts
  const gradeCounts = {
    A: students.filter((s) => Number(s.total_mark || 0) >= 90).length,
    B: students.filter((s) => Number(s.total_mark || 0) >= 80 && Number(s.total_mark || 0) < 90).length,
    C: students.filter((s) => Number(s.total_mark || 0) >= 70 && Number(s.total_mark || 0) < 80).length,
    D: students.filter((s) => Number(s.total_mark || 0) >= 60 && Number(s.total_mark || 0) < 70).length,
    F: students.filter((s) => Number(s.total_mark || 0) < 60).length,
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="text-xl" title="1st Place Gold">🥇</span>;
    if (rank === 2) return <span className="text-xl" title="2nd Place Silver">🥈</span>;
    if (rank === 3) return <span className="text-xl" title="3rd Place Bronze">🥉</span>;
    return <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">#{rank}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Teacher Profile Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 p-6 text-white shadow-xl shadow-indigo-500/10 sm:p-8">
        <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                Teacher Profile
              </span>
              {profile?.id && (
                <span className="rounded-full bg-sky-400/30 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                  Teacher ID: #{profile.id}
                </span>
              )}
              {profile?.department && (
                <span className="rounded-full bg-emerald-400/30 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                  Department: {profile.department}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back, {profile?.name || 'Instructor'}!
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-indigo-100">
              Specialty: <span className="font-semibold text-white">{profile?.subject || 'Course Specialty'}</span>
            </p>
          </div>

          <button
            onClick={() => navigate('/teacher/gradebook')}
            className="flex items-center space-x-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-600 shadow-md transition hover:bg-slate-50 hover:shadow-lg active:scale-95"
          >
            <span>Open Gradebook</span>
            <HiOutlineArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Total Enrolled</p>
              <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                {loading ? '...' : totalStudents}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <HiOutlineUserGroup className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Active roster students</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Class Average</p>
              <h3 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                {loading ? '...' : `${avgScore} / 100`}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
              <HiOutlineAcademicCap className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Average overall student mark</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Passing Rate</p>
              <h3 className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {loading ? '...' : `${passRate}%`}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <HiOutlineTrendingUp className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Students with total score ≥ 60</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Top Performer</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900 truncate dark:text-white">
                {loading ? '...' : topStudent ? topStudent.name : 'N/A'}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <HiOutlineBadgeCheck className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-3 text-xs text-amber-600 font-semibold dark:text-amber-400">
            {topStudent ? `Rank 1st (${topStudent.total_mark} pts)` : 'No records'}
          </p>
        </div>
      </div>

      {/* Main Grid: Grade Distribution + Top Performers Leaderboard */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Grade Breakdown Progress Bars */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-700/60">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Grade Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown across A, B, C, D, F grade bands
              </p>
            </div>
            <HiOutlineChartPie className="h-6 w-6 text-indigo-500" />
          </div>

          <div className="mt-6 space-y-4">
            {[
              { label: 'Grade A (90-100)', key: 'A', color: 'bg-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-700 dark:text-emerald-400' },
              { label: 'Grade B (80-89)', key: 'B', color: 'bg-sky-500', bg: 'bg-sky-100', text: 'text-sky-700 dark:text-sky-400' },
              { label: 'Grade C (70-79)', key: 'C', color: 'bg-amber-500', bg: 'bg-amber-100', text: 'text-amber-700 dark:text-amber-400' },
              { label: 'Grade D (60-69)', key: 'D', color: 'bg-orange-500', bg: 'bg-orange-100', text: 'text-orange-700 dark:text-orange-400' },
              { label: 'Grade F (< 60)', key: 'F', color: 'bg-rose-500', bg: 'bg-rose-100', text: 'text-rose-700 dark:text-rose-400' },
            ].map((item) => {
              const count = gradeCounts[item.key] || 0;
              const percent = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
              return (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className={item.text}>{count} students ({percent}%)</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Leaderboard */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-700/60">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Class Leaderboard</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">High-to-Low Total Score Order</p>
            </div>
            <HiOutlineSparkles className="h-6 w-6 text-amber-500" />
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-700/60">
            {students.slice(0, 5).map((student, index) => (
              <div key={student.id} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center">
                    {getRankBadge(index + 1)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{student.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{student.grade}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                    {student.total_mark} pts
                  </span>
                  <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Grade {student.letter_grade}
                  </span>
                </div>
              </div>
            ))}

            {students.length === 0 && !loading && (
              <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">No students recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
