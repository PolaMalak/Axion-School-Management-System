module.exports = {
  "/api/student/createStudent": {
    post: {
      tags: ["Students"],
      summary: "Create student",
      description:
        "Superadmin or school_admin (own school only). Classroom must have capacity.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: [
                "firstName",
                "lastName",
                "schoolId",
                "classroomId",
                "dateOfBirth",
              ],
              properties: {
                firstName: { type: "string", minLength: 1, maxLength: 100 },
                lastName: { type: "string", minLength: 1, maxLength: 100 },
                schoolId: { type: "string" },
                classroomId: { type: "string" },
                dateOfBirth: { type: "string", format: "date" },
                email: { type: "string", format: "email" },
                phone: { type: "string", maxLength: 20 },
                address: { type: "string", maxLength: 500 },
                guardianName: { type: "string", maxLength: 100 },
                guardianPhone: { type: "string", maxLength: 20 },
                guardianEmail: { type: "string", format: "email" },
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
                    properties: {
                      student: { $ref: "#/components/schemas/Student" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Validation, full classroom, or unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/api/student/getStudent": {
    get: {
      tags: ["Students"],
      summary: "Get student by ID",
      description: "studentId = MongoDB _id of the student document.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "studentId",
          in: "query",
          required: true,
          schema: { type: "string" },
        },
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
                      student: { $ref: "#/components/schemas/Student" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Not found or unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/api/student/listStudents": {
    get: {
      tags: ["Students"],
      summary: "List students",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "schoolId",
          in: "query",
          required: true,
          schema: { type: "string" },
        },
        { name: "classroomId", in: "query", schema: { type: "string" } },
        { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10 },
        },
        { name: "isActive", in: "query", schema: { type: "boolean" } },
      ],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiResponse" },
                  {
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          students: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Student" },
                          },
                          pagination: {
                            $ref: "#/components/schemas/Pagination",
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/api/student/updateStudent": {
    put: {
      tags: ["Students"],
      summary: "Update student",
      description: "studentId = MongoDB _id of the student document.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "studentId",
          in: "query",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                firstName: { type: "string", minLength: 1, maxLength: 100 },
                lastName: { type: "string", minLength: 1, maxLength: 100 },
                email: { type: "string", format: "email" },
                phone: { type: "string", maxLength: 20 },
                address: { type: "string", maxLength: 500 },
                guardianName: { type: "string", maxLength: 100 },
                guardianPhone: { type: "string", maxLength: 20 },
                guardianEmail: { type: "string", format: "email" },
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
                    properties: {
                      student: { $ref: "#/components/schemas/Student" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Validation or unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/api/student/deleteStudent": {
    delete: {
      tags: ["Students"],
      summary: "Delete student",
      description:
        "studentId = MongoDB _id. Decrements classroom currentEnrollment.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "studentId",
          in: "query",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Deleted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        400: {
          description: "Not found or unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/api/student/transferStudent": {
    post: {
      tags: ["Students"],
      summary: "Transfer student",
      description:
        "Move student to newClassroomId. Optionally newSchoolId when transferring to another school.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["studentId", "newClassroomId"],
              properties: {
                studentId: { type: "string" },
                newClassroomId: { type: "string" },
                newSchoolId: {
                  type: "string",
                  description: "When transferring to another school",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Transferred",
          content: {
            "application/json": {
              schema: {
                allOf: [{ $ref: "#/components/schemas/ApiResponse" }],
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      student: { $ref: "#/components/schemas/Student" },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Validation, full classroom, or unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
};
