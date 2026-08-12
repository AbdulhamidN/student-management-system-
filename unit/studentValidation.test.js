const { validateStudent } = require('../../backend/src/utils/validation');

describe('Student Validation Unit Tests', () => {
    test('should validate student data correctly when valid', () => {
        const validStudent = {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '1234567890',
            department_id: 1
        };
        const result = validateStudent(validStudent);
        expect(result.valid).toBe(true);
    });

    test('should reject student missing name', () => {
        const invalidStudent = {
            name: '',
            email: 'john@example.com'
        };
        const result = validateStudent(invalidStudent);
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Name and email are required fields');
    });

    test('should reject student missing email', () => {
        const invalidStudent = {
            name: 'John Doe',
            email: ''
        };
        const result = validateStudent(invalidStudent);
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Name and email are required fields');
    });

    test('should reject student with invalid email format', () => {
        const invalidStudent = {
            name: 'John Doe',
            email: 'not-an-email'
        };
        const result = validateStudent(invalidStudent);
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Invalid email format');
    });

    test('should reject non-object or null input', () => {
        expect(validateStudent(null).valid).toBe(false);
        expect(validateStudent(undefined).valid).toBe(false);
    });
});
