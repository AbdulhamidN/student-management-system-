import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTeacherProfile } from '../../api/teacherApi';

export default function TeacherProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getTeacherProfile()
      .then((data) => {
        if (isMounted && data) {
          setProfile(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        Loading teacher profile...
      </div>
    );
  }

  const teacherName = profile?.name || user?.name || 'Adnaan Muslim';
  const teacherEmail = profile?.email || user?.email || 'adnaanmuslim1@gmail.com';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Main Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800 sm:p-8">
        {/* Profile Header Badge */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-700/60">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2f73b7] text-2xl font-bold text-white shadow-md border-2 border-[#e5b93b]">
              {teacherName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{teacherName}</h2>
              <p className="text-sm font-medium text-[#2f73b7] dark:text-blue-400">{teacherEmail}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/60 dark:text-sky-300">
              Teacher ID: #{profile?.id || profile?.teacher_id || 'TCH'}
            </span>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Full Name */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/50">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</span>
            <span className="mt-1 block text-base font-semibold text-slate-800 dark:text-slate-200">
              {teacherName}
            </span>
          </div>

          {/* Email Address */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/50">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</span>
            <span className="mt-1 block text-base font-semibold text-slate-800 dark:text-slate-200">
              {teacherEmail}
            </span>
          </div>

          {/* Department */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/50">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Department</span>
            <span className="mt-1 block text-base font-semibold text-slate-800 dark:text-slate-200">
              {profile?.department || 'General'}
            </span>
          </div>

          {/* Subject Specialty */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/50">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Subject Specialty</span>
            <span className="mt-1 block text-base font-semibold text-slate-800 dark:text-slate-200">
              {profile?.subject || 'All Courses'}
            </span>
          </div>

          {/* Phone */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/50">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Contact Phone</span>
            <span className="mt-1 block text-base font-semibold text-slate-800 dark:text-slate-200">
              {profile?.phone || 'Not provided'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
