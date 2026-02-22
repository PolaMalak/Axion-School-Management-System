module.exports = {
  "/api/grade/createGrade": {
    post: {
      tags: ["Grades"],
      summary: "Create grade",
      description: "Superadmin or school_admin (own school only).",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "schoolId"],
              properties: {
                name: { type: "string", minLength: 1, maxLength: 100 },
                schoolId: { type: "string" },
                sortOrder: { type: "integer", minimum: 0 },
                isActive: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Created",
          content: {
            "application/json": {
              schema: {
                allOf: [{ $ref: "#/components/schemas/ApiResponse" }],
                properties: {
                  data: {
                    type: "object",
                    properties: { grade: { $ref: "#/components/schemas/Grade" } },
                  },
                },
              },
            },
          },
        },
        400: { description: "Validation or unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
        401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
      },
    },
  },
  "/api/grade/getGrade": {
    get: {
      tags: ["Grades"],
      summary: "Get grade by ID",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "gradeId", in: "query", required: true, schema: { type: "string" } }],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: {
                allOf: [{ $ref: "#/components/schemas/ApiResponse" }],
                properties: {
                  data: {
                    type: "object",
                    properties: { grade: { $ref: "#/components/schemas/Grade" } },
                  },
                },
              },
            },
          },
        },
        400: { description: "Not found or unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
        401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
      },
    },
  },
  "/api/grade/getGradeClassrooms": {
    get: {
      tags: ["Grades"],
      summary: "Get grade and all its classrooms",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "gradeId", in: "query", required: true, schema: { type: "string" } }],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: {
                allOf: [{ $ref: "#/components/schemas/ApiResponse" }],
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      grade: { $ref: "#/components/schemas/Grade" },
                      classrooms: { type: "array", items: { $ref: "#/components/schemas/Classroom" } },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Not found or unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
        401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
      },
    },
  },
  "/api/grade/updateGrade": {
    put: {
      tags: ["Grades"],
      summary: "Update grade",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["gradeId"],
              properties: {
                gradeId: { type: "string" },
                name: { type: "string", minLength: 1, maxLength: 100 },
                sortOrder: { type: "integer", minimum: 0 },
                isActive: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Updated",
          content: {
            "application/json": {
              schema: {
                allOf: [{ $ref: "#/components/schemas/ApiResponse" }],
                properties: {
                  data: {
                    type: "object",
                    properties: { grade: { $ref: "#/components/schemas/Grade" } },
                  },
                },
              },
            },
          },
        },
        400: { description: "Validation or unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
        401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
      },
    },
  },
  "/api/grade/deleteGrade": {
    delete: {
      tags: ["Grades"],
      summary: "Delete grade",
      description: "Classrooms in this grade are unassigned (gradeId set to null).",
      security: [{ bearerAuth: [] }],
      parameters: [{ name: "gradeId", in: "query", required: true, schema: { type: "string" } }],
      responses: {
        200: { description: "Deleted", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
        400: { description: "Not found or unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
        401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
      },
    },
  },
  "/api/grade/listGrades": {
    get: {
      tags: ["Grades"],
      summary: "List grades for a school",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "schoolId", in: "query", required: true, schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        { name: "isActive", in: "query", schema: { type: "boolean" } },
      ],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: {
                allOf: [{ $ref: "#/components/schemas/ApiResponse" }],
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      grades: { type: "array", items: { $ref: "#/components/schemas/Grade" } },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } } },
      },
    },
  },
};
