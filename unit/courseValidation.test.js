const { validateCourse } = require('../../backend/src/utils/validation');

describe('Course Validation Unit Tests', () => {
    test('should validate course data correctly when valid', () => {
        const validCourse = { name: 'Data Structures', code: 'CS201', department_id: 1 };
        const result = validateCourse(validCourse);
        expect(result.valid).toBe(true);
    });

    test('should reject course missing name', () => {
        const invalidCourse = { name: '', code: 'CS201' };
        const result = validateCourse(invalidCourse);
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Course name and code are required');
    });

    test('should reject course missing code', () => {
        const invalidCourse = { name: 'Data Structures', code: '' };
        const result = validateCourse(invalidCourse);
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Course name and code are required');
    });

    test('should reject null or undefined input', () => {
        expect(validateCourse(null).valid).toBe(false);
        expect(validateCourse(undefined).valid).toBe(false);
    });
});
