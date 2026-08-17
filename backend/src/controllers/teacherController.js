const teacherModel = require('../models/teacherModel');

exports.getTeacherProfile = async (req, res, next) => {
  try {
    const profile = await teacherModel.getTeacherByUserId(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found.' });
    }
    return res.json({ success: true, data: profile });
  } catch (error) {
    return next(error);
  }
};

exports.updateTeacherProfile = async (req, res, next) => {
  try {
    const { name, department, subject, phone, bio } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters long.' });
    }
    await teacherModel.updateTeacherProfile(req.user.id, { name, department, subject, phone, bio });
    const updated = await teacherModel.getTeacherByUserId(req.user.id);
    return res.json({ success: true, message: 'Profile updated successfully.', data: updated });
  } catch (error) {
    return next(error);
  }
};

exports.getAllTeachers = async (req, res, next) => {
  try {
    return res.json({ success: true, data: await teacherModel.getAllTeachers() });
  } catch (error) {
    return next(error);
  }
};

exports.getTeacherById = async (req, res, next) => {
  try {
    const teacher = await teacherModel.getTeacherById(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found.' });
    return res.json({ success: true, data: teacher });
  } catch (error) {
    return next(error);
  }
};

exports.createTeacher = async (req, res, next) => {
  try {
    const result = await teacherModel.createTeacher(req.body);
    return res.status(201).json({ success: true, message: 'Teacher created successfully.', ...result });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    return next(error);
  }
};

exports.updateTeacher = async (req, res, next) => {
  try {
    const result = await teacherModel.updateTeacher(req.params.id, req.body);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Teacher not found.' });
    return res.json({ success: true, message: 'Teacher updated successfully.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    return next(error);
  }
};

exports.deleteTeacher = async (req, res, next) => {
  try {
    const result = await teacherModel.deleteTeacher(req.params.id);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Teacher not found.' });
    return res.json({ success: true, message: 'Teacher deleted successfully.' });
  } catch (error) {
    return next(error);
  }
};
