import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { FaGraduationCap, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api/config';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark } = useOutletContext();
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
    <div className={`min-h-[70vh] px-4 py-10 transition-colors sm:px-6 lg:px-8 ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
      <div className="mx-auto max-w-xl">
        <div className="flex justify-center">
          <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full border-[6px] border-[#e5b93b] bg-[#2f73b7] shadow-lg shadow-blue-200">
            <FaGraduationCap className="text-5xl text-white" />
          </div>
        </div>

        <h1 className={`text-center text-3xl font-bold tracking-tight sm:text-4xl ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
          Student Management System
        </h1>

        <div className={`mt-8 rounded-2xl p-6 shadow-xl ring-1 sm:p-8 ${isDark ? 'bg-slate-900 shadow-black/30 ring-slate-800' : 'bg-white shadow-slate-200 ring-slate-200'}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-xl font-semibold text-slate-700">Username</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-4 text-lg outline-none transition focus:border-blue-500 ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100 focus:bg-slate-800' : 'border-slate-300 bg-slate-50 text-slate-700 focus:bg-white'}`}
                placeholder="Enter Username"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xl font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-4 pr-12 text-lg outline-none transition focus:border-blue-500 ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100 focus:bg-slate-800' : 'border-slate-300 bg-slate-50 text-slate-700 focus:bg-white'}`}
                  placeholder="Enter Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={`absolute inset-y-0 right-4 flex items-center ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <label className={`flex items-center gap-3 text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Remember Me
            </label>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#2f73b7] px-4 py-4 text-2xl font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-[#285fa2] disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
