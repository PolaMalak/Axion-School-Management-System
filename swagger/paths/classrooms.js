module.exports = {
  "/api/classroom/createClassroom": {
    post: {
      tags: ["Classrooms"],
      summary: "Create classroom",
      description: "Superadmin or school_admin (own school only).",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "schoolId", "capacity"],
              properties: {
                name: { type: "string", minLength: 1, maxLength: 100 },
                schoolId: { type: "string" },
                capacity: { type: "integer", minimum: 1, maximum: 100 },
                grade: { type: "string", maxLength: 50 },
                section: { type: "string", maxLength: 10 },
                roomNumber: { type: "string", maxLength: 20 },
                resources: { type: "array", items: { type: "string" } },
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
                      classroom: { $ref: "#/components/schemas/Classroom" },
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
  "/api/classroom/getClassroom": {
    get: {
      tags: ["Classrooms"],
      summary: "Get classroom by ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "classroomId",
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
                      classroom: { $ref: "#/components/schemas/Classroom" },
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
  "/api/classroom/getClassroomStudents": {
    get: {
      tags: ["Classrooms"],
      summary: "Get all students in a classroom",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "classroomId",
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
                      students: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Student" },
                      },
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
  "/api/classroom/listClassrooms": {
    get: {
      tags: ["Classrooms"],
      summary: "List classrooms for a school",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "schoolId",
          in: "query",
          required: true,
          schema: { type: "string" },
        },
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
                          classrooms: {
                            type: "array",
                            items: { $ref: "#/components/schemas/Classroom" },
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
  "/api/classroom/getClassroomTeachers": {
    get: {
      tags: ["Classrooms"],
      summary: "Get all teachers assigned to a classroom",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "classroomId",
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
                      classroom: { $ref: "#/components/schemas/Classroom" },
                      teachers: {
                        type: "array",
                        items: { $ref: "#/components/schemas/User" },
                      },
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
  "/api/classroom/updateClassroom": {
    put: {
      tags: ["Classrooms"],
      summary: "Update classroom",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "classroomId",
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
                name: { type: "string", minLength: 1, maxLength: 100 },
                capacity: { type: "integer", minimum: 1, maximum: 100 },
                grade: { type: "string", maxLength: 50 },
                section: { type: "string", maxLength: 10 },
                roomNumber: { type: "string", maxLength: 20 },
                resources: { type: "array", items: { type: "string" } },
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
                      classroom: { $ref: "#/components/schemas/Classroom" },
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
  "/api/classroom/deleteClassroom": {
    delete: {
      tags: ["Classrooms"],
      summary: "Delete classroom",
      description: "Fails if classroom has enrolled students.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "classroomId",
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
          description: "Not found, has students, or unauthorized",
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
