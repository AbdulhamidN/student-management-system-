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

describe('Department API Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/departments - Create Department', () => {
        test('should create department successfully', async () => {
            pool.execute.mockResolvedValueOnce([{ insertId: 5 }]);

            const response = await request(app)
                .post('/api/departments')
                .send({ name: 'Physics' });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                success: true,
                message: 'Department created successfully',
                id: 5
            });
        });

        test('should return 400 when name is missing', async () => {
            const response = await request(app)
                .post('/api/departments')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/departments - Get All Departments', () => {
        test('should return list of all departments', async () => {
            const mockDepts = [
                { id: 1, name: 'Computer Science' },
                { id: 2, name: 'Electrical Engineering' }
            ];
            pool.execute.mockResolvedValueOnce([mockDepts]);

            const response = await request(app).get('/api/departments');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockDepts);
        });
    });

    describe('GET /api/departments/:id - Get Department by ID', () => {
        test('should return department if found', async () => {
            const mockDept = { id: 1, name: 'Computer Science' };
            pool.execute.mockResolvedValueOnce([[mockDept]]);

            const response = await request(app).get('/api/departments/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(mockDept);
        });

        test('should return 404 if department not found', async () => {
            pool.execute.mockResolvedValueOnce([[]]);

            const response = await request(app).get('/api/departments/999');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/departments/:id - Update Department', () => {
        test('should update department name successfully', async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app)
                .put('/api/departments/1')
                .send({ name: 'Computer Science & AI' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('should return 400 if name is missing', async () => {
            const response = await request(app)
                .put('/api/departments/1')
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /api/departments/:id - Delete Department', () => {
        test('should delete department successfully', async () => {
            pool.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const response = await request(app).delete('/api/departments/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
