# School Management System API

A comprehensive RESTful API for managing schools, classrooms, and students with role-based access control (RBAC).

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Framework Customizations](#framework-customizations)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)

## Features

- **Role-Based Access Control (RBAC)**
  - Superadmin: Full system access
  - School Administrator: School-specific access
- **Entity Management**
  - Schools: CRUD, getSchoolClassrooms, getSchoolGrades, getSchoolStaff, getSchoolStudents
  - Grades: CRUD, listGrades, getGradeClassrooms (School → Grade → Classroom)
  - Classrooms: CRUD, getClassroomStudents, getClassroomTeachers, listClassrooms
  - Students: Create (cardId auto-generated from dateOfBirth + 2 random chars), get, update, delete, transfer, list
  - Staff (User): createStaff, updateStaff, getStaff, listStaff, getStaffClassrooms (teacher, cafeteria_staff, security, hr)

- **Security**
  - JWT-based authentication
  - Input validation
  - Rate limiting
  - Error handling with appropriate HTTP status codes

- **Database**
  - MongoDB for data persistence
  - Redis for caching and rate limiting

## Architecture

The system follows a modular architecture pattern:

```
├── managers/
│   ├── entities/          # Entity managers (User, School, Classroom, Student)
│   ├── api/               # API handler
│   ├── http/              # HTTP server
│   ├── token/             # JWT token management
│   └── response_dispatcher/ # Response formatting
├── mws/                   # Middlewares
├── loaders/               # Module loaders
├── config/                # Configuration files
└── connect/               # Database connections
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6 or higher)

## Installation And Configuration

1. Clone the repository:

```bash
git clone <repository-url>
cd axion
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
SERVICE_NAME=axion-school-management-system
ENV=development
USER_PORT=5111
ADMIN_PORT=5222

MONGO_URI=mongodb://localhost:27017/axion-school-management-system
REDIS_URI=redis://127.0.0.1:6379
CACHE_REDIS=redis://127.0.0.1:6379
CACHE_PREFIX=axion:ch

CORTEX_REDIS=redis://127.0.0.1:6379
CORTEX_PREFIX=axion
CORTEX_TYPE=axion

OYSTER_REDIS=redis://127.0.0.1:6379
OYSTER_PREFIX=axion

LONG_TOKEN_SECRET=your-long-token-secret-key-here
SHORT_TOKEN_SECRET=your-short-token-secret-key-here
NACL_SECRET=your-nacl-secret-key-here
```

4. (Optional) Seed test data:

```bash
npm run seed
```

Creates a superadmin (`superadmin@test.com` / `password123`), a school admin (`schooladmin@test.com` / `password123`), one school, one classroom, and one student. Safe to run multiple times (skips existing records).

5. Start the server:

```bash
npm start
```

The server will start on port 5111 (or the port specified in USER_PORT).

## API Documentation

### Swagger UI (OpenAPI)

Interactive API docs are available at:

**http://localhost:5111/api-docs**

Use it to explore all endpoints, request/response schemas, and try requests. For protected routes, get a short token via **POST /api/token/v1_createShortToken** (with long token in header `token`), then use **Authorize** and enter the short token, or send it in the `token` header for each request.

### Base URL

```
http://localhost:5111/api
```

### Authentication Endpoints

#### Register User

```http
POST /api/user/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "schoolId": "string (optional, required for school_admin)"
}
```

**Response:**

```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "superadmin|school_admin",
      "schoolId": "string|null"
    },
    "longToken": "string"
  }
}
```

#### Login

```http
POST /api/user/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "ok": true,
  "data": {
    "user": { ... },
    "longToken": "string"
  }
}
```

#### Create Short Token

```http
POST /api/token/v1_createShortToken
Headers: { "token": "longToken" }
```

**Response:**

```json
{
  "ok": true,
  "data": {
    "shortToken": "string"
  }
}
```

### School Endpoints

All school endpoints require authentication via `token` header (shortToken).

#### Create School

```http
POST /api/school/createSchool
Headers: { "token": "shortToken" }
Content-Type: application/json

{
  "name": "string",
  "address": "string",
  "phone": "string",
  "email": "string",
  "principalName": "string (optional)",
  "establishedYear": "number (optional)"
}
```

**Authorization:** Superadmin only

#### Get School

```http
GET /api/school/getSchool?schoolId={id}
Headers: { "token": "shortToken" }
```

**Authorization:** Superadmin or School Admin (own school only)

#### Update School

```http
PUT /api/school/updateSchool
Headers: { "token": "shortToken" }
Content-Type: application/json

{
  "schoolId": "string",
  "name": "string (optional)",
  "address": "string (optional)",
  "phone": "string (optional)",
  "email": "string (optional)",
  "principalName": "string (optional)",
  "establishedYear": "number (optional)",
  "isActive": "boolean (optional)"
}
```

**Authorization:** Superadmin only

#### Delete School

```http
DELETE /api/school/deleteSchool?schoolId={id}
Headers: { "token": "shortToken" }
```

**Authorization:** Superadmin only

#### List Schools

```http
GET /api/school/listSchools?page={number}&limit={number}&isActive={boolean}
Headers: { "token": "shortToken" }
```

**Authorization:** Superadmin (all schools) or School Admin (own school only)

### Classroom Endpoints

All classroom endpoints require authentication via `token` header.

#### Create Classroom

```http
POST /api/classroom/createClassroom
Headers: { "token": "shortToken" }
Content-Type: application/json

{
  "name": "string",
  "schoolId": "string",
  "capacity": "number",
  "grade": "string (optional)",
  "section": "string (optional)",
  "roomNumber": "string (optional)",
  "resources": ["string"] (optional)
}
```

**Authorization:** Superadmin or School Admin (own school only)

#### Get Classroom

```http
GET /api/classroom/getClassroom?classroomId={id}
Headers: { "token": "shortToken" }
```

**Authorization:** Superadmin or School Admin (own school only)

#### Update Classroom

```http
PUT /api/classroom/updateClassroom
Headers: { "token": "shortToken" }
Content-Type: application/json

{
  "classroomId": "string",
  "name": "string (optional)",
  "capacity": "number (optional)",
  "grade": "string (optional)",
  "section": "string (optional)",
  "roomNumber": "string (optional)",
  "resources": ["string"] (optional),
  "isActive": "boolean (optional)"
}
```

**Authorization:** Superadmin or School Admin (own school only)

#### Delete Classroom

```http
DELETE /api/classroom/deleteClassroom?classroomId={id}
Headers: { "token": "shortToken" }
```

**Authorization:** Superadmin or School Admin (own school only)

#### Get Classroom Students

```http
GET /api/classroom/getClassroomStudents?classroomId={id}
Headers: { "token": "shortToken" }
```

**Authorization:** Superadmin or School Admin (own school only)

#### Get Classroom Teachers

```http
GET /api/classroom/getClassroomTeachers?classroomId={id}
Headers: { "token": "shortToken" }
```

Returns the classroom and all teachers assigned to it (`assignedClassroomIds` contains this classroom). **Authorization:** Superadmin or School Admin (own school only)

#### List Classrooms

```http
GET /api/classroom/listClassrooms?schoolId={id}&page={number}&limit={number}&isActive={boolean}
Headers: { "token": "shortToken" }
```

**Authorization:** Superadmin or School Admin (own school only)

### Student Endpoints

All student endpoints require authentication via `token` header.

#### Create Student

`cardId` is auto-generated from the student’s date of birth plus two random alphanumeric characters (e.g. `20100515A3`). Do not send `studentId` or `cardId` in the body.

```http
POST /api/student/createStudent
Headers: { "token": "shortToken" }
Content-Type: application/json

{
  "firstName": "string",
  "lastName": "string",
  "schoolId": "string",
  "classroomId": "string",
  "dateOfBirth": "string (ISO date YYYY-MM-DD)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "address": "string (optional)",
  "guardianName": "string (optional)",
  "guardianPhone": "string (optional)",
  "guardianEmail": "string (optional)"
}
```

**Response** includes `data.student.cardId`. For get/update/delete/transfer, the `studentId` parameter is the student’s MongoDB `_id`, not the cardId.

**Authorization:** Superadmin or School Admin (own school only)

#### Get Student

```http
GET /api/student/getStudent?studentId={id}
Headers: { "token": "shortToken" }
```

**Authorization:** Superadmin or School Admin (own school only)

#### Update Student

```http
PUT /api/student/updateStudent
Headers: { "token": "shortToken" }
Content-Type: application/json

{
  "studentId": "string",
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "address": "string (optional)",
  "guardianName": "string (optional)",
  "guardianPhone": "string (optional)",
  "guardianEmail": "string (optional)",
  "isActive": "boolean (optional)"
}
```

**Authorization:** Superadmin or School Admin (own school only)

#### Delete Student

```http
DELETE /api/student/deleteStudent?studentId={id}
Headers: { "token": "shortToken" }
```

**Authorization:** Superadmin or School Admin (own school only)

#### Transfer Student

```http
POST /api/student/transferStudent
Headers: { "token": "shortToken" }
Content-Type: application/json

{
  "studentId": "string",
  "newClassroomId": "string",
  "newSchoolId": "string (optional)"
}
```

**Authorization:** Superadmin or School Admin (own school only)

#### List Students

```http
GET /api/student/listStudents?schoolId={id}&classroomId={id}&page={number}&limit={number}&isActive={boolean}
Headers: { "token": "shortToken" }
```

**Authorization:** Superadmin or School Admin (own school only)

## Authentication

The API uses a two-token authentication system:

1. **Long Token**: Issued on login/registration, long-lived (3 years)
2. **Short Token**: Issued from long token, used for API requests

### Authentication Flow

1. User registers/logs in → receives `longToken`
2. User exchanges `longToken` for `shortToken` via `/api/token/v1_createShortToken`
3. User includes `shortToken` in `token` header for all protected endpoints

### Role-Based Access

- **Superadmin**: Can manage all schools, classrooms, and students
- **School Admin**: Can only manage resources within their assigned school

See `database-schema.md` for full schema including Grade, User staff roles, and Classroom gradeId.

## Testing

Unit tests use mocks for MongoDB, Redis, and external services (no live API or DB). Coverage is collected for manager and token logic.

```bash
npm test
npm run test:coverage
```

Tests live under `tests/unit/`. Jest is configured in `jest.config.js` (test match: `tests/unit/**/*.test.js`).

## Error Handling

The API returns standardized error responses:

```json
{
  "ok": false,
  "errors": "Error message or array of errors",
  "message": "Optional detailed message"
}
```

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## Framework Customizations

The following customizations were added to the base framework for this project:

- **Params from query + body** — The API handler merges coerced query params, request body, and middleware results into a single `data` object before calling manager methods. Validators run on this combined input. _Reason: APIs can accept both query and body; one validation pass applies to the full input._

- **Custom validators** — `ValidatorsLoader` is given `schema.models` and `schema.validators` from `managers/_common/`. Custom validators (e.g. `mongoId`, `dateOfBirth`) in `schema.validators.js` are used by entity schemas. _Reason: Validate MongoDB ObjectIds and domain rules (e.g. date of birth not future, sane range) beyond built-in types._

- **Query coercion** — `coerceQueryParams` (in `managers/_common/coerceQueryParams.js`) runs on `req.query` before merging. It coerces `page` and `limit` to numbers and `isActive` to boolean. _Reason: Query params are always strings; coercing avoids type errors and duplicate validation in handlers._

- **Middlewares** — Pre-stack includes `__requestLog` (logs each request and response time in ms) and `__device` (device fingerprint for short token). Per-route `__shortToken` loads the user from `mongomodels.user` and sets `decoded.role` and `decoded.schoolId` on the token. _Reason: Request logging for observability; short token carries full user context for RBAC._

- **Mongomodels in injectable** — `MongoLoader` loads entity Mongoose models; they are attached to the injectable as `mongomodels` and passed to managers and middlewares (e.g. `__shortToken`). _Reason: Managers and middlewares can access the database without tight coupling to the loader; \_\_shortToken can enrich the token with role and schoolId from the User collection._

## Deployment

### Production Checklist

1. Set `ENV=production` in `.env`
2. Use strong, unique secrets for tokens
3. Configure MongoDB replica set for high availability
4. Set up Redis cluster for caching
5. Enable HTTPS/TLS
6. Configure firewall rules
7. Set up monitoring and logging
8. Configure backup strategy

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5111
CMD ["node", "index.js"]
```

See **Security Implementation** and **Error Handling** above for full criteria.

## License

ISC
