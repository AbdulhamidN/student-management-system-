import { useEffect, useMemo, useRef, useState } from 'react';
import { FaFileExcel, FaPlus, FaSearch, FaUserGraduate, FaEdit, FaTrash, FaBookOpen, FaDownload } from 'react-icons/fa';
import { getDepartments } from '../../api/departments';
import { getCoursesByDepartment } from '../../api/courses';
import { createStudent, deleteStudent, getStudentCourses, getStudentCount, getStudents, importStudents, setStudentCourses, updateStudent } from '../../api/students';

const BLUE = '#2f73b7';
const GOLD = '#e5b93b';

const emptyForm = { name: '', email: '', phone: '', department_id: '' };

function StudentModal({ student, departments, onClose, onSaved }) {
  const [form, setForm] = useState(student ? { name: student.name, email: student.email, phone: student.phone || '', department_id: student.department_id || '' } : emptyForm);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!form.department_id) { setCourses([]); setSelectedCourses([]); return; }
    setLoadingCourses(true);
    getCoursesByDepartment(form.department_id)
      .then(setCourses)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingCourses(false));
  }, [form.department_id]);

  useEffect(() => {
    if (!student) return;
    getStudentCourses(student.id).then((items) => setSelectedCourses(items.map((item) => item.id))).catch(() => {});
  }, [student]);

  const toggleCourse = (id) => setSelectedCourses((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const submit = async (event) => {
    event.preventDefault(); setError(''); setSaving(true);
    try {
      let result = null;
      if (student) {
        result = await updateStudent(student.id, form);
        await setStudentCourses(student.id, selectedCourses);
      } else {
        result = await createStudent(form);
        if (selectedCourses.length && result.id) await setStudentCourses(result.id, selectedCourses);
      }
      onSaved(result, form);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <div><h2 className="text-xl font-bold text-slate-900">{student ? 'Edit Student' : 'Add Student'}</h2><p className="text-sm text-slate-500">Student login credentials are generated securely by the server.</p></div>
        <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700">×</button>
      </div>
      <form onSubmit={submit} className="space-y-5 p-6">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Student full name" /></Field>
          <Field label="Email"><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="student@example.com" /></Field>
          <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="0911..." /></Field>
          <Field label="Department"><select required value={form.department_id} onChange={(e) => { setForm({ ...form, department_id: e.target.value }); setSelectedCourses([]); }} className="input"><option value="">Select department</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Courses</label>
          {!form.department_id ? <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">Choose a department to see its courses.</p> : loadingCourses ? <p className="text-sm text-slate-500">Loading courses...</p> : <div className="grid gap-2 sm:grid-cols-3">{courses.map((course) => <label key={course.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3 hover:border-[#2f73b7]"><input type="checkbox" checked={selectedCourses.includes(course.id)} onChange={() => toggleCourse(course.id)} className="h-4 w-4" /> <span className="text-sm text-slate-700">{course.name}</span></label>)}</div>}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-200">Cancel</button><button disabled={saving} className="rounded-xl px-5 py-2.5 font-semibold text-white disabled:opacity-50" style={{ backgroundColor: BLUE }}>{saving ? 'Saving...' : student ? 'Save Changes' : 'Create Student'}</button></div>
      </form>
    </div>
  </div>;
}

function Field({ label, children }) { return <div><label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>{children}</div>; }

function CredentialsModal({ result, onClose }) {
  if (!result) return null;
  const rows = result.imported || [];
  if (result.single) return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-bold text-slate-900">Student created</h2><p className="mt-2 text-sm text-slate-600">Give these temporary credentials to the student. The password is stored only as a hash in the database.</p><div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4"><div><p className="text-xs font-semibold uppercase text-slate-500">Email</p><p className="font-medium text-slate-800">{result.single.email}</p></div><div><p className="text-xs font-semibold uppercase text-slate-500">Temporary password</p><p className="mt-1 font-mono text-slate-900">{result.single.password}</p></div></div><button onClick={onClose} className="mt-6 w-full rounded-xl px-5 py-2.5 font-semibold text-white" style={{ backgroundColor: BLUE }}>Done</button></div></div>;
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4"><div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-bold text-slate-900">Import completed</h2><p className="mt-1 text-sm text-slate-600">Temporary passwords are shown only here. Give each student their own credentials securely.</p><div className="mt-5 overflow-x-auto rounded-xl border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Temporary password</th></tr></thead><tbody>{rows.map((r) => <tr key={`${r.row}-${r.email}`} className="border-t"><td className="px-4 py-3">{r.name}</td><td className="px-4 py-3">{r.email}</td><td className="px-4 py-3 font-mono">{r.temporaryPassword}</td></tr>)}</tbody></table></div>{result.failed?.length > 0 && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"><p className="font-semibold text-red-800">Failed rows</p>{result.failed.map((r) => <p key={`${r.row}-${r.email}`} className="mt-1 text-sm text-red-700">Row {r.row}: {r.error} {r.email && `(${r.email})`}</p>)}</div>}<div className="mt-6 flex justify-end"><button onClick={onClose} className="rounded-xl px-5 py-2.5 font-semibold text-white" style={{ backgroundColor: BLUE }}>Done</button></div></div></div>;
}

export default function Students() {
  const [students, setStudents] = useState([]); const [departments, setDepartments] = useState([]); const [department, setDepartment] = useState('');
  const [count, setCount] = useState(0); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); const [showForm, setShowForm] = useState(false); const [importResult, setImportResult] = useState(null); const [credentials, setCredentials] = useState(null); const fileRef = useRef(null);

  const load = async () => { setLoading(true); try { const [s, d, c] = await Promise.all([getStudents(), getDepartments(), getStudentCount()]); setStudents(s); setDepartments(d.filter((item) => ['CS', 'IT', 'IS'].includes(item.name))); setCount(c); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => students.filter((s) => (!department || String(s.department_id) === String(department)) && (`${s.name} ${s.email}`.toLowerCase().includes(search.toLowerCase()))), [students, department, search]);

  const handleImport = async (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; setError(''); try { const result = await importStudents(file); setImportResult(result); await load(); } catch (err) { setError(err.message); } };
  const downloadTemplate = () => { const blob = new Blob(['name,email,phone,department\nAbebe Kebede,abebe@example.com,0911000000,CS\n'], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'students-import-template.csv'; a.click(); URL.revokeObjectURL(url); };
  const handleDelete = async (id) => { if (!window.confirm('Deactivate this student and disable their login?')) return; try { await deleteStudent(id); await load(); } catch (err) { setError(err.message); } };

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center"><div><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: BLUE }}><FaUserGraduate /></div><div><h1 className="text-2xl font-bold text-slate-900">Student Management</h1><p className="text-sm text-slate-500">Add, import, assign departments and manage courses.</p></div></div></div><div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Students</p><p className="text-2xl font-bold" style={{ color: BLUE }}>{count}</p></div></div>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center"><div className="relative flex-1"><FaSearch className="absolute left-3 top-3.5 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..." className="input pl-10" /></div><select value={department} onChange={(e) => setDepartment(e.target.value)} className="input lg:w-48"><option value="">All departments</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select><button onClick={downloadTemplate} className="action-secondary"><FaDownload /> Template</button><button onClick={() => fileRef.current?.click()} className="action-secondary"><FaFileExcel /> Import Excel</button><input ref={fileRef} type="file" accept=".xlsx,.csv" onChange={handleImport} className="hidden" /><button onClick={() => { setEditing(null); setShowForm(true); }} className="action-primary"><FaPlus /> Add Student</button></div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Student</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4">Department</th><th className="px-5 py-4">Courses</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-500">Loading students...</td></tr> : filtered.length === 0 ? <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-500">No students found.</td></tr> : filtered.map((student) => <tr key={student.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: BLUE }}>{student.name?.charAt(0)?.toUpperCase()}</div><span className="font-semibold text-slate-800">{student.name}</span></div></td><td className="px-5 py-4 text-slate-600">{student.email}</td><td className="px-5 py-4 text-slate-600">{student.phone || '—'}</td><td className="px-5 py-4"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold" style={{ color: BLUE }}>{student.department_name || 'Unassigned'}</span></td><td className="px-5 py-4"><span className="inline-flex items-center gap-1 text-slate-600"><FaBookOpen className="text-xs" /> {student.course_count || 0}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => { setEditing(student); setShowForm(true); }} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Edit"><FaEdit /></button><button onClick={() => handleDelete(student.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Deactivate"><FaTrash /></button></div></td></tr>)}</tbody></table></div></div>
    {showForm && <StudentModal student={editing} departments={departments} onClose={() => setShowForm(false)} onSaved={async (result, form) => { setShowForm(false); await load(); if (!editing && result?.temporaryPassword) setCredentials({ single: { email: form.email, password: result.temporaryPassword } }); }} />}
    <CredentialsModal result={importResult || credentials} onClose={() => { setImportResult(null); setCredentials(null); }} />
  </div>;
}
