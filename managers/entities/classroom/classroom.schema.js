module.exports = {
  createClassroom: [
    {
      model: "text",
      required: true,
      path: "name",
    },
    {
      model: "mongoId",
      required: true,
      path: "schoolId",
    },
    {
      model: "mongoId",
      required: false,
      path: "gradeId",
    },
    {
      model: "number",
      required: true,
      path: "capacity",
    },
    {
      model: "text",
      required: false,
      path: "grade",
    },
    {
      model: "text",
      required: false,
      path: "section",
    },
    {
      model: "text",
      required: false,
      path: "roomNumber",
    },
    {
      model: "arrayOfStrings",
      required: false,
      path: "resources",
    },
  ],
  updateClassroom: [
    {
      model: "mongoId",
      required: true,
      path: "classroomId",
    },
    {
      model: "mongoId",
      required: false,
      path: "gradeId",
    },
    {
      model: "text",
      required: false,
      path: "name",
    },
    {
      model: "number",
      required: false,
      path: "capacity",
    },
    {
      model: "text",
      required: false,
      path: "grade",
    },
    {
      model: "text",
      required: false,
      path: "section",
    },
    {
      model: "text",
      required: false,
      path: "roomNumber",
    },
    {
      model: "arrayOfStrings",
      required: false,
      path: "resources",
    },
    {
      model: "bool",
      required: false,
      path: "isActive",
    },
  ],
  getClassroom: [
    {
      model: "mongoId",
      required: true,
      path: "classroomId",
    },
  ],
  getClassroomStudents: [
    {
      model: "mongoId",
      required: true,
      path: "classroomId",
    },
  ],
  getClassroomTeachers: [
    {
      model: "mongoId",
      required: true,
      path: "classroomId",
    },
  ],
  deleteClassroom: [
    {
      model: "mongoId",
      required: true,
      path: "classroomId",
    },
  ],
  listClassrooms: [
    {
      model: "mongoId",
      required: true,
      path: "schoolId",
    },
    {
      model: "mongoId",
      required: false,
      path: "gradeId",
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
