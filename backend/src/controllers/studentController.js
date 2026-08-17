const studentModel = require('../models/studentModel');
const { parseSpreadsheet, rowsToObjects } = require('../utils/spreadsheetParser');
const { pool } = require('../config/db');

function sanitizeStudentInput(body = {}) {
  return {
    name: String(body.name || '').trim().replace(/\s+/g, ' '),
    email: String(body.email || '').trim().toLowerCase(),
    phone: body.phone ? String(body.phone).trim() : null,
    department_id: body.department_id ? Number(body.department_id) : null,
  };
}

function validateStudent(data) {
  if (!data.name || data.name.length < 2 || data.name.length > 100) return 'Name must be between 2 and 100 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'A valid email address is required.';
  if (data.phone && data.phone.length > 20) return 'Phone number must be 20 characters or fewer.';
  if (data.department_id !== null && (!Number.isInteger(data.department_id) || data.department_id < 1)) return 'Department is invalid.';
  return null;
}

exports.createStudent = async (req, res, next) => {
  try {
    const data = sanitizeStudentInput(req.body);
    const validationError = validateStudent(data);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    if (!(await studentModel.validateDepartment(data.department_id))) {
      return res.status(400).json({ success: false, message: 'Selected department does not exist.' });
    }

    const result = await studentModel.createStudent(data);
    return res.status(201).json({
      success: true,
      message: 'Student created successfully.',
      id: result.insertId,
      temporaryPassword: result.temporaryPassword,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'A student or user with this email already exists.' });
    return next(error);
  }
};

exports.getAllStudents = async (req, res, next) => {
  try { return res.json({ success: true, data: await studentModel.getAllStudents() }); }
  catch (error) { return next(error); }
};

exports.getStudentById = async (req, res, next) => {
  try {
    const student = await studentModel.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    return res.json({ success: true, data: student });
  } catch (error) { return next(error); }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const data = sanitizeStudentInput(req.body);
    const validationError = validateStudent(data);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    if (!(await studentModel.validateDepartment(data.department_id))) {
      return res.status(400).json({ success: false, message: 'Selected department does not exist.' });
    }
    const result = await studentModel.updateStudent(req.params.id, data);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Student not found.' });
    return res.json({ success: true, message: 'Student updated successfully.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'A student or user with this email already exists.' });
    return next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const result = await studentModel.deleteStudent(req.params.id);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Student not found.' });
    return res.json({ success: true, message: 'Student deactivated successfully.' });
  } catch (error) { return next(error); }
};

exports.getStudentCount = async (req, res, next) => {
  try { return res.json({ success: true, count: await studentModel.getActiveStudentCount() }); }
  catch (error) { return next(error); }
};

exports.getStudentsByDepartment = async (req, res, next) => {
  try { return res.json({ success: true, data: await studentModel.getStudentsByDepartment(req.params.deptId) }); }
  catch (error) { return next(error); }
};

exports.getStudentCourses = async (req, res, next) => {
  try {
    const student = await studentModel.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    return res.json({ success: true, data: await studentModel.getStudentCourses(req.params.id) });
  } catch (error) { return next(error); }
};

exports.setCourses = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body.courseIds)) return res.status(400).json({ success: false, message: 'courseIds must be an array.' });
    await studentModel.setStudentCourses(req.params.id, req.body.courseIds);
    return res.json({ success: true, message: 'Student courses updated successfully.' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to update student courses.' });
  }
};

exports.assignCourse = async (req, res, next) => {
  try {
    const current = await studentModel.getStudentCourses(req.params.id);
    const courseId = Number(req.body.courseId);
    if (!Number.isInteger(courseId)) return res.status(400).json({ success: false, message: 'A valid courseId is required.' });
    if (!current.some((course) => course.id === courseId)) current.push({ id: courseId });
    await studentModel.setStudentCourses(req.params.id, current.map((course) => course.id));
    return res.status(201).json({ success: true, message: 'Course assigned successfully.' });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

exports.removeCourseFromStudent = async (req, res, next) => {
  try {
    const result = await studentModel.removeCourseFromStudent(req.params.id, req.params.courseId);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Course assignment not found.' });
    return res.json({ success: true, message: 'Course removed from student.' });
  } catch (error) { return next(error); }
};

exports.importStudents = async (req, res, next) => {
  try {
    const extension = req.file.originalname.toLowerCase().slice(req.file.originalname.lastIndexOf('.'));
    if (!['.xlsx', '.csv'].includes(extension)) {
      return res.status(400).json({ success: false, message: 'Only .xlsx and .csv files are supported.' });
    }

    const rows = rowsToObjects(parseSpreadsheet(req.file.buffer, req.file.originalname));
    if (!rows.length) return res.status(400).json({ success: false, message: 'The spreadsheet contains no student rows.' });
    if (rows.length > 5000) return res.status(400).json({ success: false, message: 'A single upload can contain at most 5,000 students.' });

    const departments = await pool.execute('SELECT id, name FROM departments');
    const departmentMap = new Map(departments[0].map((d) => [d.name.toLowerCase(), d.id]));
    const seen = new Set();
    const imported = [];
    const failed = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const line = index + 2;
      const email = String(row.email || '').trim().toLowerCase();
      const name = String(row.name || '').trim().replace(/\s+/g, ' ');
      const phone = row.phone ? String(row.phone).trim() : null;
      const departmentName = String(row.department || '').trim();
      const departmentId = departmentName ? departmentMap.get(departmentName.toLowerCase()) : null;

      if (!name || name.length < 2) { failed.push({ row: line, email, error: 'Name is required.' }); continue; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { failed.push({ row: line, email, error: 'Valid email is required.' }); continue; }
      if (seen.has(email)) { failed.push({ row: line, email, error: 'Duplicate email in this file.' }); continue; }
      seen.add(email);
      if (departmentName && !departmentId) { failed.push({ row: line, email, error: `Unknown department "${departmentName}".` }); continue; }

      try {
        const result = await studentModel.createStudent({ name, email, phone, department_id: departmentId });
        imported.push({ row: line, name, email, temporaryPassword: result.temporaryPassword });
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') failed.push({ row: line, email, error: 'Email already exists in the system.' });
        else failed.push({ row: line, email, error: 'Unable to create this student.' });
      }
    }

    return res.status(201).json({
      success: true,
      message: `Import finished: ${imported.length} imported, ${failed.length} failed.`,
      importedCount: imported.length,
      failedCount: failed.length,
      imported,
      failed,
    });
  } catch (error) { return next(error); }
};
