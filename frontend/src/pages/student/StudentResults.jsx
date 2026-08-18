import { useState, useEffect } from 'react';
import { getAcademicResults } from '../../api/studentPortalApi';

export default function StudentResults() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getAcademicResults()
      .then((data) => {
        if (isMounted) {
          setResults(data);
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
        Loading academic results...
      </div>
    );
  }

  if (!results) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Results Record Found</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Your marks have not been entered into the gradebook yet. Please contact your instructor.
        </p>
      </div>
    );
  }

  const getGradePill = (grade) => {
    if (grade === 'A') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300';
    if (grade === 'B') return 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300';
    if (grade === 'C') return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300';
    if (grade === 'D') return 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300';
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300';
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Academic Results
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your evaluation report for midterm, final exam, and coursework marks.
        </p>
      </div>

      {/* Main Results Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-800">
        {/* Card Header */}
        <div className="border-b border-slate-100 bg-slate-50/80 p-6 dark:border-slate-700/60 dark:bg-slate-900/50">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{results.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Grade Level: <span className="font-semibold text-slate-700 dark:text-slate-200">{results.grade}</span> | Instructor: <span className="font-semibold text-slate-700 dark:text-slate-200">{results.teacher_name || 'Assigned Instructor'}</span>
              </p>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center rounded-xl px-4 py-1.5 text-lg font-extrabold ${getGradePill(results.letter_grade)}`}>
                Grade {results.letter_grade}
              </span>
              <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{results.grade_description}</p>
            </div>
          </div>
        </div>

        {/* Detailed Mark Breakdown Grid */}
        <div className="p-6 sm:p-8">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Component Breakdown</h3>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Midterm */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700/60 dark:bg-slate-900/60">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold">Midterm Exam</span>
                <span>Max 20 pts</span>
              </div>
              <h4 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                {results.mid_mark} <span className="text-sm font-normal text-slate-400">/ 20</span>
              </h4>
            </div>

            {/* Final Exam */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700/60 dark:bg-slate-900/60">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold">Final Exam</span>
                <span>Max 50 pts</span>
              </div>
              <h4 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                {results.final_mark} <span className="text-sm font-normal text-slate-400">/ 50</span>
              </h4>
            </div>

            {/* Assessment / Coursework */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700/60 dark:bg-slate-900/60">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold">Coursework Assessment</span>
                <span>Max 30 pts</span>
              </div>
              <h4 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                {results.assessment_mark} <span className="text-sm font-normal text-slate-400">/ 30</span>
              </h4>
            </div>
          </div>

          {/* Overall Score Box */}
          <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 dark:border-blue-900/50 dark:bg-blue-950/40 sm:flex-row sm:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Score</span>
              <h4 className="mt-1 text-3xl font-extrabold text-[#2f73b7] dark:text-blue-400">
                {results.total_mark} / 100 Points
              </h4>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Letter Grade</span>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                Grade {results.letter_grade} ({results.grade_description})
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
