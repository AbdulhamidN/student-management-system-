const studentPortalModel = require('../models/studentPortalModel');
const teacherModel = require('../models/teacherModel');

// Helper to ensure student record exists for user
async function resolveStudent(req) {
  const profile = await studentPortalModel.getStudentByUserId(req.user.id);
  if (!profile) {
    const error = new Error('Student profile record not found.');
    error.statusCode = 404;
    throw error;
  }
  return profile;
}

exports.getStudentProfile = async (req, res, next) => {
  try {
    const profile = await resolveStudent(req);
    return res.json({ success: true, data: profile });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  }
};

exports.getSelfSchedule = async (req, res, next) => {
  try {
    const profile = await resolveStudent(req);
    const schedules = await studentPortalModel.getStudentSelfSchedule(profile.id);
    return res.json({ success: true, data: schedules });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  }
};

exports.createSelfSchedule = async (req, res, next) => {
  try {
    const profile = await resolveStudent(req);
    const { title, day_of_week, start_time, end_time, description } = req.body;

    if (!title || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Title, day of week, start time, and end time are required.' });
    }

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(day_of_week)) {
      return res.status(400).json({ success: false, message: 'Invalid day of week.' });
    }

    await studentPortalModel.addStudentSelfSchedule(profile.id, {
      title,
      day_of_week,
      start_time,
      end_time,
      description,
    });

    const updatedSchedule = await studentPortalModel.getStudentSelfSchedule(profile.id);
    return res.status(201).json({ success: true, message: 'Schedule item added successfully.', data: updatedSchedule });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  }
};

exports.deleteSelfSchedule = async (req, res, next) => {
  try {
    const profile = await resolveStudent(req);
    const result = await studentPortalModel.deleteStudentSelfSchedule(profile.id, req.params.id);
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Schedule item not found.' });
    }
    return res.json({ success: true, message: 'Schedule item deleted.' });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  }
};

exports.getAcademicResults = async (req, res, next) => {
  try {
    const profile = await resolveStudent(req);
    return res.json({
      success: true,
      data: {
        id: profile.id,
        name: profile.name,
        grade: profile.grade,
        mid_mark: profile.mid_mark,
        final_mark: profile.final_mark,
        assessment_mark: profile.assessment_mark,
        total_mark: profile.total_mark,
        letter_grade: profile.letter_grade,
        grade_description: profile.grade_description,
        rank: profile.rank,
        notes: profile.notes,
        teacher_name: profile.teacher_name,
        teacher_department: profile.teacher_department,
      },
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  }
};

exports.getExamSchedules = async (req, res, next) => {
  try {
    const profile = await resolveStudent(req);
    const exams = await studentPortalModel.getExamSchedulesForStudent(profile.grade, profile.teacher_id);
    return res.json({ success: true, data: exams });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  }
};

exports.createExamSchedule = async (req, res, next) => {
  try {
    const teacher = await teacherModel.getTeacherByUserId(req.user.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found.' });

    const { title, subject, grade, exam_date, start_time, end_time, location, notes } = req.body;
    if (!title || !subject || !grade || !exam_date || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Title, subject, grade, exam date, start time, and end time are required.' });
    }

    await studentPortalModel.addExamSchedule(teacher.id, {
      title,
      subject,
      grade,
      exam_date,
      start_time,
      end_time,
      location,
      notes,
    });

    return res.status(201).json({ success: true, message: 'Exam schedule created successfully.' });
  } catch (error) {
    return next(error);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const profile = await resolveStudent(req);
    const notifications = await studentPortalModel.getStudentNotifications(profile.id);
    return res.json({ success: true, data: notifications });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    const profile = await resolveStudent(req);
    await studentPortalModel.markNotificationRead(profile.id, req.params.id);
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    return next(error);
  }
};

exports.sendNotification = async (req, res, next) => {
  try {
    const teacher = await teacherModel.getTeacherByUserId(req.user.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found.' });

    const { recipient_student_id, title, message } = req.body;
    if (!recipient_student_id || !title || !message) {
      return res.status(400).json({ success: false, message: 'Recipient student ID, title, and message are required.' });
    }

    await studentPortalModel.sendNotification(teacher.id, {
      recipient_student_id,
      title,
      message,
    });

    return res.status(201).json({ success: true, message: 'Notification sent to student.' });
  } catch (error) {
    return next(error);
  }
};

exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await studentPortalModel.getPublishedAnnouncements();
    return res.json({ success: true, data: announcements });
  } catch (error) {
    return next(error);
  }
};
