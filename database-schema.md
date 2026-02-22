# School Management System — Database Schema

MongoDB design for the School Management API. All collections use `timestamps: true` (auto `createdAt`, `updatedAt`).

---

## Entity Relationship Overview

**1. Hierarchy (School → Grade → Classroom → Student)**

School has many Grades; each Grade has many Classrooms; each Classroom belongs to one Grade and one School. Each Student belongs to one School and optionally one Classroom.

```
    ┌─────────────────┐
    │     School      │
    │  PK: _id        │
    └────────┬────────┘
             │ 1
             │ schoolId (FK)
             ▼ N
    ┌─────────────────┐
    │     Grade       │
    │  PK: _id        │
    │  FK: schoolId   │───► School
    └────────┬────────┘
             │ 1
             │ gradeId (FK)
             ▼ N
    ┌─────────────────┐
    │   Classroom     │
    │  PK: _id        │
    │  FK: schoolId   │───► School
    │  FK: gradeId    │───► Grade
    └────────┬────────┘
             │ 1
             │ classroomId (FK)
             ▼ N
    ┌─────────────────┐
    │     Student     │
    │  PK: _id        │
    │  FK: schoolId   │───► School
    │  FK: classroomId│───► Classroom (optional)
    └─────────────────┘
```

**2. “Created by” (User as creator)**

User is the creator of School, Grade, Classroom, and Student. The foreign key lives on the created entity.

```
                         ┌─────────────────┐
                         │      User       │
                         │  PK: _id        │
                         └────────┬────────┘
                                  │ 1
                    createdBy (FK on School, Classroom, Student)
                                  │
         ┌────────────────────────┼────────────────────────┬────────────────────────┐
         │                        │                        │                        │
         ▼ N                      ▼ N                      ▼ N                      ▼ N
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     School      │     │     Grade       │     │   Classroom     │     │     Student     │
│ FK: createdBy ──┼─►   │ FK: createdBy ──┼─►   │ FK: createdBy ──┼─►   │ FK: createdBy ──┼─► User
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

**3. “Assigned to” (User as school admin)**

A school_admin User is assigned to exactly one School. The foreign key is on User.

```
┌─────────────────┐                    ┌─────────────────┐
│      User       │                    │     School      │
│ FK: schoolId ───┼───────────────────►│  PK: _id        │
│ (optional;      │  N         1       └─────────────────┘
│  when role =    │
│  school_admin)  │
└─────────────────┘
```

**Relation summary**

| From      | To        | Foreign key          | Cardinality | Notes                                        |
| --------- | --------- | -------------------- | ----------- | -------------------------------------------- |
| Grade     | School    | schoolId             | N : 1       | Grade belongs to one School                  |
| Classroom | School    | schoolId             | N : 1       | Classroom belongs to one School              |
| Classroom | Grade     | gradeId              | N : 1       | Classroom optionally belongs to one Grade    |
| Student   | School    | schoolId             | N : 1       | Student belongs to one School                |
| Student   | Classroom | classroomId          | N : 1       | Student optionally in one Classroom          |
| School    | User      | createdBy            | N : 1       | School created by one User                   |
| Grade     | User      | createdBy            | N : 1       | Grade created by one User                    |
| Classroom | User      | createdBy            | N : 1       | Classroom created by one User                |
| Student   | User      | createdBy            | N : 1       | Student created by one User                  |
| User      | School    | schoolId             | N : 1       | User (school_admin/staff) assigned to school |
| User      | Classroom | assignedClassroomIds | N : M       | Teachers assigned to classrooms (array)      |

---

## Collections

### 1. users

| Field                | Type       | Required | Constraints                                                                        | Notes                                 |
| -------------------- | ---------- | -------- | ---------------------------------------------------------------------------------- | ------------------------------------- |
| \_id                 | ObjectId   | auto     | —                                                                                  | Primary key                           |
| username             | String     | yes      | unique, trim, 3–20 chars                                                           |                                       |
| email                | String     | yes      | unique, trim, lowercase, email                                                     |                                       |
| password             | String     | yes      | min 8 chars                                                                        | Stored hashed (bcrypt)                |
| role                 | String     | yes      | enum: `superadmin`, `school_admin`, `teacher`, `cafeteria_staff`, `security`, `hr` |                                       |
| schoolId             | ObjectId   | cond     | ref: School                                                                        | Required for school_admin and staff   |
| assignedClassroomIds | [ObjectId] | no       | ref: Classroom                                                                     | Teachers only; classrooms assigned to |
| isActive             | Boolean    | no       | default: true                                                                      |                                       |
| key                  | String     | no       | unique, auto (nanoid)                                                              | Used in JWT                           |
| createdAt            | Date       | auto     | —                                                                                  |                                       |
| updatedAt            | Date       | auto     | —                                                                                  |                                       |

**Indexes:**

| Index           | Type     | Purpose                               |
| --------------- | -------- | ------------------------------------- |
| username        | unique   | Login / lookup, uniqueness            |
| email           | unique   | Login / lookup, uniqueness            |
| role            | single   | Filter by role                        |
| schoolId        | sparse   | Users by school (null for superadmin) |
| isActive + role | compound | Active users by role                  |
| role + schoolId | compound | School admins/staff for a school      |

---

### 2. schools

| Field           | Type     | Required | Constraints                    | Notes       |
| --------------- | -------- | -------- | ------------------------------ | ----------- |
| \_id            | ObjectId | auto     | —                              | Primary key |
| name            | String   | yes      | trim, 3–200 chars              |             |
| address         | String   | yes      | trim, max 500                  |             |
| phone           | String   | yes      | trim, max 20                   |             |
| email           | String   | yes      | trim, lowercase, email, unique |             |
| principalName   | String   | no       | trim, max 100                  |             |
| establishedYear | Number   | no       | 1800 – current year            |             |
| isActive        | Boolean  | no       | default: true                  |             |
| createdBy       | ObjectId | yes      | ref: User                      |             |
| createdAt       | Date     | auto     | —                              |             |
| updatedAt       | Date     | auto     | —                              |             |

**Indexes:**

| Index                | Type            | Purpose               |
| -------------------- | --------------- | --------------------- |
| name                 | single          | Search / sort by name |
| email                | unique          | Uniqueness, lookup    |
| isActive             | single          | Filter active schools |
| createdAt            | single (desc)   | List by date          |
| isActive + createdAt | compound (desc) | Filter + pagination   |
| createdBy            | single          | Schools by creator    |

---

### 3. grades

| Field     | Type     | Required | Constraints   | Notes       |
| --------- | -------- | -------- | ------------- | ----------- |
| \_id      | ObjectId | auto     | —             | Primary key |
| name      | String   | yes      | trim, 1–100   |             |
| schoolId  | ObjectId | yes      | ref: School   |             |
| sortOrder | Number   | no       | default: 0    |             |
| isActive  | Boolean  | no       | default: true |             |
| createdBy | ObjectId | yes      | ref: User     |             |
| createdAt | Date     | auto     | —             |             |
| updatedAt | Date     | auto     | —             |             |

**Indexes:** schoolId; schoolId + name (unique per school); sortOrder; createdBy.

---

### 4. classrooms

| Field             | Type     | Required | Constraints       | Notes              |
| ----------------- | -------- | -------- | ----------------- | ------------------ |
| \_id              | ObjectId | auto     | —                 | Primary key        |
| name              | String   | yes      | trim, 1–100 chars |                    |
| schoolId          | ObjectId | yes      | ref: School       |                    |
| gradeId           | ObjectId | no       | ref: Grade        |                    |
| capacity          | Number   | yes      | 1–100             |                    |
| currentEnrollment | Number   | no       | default: 0, min 0 | Must be ≤ capacity |
| grade             | String   | no       | trim, max 50      |                    |
| section           | String   | no       | trim, max 10      |                    |
| roomNumber        | String   | no       | trim, max 20      |                    |
| resources         | [String] | no       | default: []       |                    |
| isActive          | Boolean  | no       | default: true     |                    |
| createdBy         | ObjectId | yes      | ref: User         |                    |
| createdAt         | Date     | auto     | —                 |                    |
| updatedAt         | Date     | auto     | —                 |                    |

**Indexes:**

| Index                | Type            | Purpose                      |
| -------------------- | --------------- | ---------------------------- |
| schoolId + name      | unique          | One name per school          |
| schoolId             | single          | Classrooms by school         |
| gradeId              | single          | Classrooms by grade          |
| schoolId + gradeId   | compound        | Classrooms by school + grade |
| schoolId + isActive  | compound        | Active classrooms per school |
| schoolId + createdAt | compound (desc) | List by school + date        |
| isActive             | single          | Filter active                |
| createdBy            | single          | Classrooms by creator        |

**Validation:** Pre-save: `currentEnrollment` must not exceed `capacity`.

---

### 4. students

| Field          | Type     | Required | Constraints            | Notes       |
| -------------- | -------- | -------- | ---------------------- | ----------- |
| \_id           | ObjectId | auto     | —                      | Primary key |
| firstName      | String   | yes      | trim, 1–100 chars      |             |
| lastName       | String   | yes      | trim, 1–100 chars      |             |
| dateOfBirth    | Date     | yes      | —                      |             |
| email          | String   | no       | trim, lowercase, email |             |
| phone          | String   | no       | trim, max 20           |             |
| address        | String   | no       | trim, max 500          |             |
| schoolId       | ObjectId | yes      | ref: School            |             |
| classroomId    | ObjectId | yes      | ref: Classroom         |             |
| studentId      | String   | yes      | unique, trim, max 50   | Business ID |
| enrollmentDate | Date     | no       | default: now           |             |
| guardianName   | String   | no       | trim, max 100          |             |
| guardianPhone  | String   | no       | trim, max 20           |             |
| guardianEmail  | String   | no       | trim, lowercase, email |             |
| isActive       | Boolean  | no       | default: true          |             |
| createdBy      | ObjectId | yes      | ref: User              |             |
| createdAt      | Date     | auto     | —                      |             |
| updatedAt      | Date     | auto     | —                      |             |

**Indexes:**

| Index                  | Type            | Purpose                        |
| ---------------------- | --------------- | ------------------------------ |
| schoolId               | single          | Students by school             |
| schoolId + createdAt   | compound (desc) | List by school + date          |
| schoolId + classroomId | compound        | Students in school + classroom |
| schoolId + isActive    | compound        | Active students per school     |
| classroomId            | single          | Students by classroom          |
| studentId              | unique          | Business ID, uniqueness        |
| email                  | sparse          | Lookup when present            |
| isActive               | single          | Filter active                  |
| createdBy              | single          | Students by creator            |
| enrollmentDate         | single (desc)   | Recent enrollments             |

---

## Index Summary (by collection)

| Collection | Unique indexes            | Other notable indexes                                                                                                                   |
| ---------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| users      | username, email, key      | role; schoolId (sparse); isActive+role; role+schoolId                                                                                   |
| schools    | email                     | name; isActive; createdAt; isActive+createdAt; createdBy                                                                                |
| grades     | (schoolId, name)          | schoolId; sortOrder; createdBy                                                                                                          |
| classrooms | (schoolId, name)          | schoolId; gradeId; schoolId+gradeId; schoolId+isActive; schoolId+createdAt; isActive; createdBy                                         |
| students   | (schoolId, cardId) sparse | schoolId; schoolId+createdAt; schoolId+classroomId; schoolId+isActive; classroomId; email (sparse); isActive; createdBy; enrollmentDate |

---

## Reference (Mongoose model files)

- Users: `managers/entities/user/user.mongoModel.js`
- Schools: `managers/entities/school/school.mongoModel.js`
- Grades: `managers/entities/grade/grade.mongoModel.js`
- Classrooms: `managers/entities/classroom/classroom.mongoModel.js`
- Students: `managers/entities/student/student.mongoModel.js`
