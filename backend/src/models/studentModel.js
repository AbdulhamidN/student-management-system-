const { pool } = require('../config/db');

function calculateLetterGrade(totalMark) {
  const score = Number(totalMark) || 0;
  if (score >= 90) return { grade: 'A', description: 'Excellent' };
  if (score >= 80) return { grade: 'B', description: 'Very Good' };
  if (score >= 70) return { grade: 'C', description: 'Good' };
  if (score >= 60) return { grade: 'D', description: 'Satisfactory' };
  return { grade: 'F', description: 'Needs Improvement' };
}

function normalizeStudent(student = {}) {
  return {
    teacher_id: student.teacher_id ? Number(student.teacher_id) : null,
    name: String(student.name || '').trim().replace(/\s+/g, ' '),
    grade: String(student.grade || 'Grade 10').trim(),
    parent_name: student.parent_name ? String(student.parent_name).trim() : null,
    parent_phone: student.parent_phone ? String(student.parent_phone).trim() : null,
    email: student.email ? String(student.email).trim().toLowerCase() : null,
    address: student.address ? String(student.address).trim() : null,
    date_of_birth: student.date_of_birth || null,
    enrollment_date: student.enrollment_date || null,
    status: ['active', 'inactive', 'graduated'].includes(student.status) ? student.status : 'active',
    notes: student.notes ? String(student.notes).trim() : null,
    mid_mark: Math.max(0, Math.min(20, Number(student.mid_mark) || 0)),
    final_mark: Math.max(0, Math.min(50, Number(student.final_mark) || 0)),
    assessment_mark: Math.max(0, Math.min(30, Number(student.assessment_mark) || 0)),
  };
}

async function getAllStudents(options = {}) {
  let query = `
    SELECT s.id, s.teacher_id, s.name, s.grade, s.parent_name, s.parent_phone,
           s.email, s.address, s.date_of_birth, s.enrollment_date, s.status, s.notes,
           s.mid_mark, s.final_mark, s.assessment_mark, s.total_mark, s.created_at,
           t.name AS teacher_name, t.department AS teacher_department
    FROM students s
    LEFT JOIN teachers t ON t.id = s.teacher_id
  `;
  const params = [];

  if (options.teacher_id) {
    query += ' WHERE s.teacher_id = ?';
    params.push(options.teacher_id);
  }

  query += ' ORDER BY s.total_mark DESC, s.name ASC';

  const [rows] = await pool.execute(query, params);

  return rows.map((row, index) => {
    const letter = calculateLetterGrade(row.total_mark);
    return {
      ...row,
      rank: index + 1,
      letter_grade: letter.grade,
      grade_description: letter.description,
    };
  });
}

async function getStudentById(id) {
  const [rows] = await pool.execute(`
    SELECT s.id, s.teacher_id, s.name, s.grade, s.parent_name, s.parent_phone,
           s.email, s.address, s.date_of_birth, s.enrollment_date, s.status, s.notes,
           s.mid_mark, s.final_mark, s.assessment_mark, s.total_mark, s.created_at,
           t.name AS teacher_name, t.department AS teacher_department
    FROM students s
    LEFT JOIN teachers t ON t.id = s.teacher_id
    WHERE s.id = ?
    LIMIT 1
  `, [id]);

  if (!rows[0]) return null;

  const letter = calculateLetterGrade(rows[0].total_mark);
  return {
    ...rows[0],
    letter_grade: letter.grade,
    grade_description: letter.description,
  };
}

async function updateStudentMarks(id, { mid_mark, final_mark, assessment_mark }) {
  const mid = Number(mid_mark);
  const final = Number(final_mark);
  const assessment = Number(assessment_mark);

  if (isNaN(mid) || mid < 0 || mid > 20) {
    throw Object.assign(new Error('Midterm exam mark must be between 0 and 20 points.'), { statusCode: 400 });
  }
  if (isNaN(final) || final < 0 || final > 50) {
    throw Object.assign(new Error('Final exam mark must be between 0 and 50 points.'), { statusCode: 400 });
  }
  if (isNaN(assessment) || assessment < 0 || assessment > 30) {
    throw Object.assign(new Error('Assessment mark must be between 0 and 30 points.'), { statusCode: 400 });
  }

  const total = mid + final + assessment;

  const [result] = await pool.execute(`
    UPDATE students
    SET mid_mark = ?, final_mark = ?, assessment_mark = ?, total_mark = ?
    WHERE id = ?
  `, [mid, final, assessment, total, id]);

  if (result.affectedRows === 0) {
    throw Object.assign(new Error('Student not found.'), { statusCode: 404 });
  }

  const updatedStudent = await getStudentById(id);
  return updatedStudent;
}

async function createStudent(studentData) {
  const data = normalizeStudent(studentData);
  const total_mark = data.mid_mark + data.final_mark + data.assessment_mark;

  const [result] = await pool.execute(`
    INSERT INTO students (teacher_id, name, grade, parent_name, parent_phone, email, address, date_of_birth, enrollment_date, status, notes, mid_mark, final_mark, assessment_mark, total_mark)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.teacher_id,
    data.name,
    data.grade,
    data.parent_name,
    data.parent_phone,
    data.email,
    data.address,
    data.date_of_birth,
    data.enrollment_date,
    data.status,
    data.notes,
    data.mid_mark,
    data.final_mark,
    data.assessment_mark,
    total_mark,
  ]);

  return { id: result.insertId, ...data, total_mark };
}

async function updateStudent(id, studentData) {
  const data = normalizeStudent(studentData);
  const total_mark = data.mid_mark + data.final_mark + data.assessment_mark;

  const [result] = await pool.execute(`
    UPDATE students
    SET teacher_id = ?, name = ?, grade = ?, parent_name = ?, parent_phone = ?,
        email = ?, address = ?, date_of_birth = ?, status = ?, notes = ?,
        mid_mark = ?, final_mark = ?, assessment_mark = ?, total_mark = ?
    WHERE id = ?
  `, [
    data.teacher_id,
    data.name,
    data.grade,
    data.parent_name,
    data.parent_phone,
    data.email,
    data.address,
    data.date_of_birth,
    data.status,
    data.notes,
    data.mid_mark,
    data.final_mark,
    data.assessment_mark,
    total_mark,
    id,
  ]);

  return result;
}

async function deleteStudent(id) {
  const [result] = await pool.execute('DELETE FROM students WHERE id = ?', [id]);
  return result;
}

module.exports = {
  calculateLetterGrade,
  normalizeStudent,
  getAllStudents,
  getStudentById,
  updateStudentMarks,
  createStudent,
  updateStudent,
  deleteStudent,
};
