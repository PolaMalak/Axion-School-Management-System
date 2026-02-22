const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");

const STAFF_ROLES = ["teacher", "cafeteria_staff", "security", "hr"];

module.exports = class User {
  constructor({
    utils,
    cache,
    config,
    cortex,
    managers,
    validators,
    mongomodels,
  } = {}) {
    this.config = config;
    this.cortex = cortex;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.userModel = mongomodels.user;
    this.schoolModel = mongomodels.school;
    this.classroomModel = mongomodels.classroom;
    this.tokenManager = managers.token;
    this.usersCollection = "users";
    this.httpExposed = [
      "post=register",
      "post=login",
      "post=createStaff",
      "put=updateStaff",
      "get=getStaff",
      "get=listStaff",
      "get=getStaffClassrooms",
    ];
  }

  async register({ username, email, password, schoolId }) {
    const data = { username, email, password, schoolId };

    let result = await this.validators.user.register(data);
    if (result) return { errors: result };

    try {
      const existingUser = await this.userModel.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return { errors: "User with this email or username already exists" };
      }

      if (schoolId) {
        const school = await this.schoolModel.findById(schoolId);
        if (!school) {
          return { errors: "School not found" };
        }
        if (!school.isActive) {
          return { errors: "Cannot register for inactive school" };
        }
      }

      const user = new this.userModel({
        username,
        email,
        password,
        role: schoolId ? "school_admin" : "superadmin",
        schoolId: schoolId || undefined,
      });

      const savedUser = await user.save();
      const longToken = this.tokenManager.genLongToken({
        userId: savedUser._id.toString(),
        userKey: savedUser.key,
      });

      return {
        user: this._sanitizeUser(savedUser),
        longToken,
      };
    } catch (error) {
      console.error("Error registering user:", error);
      return { error: "Failed to register user", details: error.message };
    }
  }

  async createStaff({
    __shortToken,
    username,
    email,
    password,
    schoolId,
    role,
    assignedClassroomIds,
  }) {
    const data = { username, email, password, schoolId, role, assignedClassroomIds };
    let result = await this.validators.user.createStaff(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized: Only superadmin or school_admin can create staff" };
    }
    if (
      __shortToken.role === "school_admin" &&
      __shortToken.schoolId !== schoolId
    ) {
      return { errors: "Unauthorized: Cannot create staff for other schools" };
    }
    if (!STAFF_ROLES.includes(role)) {
      return { errors: `Role must be one of: ${STAFF_ROLES.join(", ")}` };
    }

    try {
      const school = await this.schoolModel.findById(schoolId);
      if (!school) return { errors: "School not found" };
      if (!school.isActive) return { errors: "Cannot add staff to inactive school" };

      const existing = await this.userModel.findOne({ $or: [{ email }, { username }] });
      if (existing) return { errors: "User with this email or username already exists" };

      let classroomIds = [];
      if (Array.isArray(assignedClassroomIds) && assignedClassroomIds.length > 0 && role === "teacher") {
        const classrooms = await this.classroomModel.find({
          _id: { $in: assignedClassroomIds },
          schoolId,
        });
        if (classrooms.length !== assignedClassroomIds.length) {
          return { errors: "One or more classrooms not found or do not belong to this school" };
        }
        classroomIds = assignedClassroomIds;
      }

      const user = new this.userModel({
        username,
        email,
        password,
        role,
        schoolId,
        assignedClassroomIds: classroomIds,
      });
      const saved = await user.save();
      return { user: this._sanitizeUser(saved) };
    } catch (error) {
      console.error("Error creating staff:", error);
      return { error: "Failed to create staff", details: error.message };
    }
  }

  async updateStaff({
    __shortToken,
    userId,
    role,
    assignedClassroomIds,
    isActive,
  }) {
    const data = { userId, role, assignedClassroomIds, isActive };
    let result = await this.validators.user.updateStaff(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const user = await this.userModel.findById(userId);
      if (!user) return { errors: "User not found" };
      if (!STAFF_ROLES.includes(user.role)) {
        return { errors: "User is not a staff member" };
      }
      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== user.schoolId.toString()
      ) {
        return { errors: "Unauthorized: Cannot update staff from other schools" };
      }

      const updateData = {};
      const newRole = role !== undefined ? role : user.role;
      if (role !== undefined && STAFF_ROLES.includes(role)) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (newRole !== "teacher") {
        updateData.assignedClassroomIds = [];
      } else if (assignedClassroomIds !== undefined) {
        if (Array.isArray(assignedClassroomIds)) {
          const classrooms = await this.classroomModel.find({
            _id: { $in: assignedClassroomIds },
            schoolId: user.schoolId,
          });
          if (classrooms.length !== assignedClassroomIds.length) {
            return { errors: "One or more classrooms not found or do not belong to this school" };
          }
          updateData.assignedClassroomIds = assignedClassroomIds;
        }
      }

      const updated = await this.userModel.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      return { user: this._sanitizeUser(updated) };
    } catch (error) {
      console.error("Error updating staff:", error);
      return { error: "Failed to update staff", details: error.message };
    }
  }

  async getStaff({ __shortToken, userId }) {
    const data = { userId };
    let result = await this.validators.user.getStaff(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const user = await this.userModel.findById(userId);
      if (!user) return { errors: "User not found" };
      if (!STAFF_ROLES.includes(user.role)) {
        return { errors: "User is not a staff member" };
      }
      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== user.schoolId.toString()
      ) {
        return { errors: "Unauthorized: Cannot access staff from other schools" };
      }
      return { user: this._sanitizeUser(user) };
    } catch (error) {
      console.error("Error fetching staff:", error);
      return { error: "Failed to fetch staff", details: error.message };
    }
  }

  async listStaff({ __shortToken, schoolId, role, page = 1, limit = 10, isActive }) {
    const data = { schoolId, role, page, limit, isActive };
    let result = await this.validators.user.listStaff(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }
    if (
      __shortToken.role === "school_admin" &&
      __shortToken.schoolId !== schoolId
    ) {
      return { errors: "Unauthorized: Cannot access other schools" };
    }

    try {
      const query = { schoolId, role: { $in: STAFF_ROLES } };
      if (role && STAFF_ROLES.includes(role)) query.role = role;
      if (isActive !== undefined) query.isActive = isActive;

      const skip = (page - 1) * limit;
      const users = await this.userModel
        .find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
      const total = await this.userModel.countDocuments(query);

      return {
        staff: users.map((u) => this._sanitizeUser(u)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error listing staff:", error);
      return { error: "Failed to list staff", details: error.message };
    }
  }

  async getStaffClassrooms({ __shortToken, userId }) {
    const data = { userId };
    let result = await this.validators.user.getStaffClassrooms(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const user = await this.userModel.findById(userId);
      if (!user) return { errors: "User not found" };
      if (user.role !== "teacher") {
        return { errors: "Only teachers have assigned classrooms" };
      }
      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== user.schoolId.toString()
      ) {
        return { errors: "Unauthorized: Cannot access staff from other schools" };
      }

      if (!user.assignedClassroomIds || user.assignedClassroomIds.length === 0) {
        return { user: this._sanitizeUser(user), classrooms: [] };
      }

      const classrooms = await this.classroomModel
        .find({ _id: { $in: user.assignedClassroomIds } })
        .sort({ name: 1 });
      const sanitized = classrooms.map((c) => {
        const o = c.toObject ? c.toObject() : c;
        return {
          id: o._id,
          name: o.name,
          schoolId: o.schoolId,
          gradeId: o.gradeId,
          capacity: o.capacity,
          currentEnrollment: o.currentEnrollment,
          grade: o.grade,
          section: o.section,
          roomNumber: o.roomNumber,
          resources: o.resources,
          isActive: o.isActive,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        };
      });
      return { user: this._sanitizeUser(user), classrooms: sanitized };
    } catch (error) {
      console.error("Error fetching staff classrooms:", error);
      return { error: "Failed to fetch staff classrooms", details: error.message };
    }
  }

  async login({ email, password }) {
    const data = { email, password };

    let result = await this.validators.user.login(data);
    if (result) return { errors: result };

    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        return { errors: "Invalid email or password" };
      }

      if (!user.isActive) {
        return { errors: "Account is inactive" };
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return { errors: "Invalid email or password" };
      }

      const longToken = this.tokenManager.genLongToken({
        userId: user._id.toString(),
        userKey: user.key,
      });

      return {
        user: this._sanitizeUser(user),
        longToken,
      };
    } catch (error) {
      console.error("Error logging in:", error);
      return { error: "Failed to login", details: error.message };
    }
  }

  _sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : user;
    return {
      id: userObj._id,
      username: userObj.username,
      email: userObj.email,
      role: userObj.role,
      schoolId: userObj.schoolId,
      assignedClassroomIds: userObj.assignedClassroomIds || [],
      isActive: userObj.isActive,
    };
  }
};
