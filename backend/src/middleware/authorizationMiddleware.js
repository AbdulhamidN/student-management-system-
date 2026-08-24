const studentModel = require('../models/studentModel');

const rolePermissions = {
  admin: new Set(['students:read', 'students:read:own', 'students:write', 'teachers:read', 'teachers:write', 'courses:read', 'courses:read:own', 'courses:write', 'departments:read', 'departments:write']),
  teacher: new Set(['students:read:own-department', 'courses:read:own-department']),
  student: new Set(['students:read:own', 'courses:read:own']),
};

function deny(res) {
  return res.status(403).json({ success: false, message: 'Access denied.' });
}

function requirePermission(permission, objectPolicy = null) {
  return async (req, res, next) => {
    try {
      if (!req.user || !rolePermissions[req.user.role]?.has(permission)) return deny(res);
      if (objectPolicy && !(await objectPolicy(req))) return deny(res);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function requireAnyPermission(permissions, objectPolicy = null) {
  return async (req, res, next) => {
    try {
      const allowed = permissions.some((permission) => rolePermissions[req.user?.role]?.has(permission));
      if (!req.user || !allowed) return deny(res);
      if (objectPolicy && !(await objectPolicy(req))) return deny(res);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

async function studentRecordPolicy(req) {
  if (req.user.role === 'admin') return true;
  const student = await studentModel.getStudentById(req.params.id);
  if (!student) return false;
  if (req.user.role === 'student') return Number(student.user_id) === Number(req.user.id);
  return req.user.role === 'teacher' && Number(student.department_id) === Number(req.user.departmentId);
}

async function studentTargetPolicy(req) {
  if (req.user.role === 'admin') return true;
  const studentId = req.params.studentId || req.params.id;
  const student = await studentModel.getStudentById(studentId);
  if (!student) return false;
  if (req.user.role === 'student') return Number(student.user_id) === Number(req.user.id);
  return req.user.role === 'teacher' && Number(student.department_id) === Number(req.user.departmentId);
}

module.exports = {
  requirePermission,
  requireAnyPermission,
  studentRecordPolicy,
  studentTargetPolicy,
};