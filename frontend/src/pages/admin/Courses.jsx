import { useEffect, useMemo, useState } from 'react';
import { FaBookOpen, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { getDepartments } from '../../api/departments';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../api/courses';

const BLUE = '#2f73b7';
const emptyForm = { name: '', code: '', department_id: '' };

function CourseModal({ course, departments, onClose, onSaved }) {
  const [form, setForm] = useState(
    course ? { name: course.name, code: course.code, department_id: course.department_id || '' } : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (course) await updateCourse(course.id, form);
      else await createCourse(form);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">{course ? 'Edit Course' : 'Add Course'}</h2>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700">×</button>
        </div>
        <form onSubmit={submit} className="space-y-5 p-6">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Course name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="e.g. Database Systems" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Course code</label>
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input" placeholder="e.g. DB" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Department</label>
            <select required value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} className="input">
              <option value="">Select department</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-200">Cancel</button>
            <button disabled={saving} className="rounded-xl px-5 py-2.5 font-semibold text-white disabled:opacity-50" style={{ backgroundColor: BLUE }}>
              {saving ? 'Saving...' : course ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [c, d] = await Promise.all([getCourses(), getDepartments()]);
      setCourses(c);
      setDepartments(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => courses.filter(
      (c) => (!department || String(c.department_id) === String(department))
        && (`${c.name} ${c.code}`.toLowerCase().includes(search.toLowerCase()))
    ),
    [courses, department, search]
  );

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.name}"? Students and teachers currently assigned to it will lose that assignment.`)) return;
    try {
      await deleteCourse(course.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: BLUE }}><FaBookOpen /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
            <p className="text-sm text-slate-500">Manage the courses offered by each department.</p>
          </div>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="action-primary"><FaPlus /> Add Course</button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or code..." className="input pl-10" />
        </div>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="input lg:w-48">
          <option value="">All departments</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Course</th>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="px-5 py-12 text-center text-slate-500">Loading courses...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="4" className="px-5 py-12 text-center text-slate-500">No courses found.</td></tr>
              ) : filtered.map((course) => (
                <tr key={course.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-800">{course.name}</td>
                  <td className="px-5 py-4 text-slate-600">{course.code}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold" style={{ color: BLUE }}>
                      {course.department_name || 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditing(course); setShowForm(true); }} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Edit"><FaEdit /></button>
                      <button onClick={() => handleDelete(course)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Delete"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <CourseModal
          course={editing}
          departments={departments}
          onClose={() => setShowForm(false)}
          onSaved={async () => { setShowForm(false); await load(); }}
        />
      )}
    </div>
  );
}
