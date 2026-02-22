const {
  createMockModel,
  createMockMongoModels,
  getInjectable,
} = require("./helpers/mocks");

const UserManager = require("../../managers/entities/user/User.manager");
const SchoolManager = require("../../managers/entities/school/School.manager");
const GradeManager = require("../../managers/entities/grade/Grade.manager");
const ClassroomManager = require("../../managers/entities/classroom/Classroom.manager");
const StudentManager = require("../../managers/entities/student/Student.manager");

const shortToken = (overrides = {}) => ({
  userId: "user1",
  role: "superadmin",
  schoolId: null,
  ...overrides,
});

describe("User manager (unit)", () => {
  test("register – superadmin – returns user and longToken", async () => {
    const userModel = createMockModel({
      _id: "u1",
      username: "superadmin",
      role: "superadmin",
      key: "k1",
    });
    userModel.findOne.mockResolvedValue(null);
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ user: userModel }),
    });
    const manager = new UserManager(injectable);

    const result = await manager.register({
      username: "superadmin",
      email: "superadmin@test.com",
      password: "password123",
    });

    expect(result.errors).toBeUndefined();
    expect(result.error).toBeUndefined();
    expect(result.user).toBeDefined();
    expect(result.user.role).toBe("superadmin");
    expect(result.longToken).toBe("mock-long-token");
    expect(userModel.findOne).toHaveBeenCalled();
  });

  test("register – school_admin with schoolId – calls schoolModel.findById", async () => {
    const userModel = createMockModel({
      _id: "u2",
      role: "school_admin",
      key: "k2",
    });
    userModel.findOne.mockResolvedValue(null);
    const schoolModel = createMockModel({ _id: "school1", isActive: true });
    schoolModel.findById.mockResolvedValue(
      schoolModel({ _id: "school1", isActive: true }),
    );
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({
        user: userModel,
        school: schoolModel,
      }),
    });
    const manager = new UserManager(injectable);

    const result = await manager.register({
      username: "schooladmin",
      email: "schooladmin@test.com",
      password: "password123",
      schoolId: "school1",
    });

    expect(result.errors).toBeUndefined();
    expect(schoolModel.findById).toHaveBeenCalledWith("school1");
  });

  test("login – invalid credentials returns errors", async () => {
    const userModel = createMockModel();
    userModel.findOne.mockResolvedValue(null);
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ user: userModel }),
    });
    const manager = new UserManager(injectable);

    const result = await manager.login({
      email: "nobody@test.com",
      password: "wrong",
    });

    expect(result.errors).toBeDefined();
  });

  test("createStaff – success returns user", async () => {
    const userModel = createMockModel({ _id: "staff1", role: "teacher" });
    userModel.findOne.mockResolvedValue(null);
    const schoolModel = createMockModel({ _id: "school1", isActive: true });
    schoolModel.findById.mockResolvedValue({ _id: "school1", isActive: true });
    const classroomModel = createMockModel();
    classroomModel.find.mockResolvedValue([
      { _id: "room1", schoolId: "school1" },
    ]);
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({
        user: userModel,
        school: schoolModel,
        classroom: classroomModel,
      }),
    });
    const manager = new UserManager(injectable);

    const result = await manager.createStaff({
      __shortToken: shortToken(),
      username: "teacher1",
      email: "teacher@test.com",
      password: "password123",
      schoolId: "school1",
      role: "teacher",
      assignedClassroomIds: ["room1"],
    });

    expect(result.errors).toBeUndefined();
    expect(result.user).toBeDefined();
    expect(result.user.role).toBe("teacher");
  });

  test("login – success returns user and longToken", async () => {
    const userDoc = {
      _id: "u1",
      email: "admin@test.com",
      isActive: true,
      comparePassword: jest.fn().mockResolvedValue(true),
      toObject: () => ({ _id: "u1", username: "admin", email: "admin@test.com", role: "superadmin", isActive: true }),
    };
    const userModel = createMockModel();
    userModel.findOne.mockResolvedValue(userDoc);
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ user: userModel }) });
    const manager = new UserManager(injectable);

    const result = await manager.login({
      email: "admin@test.com",
      password: "password123",
    });

    expect(result.errors).toBeUndefined();
    expect(result.user).toBeDefined();
    expect(result.longToken).toBe("mock-long-token");
  });

  test("login – inactive user returns errors", async () => {
    const userDoc = {
      _id: "u1",
      email: "inactive@test.com",
      isActive: false,
      comparePassword: jest.fn(),
      toObject: () => ({}),
    };
    const userModel = createMockModel();
    userModel.findOne.mockResolvedValue(userDoc);
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ user: userModel }) });
    const manager = new UserManager(injectable);

    const result = await manager.login({
      email: "inactive@test.com",
      password: "password123",
    });

    expect(result.errors).toBe("Account is inactive");
  });

  test("register – duplicate email returns errors", async () => {
    const userModel = createMockModel();
    userModel.findOne.mockResolvedValue({ email: "existing@test.com" });
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ user: userModel }) });
    const manager = new UserManager(injectable);

    const result = await manager.register({
      username: "newuser",
      email: "existing@test.com",
      password: "password123",
    });

    expect(result.errors).toBe("User with this email or username already exists");
  });

  test("getStaff – success returns user", async () => {
    const staffDoc = { _id: "staff1", role: "teacher", schoolId: "school1", toObject: () => ({ _id: "staff1", role: "teacher" }) };
    const userModel = createMockModel();
    userModel.findById.mockResolvedValue(staffDoc);
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ user: userModel }) });
    const manager = new UserManager(injectable);

    const result = await manager.getStaff({
      __shortToken: shortToken(),
      userId: "staff1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.user).toBeDefined();
  });

  test("getStaff – not found returns errors", async () => {
    const userModel = createMockModel();
    userModel.findById.mockResolvedValue(null);
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ user: userModel }) });
    const manager = new UserManager(injectable);

    const result = await manager.getStaff({
      __shortToken: shortToken(),
      userId: "nonexistent",
    });

    expect(result.errors).toBe("User not found");
  });

  test("updateStaff – success returns user", async () => {
    const userDoc = { _id: "staff1", role: "teacher", schoolId: "school1", isActive: true, toObject: () => ({}) };
    const userModel = createMockModel();
    userModel.findById.mockResolvedValue(userDoc);
    userModel.findByIdAndUpdate.mockResolvedValue({ ...userDoc, isActive: false, toObject: () => ({ ...userDoc, isActive: false }) });
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ user: userModel }) });
    const manager = new UserManager(injectable);

    const result = await manager.updateStaff({
      __shortToken: shortToken(),
      userId: "staff1",
      isActive: false,
    });

    expect(result.errors).toBeUndefined();
    expect(result.user).toBeDefined();
  });

  test("listStaff – success returns staff and pagination", async () => {
    const userModel = createMockModel();
    userModel.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([{ _id: "s1", role: "teacher", toObject: () => ({}) }]),
        }),
      }),
    });
    userModel.countDocuments.mockResolvedValue(1);
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ user: userModel }) });
    const manager = new UserManager(injectable);

    const result = await manager.listStaff({
      __shortToken: shortToken(),
      schoolId: "school1",
      page: 1,
      limit: 10,
    });

    expect(result.errors).toBeUndefined();
    expect(result.staff).toBeInstanceOf(Array);
    expect(result.pagination).toBeDefined();
  });

  test("getStaffClassrooms – teacher with classrooms returns user and classrooms", async () => {
    const userDoc = { _id: "t1", role: "teacher", schoolId: "school1", assignedClassroomIds: ["room1"], toObject: () => ({}) };
    const userModel = createMockModel();
    userModel.findById.mockResolvedValue(userDoc);
    const classroomModel = createMockModel();
    classroomModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ _id: "room1", name: "Class A", toObject: () => ({}) }]) });
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ user: userModel, classroom: classroomModel }),
    });
    const manager = new UserManager(injectable);

    const result = await manager.getStaffClassrooms({
      __shortToken: shortToken(),
      userId: "t1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.user).toBeDefined();
    expect(result.classrooms).toBeInstanceOf(Array);
  });
});

describe("School manager (unit)", () => {
  test("createSchool – superadmin success", async () => {
    const schoolModel = createMockModel({
      _id: "school1",
      name: "Test School",
    });
    schoolModel.findOne.mockResolvedValue(null);
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ school: schoolModel }),
    });
    const manager = new SchoolManager(injectable);

    const result = await manager.createSchool({
      __shortToken: shortToken(),
      name: "Test School",
      address: "123 St",
      phone: "123",
      email: "test@school.com",
      principalName: "Principal",
      establishedYear: 2020,
    });

    expect(result.errors).toBeUndefined();
    expect(result.school).toBeDefined();
    expect(result.school.name).toBe("Test School");
  });

  test("createSchool – non-superadmin returns Unauthorized", async () => {
    const injectable = getInjectable();
    const manager = new SchoolManager(injectable);

    const result = await manager.createSchool({
      __shortToken: shortToken({ role: "school_admin", schoolId: "s1" }),
      name: "Other",
      email: "other@school.com",
    });

    expect(result.errors).toBe(
      "Unauthorized: Only superadmins can create schools",
    );
  });

  test("getSchool – success returns school", async () => {
    const schoolModel = createMockModel({ _id: "school1", name: "Test" });
    schoolModel.findById.mockResolvedValue(
      schoolModel({ _id: "school1", name: "Test" }),
    );
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ school: schoolModel }),
    });
    const manager = new SchoolManager(injectable);

    const result = await manager.getSchool({
      __shortToken: shortToken(),
      schoolId: "school1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.school).toBeDefined();
  });

  test("getSchool – not found returns errors", async () => {
    const schoolModel = createMockModel();
    schoolModel.findById.mockResolvedValue(null);
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ school: schoolModel }) });
    const manager = new SchoolManager(injectable);

    const result = await manager.getSchool({
      __shortToken: shortToken(),
      schoolId: "nonexistent",
    });

    expect(result.errors).toBe("School not found");
  });

  test("updateSchool – success returns updated school", async () => {
    const updatedDoc = { _id: "school1", name: "Updated Name", toObject: () => ({ _id: "school1", name: "Updated Name" }) };
    const schoolModel = createMockModel();
    schoolModel.findById.mockResolvedValue({ _id: "school1", name: "Old" });
    schoolModel.findOne.mockResolvedValue(null);
    schoolModel.findByIdAndUpdate.mockResolvedValue(updatedDoc);
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ school: schoolModel }) });
    const manager = new SchoolManager(injectable);

    const result = await manager.updateSchool({
      __shortToken: shortToken(),
      schoolId: "school1",
      name: "Updated Name",
    });

    expect(result.errors).toBeUndefined();
    expect(result.school.name).toBe("Updated Name");
  });

  test("getSchoolClassrooms – success returns classrooms", async () => {
    const schoolModel = createMockModel({ _id: "school1" });
    schoolModel.findById.mockResolvedValue({ _id: "school1", toObject: () => ({}) });
    const classroomModel = createMockModel();
    classroomModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ _id: "room1", toObject: () => ({}) }]) });
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ school: schoolModel, classroom: classroomModel }),
    });
    const manager = new SchoolManager(injectable);

    const result = await manager.getSchoolClassrooms({
      __shortToken: shortToken(),
      schoolId: "school1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.classrooms).toBeInstanceOf(Array);
  });

  test("getSchoolGrades – success returns grades", async () => {
    const schoolModel = createMockModel({ _id: "school1" });
    schoolModel.findById.mockResolvedValue({ _id: "school1", toObject: () => ({}) });
    const gradeModel = createMockModel();
    gradeModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ _id: "grade1", toObject: () => ({}) }]) });
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ school: schoolModel, grade: gradeModel }),
    });
    const manager = new SchoolManager(injectable);

    const result = await manager.getSchoolGrades({
      __shortToken: shortToken(),
      schoolId: "school1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.grades).toBeInstanceOf(Array);
  });

  test("getSchoolStaff – success returns staff", async () => {
    const schoolModel = createMockModel({ _id: "school1" });
    schoolModel.findById.mockResolvedValue({ _id: "school1", toObject: () => ({}) });
    const userModel = createMockModel();
    userModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ _id: "u1", role: "teacher", toObject: () => ({}) }]) });
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ school: schoolModel, user: userModel }),
    });
    const manager = new SchoolManager(injectable);

    const result = await manager.getSchoolStaff({
      __shortToken: shortToken(),
      schoolId: "school1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.staff).toBeInstanceOf(Array);
  });

  test("getSchoolStudents – success returns students", async () => {
    const schoolModel = createMockModel({ _id: "school1" });
    schoolModel.findById.mockResolvedValue({ _id: "school1", toObject: () => ({}) });
    const studentModel = createMockModel();
    studentModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ _id: "s1", cardId: "20100101AB", toObject: () => ({}) }]) });
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ school: schoolModel, student: studentModel }),
    });
    const manager = new SchoolManager(injectable);

    const result = await manager.getSchoolStudents({
      __shortToken: shortToken(),
      schoolId: "school1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.students).toBeInstanceOf(Array);
  });

  test("listSchools – success returns schools and pagination", async () => {
    const schoolModel = createMockModel();
    schoolModel.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([{ _id: "s1", name: "School 1", toObject: () => ({}) }]),
        }),
      }),
    });
    schoolModel.countDocuments.mockResolvedValue(1);
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ school: schoolModel }) });
    const manager = new SchoolManager(injectable);

    const result = await manager.listSchools({
      __shortToken: shortToken(),
      page: 1,
      limit: 10,
    });

    expect(result.errors).toBeUndefined();
    expect(result.schools).toBeInstanceOf(Array);
    expect(result.pagination).toBeDefined();
  });

  test("deleteSchool – success returns message", async () => {
    const schoolModel = createMockModel();
    schoolModel.findById.mockResolvedValue({ _id: "school1" });
    const studentModel = createMockModel();
    const classroomModel = createMockModel();
    const gradeModel = createMockModel();
    const userModel = createMockModel();
    [studentModel, classroomModel, gradeModel, userModel].forEach((m) => {
      m.deleteMany.mockResolvedValue({});
    });
    schoolModel.findByIdAndDelete.mockResolvedValue({});
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({
        school: schoolModel,
        student: studentModel,
        classroom: classroomModel,
        grade: gradeModel,
        user: userModel,
      }),
    });
    const manager = new SchoolManager(injectable);

    const result = await manager.deleteSchool({
      __shortToken: shortToken(),
      schoolId: "school1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.message).toBe("School deleted successfully");
  });
});

describe("Grade manager (unit)", () => {
  test("createGrade – success returns grade", async () => {
    const gradeModel = createMockModel({ _id: "grade1", name: "Grade 1" });
    gradeModel.findOne.mockResolvedValue(null);
    const schoolModel = createMockModel({ _id: "school1", isActive: true });
    schoolModel.findById.mockResolvedValue({ _id: "school1", isActive: true });
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({
        grade: gradeModel,
        school: schoolModel,
      }),
    });
    const manager = new GradeManager(injectable);

    const result = await manager.createGrade({
      __shortToken: shortToken(),
      name: "Grade 1",
      schoolId: "school1",
      sortOrder: 1,
    });

    expect(result.errors).toBeUndefined();
    expect(result.grade).toBeDefined();
  });

  test("getGrade – not found returns errors", async () => {
    const gradeModel = createMockModel();
    gradeModel.findById.mockResolvedValue(null);
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ grade: gradeModel }),
    });
    const manager = new GradeManager(injectable);

    const result = await manager.getGrade({
      __shortToken: shortToken(),
      gradeId: "nonexistent",
    });

    expect(result.errors).toBe("Grade not found");
  });

  test("getGrade – success returns grade", async () => {
    const gradeDoc = { _id: "grade1", name: "Grade 1", schoolId: "school1", toObject: () => ({}) };
    const gradeModel = createMockModel();
    gradeModel.findById.mockResolvedValue(gradeDoc);
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ grade: gradeModel }) });
    const manager = new GradeManager(injectable);

    const result = await manager.getGrade({
      __shortToken: shortToken(),
      gradeId: "grade1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.grade).toBeDefined();
  });

  test("updateGrade – success returns grade", async () => {
    const gradeDoc = { _id: "grade1", name: "Grade 1", schoolId: "school1" };
    const gradeModel = createMockModel();
    gradeModel.findById.mockResolvedValue(gradeDoc);
    gradeModel.findOne.mockResolvedValue(null);
    gradeModel.findByIdAndUpdate.mockResolvedValue({ ...gradeDoc, name: "Grade 1 Updated", toObject: () => ({}) });
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ grade: gradeModel }) });
    const manager = new GradeManager(injectable);

    const result = await manager.updateGrade({
      __shortToken: shortToken(),
      gradeId: "grade1",
      name: "Grade 1 Updated",
    });

    expect(result.errors).toBeUndefined();
    expect(result.grade).toBeDefined();
  });

  test("deleteGrade – success returns message", async () => {
    const gradeDoc = { _id: "grade1", schoolId: "school1" };
    const gradeModel = createMockModel();
    gradeModel.findById.mockResolvedValue(gradeDoc);
    gradeModel.findByIdAndDelete.mockResolvedValue({});
    const classroomModel = createMockModel();
    classroomModel.updateMany.mockResolvedValue({});
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ grade: gradeModel, classroom: classroomModel }),
    });
    const manager = new GradeManager(injectable);

    const result = await manager.deleteGrade({
      __shortToken: shortToken(),
      gradeId: "grade1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.message).toBe("Grade deleted successfully");
  });

  test("listGrades – success returns grades and pagination", async () => {
    const gradeModel = createMockModel();
    gradeModel.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([{ _id: "g1", name: "Grade 1", toObject: () => ({}) }]),
        }),
      }),
    });
    gradeModel.countDocuments.mockResolvedValue(1);
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ grade: gradeModel }) });
    const manager = new GradeManager(injectable);

    const result = await manager.listGrades({
      __shortToken: shortToken(),
      schoolId: "school1",
      page: 1,
      limit: 10,
    });

    expect(result.errors).toBeUndefined();
    expect(result.grades).toBeInstanceOf(Array);
    expect(result.pagination).toBeDefined();
  });

  test("getGradeClassrooms – success returns grade and classrooms", async () => {
    const gradeDoc = { _id: "grade1", schoolId: "school1", toObject: () => ({}) };
    const gradeModel = createMockModel();
    gradeModel.findById.mockResolvedValue(gradeDoc);
    const classroomModel = createMockModel();
    classroomModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ _id: "room1", toObject: () => ({}) }]) });
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ grade: gradeModel, classroom: classroomModel }),
    });
    const manager = new GradeManager(injectable);

    const result = await manager.getGradeClassrooms({
      __shortToken: shortToken(),
      gradeId: "grade1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.grade).toBeDefined();
    expect(result.classrooms).toBeInstanceOf(Array);
  });
});

describe("Classroom manager (unit)", () => {
  test("createClassroom – success returns classroom", async () => {
    const classroomModel = createMockModel({ _id: "room1", name: "Class A" });
    classroomModel.findOne.mockResolvedValue(null);
    const schoolModel = createMockModel({ _id: "school1", isActive: true });
    schoolModel.findById.mockResolvedValue({ _id: "school1", isActive: true });
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({
        classroom: classroomModel,
        school: schoolModel,
      }),
    });
    const manager = new ClassroomManager(injectable);

    const result = await manager.createClassroom({
      __shortToken: shortToken(),
      name: "Class A",
      schoolId: "school1",
      capacity: 30,
      grade: "1",
      section: "A",
    });

    expect(result.errors).toBeUndefined();
    expect(result.classroom).toBeDefined();
  });

  test("getClassroom – success returns classroom", async () => {
    const classroomDoc = { _id: "room1", name: "Class A", schoolId: "school1", toObject: () => ({}) };
    const classroomModel = createMockModel();
    classroomModel.findById.mockResolvedValue(classroomDoc);
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ classroom: classroomModel }),
    });
    const manager = new ClassroomManager(injectable);

    const result = await manager.getClassroom({
      __shortToken: shortToken(),
      classroomId: "room1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.classroom).toBeDefined();
  });

  test("getClassroom – not found returns errors", async () => {
    const classroomModel = createMockModel();
    classroomModel.findById.mockResolvedValue(null);
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ classroom: classroomModel }) });
    const manager = new ClassroomManager(injectable);

    const result = await manager.getClassroom({
      __shortToken: shortToken(),
      classroomId: "nonexistent",
    });

    expect(result.errors).toBe("Classroom not found");
  });

  test("updateClassroom – success returns classroom", async () => {
    const classroomDoc = { _id: "room1", name: "Class A", schoolId: "school1" };
    const classroomModel = createMockModel();
    classroomModel.findById.mockResolvedValue(classroomDoc);
    classroomModel.findByIdAndUpdate.mockResolvedValue({ ...classroomDoc, name: "Class A Updated", toObject: () => ({}) });
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ classroom: classroomModel }) });
    const manager = new ClassroomManager(injectable);

    const result = await manager.updateClassroom({
      __shortToken: shortToken(),
      classroomId: "room1",
      name: "Class A Updated",
    });

    expect(result.errors).toBeUndefined();
    expect(result.classroom).toBeDefined();
  });

  test("getClassroomStudents – success returns classroom and students", async () => {
    const classroomDoc = { _id: "room1", schoolId: "school1", toObject: () => ({}) };
    const classroomModel = createMockModel();
    classroomModel.findById.mockResolvedValue(classroomDoc);
    const studentModel = createMockModel();
    studentModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ _id: "s1", cardId: "20100101AB", toObject: () => ({}) }]) });
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ classroom: classroomModel, student: studentModel }),
    });
    const manager = new ClassroomManager(injectable);

    const result = await manager.getClassroomStudents({
      __shortToken: shortToken(),
      classroomId: "room1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.classroom).toBeDefined();
    expect(result.students).toBeInstanceOf(Array);
  });

  test("getClassroomTeachers – success returns classroom and teachers", async () => {
    const classroomDoc = { _id: "room1", schoolId: "school1", toObject: () => ({}) };
    const classroomModel = createMockModel();
    classroomModel.findById.mockResolvedValue(classroomDoc);
    const userModel = createMockModel();
    userModel.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { _id: "t1", role: "teacher", username: "teacher1", email: "t1@test.com", toObject: () => ({}) },
      ]),
    });
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ classroom: classroomModel, user: userModel }),
    });
    const manager = new ClassroomManager(injectable);

    const result = await manager.getClassroomTeachers({
      __shortToken: shortToken(),
      classroomId: "room1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.classroom).toBeDefined();
    expect(result.teachers).toBeInstanceOf(Array);
  });

  test("getClassroomTeachers – classroom not found returns errors", async () => {
    const classroomModel = createMockModel();
    classroomModel.findById.mockResolvedValue(null);
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ classroom: classroomModel }) });
    const manager = new ClassroomManager(injectable);

    const result = await manager.getClassroomTeachers({
      __shortToken: shortToken(),
      classroomId: "nonexistent",
    });

    expect(result.errors).toBe("Classroom not found");
  });

  test("getClassroomTeachers – school_admin for other school returns Unauthorized", async () => {
    const classroomDoc = { _id: "room1", schoolId: "school-other", toObject: () => ({}) };
    const classroomModel = createMockModel();
    classroomModel.findById.mockResolvedValue(classroomDoc);
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ classroom: classroomModel }) });
    const manager = new ClassroomManager(injectable);

    const result = await manager.getClassroomTeachers({
      __shortToken: shortToken({ role: "school_admin", schoolId: "school-mine" }),
      classroomId: "room1",
    });

    expect(result.errors).toContain("Cannot access classrooms from other schools");
  });

  test("listClassrooms – success returns classrooms and pagination", async () => {
    const classroomModel = createMockModel();
    classroomModel.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([{ _id: "room1", name: "Class A", toObject: () => ({}) }]),
        }),
      }),
    });
    classroomModel.countDocuments.mockResolvedValue(1);
    const injectable = getInjectable({ mongomodels: createMockMongoModels({ classroom: classroomModel }) });
    const manager = new ClassroomManager(injectable);

    const result = await manager.listClassrooms({
      __shortToken: shortToken(),
      schoolId: "school1",
      page: 1,
      limit: 10,
    });

    expect(result.errors).toBeUndefined();
    expect(result.classrooms).toBeInstanceOf(Array);
    expect(result.pagination).toBeDefined();
  });

  test("deleteClassroom – success returns message", async () => {
    const classroomDoc = { _id: "room1", schoolId: "school1" };
    const classroomModel = createMockModel();
    classroomModel.findById.mockResolvedValue(classroomDoc);
    const studentModel = createMockModel();
    const userModel = createMockModel();
    studentModel.updateMany.mockResolvedValue({});
    userModel.updateMany.mockResolvedValue({});
    classroomModel.findByIdAndDelete.mockResolvedValue({});
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({
        classroom: classroomModel,
        student: studentModel,
        user: userModel,
      }),
    });
    const manager = new ClassroomManager(injectable);

    const result = await manager.deleteClassroom({
      __shortToken: shortToken(),
      classroomId: "room1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.message).toBe("Classroom deleted successfully");
  });
});

describe("Student manager (unit)", () => {
  test("createStudent – success returns student with cardId", async () => {
    const savedDoc = {
      _id: "student1",
      cardId: "20100101XY",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: new Date("2010-01-01"),
      schoolId: "school1",
      classroomId: "room1",
      email: "john@test.com",
      createdBy: "user1",
    };
    const studentModel = createMockModel(savedDoc);
    studentModel.findById.mockResolvedValue(null);
    studentModel.findOne.mockResolvedValue(null);
    const schoolModel = createMockModel({ _id: "school1", isActive: true });
    schoolModel.findById.mockResolvedValue({ _id: "school1", isActive: true });
    const classroomModel = createMockModel({
      _id: "room1",
      schoolId: "school1",
      capacity: 30,
      currentEnrollment: 0,
      isActive: true,
    });
    classroomModel.findById.mockResolvedValue({
      _id: "room1",
      schoolId: "school1",
      capacity: 30,
      currentEnrollment: 0,
      isActive: true,
    });
    classroomModel.findByIdAndUpdate.mockResolvedValue({});
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({
        student: studentModel,
        school: schoolModel,
        classroom: classroomModel,
      }),
    });
    const manager = new StudentManager(injectable);

    const result = await manager.createStudent({
      __shortToken: shortToken(),
      firstName: "John",
      lastName: "Doe",
      schoolId: "school1",
      classroomId: "room1",
      dateOfBirth: "2010-01-01",
      email: "john@test.com",
    });

    expect(result.errors).toBeUndefined();
    expect(result.error).toBeUndefined();
    expect(result.student).toBeDefined();
    expect(result.student.cardId).toBeDefined();
    expect(result.student.cardId).toMatch(/^\d{8}[0-9A-Z]{2}$/);
    expect(result.student.firstName).toBe("John");
    expect(classroomModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  test("createStudent – school_admin for other school returns Unauthorized", async () => {
    const injectable = getInjectable();
    const manager = new StudentManager(injectable);

    const result = await manager.createStudent({
      __shortToken: shortToken({ role: "school_admin", schoolId: "school-A" }),
      firstName: "Jane",
      lastName: "Doe",
      schoolId: "school-B",
      classroomId: "room1",
      dateOfBirth: "2011-01-01",
    });

    expect(result.errors).toContain("Cannot create students for other schools");
  });

  test("getStudent – success returns student with cardId", async () => {
    const doc = {
      _id: "student1",
      cardId: "20100101AB",
      firstName: "John",
      lastName: "Doe",
      schoolId: "school1",
      classroomId: "room1",
    };
    const studentModel = createMockModel(doc);
    studentModel.findById.mockResolvedValue({ ...doc, toObject: () => doc });
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ student: studentModel }),
    });
    const manager = new StudentManager(injectable);

    const result = await manager.getStudent({
      __shortToken: shortToken(),
      studentId: "student1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.student).toBeDefined();
    expect(result.student.cardId).toBe("20100101AB");
  });

  test("getStudent – not found returns errors", async () => {
    const studentModel = createMockModel();
    studentModel.findById.mockResolvedValue(null);
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ student: studentModel }),
    });
    const manager = new StudentManager(injectable);

    const result = await manager.getStudent({
      __shortToken: shortToken(),
      studentId: "nonexistent",
    });

    expect(result.errors).toBe("Student not found");
  });

  test("updateStudent – success returns updated student", async () => {
    const doc = {
      _id: "student1",
      cardId: "20100101AB",
      firstName: "John",
      lastName: "Doe",
      schoolId: "school1",
    };
    const updatedDoc = { ...doc, firstName: "Johnny" };
    const studentModel = createMockModel(doc);
    studentModel.findById.mockResolvedValue({
      ...doc,
      schoolId: { toString: () => "school1" },
    });
    studentModel.findOne.mockResolvedValue(null);
    studentModel.findByIdAndUpdate.mockResolvedValue({
      ...updatedDoc,
      toObject: () => updatedDoc,
    });
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ student: studentModel }),
    });
    const manager = new StudentManager(injectable);

    const result = await manager.updateStudent({
      __shortToken: shortToken(),
      studentId: "student1",
      firstName: "Johnny",
    });

    expect(result.errors).toBeUndefined();
    expect(result.student.firstName).toBe("Johnny");
  });

  test("deleteStudent – success returns message", async () => {
    const doc = {
      _id: "student1",
      schoolId: "school1",
      classroomId: "room1",
    };
    const studentModel = createMockModel(doc);
    studentModel.findById.mockResolvedValue({
      ...doc,
      schoolId: { toString: () => "school1" },
    });
    studentModel.findByIdAndDelete.mockResolvedValue({});
    const classroomModel = createMockModel();
    classroomModel.findByIdAndUpdate.mockResolvedValue({});
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({
        student: studentModel,
        classroom: classroomModel,
      }),
    });
    const manager = new StudentManager(injectable);

    const result = await manager.deleteStudent({
      __shortToken: shortToken(),
      studentId: "student1",
    });

    expect(result.errors).toBeUndefined();
    expect(result.message).toBe("Student deleted successfully");
    expect(studentModel.findByIdAndDelete).toHaveBeenCalledWith("student1");
  });

  test("transferStudent – success returns student with new classroomId", async () => {
    const doc = {
      _id: "student1",
      schoolId: "school1",
      classroomId: "room1",
      save: jest.fn().mockResolvedValue(undefined),
      toObject() {
        return { ...this };
      },
    };
    const studentModel = createMockModel();
    studentModel.findById.mockResolvedValue(doc);
    const classroomModel = createMockModel();
    classroomModel.findById.mockResolvedValue({
      _id: "room2",
      schoolId: "school1",
      isActive: true,
      currentEnrollment: 0,
      capacity: 30,
    });
    classroomModel.findByIdAndUpdate.mockResolvedValue({});
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({
        student: studentModel,
        classroom: classroomModel,
      }),
    });
    const manager = new StudentManager(injectable);

    const result = await manager.transferStudent({
      __shortToken: shortToken(),
      studentId: "student1",
      newClassroomId: "room2",
    });

    expect(result.errors).toBeUndefined();
    expect(result.student).toBeDefined();
    expect(result.student.classroomId).toBe("room2");
  });

  test("createStudent – school not found returns errors", async () => {
    const schoolModel = createMockModel();
    schoolModel.findById.mockResolvedValue(null);
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ school: schoolModel }),
    });
    const manager = new StudentManager(injectable);

    const result = await manager.createStudent({
      __shortToken: shortToken(),
      firstName: "John",
      lastName: "Doe",
      schoolId: "school1",
      classroomId: "room1",
      dateOfBirth: "2010-01-01",
    });

    expect(result.errors).toBe("School not found");
  });

  test("createStudent – classroom full returns errors", async () => {
    const schoolModel = createMockModel({ _id: "school1", isActive: true });
    schoolModel.findById.mockResolvedValue(schoolModel({ _id: "school1", isActive: true }));
    const classroomModel = createMockModel({
      _id: "room1",
      schoolId: "school1",
      capacity: 30,
      currentEnrollment: 30,
      isActive: true,
    });
    classroomModel.findById.mockResolvedValue({
      _id: "room1",
      schoolId: "school1",
      capacity: 30,
      currentEnrollment: 30,
      isActive: true,
    });
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ school: schoolModel, classroom: classroomModel }),
    });
    const manager = new StudentManager(injectable);

    const result = await manager.createStudent({
      __shortToken: shortToken(),
      firstName: "John",
      lastName: "Doe",
      schoolId: "school1",
      classroomId: "room1",
      dateOfBirth: "2010-01-01",
    });

    expect(result.errors).toBe("Classroom is at full capacity");
  });

  test("listStudents – success returns students array and pagination", async () => {
    const studentModel = createMockModel();
    const studentList = [
      {
        _id: "s1",
        cardId: "20100101AB",
        firstName: "John",
        lastName: "Doe",
        schoolId: "school1",
        classroomId: "room1",
      },
    ];
    studentModel.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(studentList),
        }),
      }),
    });
    studentModel.countDocuments.mockResolvedValue(1);
    const injectable = getInjectable({
      mongomodels: createMockMongoModels({ student: studentModel }),
    });
    const manager = new StudentManager(injectable);

    const result = await manager.listStudents({
      __shortToken: shortToken(),
      schoolId: "school1",
      page: 1,
      limit: 10,
    });

    expect(result.errors).toBeUndefined();
    expect(result.students).toBeInstanceOf(Array);
    expect(result.pagination).toBeDefined();
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(10);
    if (result.students.length > 0) {
      expect(result.students[0].cardId).toBeDefined();
    }
  });

  test("_generateCardId – returns YYYYMMDD + 2 alphanumeric chars", () => {
    const injectable = getInjectable();
    const manager = new StudentManager(injectable);
    const cardId = manager._generateCardId("2010-05-15");
    expect(cardId).toMatch(/^20100515[0-9A-Z]{2}$/);
  });
});

describe("Token manager (unit)", () => {
  test("genLongToken – returns signed token", () => {
    const jwt = require("jsonwebtoken");
    jwt.sign = jest.fn().mockReturnValue("mock-jwt-token");
    const TokenManager = require("../../managers/token/Token.manager");
    const manager = new TokenManager({
      config: { dotEnv: { LONG_TOKEN_SECRET: "secret" } },
    });
    const token = manager.genLongToken({ userId: "u1", userKey: "k1" });
    expect(token).toBe("mock-jwt-token");
    expect(jwt.sign).toHaveBeenCalledWith(
      { userKey: "k1", userId: "u1" },
      "secret",
      expect.any(Object),
    );
  });

  test("v1_createShortToken – returns shortToken", () => {
    const jwt = require("jsonwebtoken");
    jwt.sign = jest.fn().mockReturnValue("short-jwt");
    const TokenManager = require("../../managers/token/Token.manager");
    const manager = new TokenManager({
      config: { dotEnv: { SHORT_TOKEN_SECRET: "short-secret" } },
    });
    const result = manager.v1_createShortToken({
      __longToken: { userId: "u1", userKey: "k1" },
      __device: "device-info",
    });
    expect(result.shortToken).toBe("short-jwt");
    expect(jwt.sign).toHaveBeenCalled();
  });
});
