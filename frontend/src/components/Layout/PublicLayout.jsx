import { useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { FaGraduationCap, FaMoon, FaSun } from 'react-icons/fa';

const PublicLayout = () => {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={isDark ? 'flex min-h-screen flex-col bg-slate-950 text-slate-100' : 'flex min-h-screen flex-col bg-slate-100 text-slate-800'}>
      <header className={isDark ? 'border-b border-slate-800 bg-slate-900/90 shadow-sm backdrop-blur-sm' : 'border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm'}>
        <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-4 sm:px-6 lg:px-8">
          <div className="justify-self-start">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#2f73b7] text-white shadow-md">
                <FaGraduationCap className="text-xl" />
              </div>
              <div className={isDark ? 'text-lg font-bold tracking-tight text-slate-100' : 'text-lg font-bold tracking-tight text-slate-800'}>Student Management System</div>
            </Link>
          </div>

          <div className="hidden items-center justify-center gap-8 md:flex">
            <NavLink to="/" className={({ isActive }) => `font-medium ${isActive ? (isDark ? 'text-[#7bb7ff]' : 'text-[#2f73b7]') : isDark ? 'text-slate-300 hover:text-[#7bb7ff]' : 'text-slate-600 hover:text-[#2f73b7]'}`}>
              Home
            </NavLink>
            <NavLink to="/announcements" className={({ isActive }) => `font-medium ${isActive ? (isDark ? 'text-[#7bb7ff]' : 'text-[#2f73b7]') : isDark ? 'text-slate-300 hover:text-[#7bb7ff]' : 'text-slate-600 hover:text-[#2f73b7]'}`}>
              Announcements
            </NavLink>
          </div>

          <div className="justify-self-end">
            <button
              type="button"
              aria-label="Toggle dark mode"
              onClick={() => setIsDark((prev) => !prev)}
              className={isDark
                ? 'flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 shadow-sm transition hover:border-slate-600'
                : 'flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300'}
            >
              {isDark ? <FaSun className="text-[#facc15]" /> : <FaMoon className="text-[#2f73b7]" />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet context={{ isDark }} />
      </main>

      <footer className={isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-900 text-slate-200'}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div>
              <div className="text-lg font-bold text-white">Student Management System</div>
              <p className="mt-1 text-sm text-slate-400">Smart academic management for students, teachers, and administrators.</p>
            </div>
            <div className="text-sm text-slate-400">© {new Date().getFullYear()} All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
