const request = require('supertest');
const app = require('../../backend/src/app');
const { pool } = require('../../backend/src/config/db');

// Mock mysql pool
jest.mock('../../backend/src/config/db', () => {
    const mockPool = {
        execute: jest.fn(),
        getConnection: jest.fn().mockResolvedValue({
            release: jest.fn()
        })
    };
    return { pool: mockPool, connectDB: jest.fn() };
});

describe('Student API Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/students - Create Student', () => {
        test('should create a new student successfully', async () => {
            pool.execute.mockResolvedValueOnce([{ insertId: 10 }]);

            const newStudent = {
                name: 'Test Student',
                email: 'test@example.com',
                phone: '0911223344',
                department_id: 1
            };

            const response = await request(app)
                .post('/api/students')
                .send(newStudent);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                success: true,
                message: 'Student created successfully',
                id: 10
            });
            expect(pool.execute).toHaveBeenCalled();
        });

        test('should return 400 when name is missing', async () => {
            const invalidStudent = {
                email: 'test@example.com'
            };

            const response = await request(app)
                .post('/api/students')
                .send(invalidStudent);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('required');
        });

        test('should return 400 when email is missing', async () => {
            const invalidStudent = {
                name: 'Test Student'
            };

            const response = await request(app)
                .post('/api/students')
                .send(invalidStudent);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('required');
        });

        test('should return 409 when duplicate email error occurs', async () => {
            const duplicateError = new Error('Duplicate entry');
            duplicateError.code = 'ER_DUP_ENTRY';
            pool.execute.mockRejectedValueOnce(duplicateError);

            const student = {
                name: 'Test Student',
                email: 'existing@example.com'
            };

            const response = await request(app)
                .post('/api/students')
                .send(student);

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Email already exists');
        });
    });

    describe('GET /api/students - Get All Active Students', () => {
        test('should return list of active students excluding soft-deleted', async () => {
            const mockStudents = [
                { id: 1, name: 'Alice', email: 'alice@example.com', is_deleted: 0, department_name: 'Computer Science' },
                { id: 2, name: 'Bob', email: 'bob@example.com', is_deleted: 0, department_name: 'Electrical Engineering' }
            ];
            pool.execute.mockResolvedValueOnce([mockStudents]);

            const response = await request(app).get('/api/students');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockStudents);
            expect(pool.execute).toHaveBeenCalled();
            // Verify query filters by is_deleted = FALSE
            const queryExecuted = pool.execute.mock.calls[0][0];
            expect(queryExecuted).toContain('is_deleted = FALSE');
        });
    });

    describe('GET /api/students/count - Student Count API', () => {
        test('should return active student count', async () => {
            pool.execute.mockResolvedValueOnce([[{ count: 5 }]]);

            const response = await request(app).get('/api/students/count');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(5);
        });
    });

    describe('GET /api/students/department/:deptId - Department Filtering', () => {
        test('should return active students belonging to specific department', async () => {
            const mockDeptStudents = [
                { id: 1, name: 'Alice', email: 'alice@example.com', department_id: 1, department_name: 'Computer Science' }
            ];
            pool.execute.mockResolvedValueOnce([mockDeptStudents]);

            const response = await request(app).get('/api/students/department/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockDeptStudents);
        });
    });

    describe('GET /api/students/:id - Get Student by ID', () => {
        test('should return student details if found', async () => {
            const mockStudent = { id: 1, name: 'Alice', email: 'alice@example.com', department_name: 'CS' };
            pool.execute.mockResolvedValueOnce([[mockStudent]]);

            const response = await request(app).get('/api/students/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockStudent);
        });

        test('should return 404 if student not found', async () => {
            pool.execute.mockResolvedValueOnce([[]]);

            const response = await request(app).get('/api/students/999');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Student not found');
        });
    });

    describe('PUT /api/students/:id - Update Student', () => {
        test('should update student successfully', async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const updatedStudent = {
                name: 'Alice Updated',
                email: 'alice.updated@example.com',
                phone: '0900000000',
                department_id: 2
            };

            const response = await request(app)
                .put('/api/students/1')
                .send(updatedStudent);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Student updated successfully');
        });

        test('should return 404 if student to update does not exist or is deleted', async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const updatedStudent = {
                name: 'Ghost',
                email: 'ghost@example.com'
            };

            const response = await request(app)
                .put('/api/students/999')
                .send(updatedStudent);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /api/students/:id - Soft Delete', () => {
        test('should soft delete student by setting is_deleted = TRUE', async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app).delete('/api/students/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Student soft-deleted successfully');

            const queryExecuted = pool.execute.mock.calls[0][0];
            expect(queryExecuted).toContain('SET is_deleted = TRUE');
        });

        test('should return 404 when deleting non-existent student', async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

            const response = await request(app).delete('/api/students/999');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('Course Assignment API for Student', () => {
        test('POST /api/students/:id/courses - assign course to student', async () => {
            // Check student exists
            pool.execute.mockResolvedValueOnce([[{ id: 1, name: 'Alice' }]]);
            // Insert course assignment
            pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app)
                .post('/api/students/1/courses')
                .send({ courseId: 2 });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Course assigned to student successfully');
        });

        test('POST /api/students/:id/courses - return 400 if courseId is missing', async () => {
            const response = await request(app)
                .post('/api/students/1/courses')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('GET /api/students/:id/courses - fetch assigned courses', async () => {
            // Check student exists
            pool.execute.mockResolvedValueOnce([[{ id: 1, name: 'Alice' }]]);
            // Fetch courses
            const mockCourses = [{ id: 2, name: 'Database Systems', code: 'CS301' }];
            pool.execute.mockResolvedValueOnce([mockCourses]);

            const response = await request(app).get('/api/students/1/courses');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockCourses);
        });

        test('DELETE /api/students/:id/courses/:courseId - remove course assignment', async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app).delete('/api/students/1/courses/2');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Course removed from student successfully');
        });
    });
});
