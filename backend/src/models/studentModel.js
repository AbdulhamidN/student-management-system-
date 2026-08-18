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
    name: String(student.name || '').trim().replace(/\s+/g, ' '),
    email: student.email ? String(student.email).trim().toLowerCase() : null,
    phone: student.phone ? String(student.phone).trim() : null,
    department_id: student.department_id ? Number(student.department_id) : null,
    grade: String(student.grade || 'Grade 10').trim(),
    parent_name: student.parent_name ? String(student.parent_name).trim() : null,
    parent_phone: student.parent_phone ? String(student.parent_phone).trim() : null,
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
    SELECT s.id, s.department_id, s.name, s.email, s.phone, s.grade,
           s.parent_name, s.parent_phone, s.address, s.date_of_birth,
           s.enrollment_date, s.status, s.notes, s.mid_mark, s.final_mark,
           s.assessment_mark, s.total_mark, s.created_at,
           d.name AS department_name,
           (SELECT COUNT(*) FROM student_courses sc WHERE sc.student_id = s.id) AS course_count
    FROM students s
    LEFT JOIN departments d ON d.id = s.department_id
  `;
  const params = [];

  if (options.department_id) {
    query += ' WHERE s.department_id = ?';
    params.push(options.department_id);
  }

  query += ' ORDER BY s.id DESC';

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
    SELECT s.id, s.department_id, s.name, s.email, s.phone, s.grade,
           s.parent_name, s.parent_phone, s.address, s.date_of_birth,
           s.enrollment_date, s.status, s.notes, s.mid_mark, s.final_mark,
           s.assessment_mark, s.total_mark, s.created_at,
           d.name AS department_name,
           (SELECT COUNT(*) FROM student_courses sc WHERE sc.student_id = s.id) AS course_count
    FROM students s
    LEFT JOIN departments d ON d.id = s.department_id
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

  return await getStudentById(id);
}

async function createStudent(studentData) {
  const data = normalizeStudent(studentData);
  const total_mark = data.mid_mark + data.final_mark + data.assessment_mark;

  const [result] = await pool.execute(`
    INSERT INTO students (department_id, name, grade, parent_name, parent_phone, email, address, date_of_birth, enrollment_date, status, notes, mid_mark, final_mark, assessment_mark, total_mark)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.department_id,
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
    SET department_id = ?, name = ?, grade = ?, parent_name = ?, parent_phone = ?,
        email = ?, address = ?, date_of_birth = ?, status = ?, notes = ?,
        mid_mark = ?, final_mark = ?, assessment_mark = ?, total_mark = ?
    WHERE id = ?
  `, [
    data.department_id,
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

async function getStudentCourses(studentId) {
  const sql = `
    SELECT c.*, d.name AS department_name
    FROM courses c
    INNER JOIN student_courses sc ON c.id = sc.course_id
    LEFT JOIN departments d ON c.department_id = d.id
    WHERE sc.student_id = ?
  `;
  const [rows] = await pool.execute(sql, [studentId]);
  return rows;
}

async function setStudentCourses(studentId, courseIds = []) {
  await pool.execute('DELETE FROM student_courses WHERE student_id = ?', [studentId]);
  if (Array.isArray(courseIds) && courseIds.length > 0) {
    const values = courseIds.map((cId) => `(${Number(studentId)}, ${Number(cId)})`).join(', ');
    await pool.execute(`INSERT INTO student_courses (student_id, course_id) VALUES ${values}`);
  }
  return true;
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
  getStudentCourses,
  setStudentCourses,
};
