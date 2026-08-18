import { useState, useEffect } from 'react';
import { getStudentsForGradebook, updateStudentMarks } from '../../api/teacherApi';

export default function TeacherGradebook() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetterFilter, setSelectedLetterFilter] = useState('ALL');

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [midMarkInput, setMidMarkInput] = useState('0');
  const [finalMarkInput, setFinalMarkInput] = useState('0');
  const [assessmentMarkInput, setAssessmentMarkInput] = useState('0');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const data = await getStudentsForGradebook();
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load gradebook', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  const openMarkModal = (student) => {
    setEditingStudent(student);
    setMidMarkInput(String(student.mid_mark || 0));
    setFinalMarkInput(String(student.final_mark || 0));
    setAssessmentMarkInput(String(student.assessment_mark || 0));
    setModalError('');
    setModalSuccess('');
  };

  const closeMarkModal = () => {
    setEditingStudent(null);
    setModalError('');
    setModalSuccess('');
  };

  // Helper for Letter Grade Calculation
  const computeLetter = (total) => {
    const score = Number(total) || 0;
    if (score >= 90) return { letter: 'A', text: 'Excellent', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' };
    if (score >= 80) return { letter: 'B', text: 'Very Good', bg: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300' };
    if (score >= 70) return { letter: 'C', text: 'Good', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' };
    if (score >= 60) return { letter: 'D', text: 'Satisfactory', bg: 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300' };
    return { letter: 'F', text: 'Needs Improvement', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300' };
  };

  // Compute total & letter preview in modal
  const modalMid = Math.max(0, Math.min(20, Number(midMarkInput) || 0));
  const modalFinal = Math.max(0, Math.min(50, Number(finalMarkInput) || 0));
  const modalAssessment = Math.max(0, Math.min(30, Number(assessmentMarkInput) || 0));
  const modalTotal = (modalMid + modalFinal + modalAssessment).toFixed(2);
  const modalGrade = computeLetter(modalTotal);

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    const midNum = Number(midMarkInput);
    const finalNum = Number(finalMarkInput);
    const assessmentNum = Number(assessmentMarkInput);

    if (isNaN(midNum) || midNum < 0 || midNum > 20) {
      setModalError('Midterm exam mark must be between 0 and 20 points.');
      return;
    }
    if (isNaN(finalNum) || finalNum < 0 || finalNum > 50) {
      setModalError('Final exam mark must be between 0 and 50 points.');
      return;
    }
    if (isNaN(assessmentNum) || assessmentNum < 0 || assessmentNum > 30) {
      setModalError('Assessment mark must be between 0 and 30 points.');
      return;
    }

    try {
      setSaving(true);
      await updateStudentMarks(editingStudent.id, {
        mid_mark: midNum,
        final_mark: finalNum,
        assessment_mark: assessmentNum,
      });

      setModalSuccess('Marks updated successfully!');
      setTimeout(() => {
        closeMarkModal();
        fetchRoster();
      }, 700);
    } catch (err) {
      setModalError(err.message || 'Failed to update marks.');
    } finally {
      setSaving(false);
    }
  };

  // Filtering
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLetter = selectedLetterFilter === 'ALL' || s.letter_grade === selectedLetterFilter;
    return matchesSearch && matchesLetter;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Student Gradebook
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter and manage student midterm, final, and assessment grades.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student by name or email..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-4 pr-10 text-sm text-slate-900 transition focus:border-[#2f73b7] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedLetterFilter}
            onChange={(e) => setSelectedLetterFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-700 transition focus:border-[#2f73b7] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="ALL">All Grades (A–F)</option>
            <option value="A">Grade A (90–100)</option>
            <option value="B">Grade B (80–89)</option>
            <option value="C">Grade C (70–79)</option>
            <option value="D">Grade D (60–69)</option>
            <option value="F">Grade F (&lt;60)</option>
          </select>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Student Name</th>
                <th className="px-4 py-3.5">Grade Level</th>
                <th className="px-4 py-3.5 text-center">Midterm (Max 20)</th>
                <th className="px-4 py-3.5 text-center">Final (Max 50)</th>
                <th className="px-4 py-3.5 text-center">Assessment (Max 30)</th>
                <th className="px-4 py-3.5 text-center">Total Score (100)</th>
                <th className="px-4 py-3.5 text-center">Letter Grade</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredStudents.map((student, idx) => {
                const gradeInfo = computeLetter(student.total_mark);
                return (
                  <tr
                    key={student.id}
                    className="transition hover:bg-slate-50/80 dark:hover:bg-slate-700/30"
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-xs font-bold text-slate-500">
                      {idx + 1}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {student.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{student.email}</div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {student.grade}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                      {student.mid_mark} <span className="text-xs font-normal text-slate-400">/ 20</span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                      {student.final_mark} <span className="text-xs font-normal text-slate-400">/ 50</span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                      {student.assessment_mark} <span className="text-xs font-normal text-slate-400">/ 30</span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      <span className="text-base font-extrabold text-[#2f73b7] dark:text-blue-400">
                        {student.total_mark}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${gradeInfo.bg}`}>
                        Grade {gradeInfo.letter} ({gradeInfo.text})
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      <button
                        onClick={() => openMarkModal(student)}
                        className="inline-flex items-center space-x-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#2f73b7] transition hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/50"
                      >
                        <span>Put Marks</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && !loading && (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No student records found matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Marks Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Enter Marks
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {editingStudent.name} ({editingStudent.grade})
                </p>
              </div>
              <button
                onClick={closeMarkModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMarks} className="space-y-4 p-6">
              {modalError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-300">
                  ⚠️ {modalError}
                </div>
              )}

              {modalSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-300">
                  ✅ {modalSuccess}
                </div>
              )}

              {/* Midterm Mark Input */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <label htmlFor="midMark">Midterm Exam</label>
                  <span className="text-slate-400">Range: 0 – 20 pts</span>
                </div>
                <input
                  id="midMark"
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={midMarkInput}
                  onChange={(e) => setMidMarkInput(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 transition focus:border-[#2f73b7] focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  required
                />
              </div>

              {/* Final Exam Input */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <label htmlFor="finalMark">Final Exam</label>
                  <span className="text-slate-400">Range: 0 – 50 pts</span>
                </div>
                <input
                  id="finalMark"
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={finalMarkInput}
                  onChange={(e) => setFinalMarkInput(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 transition focus:border-[#2f73b7] focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  required
                />
              </div>

              {/* Assessment Input */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <label htmlFor="assessmentMark">Assessment / Coursework</label>
                  <span className="text-slate-400">Range: 0 – 30 pts</span>
                </div>
                <input
                  id="assessmentMark"
                  type="number"
                  step="0.5"
                  min="0"
                  max="30"
                  value={assessmentMarkInput}
                  onChange={(e) => setAssessmentMarkInput(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 transition focus:border-[#2f73b7] focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  required
                />
              </div>

              {/* Real-time Calculation Summary Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Calculated Total Score:</span>
                  <span className="text-base font-extrabold text-[#2f73b7] dark:text-blue-400">
                    {modalTotal} / 100
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Predicted Letter Grade:
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${modalGrade.bg}`}>
                    Grade {modalGrade.letter} ({modalGrade.text})
                  </span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeMarkModal}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#2f73b7] px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#285fa2] active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Marks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
