const studentModel = require('../models/studentModel');
const teacherModel = require('../models/teacherModel');

exports.getAllStudents = async (req, res, next) => {
  try {
    let teacherIdFilter = null;

    if (req.user.role === 'teacher') {
      const teacherProfile = await teacherModel.getTeacherByUserId(req.user.id);
      if (teacherProfile && req.query.scoped === 'true') {
        teacherIdFilter = teacherProfile.id;
      }
    }

    const students = await studentModel.getAllStudents({ teacher_id: teacherIdFilter });
    return res.json({ success: true, data: students });
  } catch (error) {
    return next(error);
  }
};

exports.getStudentById = async (req, res, next) => {
  try {
    const student = await studentModel.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    return res.json({ success: true, data: student });
  } catch (error) {
    return next(error);
  }
};

exports.updateStudentMarks = async (req, res, next) => {
  try {
    const { mid_mark, final_mark, assessment_mark } = req.body;
    const updated = await studentModel.updateStudentMarks(req.params.id, {
      mid_mark,
      final_mark,
      assessment_mark,
    });

    return res.json({
      success: true,
      message: 'Student marks updated successfully.',
      data: updated,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return next(error);
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Student account creation is managed strictly by Administrators.',
      });
    }

    const created = await studentModel.createStudent(req.body);
    return res.status(201).json({
      success: true,
      message: 'Student record created successfully.',
      data: created,
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A student with this email already exists.' });
    }
    return next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Editing student personal information is managed strictly by Administrators.',
      });
    }

    const result = await studentModel.updateStudent(req.params.id, req.body);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Student not found.' });

    const updated = await studentModel.getStudentById(req.params.id);
    return res.json({ success: true, message: 'Student personal information updated successfully.', data: updated });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A student with this email already exists.' });
    }
    return next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Deleting student records is managed strictly by Administrators.',
      });
    }

    const result = await studentModel.deleteStudent(req.params.id);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Student not found.' });

    return res.json({ success: true, message: 'Student record deleted successfully.' });
  } catch (error) {
    return next(error);
  }
};
