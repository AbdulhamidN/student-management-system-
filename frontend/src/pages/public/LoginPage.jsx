import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api/config';

export default function LoginPage() {
  const navigate = useNavigate();
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
    <div className="min-h-[70vh] bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <div className="flex justify-center">
          <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full border-[6px] border-[#e5b93b] bg-[#2f73b7] shadow-lg shadow-blue-200">
            <FaGraduationCap className="text-5xl text-white" />
          </div>
        </div>

        <h1 className="text-center text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
          Student Management System
        </h1>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl shadow-slate-200 ring-1 ring-slate-200 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-xl font-semibold text-slate-700">Username</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-4 text-lg text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
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
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-4 pr-12 text-lg text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                  placeholder="Enter Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-slate-700"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 text-lg text-slate-700">
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
