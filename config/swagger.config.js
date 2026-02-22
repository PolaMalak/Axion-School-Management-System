const authPaths = require('../swagger/paths/auth');
const schoolPaths = require('../swagger/paths/schools');
const gradePaths = require('../swagger/paths/grades');
const classroomPaths = require('../swagger/paths/classrooms');
const studentPaths = require('../swagger/paths/students');

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'School Management System API',
    version: '1.0.0',
    description: 'RESTful API for managing schools, classrooms, and students with JWT authentication and role-based access (superadmin, school_admin).',
    contact: { name: 'API Support' },
  },
  servers: [
    { url: 'http://localhost:5111', description: 'Development' },
  ],
  tags: [
    { name: 'Auth', description: 'Registration, login, and token exchange' },
    { name: 'Schools', description: 'School CRUD (superadmin / school_admin)' },
    { name: 'Grades', description: 'Grade CRUD per school (school -> grade -> classroom)' },
    { name: 'Classrooms', description: 'Classroom CRUD per school' },
    { name: 'Students', description: 'Student CRUD and transfer' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Short token from POST /api/token/v1_createShortToken. Send in header: token',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' },
          role: {
            type: 'string',
            enum: ['superadmin', 'school_admin', 'teacher', 'cafeteria_staff', 'security', 'hr'],
          },
          schoolId: { type: 'string', nullable: true },
          assignedClassroomIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'Classroom IDs (teachers only)',
          },
          isActive: { type: 'boolean' },
        },
      },
      School: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          address: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          principalName: { type: 'string', nullable: true },
          establishedYear: { type: 'integer', nullable: true },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Grade: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          schoolId: { type: 'string' },
          sortOrder: { type: 'integer' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Classroom: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          schoolId: { type: 'string' },
          gradeId: { type: 'string', nullable: true },
          capacity: { type: 'integer' },
          currentEnrollment: { type: 'integer' },
          grade: { type: 'string', nullable: true },
          section: { type: 'string', nullable: true },
          roomNumber: { type: 'string', nullable: true },
          resources: { type: 'array', items: { type: 'string' } },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Student: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          email: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          schoolId: { type: 'string' },
          classroomId: { type: 'string' },
          cardId: { type: 'string' },
          enrollmentDate: { type: 'string', format: 'date-time' },
          guardianName: { type: 'string', nullable: true },
          guardianPhone: { type: 'string', nullable: true },
          guardianEmail: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          pages: { type: 'integer' },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
          data: { type: 'object' },
          errors: { oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] },
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    ...authPaths,
    ...schoolPaths,
    ...gradePaths,
    ...classroomPaths,
    ...studentPaths,
  },
};

module.exports = swaggerSpec;
