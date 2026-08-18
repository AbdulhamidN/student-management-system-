/**
 * =====================================================
 * db.js
 * -----------------------------------------------------
 * Purpose:
 * Handle MySQL database connection.
 *
 * Responsibilities:
 * 1. Create MySQL connection pool
 * 2. Test database connection
 * 3. Export database functions
 * =====================================================
 */


// Import mysql2 promise version
const mysql = require("mysql2/promise");


// Create MySQL connection pool
// Pool allows multiple database connections
// and improves performance.
const pool = mysql.createPool({

    // Database server address
    host: process.env.DB_HOST || "localhost",

    // Database port
    port: process.env.DB_PORT || 3306,

    // MySQL username
    user: process.env.DB_USER || "root",

    // MySQL password
    password: process.env.DB_PASSWORD || "",

    // Database name
    database: process.env.DB_NAME || "school_management",


    // Allow waiting if all connections are busy
    waitForConnections: true,


    // Maximum number of connections
    connectionLimit: 10,


    // Unlimited waiting queue
    queueLimit: 0

});



/**
 * =====================================================
 * connectDB()
 * -----------------------------------------------------
 * Purpose:
 * Test MySQL database connection when server starts.
 * =====================================================
 */

async function ensureStudentColumns() {
    try {
        const [cols] = await pool.execute(`
            SELECT COLUMN_NAME FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students'
        `);
        const colNames = cols.map((c) => c.COLUMN_NAME.toLowerCase());

        const needed = [
            { name: 'teacher_id', type: 'INT NULL' },
            { name: 'department_id', type: 'INT NULL' },
            { name: 'grade', type: 'VARCHAR(20) DEFAULT "Grade 10"' },
            { name: 'parent_name', type: 'VARCHAR(100) NULL' },
            { name: 'parent_phone', type: 'VARCHAR(20) NULL' },
            { name: 'address', type: 'TEXT NULL' },
            { name: 'date_of_birth', type: 'DATE NULL' },
            { name: 'enrollment_date', type: 'DATE NULL' },
            { name: 'status', type: 'VARCHAR(20) DEFAULT "active"' },
            { name: 'notes', type: 'TEXT NULL' },
            { name: 'mid_mark', type: 'DECIMAL(5,2) DEFAULT 0.00' },
            { name: 'final_mark', type: 'DECIMAL(5,2) DEFAULT 0.00' },
            { name: 'assessment_mark', type: 'DECIMAL(5,2) DEFAULT 0.00' },
            { name: 'total_mark', type: 'DECIMAL(5,2) DEFAULT 0.00' },
        ];

        for (const col of needed) {
            if (!colNames.includes(col.name)) {
                await pool.execute(`ALTER TABLE students ADD COLUMN ${col.name} ${col.type}`);
            }
        }
        try {
            await pool.execute(`ALTER TABLE students MODIFY COLUMN teacher_id INT NULL`);
        } catch (e) {
            // ignore if column doesn't exist or already nullable
        }
    } catch (err) {
        console.log("Database schema check note:", err.message);
    }
}

async function ensureTeacherColumns() {
    try {
        const [cols] = await pool.execute(`
            SELECT COLUMN_NAME FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'teachers'
        `);
        const colNames = cols.map((c) => c.COLUMN_NAME.toLowerCase());

        if (!colNames.includes('department_id')) {
            await pool.execute(`ALTER TABLE teachers ADD COLUMN department_id INT NULL`);
        }

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS teacher_courses (
                teacher_id INT NOT NULL,
                course_id INT NOT NULL,
                PRIMARY KEY (teacher_id, course_id),
                FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            )
        `);
    } catch (err) {
        console.log("Teacher schema check note:", err.message);
    }
}

async function ensureDefaultDepartmentsAndCourses() {
    try {
        // 1. Ensure Departments (CS, IT, IS)
        const [existingDepts] = await pool.execute("SELECT * FROM departments");
        if (existingDepts.length === 0) {
            await pool.execute("INSERT INTO departments (name) VALUES ('CS'), ('IT'), ('IS')");
            console.log("🌱 Auto-seeded default departments: CS, IT, IS");
        }

        // Get departments map by name
        const [depts] = await pool.execute("SELECT * FROM departments");
        const deptMap = {};
        depts.forEach((d) => { deptMap[d.name] = d.id; });

        // 2. Ensure Courses
        const [existingCourses] = await pool.execute("SELECT * FROM courses");
        if (existingCourses.length === 0) {
            const defaultCourses = [
                { name: 'OOP', code: 'OOP', dept: 'CS' },
                { name: 'DSA', code: 'DSA', dept: 'CS' },
                { name: 'DB', code: 'DB', dept: 'CS' },
                { name: 'IP', code: 'IP', dept: 'IT' },
                { name: 'Web', code: 'WEB', dept: 'IT' },
                { name: 'OS', code: 'OS', dept: 'IT' },
                { name: 'CP', code: 'CP', dept: 'IS' },
                { name: 'Information Organization', code: 'INFO_ORG', dept: 'IS' },
                { name: 'Emerging', code: 'EMERGING', dept: 'IS' },
            ];

            for (const c of defaultCourses) {
                const deptId = deptMap[c.dept] || null;
                await pool.execute(
                    "INSERT INTO courses (name, code, department_id) VALUES (?, ?, ?)",
                    [c.name, c.code, deptId]
                );
            }
            console.log("🌱 Auto-seeded default department courses");
        }
    } catch (err) {
        console.log("Seeding check note:", err.message);
    }
}

async function ensureDefaultAdmin() {
    try {
        const bcrypt = require('bcrypt');
        const adminEmail = 'admin@example.com';
        const adminPassword = 'Admin@123';
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        const [existing] = await pool.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [adminEmail]);
        if (existing.length === 0) {
            await pool.execute(
                "INSERT INTO users (email, password_hash, name, role, is_active) VALUES (?, ?, ?, 'admin', TRUE)",
                [adminEmail, passwordHash, 'System Administrator']
            );
            console.log("🌱 Created default admin user: admin@example.com");
        } else {
            await pool.execute(
                "UPDATE users SET password_hash = ?, role = 'admin', is_active = TRUE WHERE email = ?",
                [passwordHash, adminEmail]
            );
            console.log("🌱 Updated admin user password for admin@example.com");
        }
    } catch (err) {
        console.log("Admin user seeding note:", err.message);
    }
}

async function connectDB(){

    try{

        // Get one connection from pool
        const connection = await pool.getConnection();


        console.log(
            "✅ MySQL Database Connected Successfully"
        );


        // Release connection back to pool
        connection.release();

        // Run schema checks to ensure all columns exist
        await ensureStudentColumns();
        await ensureTeacherColumns();

        // Run default seeding if database is empty
        await ensureDefaultAdmin();
        await ensureDefaultDepartmentsAndCourses();

    }catch(error){

        console.error(
            "❌ MySQL Database Connection Failed"
        );


        console.error(error.message);


        // Stop application if database fails
        process.exit(1);
    }

}



// Export both
// 1. pool -> used for queries
// 2. connectDB -> used when starting server

module.exports = {

    pool,

    connectDB

};