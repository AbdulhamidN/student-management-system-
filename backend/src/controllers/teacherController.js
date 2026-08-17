const teacherModel = require('../models/teacherModel');

function validate(data) {
  if (!data.name || data.name.length < 2 || data.name.length > 100) return 'Name must be between 2 and 100 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'A valid email address is required.';
  if (data.phone && data.phone.length > 20) return 'Phone number must be 20 characters or fewer.';
  if (!Number.isInteger(data.department_id) || data.department_id < 1) return 'Department is required.';
  return null;
}

exports.getAllTeachers = async (req, res, next) => {
  try { return res.json({ success: true, data: await teacherModel.getAllTeachers() }); }
  catch (error) { return next(error); }
};

exports.getTeacherCourses = async (req, res, next) => {
  try { return res.json({ success: true, data: await teacherModel.getTeacherCourses(req.params.id) }); }
  catch (error) { return next(error); }
};

exports.createTeacher = async (req, res, next) => {
  try {
    const data = teacherModel.normalizeTeacher(req.body);
    const validationError = validate(data);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const result = await teacherModel.createTeacher(data);
    return res.status(201).json({ success: true, message: 'Teacher created successfully.', ...result });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to create teacher.' });
  }
};

exports.updateTeacher = async (req, res, next) => {
  try {
    const data = teacherModel.normalizeTeacher(req.body);
    const validationError = validate(data);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const result = await teacherModel.updateTeacher(req.params.id, data);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Teacher not found.' });
    return res.json({ success: true, message: 'Teacher updated successfully.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to update teacher.' });
  }
};

exports.deleteTeacher = async (req, res, next) => {
  try {
    const result = await teacherModel.deleteTeacher(req.params.id);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Teacher not found.' });
    return res.json({ success: true, message: 'Teacher deactivated successfully.' });
  } catch (error) { return next(error); }
};
