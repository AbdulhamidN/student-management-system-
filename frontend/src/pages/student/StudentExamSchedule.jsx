import { useState, useEffect } from 'react';
import { getExamSchedules } from '../../api/studentPortalApi';

export default function StudentExamSchedule() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getExamSchedules()
      .then((data) => {
        if (isMounted) {
          setExams(data || []);
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
        Loading exam schedules...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Teacher-Posted Exam Schedule
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Official timetable for midterm exams, final assessments, and practical quizzes.
        </p>
      </div>

      {/* Exam Cards List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-800"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  {new Date(exam.exam_date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {exam.grade}
                </span>
              </div>

              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{exam.title}</h3>
              <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Subject: {exam.subject}
              </p>

              <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Time Window:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {exam.start_time} – {exam.end_time}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Exam Hall / Location:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {exam.location || 'Assigned Examination Room'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Instructor:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {exam.teacher_name || 'Department Instructor'}
                  </span>
                </div>
              </div>

              {exam.notes && (
                <div className="mt-3 text-xs text-slate-500 italic dark:text-slate-400">
                  Instructions: "{exam.notes}"
                </div>
              )}
            </div>
          </div>
        ))}

        {exams.length === 0 && (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
            No upcoming exam schedules posted by your instructor.
          </div>
        )}
      </div>
    </div>
  );
}
