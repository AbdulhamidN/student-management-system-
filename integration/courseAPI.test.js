const request = require('supertest');
const app = require('../../backend/src/app');
const { pool } = require('../../backend/src/config/db');

jest.mock('../../backend/src/config/db', () => {
    const mockPool = {
        execute: jest.fn(),
        getConnection: jest.fn().mockResolvedValue({ release: jest.fn() })
    };
    return { pool: mockPool, connectDB: jest.fn() };
});

describe('Course API Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/courses - Create Course', () => {
        test('should create course successfully', async () => {
            pool.execute.mockResolvedValueOnce([{ insertId: 3 }]);

            const newCourse = {
                name: 'Algorithms',
                code: 'CS202',
                department_id: 1
            };

            const response = await request(app)
                .post('/api/courses')
                .send(newCourse);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                success: true,
                message: 'Course created successfully',
                id: 3
            });
        });

        test('should return 400 when code is missing', async () => {
            const response = await request(app)
                .post('/api/courses')
                .send({ name: 'Algorithms' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/courses - Get All Courses', () => {
        test('should return list of all courses', async () => {
            const mockCourses = [
                { id: 1, name: 'Data Structures', code: 'CS201', department_name: 'Computer Science' }
            ];
            pool.execute.mockResolvedValueOnce([mockCourses]);

            const response = await request(app).get('/api/courses');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockCourses);
        });
    });

    describe('GET /api/courses/:id - Get Course by ID', () => {
        test('should return course if found', async () => {
            const mockCourse = { id: 1, name: 'Data Structures', code: 'CS201' };
            pool.execute.mockResolvedValueOnce([[mockCourse]]);

            const response = await request(app).get('/api/courses/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockCourse);
        });

        test('should return 404 if course not found', async () => {
            pool.execute.mockResolvedValueOnce([[]]);

            const response = await request(app).get('/api/courses/999');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/courses/:id - Update Course', () => {
        test('should update course details successfully', async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app)
                .put('/api/courses/1')
                .send({ name: 'Advanced Data Structures', code: 'CS201', department_id: 1 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('DELETE /api/courses/:id - Delete Course', () => {
        test('should delete course successfully', async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app).delete('/api/courses/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('Course Assignment Endpoints', () => {
        test('POST /api/courses/assign - assign course to student', async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app)
                .post('/api/courses/assign')
                .send({ student_id: 1, course_id: 2 });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });

        test('POST /api/courses/assign - 409 for duplicate assignment', async () => {
            const dupError = new Error('Duplicate entry');
            dupError.code = 'ER_DUP_ENTRY';
            pool.execute.mockRejectedValueOnce(dupError);

            const response = await request(app)
                .post('/api/courses/assign')
                .send({ student_id: 1, course_id: 2 });

            expect(response.status).toBe(409);
            expect(response.body.message).toContain('already enrolled');
        });

        test('GET /api/courses/student/:studentId - get courses for student', async () => {
            const mockStudentCourses = [{ id: 2, name: 'Circuit Analysis', code: 'EE210' }];
            pool.execute.mockResolvedValueOnce([mockStudentCourses]);

            const response = await request(app).get('/api/courses/student/1');

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual(mockStudentCourses);
        });
    });
});
