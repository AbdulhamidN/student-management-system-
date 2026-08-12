const assert = require('assert');
const { validateStudent, validateDepartment, validateCourse } = require('../backend/src/utils/validation');
const app = require('../backend/src/app');
const { pool } = require('../backend/src/config/db');

// Mock pool.execute and pool.getConnection
let mockQueryQueue = [];
let queryHistory = [];

pool.execute = async (sql, values) => {
    queryHistory.push({ sql, values });
    if (mockQueryQueue.length > 0) {
        const next = mockQueryQueue.shift();
        if (next.error) throw next.error;
        return next.result;
    }
    return [[]];
};

pool.getConnection = async () => ({
    release: () => {}
});

function resetMock() {
    mockQueryQueue = [];
    queryHistory = [];
}

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
    return async () => {
        resetMock();
        try {
            await fn();
            passed++;
            results.push({ name, status: 'PASS' });
            console.log(`  ✅ PASS: ${name}`);
        } catch (err) {
            failed++;
            results.push({ name, status: 'FAIL', error: err.message });
            console.error(`  ❌ FAIL: ${name}\n     Error: ${err.message}`);
        }
    };
}

// Minimal HTTP request helper using Supertest style with App
async function superRequest(method, path, body) {
    const http = require('http');
    return new Promise((resolve, reject) => {
        const server = http.createServer(app);
        server.listen(0, () => {
            const port = server.address().port;
            const payload = body ? JSON.stringify(body) : '';
            const req = http.request({
                hostname: 'localhost',
                port,
                path,
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    server.close();
                    let json;
                    try { json = JSON.parse(data); } catch (e) { json = data; }
                    resolve({ status: res.statusCode, body: json, headers: res.headers });
                });
            });

            req.on('error', (err) => {
                server.close();
                reject(err);
            });

            if (payload) req.write(payload);
            req.end();
        });
    });
}

async function runAllTests() {
    console.log('=====================================================');
    console.log('  STUDENT MANAGEMENT SYSTEM - TEST SUITE RUNNER');
    console.log('=====================================================\n');

    console.log('--- 1. UNIT TESTS: VALIDATION UTILITIES ---');

    await test('Student Validation - Valid student payload', () => {
        const res = validateStudent({ name: 'John Doe', email: 'john@example.com' });
        assert.strictEqual(res.valid, true);
    })();

    await test('Student Validation - Missing name returns false', () => {
        const res = validateStudent({ name: '', email: 'john@example.com' });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.message, 'Name and email are required fields');
    })();

    await test('Student Validation - Missing email returns false', () => {
        const res = validateStudent({ name: 'John Doe', email: '' });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.message, 'Name and email are required fields');
    })();

    await test('Student Validation - Invalid email format', () => {
        const res = validateStudent({ name: 'John Doe', email: 'invalid-email' });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.message, 'Invalid email format');
    })();

    await test('Department Validation - Valid department', () => {
        const res = validateDepartment({ name: 'Computer Science' });
        assert.strictEqual(res.valid, true);
    })();

    await test('Department Validation - Missing name', () => {
        const res = validateDepartment({ name: '' });
        assert.strictEqual(res.valid, false);
    })();

    await test('Course Validation - Valid course payload', () => {
        const res = validateCourse({ name: 'Data Structures', code: 'CS201' });
        assert.strictEqual(res.valid, true);
    })();

    await test('Course Validation - Missing course code', () => {
        const res = validateCourse({ name: 'Data Structures', code: '' });
        assert.strictEqual(res.valid, false);
    })();

    console.log('\n--- 2. INTEGRATION TESTS: STUDENT API ---');

    await test('POST /api/students - Create Student (201 Created)', async () => {
        mockQueryQueue.push({ result: [{ insertId: 15 }] });
        const res = await superRequest('POST', '/api/students', {
            name: 'Abebe Bikila',
            email: 'abebe@example.com',
            phone: '0912345678',
            department_id: 1
        });
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.id, 15);
    })();

    await test('POST /api/students - Missing required name/email (400 Bad Request)', async () => {
        const res = await superRequest('POST', '/api/students', { name: '' });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.success, false);
    })();

    await test('POST /api/students - Duplicate Email Error (409 Conflict)', async () => {
        const dupErr = new Error('Duplicate entry');
        dupErr.code = 'ER_DUP_ENTRY';
        mockQueryQueue.push({ error: dupErr });

        const res = await superRequest('POST', '/api/students', {
            name: 'Duplicate Student',
            email: 'existing@example.com'
        });
        assert.strictEqual(res.status, 409);
        assert.strictEqual(res.body.message, 'Email already exists');
    })();

    await test('GET /api/students - Fetch Active Students excluding is_deleted (200 OK)', async () => {
        const mockData = [
            { id: 1, name: 'Alice', email: 'alice@example.com', is_deleted: 0, department_name: 'CS' }
        ];
        mockQueryQueue.push({ result: [mockData] });

        const res = await superRequest('GET', '/api/students');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.data.length, 1);
        assert.ok(queryHistory[0].sql.includes('is_deleted = FALSE'));
    })();

    await test('GET /api/students/count - Student Count API (200 OK)', async () => {
        mockQueryQueue.push({ result: [[{ count: 12 }]] });

        const res = await superRequest('GET', '/api/students/count');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.count, 12);
    })();

    await test('GET /api/students/department/:deptId - Filter Students by Department (200 OK)', async () => {
        mockQueryQueue.push({ result: [[{ id: 1, name: 'Alice', department_id: 1 }]] });

        const res = await superRequest('GET', '/api/students/department/1');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.data[0].department_id, 1);
    })();

    await test('GET /api/students/:id - Get Student by ID (200 OK)', async () => {
        mockQueryQueue.push({ result: [[{ id: 1, name: 'Alice', email: 'alice@example.com' }]] });

        const res = await superRequest('GET', '/api/students/1');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.data.name, 'Alice');
    })();

    await test('GET /api/students/:id - Invalid ID Not Found (404 Not Found)', async () => {
        mockQueryQueue.push({ result: [[]] });

        const res = await superRequest('GET', '/api/students/999');
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.message, 'Student not found');
    })();

    await test('PUT /api/students/:id - Update Student (200 OK)', async () => {
        mockQueryQueue.push({ result: [{ affectedRows: 1 }] });

        const res = await superRequest('PUT', '/api/students/1', {
            name: 'Alice Smith',
            email: 'alice.smith@example.com',
            phone: '0911002233',
            department_id: 2
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.message, 'Student updated successfully');
    })();

    await test('DELETE /api/students/:id - Soft Delete Student (200 OK)', async () => {
        mockQueryQueue.push({ result: [{ affectedRows: 1 }] });

        const res = await superRequest('DELETE', '/api/students/1');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.message, 'Student soft-deleted successfully');
        assert.ok(queryHistory[0].sql.includes('SET is_deleted = TRUE'));
    })();

    await test('POST /api/students/:id/courses - Assign Course to Student (201 Created)', async () => {
        mockQueryQueue.push({ result: [[{ id: 1, name: 'Alice' }]] }); // Student exists check
        mockQueryQueue.push({ result: [{ affectedRows: 1 }] }); // Course insert

        const res = await superRequest('POST', '/api/students/1/courses', { courseId: 101 });
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.message, 'Course assigned to student successfully');
    })();

    await test('GET /api/students/:id/courses - Get Student Courses (200 OK)', async () => {
        mockQueryQueue.push({ result: [[{ id: 1, name: 'Alice' }]] });
        mockQueryQueue.push({ result: [[{ id: 101, name: 'Data Structures', code: 'CS201' }]] });

        const res = await superRequest('GET', '/api/students/1/courses');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.data[0].code, 'CS201');
    })();

    await test('DELETE /api/students/:id/courses/:courseId - Remove Course Assignment (200 OK)', async () => {
        mockQueryQueue.push({ result: [{ affectedRows: 1 }] });

        const res = await superRequest('DELETE', '/api/students/1/courses/101');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.message, 'Course removed from student successfully');
    })();

    console.log('\n--- 3. INTEGRATION TESTS: DEPARTMENT API ---');

    await test('POST /api/departments - Create Department (201 Created)', async () => {
        mockQueryQueue.push({ result: [{ insertId: 4 }] });

        const res = await superRequest('POST', '/api/departments', { name: 'Mechanical Engineering' });
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.id, 4);
    })();

    await test('GET /api/departments - Get All Departments (200 OK)', async () => {
        mockQueryQueue.push({ result: [[{ id: 1, name: 'CS' }, { id: 2, name: 'EE' }]] });

        const res = await superRequest('GET', '/api/departments');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.data.length, 2);
    })();

    await test('PUT /api/departments/:id - Update Department (200 OK)', async () => {
        mockQueryQueue.push({ result: [{ affectedRows: 1 }] });

        const res = await superRequest('PUT', '/api/departments/1', { name: 'Software Engineering' });
        assert.strictEqual(res.status, 200);
    })();

    await test('DELETE /api/departments/:id - Delete Department (200 OK)', async () => {
        mockQueryQueue.push({ result: [{ affectedRows: 1 }] });

        const res = await superRequest('DELETE', '/api/departments/1');
        assert.strictEqual(res.status, 200);
    })();

    console.log('\n--- 4. INTEGRATION TESTS: COURSE API ---');

    await test('POST /api/courses - Create Course (201 Created)', async () => {
        mockQueryQueue.push({ result: [{ insertId: 105 }] });

        const res = await superRequest('POST', '/api/courses', { name: 'Operating Systems', code: 'CS302', department_id: 1 });
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.id, 105);
    })();

    await test('GET /api/courses - Get All Courses (200 OK)', async () => {
        mockQueryQueue.push({ result: [[{ id: 101, name: 'Data Structures', code: 'CS201' }]] });

        const res = await superRequest('GET', '/api/courses');
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.data.length, 1);
    })();

    await test('POST /api/courses/assign - Assign Course (201 Created)', async () => {
        mockQueryQueue.push({ result: [{ affectedRows: 1 }] });

        const res = await superRequest('POST', '/api/courses/assign', { student_id: 1, course_id: 101 });
        assert.strictEqual(res.status, 201);
    })();

    await test('POST /api/courses/assign - Duplicate Course Assignment (409 Conflict)', async () => {
        const dupErr = new Error('Duplicate entry');
        dupErr.code = 'ER_DUP_ENTRY';
        mockQueryQueue.push({ error: dupErr });

        const res = await superRequest('POST', '/api/courses/assign', { student_id: 1, course_id: 101 });
        assert.strictEqual(res.status, 409);
        assert.strictEqual(res.body.message, 'This student is already enrolled in this course');
    })();

    console.log('\n=====================================================');
    console.log(`  SUMMARY: Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log('=====================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runAllTests().catch(err => {
    console.error('Fatal error running tests:', err);
    process.exit(1);
});
