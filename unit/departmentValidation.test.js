const { validateDepartment } = require('../../backend/src/utils/validation');

describe('Department Validation Unit Tests', () => {
    test('should validate department data correctly when valid', () => {
        const validDept = { name: 'Computer Science' };
        const result = validateDepartment(validDept);
        expect(result.valid).toBe(true);
    });

    test('should reject department missing name', () => {
        const invalidDept = { name: '' };
        const result = validateDepartment(invalidDept);
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Department name is required');
    });

    test('should reject null or undefined input', () => {
        expect(validateDepartment(null).valid).toBe(false);
        expect(validateDepartment(undefined).valid).toBe(false);
    });
});
