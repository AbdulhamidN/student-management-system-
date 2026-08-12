describe('Student Management System - Complete End-to-End Workflow', () => {
    beforeEach(() => {
        // Intercept API endpoints for test control and isolation
        cy.intercept('GET', '/api/students', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    { id: 1, name: 'Abdulhamid Nuri', email: 'abdy@example.com', phone: '0911000000', department_id: 1, department_name: 'Computer Science', is_deleted: 0 },
                    { id: 2, name: 'Sara Tesfaye', email: 'sara@example.com', phone: '0911000001', department_id: 2, department_name: 'Electrical Engineering', is_deleted: 0 }
                ]
            }
        }).as('getStudents');

        cy.intercept('GET', '/api/departments', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    { id: 1, name: 'Computer Science' },
                    { id: 2, name: 'Electrical Engineering' },
                    { id: 3, name: 'Mathematics' }
                ]
            }
        }).as('getDepartments');

        cy.intercept('GET', '/api/courses', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    { id: 101, name: 'Data Structures', code: 'CS201', department_id: 1 },
                    { id: 102, name: 'Circuit Analysis', code: 'EE210', department_id: 2 }
                ]
            }
        }).as('getCourses');

        cy.visit('/');
    });

    it('1. Should display initial list of active students and departments', () => {
        cy.contains('Abdulhamid Nuri').should('be.visible');
        cy.contains('Sara Tesfaye').should('be.visible');
        cy.get('[data-testid="department-filter-select"]').should('be.visible');
    });

    it('2. Should open form modal and validate required fields', () => {
        cy.get('[data-testid="add-student-btn"]').click();
        cy.get('[data-testid="student-form-modal"]').should('be.visible');

        // Submit empty form to verify html5 validation / form required fields
        cy.get('[data-testid="name-input"]').should('have.attr', 'required');
        cy.get('[data-testid="email-input"]').should('have.attr', 'required');

        cy.get('[data-testid="cancel-btn"]').click();
        cy.get('[data-testid="student-form-modal"]').should('not.exist');
    });

    it('3. Should create a new student successfully', () => {
        cy.intercept('POST', '/api/students', {
            statusCode: 201,
            body: {
                success: true,
                message: 'Student created successfully',
                id: 3
            }
        }).as('createStudent');

        cy.get('[data-testid="add-student-btn"]').click();
        cy.get('[data-testid="name-input"]').type('Abebe Bikila');
        cy.get('[data-testid="email-input"]').type('abebe@example.com');
        cy.get('[data-testid="phone-input"]').type('0912345678');
        cy.get('[data-testid="department-select"]').select('1');

        cy.get('[data-testid="submit-btn"]').click();
        cy.wait('@createStudent');
    });

    it('4. Should edit an existing student', () => {
        cy.intercept('PUT', '/api/students/1', {
            statusCode: 200,
            body: {
                success: true,
                message: 'Student updated successfully'
            }
        }).as('updateStudent');

        cy.get('[data-testid="edit-btn-1"]').click();
        cy.get('[data-testid="name-input"]').clear().type('Abdulhamid Nuri Updated');
        cy.get('[data-testid="submit-btn"]').click();
        cy.wait('@updateStudent');
    });

    it('5. Should filter students by department', () => {
        cy.intercept('GET', '/api/students/department/1', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    { id: 1, name: 'Abdulhamid Nuri', email: 'abdy@example.com', phone: '0911000000', department_id: 1, department_name: 'Computer Science', is_deleted: 0 }
                ]
            }
        }).as('getDeptStudents');

        cy.get('[data-testid="department-filter-select"]').select('1');
        cy.wait('@getDeptStudents');
        cy.contains('Abdulhamid Nuri').should('be.visible');
    });

    it('6. Should assign a course to a student', () => {
        cy.intercept('GET', '/api/students/1/courses', {
            statusCode: 200,
            body: { success: true, data: [] }
        }).as('getStudentCourses');

        cy.intercept('POST', '/api/students/1/courses', {
            statusCode: 201,
            body: { success: true, message: 'Course assigned' }
        }).as('assignCourse');

        cy.get('[data-testid="assign-btn-1"]').click();
        cy.get('[data-testid="course-assign-modal"]').should('be.visible');
        cy.get('[data-testid="course-select"]').select('101');
        cy.get('[data-testid="assign-course-submit-btn"]').click();
        cy.wait('@assignCourse');
    });

    it('7. Should soft delete a student (setting is_deleted = TRUE)', () => {
        cy.intercept('DELETE', '/api/students/1', {
            statusCode: 200,
            body: {
                success: true,
                message: 'Student soft-deleted successfully'
            }
        }).as('deleteStudent');

        cy.get('[data-testid="delete-btn-1"]').click();
        cy.wait('@deleteStudent');
    });
});
