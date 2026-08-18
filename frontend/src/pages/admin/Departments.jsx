import { useEffect, useState } from 'react';
import { FaBuilding, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departments';

const BLUE = '#2f73b7';

function DepartmentModal({ department, onClose, onSaved }) {
  const [name, setName] = useState(department?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (department) await updateDepartment(department.id, name);
      else await createDepartment(name);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">{department ? 'Edit Department' : 'Add Department'}</h2>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-700">×</button>
        </div>
        <form onSubmit={submit} className="space-y-5 p-6">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Department name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g. CS" />
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-200">Cancel</button>
            <button disabled={saving} className="rounded-xl px-5 py-2.5 font-semibold text-white disabled:opacity-50" style={{ backgroundColor: BLUE }}>
              {saving ? 'Saving...' : department ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setDepartments(await getDepartments());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (department) => {
    if (!window.confirm(`Delete "${department.name}"? Courses in this department will be unassigned, not deleted.`)) return;
    try {
      await deleteDepartment(department.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: BLUE }}><FaBuilding /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Departments</h1>
            <p className="text-sm text-slate-500">Manage the departments students and teachers are assigned to.</p>
          </div>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="action-primary"><FaPlus /> Add Department</button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Department Name</th>
                <th className="px-5 py-4 text-center">Courses</th>
                <th className="px-5 py-4 text-center">Teachers</th>
                <th className="px-5 py-4 text-center">Students</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="px-5 py-12 text-center text-slate-500">Loading departments...</td></tr>
              ) : departments.length === 0 ? (
                <tr><td colSpan="5" className="px-5 py-12 text-center text-slate-500">No departments yet.</td></tr>
              ) : departments.map((department) => (
                <tr key={department.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-800">{department.name}</td>
                  <td className="px-5 py-4 text-center text-slate-600 font-medium">{department.course_count || 0}</td>
                  <td className="px-5 py-4 text-center text-slate-600 font-medium">{department.teacher_count || 0}</td>
                  <td className="px-5 py-4 text-center text-slate-600 font-medium">{department.student_count || 0}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditing(department); setShowForm(true); }} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title="Edit"><FaEdit /></button>
                      <button onClick={() => handleDelete(department)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Delete"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <DepartmentModal
          department={editing}
          onClose={() => setShowForm(false)}
          onSaved={async () => { setShowForm(false); await load(); }}
        />
      )}
    </div>
  );
}
