module.exports = {
  createSchool: [
    {
      model: "longText",
      required: true,
      path: "name",
    },
    {
      model: "paragraph",
      required: true,
      path: "address",
    },
    {
      model: "phone",
      required: true,
      path: "phone",
    },
    {
      model: "email",
      required: true,
      path: "email",
    },
    {
      model: "text",
      required: false,
      path: "principalName",
    },
    {
      model: "number",
      required: false,
      path: "establishedYear",
    },
  ],
  updateSchool: [
    {
      model: "mongoId",
      required: true,
      path: "schoolId",
    },
    {
      model: "title",
      required: false,
      path: "name",
    },
    {
      model: "paragraph",
      required: false,
      path: "address",
    },
    {
      model: "phone",
      required: false,
      path: "phone",
    },
    {
      model: "email",
      required: false,
      path: "email",
    },
    {
      model: "text",
      required: false,
      path: "principalName",
    },
    {
      model: "number",
      required: false,
      path: "establishedYear",
    },
    {
      model: "bool",
      required: false,
      path: "isActive",
    },
  ],
  getSchool: [
    {
      model: "mongoId",
      required: true,
      path: "schoolId",
    },
  ],
  getSchoolClassrooms: [
    {
      model: "mongoId",
      required: true,
      path: "schoolId",
    },
  ],
  getSchoolGrades: [
    {
      model: "mongoId",
      required: true,
      path: "schoolId",
    },
  ],
  getSchoolStaff: [
    {
      model: "mongoId",
      required: true,
      path: "schoolId",
    },
  ],
  getSchoolStudents: [
    {
      model: "mongoId",
      required: true,
      path: "schoolId",
    },
  ],
  deleteSchool: [
    {
      model: "mongoId",
      required: true,
      path: "schoolId",
    },
  ],
  listSchools: [
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
      default: true,
    },
  ],
};
