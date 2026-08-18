const { pool } = require('../config/db');
const { calculateLetterGrade } = require('./studentModel');

async function getStudentByUserId(userId) {
  const [rows] = await pool.execute(`
    SELECT s.id AS id, s.id AS student_id, s.user_id, s.name, s.grade,
           s.parent_name, s.parent_phone, s.email, s.address, s.date_of_birth,
           s.enrollment_date, s.status, s.notes, s.mid_mark, s.final_mark,
           s.assessment_mark, s.total_mark, s.created_at,
           t.id AS teacher_id, t.name AS teacher_name, t.department AS teacher_department,
           u_t.email AS teacher_email
    FROM students s
    LEFT JOIN teachers t ON t.id = s.teacher_id
    LEFT JOIN users u_t ON u_t.id = t.user_id
    WHERE s.user_id = ?
    LIMIT 1
  `, [userId]);

  if (!rows[0]) return null;

  const letter = calculateLetterGrade(rows[0].total_mark);

  // Compute Class Rank
  const [rankRows] = await pool.execute(`
    SELECT id, total_mark FROM students ORDER BY total_mark DESC, name ASC
  `);

  const rankIndex = rankRows.findIndex((r) => r.id === rows[0].id);
  const rank = rankIndex !== -1 ? rankIndex + 1 : 1;

  return {
    ...rows[0],
    rank,
    letter_grade: letter.grade,
    grade_description: letter.description,
  };
}

async function getStudentSelfSchedule(studentId) {
  const [rows] = await pool.execute(`
    SELECT id, student_id, title, day_of_week, start_time, end_time, description, created_at
    FROM student_schedules
    WHERE student_id = ?
    ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), start_time ASC
  `, [studentId]);
  return rows;
}

async function addStudentSelfSchedule(studentId, { title, day_of_week, start_time, end_time, description }) {
  const [result] = await pool.execute(`
    INSERT INTO student_schedules (student_id, title, day_of_week, start_time, end_time, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    studentId,
    String(title || '').trim(),
    day_of_week,
    start_time,
    end_time,
    description ? String(description).trim() : null,
  ]);
  return result;
}

async function deleteStudentSelfSchedule(studentId, scheduleId) {
  const [result] = await pool.execute(`
    DELETE FROM student_schedules WHERE id = ? AND student_id = ?
  `, [scheduleId, studentId]);
  return result;
}

async function getExamSchedulesForStudent(grade, teacherId) {
  const [rows] = await pool.execute(`
    SELECT e.id, e.teacher_id, e.title, e.subject, e.grade, e.exam_date,
           e.start_time, e.end_time, e.location, e.notes, e.created_at,
           t.name AS teacher_name, t.department AS teacher_department
    FROM exam_schedules e
    LEFT JOIN teachers t ON t.id = e.teacher_id
    WHERE e.grade = ? OR e.teacher_id = ?
    ORDER BY e.exam_date ASC, e.start_time ASC
  `, [grade || '', teacherId || 0]);
  return rows;
}

async function addExamSchedule(teacherId, { title, subject, grade, exam_date, start_time, end_time, location, notes }) {
  const [result] = await pool.execute(`
    INSERT INTO exam_schedules (teacher_id, title, subject, grade, exam_date, start_time, end_time, location, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    teacherId,
    String(title).trim(),
    String(subject).trim(),
    String(grade).trim(),
    exam_date,
    start_time,
    end_time,
    location ? String(location).trim() : null,
    notes ? String(notes).trim() : null,
  ]);
  return result;
}

async function getStudentNotifications(studentId) {
  const [rows] = await pool.execute(`
    SELECT n.id, n.sender_teacher_id, n.recipient_student_id, n.title, n.message,
           n.is_read, n.created_at,
           t.name AS sender_teacher_name, t.department AS sender_teacher_department
    FROM notifications n
    LEFT JOIN teachers t ON t.id = n.sender_teacher_id
    WHERE n.recipient_student_id = ?
    ORDER BY n.created_at DESC
  `, [studentId]);
  return rows;
}

async function markNotificationRead(studentId, notificationId) {
  const [result] = await pool.execute(`
    UPDATE notifications SET is_read = TRUE WHERE id = ? AND recipient_student_id = ?
  `, [notificationId, studentId]);
  return result;
}

async function sendNotification(senderTeacherId, { recipient_student_id, title, message }) {
  const [result] = await pool.execute(`
    INSERT INTO notifications (sender_teacher_id, recipient_student_id, title, message)
    VALUES (?, ?, ?, ?)
  `, [
    senderTeacherId,
    Number(recipient_student_id),
    String(title).trim(),
    String(message).trim(),
  ]);
  return result;
}

async function getPublishedAnnouncements() {
  const [rows] = await pool.execute(`
    SELECT id, title, content, is_published, created_at
    FROM announcements
    WHERE is_published = TRUE
    ORDER BY created_at DESC
  `);
  return rows;
}

module.exports = {
  getStudentByUserId,
  getStudentSelfSchedule,
  addStudentSelfSchedule,
  deleteStudentSelfSchedule,
  getExamSchedulesForStudent,
  addExamSchedule,
  getStudentNotifications,
  markNotificationRead,
  sendNotification,
  getPublishedAnnouncements,
};
