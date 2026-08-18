import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentProfile } from '../../api/studentPortalApi';

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getStudentProfile()
      .then((data) => {
        if (isMounted) {
          setProfile(data);
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
        Loading student profile...
      </div>
    );
  }

  const studentName = profile?.name || user?.name || 'Student Record';
  const studentEmail = profile?.email || user?.email || 'N/A';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Main Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800 sm:p-8">
        {/* Profile Header Badge */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-700/60">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2f73b7] text-2xl font-bold text-white shadow-md border-2 border-[#e5b93b]">
              {studentName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{studentName}</h2>
              <p className="text-sm font-medium text-[#2f73b7] dark:text-blue-400">{studentEmail}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/60 dark:text-sky-300">
              Student ID: #{profile?.id || 'STU'}
            </span>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Full Name */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/50">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</span>
            <span className="mt-1 block text-base font-semibold text-slate-800 dark:text-slate-200">
              {studentName}
            </span>
          </div>

          {/* Email Address */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/50">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</span>
            <span className="mt-1 block text-base font-semibold text-slate-800 dark:text-slate-200">
              {studentEmail}
            </span>
          </div>

          {/* Grade Level */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/50">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Grade Level</span>
            <span className="mt-1 block text-base font-semibold text-slate-800 dark:text-slate-200">
              {profile?.grade || 'N/A'}
            </span>
          </div>

          {/* Assigned Instructor */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/50">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Instructor</span>
            <span className="mt-1 block text-base font-semibold text-slate-800 dark:text-slate-200">
              {profile?.teacher_name || 'Assigned Instructor'}
            </span>
          </div>

          {/* Parent Name */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/50">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Parent / Guardian Name</span>
            <span className="mt-1 block text-base font-semibold text-slate-800 dark:text-slate-200">
              {profile?.parent_name || 'N/A'}
            </span>
          </div>

          {/* Parent Phone */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/50">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Parent Phone</span>
            <span className="mt-1 block text-base font-semibold text-slate-800 dark:text-slate-200">
              {profile?.parent_phone || 'N/A'}
            </span>
          </div>

          {/* Address */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/50 sm:col-span-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Address</span>
            <span className="mt-1 block text-base font-semibold text-slate-800 dark:text-slate-200">
              {profile?.address || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
