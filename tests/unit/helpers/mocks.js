function createMockModel(defaultDoc = {}) {
  const Model = function (attrs) {
    const instance = {
      _id: defaultDoc._id || "mock-id",
      ...defaultDoc,
      ...attrs,
    };
    instance.save = jest.fn().mockResolvedValue(instance);
    instance.toObject = () => ({ ...instance });
    return instance;
  };
  Model.findById = jest.fn();
  Model.findOne = jest.fn();
  Model.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
      lean: jest.fn().mockResolvedValue([]),
    }),
  });
  Model.countDocuments = jest.fn().mockResolvedValue(0);
  Model.create = jest.fn();
  Model.findByIdAndUpdate = jest.fn();
  Model.findByIdAndDelete = jest.fn();
  Model.updateMany = jest.fn().mockResolvedValue({});
  Model.deleteMany = jest.fn().mockResolvedValue({});
  return Model;
}

function createMockValidators() {
  const entities = ["user", "school", "grade", "classroom", "student"];
  const validators = {};
  entities.forEach((entity) => {
    validators[entity] = {};
    [
      "register",
      "login",
      "createSchool",
      "updateSchool",
      "getSchool",
      "getSchoolClassrooms",
      "getSchoolGrades",
      "getSchoolStaff",
      "getSchoolStudents",
      "deleteSchool",
      "listSchools",
      "createGrade",
      "updateGrade",
      "getGrade",
      "deleteGrade",
      "listGrades",
      "getGradeClassrooms",
      "createClassroom",
      "updateClassroom",
      "getClassroom",
      "getClassroomStudents",
      "getClassroomTeachers",
      "deleteClassroom",
      "listClassrooms",
      "createStudent",
      "updateStudent",
      "getStudent",
      "deleteStudent",
      "transferStudent",
      "listStudents",
      "createStaff",
      "updateStaff",
      "getStaff",
      "listStaff",
      "getStaffClassrooms",
    ].forEach((method) => {
      validators[entity][method] = jest.fn().mockResolvedValue(null);
    });
  });
  return validators;
}

function createMockMongoModels(overrides = {}) {
  const defaultDoc = (id, extra = {}) => ({ _id: id, ...extra });
  return {
    user:
      overrides.user ||
      createMockModel(defaultDoc("user1", { role: "superadmin", key: "k1" })),
    school:
      overrides.school ||
      createMockModel(defaultDoc("school1", { isActive: true })),
    grade:
      overrides.grade ||
      createMockModel(defaultDoc("grade1", { schoolId: "school1" })),
    classroom:
      overrides.classroom ||
      createMockModel(
        defaultDoc("room1", {
          schoolId: "school1",
          capacity: 30,
          currentEnrollment: 0,
          isActive: true,
        }),
      ),
    student:
      overrides.student ||
      createMockModel(
        defaultDoc("student1", {
          cardId: "20100101AB",
          firstName: "John",
          lastName: "Doe",
          schoolId: "school1",
          classroomId: "room1",
        }),
      ),
    ...overrides,
  };
}

function getInjectable(customMocks = {}) {
  const mongomodels =
    customMocks.mongomodels ||
    createMockMongoModels(customMocks.mongomodelsOverrides);
  const validators = customMocks.validators || createMockValidators();
  const cache = customMocks.cache || {};
  const config = customMocks.config || {};
  const cortex = customMocks.cortex || { sub: jest.fn(), pub: jest.fn() };
  const tokenManager = customMocks.tokenManager || {
    genLongToken: jest.fn().mockReturnValue("mock-long-token"),
  };
  const managers = customMocks.managers || { token: tokenManager };
  return {
    utils: customMocks.utils || {},
    cache,
    config,
    cortex,
    managers,
    validators,
    mongomodels,
  };
}

module.exports = {
  createMockModel,
  createMockValidators,
  createMockMongoModels,
  getInjectable,
};
