module.exports = {
  createStudent: [
    {
      model: "text",
      required: true,
      path: "firstName",
    },
    {
      model: "text",
      required: true,
      path: "lastName",
    },
    {
      model: "mongoId",
      required: true,
      path: "classroomId",
    },
    {
      model: "date",
      required: true,
      path: "dateOfBirth",
    },
    {
      model: "email",
      required: false,
      path: "email",
    },
    {
      model: "phone",
      required: false,
      path: "phone",
    },
    {
      model: "paragraph",
      required: false,
      path: "address",
    },
    {
      model: "text",
      required: false,
      path: "guardianName",
    },
    {
      model: "phone",
      required: false,
      path: "guardianPhone",
    },
    {
      model: "email",
      required: false,
      path: "guardianEmail",
    },
  ],
  updateStudent: [
    {
      model: "mongoId",
      required: true,
      path: "studentId",
    },
    {
      model: "text",
      required: false,
      path: "firstName",
    },
    {
      model: "text",
      required: false,
      path: "lastName",
    },
    {
      model: "email",
      required: false,
      path: "email",
    },
    {
      model: "phone",
      required: false,
      path: "phone",
    },
    {
      model: "paragraph",
      required: false,
      path: "address",
    },
    {
      model: "text",
      required: false,
      path: "guardianName",
    },
    {
      model: "phone",
      required: false,
      path: "guardianPhone",
    },
    {
      model: "email",
      required: false,
      path: "guardianEmail",
    },
    {
      model: "bool",
      required: false,
      path: "isActive",
    },
  ],
  getStudent: [
    {
      model: "mongoId",
      required: true,
      path: "studentId",
    },
  ],
  deleteStudent: [
    {
      model: "mongoId",
      required: true,
      path: "studentId",
    },
  ],
  transferStudent: [
    {
      model: "mongoId",
      required: true,
      path: "studentId",
    },
    {
      model: "mongoId",
      required: true,
      path: "newClassroomId",
    },
    {
      model: "mongoId",
      required: false,
      path: "newSchoolId",
    },
  ],
  listStudents: [
    {
      model: "mongoId",
      required: true,
      path: "schoolId",
    },
    {
      model: "mongoId",
      required: false,
      path: "classroomId",
    },
    {
      model: "number",
      required: false,
      path: "page",
      default: 1,
    },
    {
      model: "number",
      required: false,
      path: "limit",
      default: 10,
    },
    {
      model: "bool",
      required: false,
      path: "isActive",
    },
  ],
};
