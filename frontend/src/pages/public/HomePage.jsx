import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaGraduationCap, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api/config';

export default function HomePage() {
  const navigate = useNavigate();
  const { isDark } = useOutletContext();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to log in');
      }

      login({ authToken: data.token, authUser: data.user });

      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err) {
      setError(err.message || 'Unable to log in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={isDark ? 'min-h-[70vh] bg-slate-950 px-4 py-10 sm:px-6 lg:px-8' : 'min-h-[70vh] bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-4 py-10 sm:px-6 lg:px-8'}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 text-center">
          <h1 className={isDark ? 'text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl lg:text-[2.2rem]' : 'text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[2.2rem]'}>
            Welcome to Student Management System
          </h1>
        </div>

        <div className={isDark ? 'mx-auto max-w-md rounded-2xl bg-slate-900 p-4 shadow-xl shadow-slate-950/40 ring-1 ring-slate-700 sm:p-6' : 'mx-auto max-w-md rounded-2xl bg-white p-4 shadow-xl shadow-slate-200 ring-1 ring-slate-200 sm:p-6'}>
          <div className="mb-5 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-[5px] border-[#e5b93b] bg-[#2f73b7] shadow-lg shadow-blue-200/30">
              <FaGraduationCap className="text-4xl text-white" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={isDark ? 'mb-2 block text-lg font-semibold text-slate-200' : 'mb-2 block text-lg font-semibold text-slate-700'}>Username</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={isDark ? 'w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-base text-slate-100 outline-none transition focus:border-blue-500 focus:bg-slate-800' : 'w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-base text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white'}
                placeholder="Enter Username"
                required
              />
            </div>

            <div>
              <label className={isDark ? 'mb-2 block text-lg font-semibold text-slate-200' : 'mb-2 block text-lg font-semibold text-slate-700'}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={isDark ? 'w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 pr-11 text-base text-slate-100 outline-none transition focus:border-blue-500 focus:bg-slate-800' : 'w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 pr-11 text-base text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white'}
                  placeholder="Enter Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={isDark ? 'absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-200' : 'absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-slate-700'}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <label className={isDark ? 'flex items-center gap-3 text-base text-slate-300' : 'flex items-center gap-3 text-base text-slate-700'}>
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Remember Me
            </label>

            {error && (
              <div className={isDark ? 'rounded-lg border border-red-700 bg-red-950/50 px-4 py-3 text-sm text-red-300' : 'rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#2f73b7] px-4 py-3 text-xl font-bold text-white shadow-lg shadow-blue-200/20 transition hover:bg-[#285fa2] disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
