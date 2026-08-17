import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getTeacherProfile, updateTeacherProfile } from '../../api/teacherApi';

export default function TeacherProfile() {
  const { setProfile: setParentProfile } = useOutletContext() || {};
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [subject, setSubject] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    getTeacherProfile()
      .then((data) => {
        if (isMounted && data) {
          setProfile(data);
          setName(data.name || '');
          setDepartment(data.department || '');
          setSubject(data.subject || '');
          setPhone(data.phone || '');
          setBio(data.bio || '');
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError('Failed to load teacher profile.');
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!name || name.trim().length < 2) {
      setError('Name must be at least 2 characters long.');
      return;
    }

    try {
      setSaving(true);
      const result = await updateTeacherProfile({
        name,
        department,
        subject,
        phone,
        bio,
      });

      setMessage('Profile updated successfully!');
      if (result.data) {
        setProfile(result.data);
        if (setParentProfile) setParentProfile(result.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        Loading teacher profile credentials...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Teacher Profile Management
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          View and manage your instructor credentials, department affiliation, subject specialty, and biography.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800 sm:p-8">
        {/* Profile Header Badge */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6 dark:border-slate-700/60">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-2xl font-bold text-white shadow-lg shadow-indigo-500/20">
              {name ? name.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{name || 'Teacher Profile'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{profile?.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/60 dark:text-sky-300">
              Teacher ID: #{profile?.id || profile?.teacher_id || 'TCH'}
            </span>
            <span className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/60 dark:text-indigo-300">
              Role: Teacher
            </span>
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-300">
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-300">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Full Name */}
            <div>
              <label htmlFor="teacherName" className="block text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
                Full Name
              </label>
              <input
                id="teacherName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                required
              />
            </div>

            {/* Email (Read-Only) */}
            <div>
              <label htmlFor="teacherEmail" className="block text-xs font-bold text-slate-500 uppercase dark:text-slate-400">
                Email Address (Account ID)
              </label>
              <input
                id="teacherEmail"
                type="email"
                value={profile?.email || ''}
                disabled
                className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400"
              />
            </div>

            {/* Department */}
            <div>
              <label htmlFor="teacherDept" className="block text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
                Department
              </label>
              <input
                id="teacherDept"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science, Mathematics"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Subject Specialty */}
            <div>
              <label htmlFor="teacherSubject" className="block text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
                Subject Specialty / Courses
              </label>
              <input
                id="teacherSubject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Software Engineering & Web Dev"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Phone */}
            <div className="sm:col-span-2">
              <label htmlFor="teacherPhone" className="block text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
                Contact Phone
              </label>
              <input
                id="teacherPhone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1-555-0192"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <label htmlFor="teacherBio" className="block text-xs font-bold text-slate-700 uppercase dark:text-slate-300">
                Instructor Biography & Notes
              </label>
              <textarea
                id="teacherBio"
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief professional bio or background information..."
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 transition focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
