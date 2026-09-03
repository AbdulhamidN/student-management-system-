const { pool } = require('../config/db');

async function getAdminDashboard() {
  const [metricRows] = await pool.execute(`
    SELECT
      (SELECT COUNT(*) FROM students WHERE is_deleted = FALSE) AS total_students,
      (SELECT COUNT(*) FROM teachers WHERE is_deleted = FALSE) AS total_teachers,
      (SELECT COUNT(DISTINCT sc.course_id) FROM student_courses sc JOIN students s ON s.id = sc.student_id WHERE s.is_deleted = FALSE) AS active_courses,
      (SELECT COUNT(*) FROM departments) AS departments,
      (SELECT COUNT(*) FROM students WHERE is_deleted = FALSE AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS recent_students,
      (SELECT COUNT(*) FROM students WHERE is_deleted = FALSE AND department_id IS NULL) AS students_without_department
  `);

  const metric = metricRows[0] || {};

  const [[studentsWithoutCourses]] = await pool.execute(`
    SELECT COUNT(*) AS count
    FROM students s
    WHERE s.is_deleted = FALSE
      AND NOT EXISTS (SELECT 1 FROM student_courses sc WHERE sc.student_id = s.id)
  `);

  const [[teachersWithoutCourses]] = await pool.execute(`
    SELECT COUNT(*) AS count
    FROM teachers t
    WHERE t.is_deleted = FALSE
      AND NOT EXISTS (SELECT 1 FROM teacher_courses tc WHERE tc.teacher_id = t.id)
  `);

  const [[unassignedStudents]] = await pool.execute(`
    SELECT COUNT(*) AS count
    FROM students
    WHERE is_deleted = FALSE AND department_id IS NULL
  `);

  const [recentStudents] = await pool.execute(`
    SELECT s.id, s.name, s.created_at, d.name AS department_name
    FROM students s
    LEFT JOIN departments d ON d.id = s.department_id
    WHERE s.is_deleted = FALSE
    ORDER BY s.created_at DESC
    LIMIT 8
  `);

  const [recentTeachers] = await pool.execute(`
    SELECT t.id, u.name, t.created_at, d.name AS department_name
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    LEFT JOIN departments d ON d.id = t.department_id
    WHERE t.is_deleted = FALSE
    ORDER BY t.created_at DESC
    LIMIT 6
  `);

  const [departmentDistribution] = await pool.execute(`
    SELECT d.id, d.name, COUNT(s.id) AS student_count
    FROM departments d
    LEFT JOIN students s ON s.department_id = d.id AND s.is_deleted = FALSE
    GROUP BY d.id, d.name
    ORDER BY student_count DESC, d.name ASC
  `);

  const [enrollmentTrend] = await pool.execute(`
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
           COUNT(*) AS registrations
    FROM students
    WHERE is_deleted = FALSE
      AND created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month ASC
  `);

  const activities = [
    ...recentStudents.map((student) => ({
      type: 'student',
      title: `New student registered: ${student.name}`,
      detail: student.department_name ? `${student.department_name} department` : 'Department not assigned',
      timestamp: student.created_at,
      id: `student-${student.id}`,
    })),
    ...recentTeachers.map((teacher) => ({
      type: 'teacher',
      title: `Teacher added: ${teacher.name}`,
      detail: teacher.department_name ? `${teacher.department_name} department` : 'Department not assigned',
      timestamp: teacher.created_at,
      id: `teacher-${teacher.id}`,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 8);

  return {
    metrics: {
      totalStudents: Number(metric.total_students || 0),
      totalTeachers: Number(metric.total_teachers || 0),
      activeCourses: Number(metric.active_courses || 0),
      departments: Number(metric.departments || 0),
      recentStudents: Number(metric.recent_students || 0),
    },
    activities,
    departmentDistribution: departmentDistribution.map((row) => ({
      id: row.id,
      name: row.name,
      studentCount: Number(row.student_count || 0),
    })),
    enrollmentTrend: enrollmentTrend.map((row) => ({
      month: row.month,
      registrations: Number(row.registrations || 0),
    })),
    notifications: {
      studentsWithoutDepartment: Number(unassignedStudents.count || 0),
      studentsWithoutCourses: Number(studentsWithoutCourses.count || 0),
      teachersWithoutCourses: Number(teachersWithoutCourses.count || 0),
    },
  };
}

module.exports = { getAdminDashboard };
