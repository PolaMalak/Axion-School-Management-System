module.exports = {
  register: [
    {
      model: "username",
      required: true,
      path: "username",
    },
    {
      model: "email",
      required: true,
      path: "email",
    },
    {
      model: "password",
      required: true,
      path: "password",
    },
    {
      model: "mongoId",
      required: false,
      path: "schoolId",
    },
  ],
  createStaff: [
    { model: "username", required: true, path: "username" },
    { model: "email", required: true, path: "email" },
    { model: "password", required: true, path: "password" },
    { model: "mongoId", required: true, path: "schoolId" },
    { model: "text", required: true, path: "role" },
    { model: "arrayOfStrings", required: false, path: "assignedClassroomIds" },
  ],
  updateStaff: [
    { model: "mongoId", required: true, path: "userId" },
    { model: "text", required: false, path: "role" },
    { model: "arrayOfStrings", required: false, path: "assignedClassroomIds" },
    { model: "bool", required: false, path: "isActive" },
  ],
  getStaff: [{ model: "mongoId", required: true, path: "userId" }],
  listStaff: [
    { model: "mongoId", required: true, path: "schoolId" },
    { model: "text", required: false, path: "role" },
    { model: "number", required: false, path: "page", default: 1 },
    { model: "number", required: false, path: "limit", default: 10 },
    { model: "bool", required: false, path: "isActive" },
  ],
  getStaffClassrooms: [{ model: "mongoId", required: true, path: "userId" }],
  login: [
    {
      model: "email",
      required: true,
      path: "email",
    },
    {
      model: "password",
      required: true,
      path: "password",
    },
  ],
  createUser: [
    {
      model: "username",
      required: true,
      path: "username",
    },
  ],
};
