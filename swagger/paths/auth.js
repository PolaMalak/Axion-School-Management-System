module.exports = {
  "/api/user/register": {
    post: {
      tags: ["Auth"],
      summary: "Register",
      description:
        "Register a new user. Without schoolId = superadmin; with schoolId = school_admin for that school.",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "email", "password"],
              properties: {
                username: { type: "string", minLength: 3, maxLength: 20 },
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 },
                schoolId: {
                  type: "string",
                  description: "Required for school_admin",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Registered",
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
                          user: { $ref: "#/components/schemas/User" },
                          longToken: { type: "string" },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: {
          description: "Validation or duplicate",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },

  "/api/user/login": {
    post: {
      tags: ["Auth"],
      summary: "Login",
      description: "Returns user and longToken.",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Logged in",
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
                          user: { $ref: "#/components/schemas/User" },
                          longToken: { type: "string" },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        400: {
          description: "Invalid credentials or inactive",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },

  "/api/token/v1_createShortToken": {
    post: {
      tags: ["Auth"],
      summary: "Create short token",
      description:
        "Exchange longToken for shortToken. Send longToken in header: token. Use shortToken in header: token for all protected endpoints.",
      security: [],
      parameters: [
        {
          name: "token",
          in: "header",
          required: true,
          schema: { type: "string" },
          description: "Long token from login/register",
        },
      ],
      requestBody: { required: false },
      responses: {
        200: {
          description: "Short token",
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
                          shortToken: { type: "string" },
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
          description: "Invalid or missing token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },

  "/api/user/createStaff": {
    post: {
      tags: ["Auth"],
      summary: "Create staff user",
      description:
        "Superadmin or school_admin. Creates a user with role teacher, cafeteria_staff, security, or hr. Teachers can have assignedClassroomIds.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "email", "password", "schoolId", "role"],
              properties: {
                username: { type: "string", minLength: 3, maxLength: 20 },
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 },
                schoolId: { type: "string" },
                role: {
                  type: "string",
                  enum: ["teacher", "cafeteria_staff", "security", "hr"],
                },
                assignedClassroomIds: {
                  type: "array",
                  items: { type: "string" },
                  description: "For teachers only",
                },
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
                      user: { $ref: "#/components/schemas/User" },
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

  "/api/user/updateStaff": {
    put: {
      tags: ["Auth"],
      summary: "Update staff user",
      description: "Update role, assignedClassroomIds (teachers), or isActive.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["userId"],
              properties: {
                userId: { type: "string" },
                role: {
                  type: "string",
                  enum: ["teacher", "cafeteria_staff", "security", "hr"],
                },
                assignedClassroomIds: {
                  type: "array",
                  items: { type: "string" },
                },
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
                      user: { $ref: "#/components/schemas/User" },
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

  "/api/user/getStaff": {
    get: {
      tags: ["Auth"],
      summary: "Get staff user by ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "userId",
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
                      user: { $ref: "#/components/schemas/User" },
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

  "/api/user/listStaff": {
    get: {
      tags: ["Auth"],
      summary: "List staff for a school",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "schoolId",
          in: "query",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "role",
          in: "query",
          schema: {
            type: "string",
            enum: ["teacher", "cafeteria_staff", "security", "hr"],
          },
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
                allOf: [{ $ref: "#/components/schemas/ApiResponse" }],
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      staff: {
                        type: "array",
                        items: { $ref: "#/components/schemas/User" },
                      },
                      pagination: { $ref: "#/components/schemas/Pagination" },
                    },
                  },
                },
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

  "/api/user/getStaffClassrooms": {
    get: {
      tags: ["Auth"],
      summary: "Get teacher and assigned classrooms",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "userId",
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
                      user: { $ref: "#/components/schemas/User" },
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
};
