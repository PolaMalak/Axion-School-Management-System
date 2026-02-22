module.exports = {
  createGrade: [
    { model: "title", required: true, path: "name" },
    { model: "mongoId", required: true, path: "schoolId" },
    { model: "number", required: false, path: "sortOrder" },
    { model: "bool", required: false, path: "isActive" },
  ],
  updateGrade: [
    { model: "mongoId", required: true, path: "gradeId" },
    { model: "title", required: false, path: "name" },
    { model: "number", required: false, path: "sortOrder" },
    { model: "bool", required: false, path: "isActive" },
  ],
  getGrade: [{ model: "mongoId", required: true, path: "gradeId" }],
  deleteGrade: [{ model: "mongoId", required: true, path: "gradeId" }],
  listGrades: [
    { model: "mongoId", required: true, path: "schoolId" },
    { model: "number", required: false, path: "page", default: 1 },
    { model: "number", required: false, path: "limit", default: 10 },
    { model: "bool", required: false, path: "isActive" },
  ],
  getGradeClassrooms: [{ model: "mongoId", required: true, path: "gradeId" }],
};
