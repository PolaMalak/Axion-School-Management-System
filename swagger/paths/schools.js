module.exports = {
  "/api/school/createSchool": {
    post: {
      tags: ["Schools"],
      summary: "Create school",
      description: "Superadmin only.",
      security: [{ bearerAuth: [] }],

      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "address", "phone", "email"],
              properties: {
                name: { type: "string", minLength: 3, maxLength: 200 },
                address: { type: "string", maxLength: 500 },
                phone: { type: "string", maxLength: 20 },
                email: { type: "string", format: "email" },
                principalName: { type: "string", maxLength: 100 },
                establishedYear: { type: "integer", minimum: 1800 },
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
                      school: { $ref: "#/components/schemas/School" },
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
  "/api/school/getSchool": {
    get: {
      tags: ["Schools"],
      summary: "Get school by ID",
      description: "Superadmin: any school. School admin: own school only.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "schoolId",
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
                      school: { $ref: "#/components/schemas/School" },
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
  "/api/school/getSchoolClassrooms": {
    get: {
      tags: ["Schools"],
      summary: "Get school and all its classrooms",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "schoolId",
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
                      school: { $ref: "#/components/schemas/School" },
                      classrooms: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Classroom" },
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
  "/api/school/getSchoolGrades": {
    get: {
      tags: ["Schools"],
      summary: "Get school and all its grades",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "schoolId", in: "query", required: true, schema: { type: "string" } },
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
                      school: { $ref: "#/components/schemas/School" },
                      grades: { type: "array", items: { $ref: "#/components/schemas/Grade" } },
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
  "/api/school/getSchoolStaff": {
    get: {
      tags: ["Schools"],
      summary: "Get school and all its staff",
      description: "Returns school_admin and staff (teacher, cafeteria_staff, security, hr) for the school.",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "schoolId", in: "query", required: true, schema: { type: "string" } },
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
                      school: { $ref: "#/components/schemas/School" },
                      staff: { type: "array", items: { $ref: "#/components/schemas/User" } },
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
  "/api/school/getSchoolStudents": {
    get: {
      tags: ["Schools"],
      summary: "Get school and all its students",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "schoolId",
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
                      school: { $ref: "#/components/schemas/School" },
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
  "/api/school/listSchools": {
    get: {
      tags: ["Schools"],
      summary: "List schools",
      description: "Superadmin: all. School admin: own school only.",
      security: [{ bearerAuth: [] }],
      parameters: [
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
                          schools: {
                            type: "array",
                            items: { $ref: "#/components/schemas/School" },
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
  "/api/school/updateSchool": {
    put: {
      tags: ["Schools"],
      summary: "Update school",
      description: "Superadmin only.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "schoolId",
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
                name: { type: "string", minLength: 3, maxLength: 200 },
                address: { type: "string", maxLength: 500 },
                phone: { type: "string", maxLength: 20 },
                email: { type: "string", format: "email" },
                principalName: { type: "string", maxLength: 100 },
                establishedYear: { type: "integer", minimum: 1800 },
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
                      school: { $ref: "#/components/schemas/School" },
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
  "/api/school/deleteSchool": {
    delete: {
      tags: ["Schools"],
      summary: "Delete school",
      description: "Superadmin only.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "schoolId",
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
};
