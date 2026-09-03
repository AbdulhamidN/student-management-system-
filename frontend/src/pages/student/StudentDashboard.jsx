import { useEffect, useState } from 'react';
import { FaBookOpen, FaBuilding, FaEnvelope, FaGraduationCap, FaKey, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { apiRequest } from '../../api/config';
import { useAuth } from '../../context/AuthContext';

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 text-slate-500">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2f73b7]">{icon}</span>
        <span className="text-sm font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 text-lg font-bold text-slate-800">{value || 'Not assigned'}</p>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, login, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadProfile = async () => {
    try {
      const data = await apiRequest('/students/me/profile');
      setProfile(data.data);
    } catch (err) {
      setError(err.message || 'Unable to load your registration profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError('');
    setMessage('');
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const data = await apiRequest('/auth/student/change-initial-password', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      login({ authToken: localStorage.getItem('sms_auth_token'), authUser: data.user });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage(data.message);
    } catch (err) {
      setError(err.message || 'Unable to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Loading your registration profile...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl bg-[#2f73b7] p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl"><FaGraduationCap /></div>
            <div>
              <p className="text-sm font-medium text-blue-100">Student Portal</p>
              <h1 className="text-2xl font-bold">Welcome, {profile?.name || user?.name}</h1>
            </div>
          </div>
          <button onClick={logout} className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 font-semibold text-[#2f73b7] hover:bg-blue-50">
            <FaSignOutAlt /> Sign Out
          </button>
        </header>

        {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>}

        {user?.mustChangePassword && (
          <section className="mb-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><FaKey /></div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Set your permanent password</h2>
                <p className="mt-1 text-sm text-slate-600">This is your first login. You must replace the temporary password before continuing. This password change is available only once.</p>
              </div>
            </div>
            <form onSubmit={handlePasswordChange} className="grid gap-4 md:grid-cols-3">
              <input name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} placeholder="Temporary password" required className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500" />
              <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} placeholder="New password" required minLength={8} className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500" />
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm new password" required minLength={8} className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500" />
              <div className="md:col-span-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-600">Use at least 8 characters with uppercase, lowercase and a number.</p>
                <button disabled={submitting} className="rounded-xl bg-[#2f73b7] px-6 py-3 font-bold text-white hover:bg-[#285fa2] disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? 'Saving...' : 'Change Password Once'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3"><FaUser className="text-[#2f73b7]" /><h2 className="text-xl font-bold text-slate-900">Registration Profile</h2></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard icon={<FaUser />} label="Full Name" value={profile?.name} />
            <InfoCard icon={<FaEnvelope />} label="Email" value={profile?.email} />
            <InfoCard icon={<FaBuilding />} label="Department" value={profile?.department} />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3"><FaBookOpen className="text-[#2f73b7]" /><h2 className="text-xl font-bold text-slate-900">Registered Courses</h2></div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-[#2f73b7]">{profile?.courses?.length || 0} Courses</span>
          </div>
          {profile?.courses?.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.courses.map((course) => (
                <div key={course.id} className="rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2f73b7]">{course.code}</span>
                  <h3 className="mt-2 text-lg font-bold text-slate-800">{course.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{course.department_name || profile.department}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">No courses have been assigned to your registration yet.</div>
          )}
        </section>

        <footer className="py-8 text-center text-sm text-slate-400">Student Management System · Registration Profile</footer>
      </div>
    </main>
  );
}
