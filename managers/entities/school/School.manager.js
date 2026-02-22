module.exports = class School {
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
    this.schoolModel = mongomodels.school;
    this.classroomModel = mongomodels.classroom;
    this.gradeModel = mongomodels.grade;
    this.studentModel = mongomodels.student;
    this.userModel = mongomodels.user;
    this.httpExposed = [
      "post=createSchool",
      "put=updateSchool",
      "get=getSchool",
      "get=getSchoolClassrooms",
      "get=getSchoolGrades",
      "get=getSchoolStaff",
      "get=getSchoolStudents",
      "delete=deleteSchool",
      "get=listSchools",
    ];
  }

  async createSchool({
    __shortToken,
    name,
    address,
    phone,
    email,
    principalName,
    establishedYear,
  }) {
    const data = {
      name,
      address,
      phone,
      email,
      principalName,
      establishedYear,
    };

    let result = await this.validators.school.createSchool(data);
    if (result) return { errors: result };

    if (__shortToken.role !== "superadmin") {
      return { errors: "Unauthorized: Only superadmins can create schools" };
    }

    try {
      const existingSchool = await this.schoolModel.findOne({ email });
      if (existingSchool) {
        return { errors: "School with this email already exists" };
      }

      const school = new this.schoolModel({
        name,
        address,
        phone,
        email,
        principalName,
        establishedYear,
        createdBy: __shortToken.userId,
      });

      const savedSchool = await school.save();
      return { school: this._sanitizeSchool(savedSchool) };
    } catch (error) {
      console.error("Error creating school:", error);
      return { error: "Failed to create school", details: error.message };
    }
  }

  async updateSchool({
    __shortToken,
    schoolId,
    name,
    address,
    phone,
    email,
    principalName,
    establishedYear,
    isActive,
  }) {
    const data = {
      schoolId,
      name,
      address,
      phone,
      email,
      principalName,
      establishedYear,
      isActive,
    };
    let result = await this.validators.school.updateSchool(data);
    if (result) return { errors: result };

    if (__shortToken.role !== "superadmin") {
      return { errors: "Unauthorized: Only superadmins can update schools" };
    }

    try {
      const school = await this.schoolModel.findById(schoolId);
      if (!school) {
        return { errors: "School not found" };
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (address !== undefined) updateData.address = address;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) {
        const existingSchool = await this.schoolModel.findOne({
          email,
          _id: { $ne: schoolId },
        });
        if (existingSchool) {
          return { errors: "School with this email already exists" };
        }
        updateData.email = email;
      }
      if (principalName !== undefined) updateData.principalName = principalName;
      if (establishedYear !== undefined)
        updateData.establishedYear = establishedYear;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedSchool = await this.schoolModel.findByIdAndUpdate(
        schoolId,
        { $set: updateData },
        { new: true, runValidators: true },
      );

      return { school: this._sanitizeSchool(updatedSchool) };
    } catch (error) {
      console.error("Error updating school:", error);
      return { error: "Failed to update school", details: error.message };
    }
  }

  async getSchool({ __shortToken, schoolId }) {
    const data = { schoolId };
    let result = await this.validators.school.getSchool(data);
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
      const school = await this.schoolModel.findById(schoolId);
      if (!school) {
        return { errors: "School not found" };
      }

      return { school: this._sanitizeSchool(school) };
    } catch (error) {
      console.error("Error fetching school:", error);
      return { error: "Failed to fetch school", details: error.message };
    }
  }

  async getSchoolClassrooms({ __shortToken, schoolId }) {
    const data = { schoolId };
    let result = await this.validators.school.getSchool(data);
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
      const school = await this.schoolModel.findById(schoolId);
      if (!school) {
        return { errors: "School not found" };
      }

      const classrooms = await this.classroomModel
        .find({ schoolId })
        .sort({ createdAt: 1 });
      return {
        school: this._sanitizeSchool(school),
        classrooms: classrooms.map((c) => this._sanitizeClassroom(c)),
      };
    } catch (error) {
      console.error("Error fetching school classrooms:", error);
      return {
        error: "Failed to fetch school classrooms",
        details: error.message,
      };
    }
  }

  async getSchoolGrades({ __shortToken, schoolId }) {
    const data = { schoolId };
    let result = await this.validators.school.getSchool(data);
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
      const school = await this.schoolModel.findById(schoolId);
      if (!school) {
        return { errors: "School not found" };
      }

      const grades = await this.gradeModel
        .find({ schoolId })
        .sort({ sortOrder: 1, createdAt: 1 });
      return {
        school: this._sanitizeSchool(school),
        grades: grades.map((g) => this._sanitizeGrade(g)),
      };
    } catch (error) {
      console.error("Error fetching school grades:", error);
      return {
        error: "Failed to fetch school grades",
        details: error.message,
      };
    }
  }

  async getSchoolStaff({ __shortToken, schoolId }) {
    const data = { schoolId };
    let result = await this.validators.school.getSchool(data);
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
      const school = await this.schoolModel.findById(schoolId);
      if (!school) {
        return { errors: "School not found" };
      }

      const staffRoles = [
        "school_admin",
        "teacher",
        "cafeteria_staff",
        "security",
        "hr",
      ];
      const staff = await this.userModel
        .find({ schoolId, role: { $in: staffRoles } })
        .sort({ role: 1, createdAt: 1 });
      return {
        school: this._sanitizeSchool(school),
        staff: staff.map((u) => this._sanitizeStaffUser(u)),
      };
    } catch (error) {
      console.error("Error fetching school staff:", error);
      return {
        error: "Failed to fetch school staff",
        details: error.message,
      };
    }
  }

  async getSchoolStudents({ __shortToken, schoolId }) {
    const data = { schoolId };
    let result = await this.validators.school.getSchool(data);
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
      const school = await this.schoolModel.findById(schoolId);
      if (!school) {
        return { errors: "School not found" };
      }

      const students = await this.studentModel
        .find({ schoolId })
        .sort({ createdAt: 1 });
      return {
        school: this._sanitizeSchool(school),
        students: students.map((s) => this._sanitizeStudent(s)),
      };
    } catch (error) {
      console.error("Error fetching school students:", error);
      return {
        error: "Failed to fetch school students",
        details: error.message,
      };
    }
  }

  async deleteSchool({ __shortToken, schoolId }) {
    const data = { schoolId };

    let result = await this.validators.school.deleteSchool(data);
    if (result) return { errors: result };

    if (__shortToken.role !== "superadmin") {
      return { errors: "Unauthorized: Only superadmins can delete schools" };
    }

    try {
      const school = await this.schoolModel.findById(schoolId);
      if (!school) {
        return { errors: "School not found" };
      }

      await this.studentModel.deleteMany({ schoolId });
      await this.classroomModel.deleteMany({ schoolId });
      await this.gradeModel.deleteMany({ schoolId });
      await this.userModel.deleteMany({ schoolId });
      await this.schoolModel.findByIdAndDelete(schoolId);
      return { message: "School deleted successfully" };
    } catch (error) {
      console.error("Error deleting school:", error);
      return { error: "Failed to delete school", details: error.message };
    }
  }

  async listSchools({ __shortToken, page = 1, limit = 10, isActive }) {
    const data = { page, limit, isActive };

    let result = await this.validators.school.listSchools(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const query = {};

      if (__shortToken.role === "school_admin") {
        query._id = __shortToken.schoolId;
      }

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      const skip = (page - 1) * limit;
      const schools = await this.schoolModel
        .find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await this.schoolModel.countDocuments(query);

      return {
        schools: schools.map((school) => this._sanitizeSchool(school)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error listing schools:", error);
      return { error: "Failed to list schools", details: error.message };
    }
  }

  _sanitizeSchool(school) {
    const schoolObj = school.toObject ? school.toObject() : school;
    return {
      id: schoolObj._id,
      name: schoolObj.name,
      address: schoolObj.address,
      phone: schoolObj.phone,
      email: schoolObj.email,
      principalName: schoolObj.principalName,
      establishedYear: schoolObj.establishedYear,
      isActive: schoolObj.isActive,
      createdAt: schoolObj.createdAt,
      updatedAt: schoolObj.updatedAt,
    };
  }

  _sanitizeClassroom(classroom) {
    const classroomObj = classroom.toObject ? classroom.toObject() : classroom;
    return {
      id: classroomObj._id,
      name: classroomObj.name,
      schoolId: classroomObj.schoolId,
      gradeId: classroomObj.gradeId,
      capacity: classroomObj.capacity,
      currentEnrollment: classroomObj.currentEnrollment,
      grade: classroomObj.grade,
      section: classroomObj.section,
      roomNumber: classroomObj.roomNumber,
      resources: classroomObj.resources,
      isActive: classroomObj.isActive,
      createdAt: classroomObj.createdAt,
      updatedAt: classroomObj.updatedAt,
    };
  }

  _sanitizeGrade(grade) {
    const obj = grade.toObject ? grade.toObject() : grade;
    return {
      id: obj._id,
      name: obj.name,
      schoolId: obj.schoolId,
      sortOrder: obj.sortOrder,
      isActive: obj.isActive,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }

  _sanitizeStaffUser(user) {
    const obj = user.toObject ? user.toObject() : user;
    return {
      id: obj._id,
      username: obj.username,
      email: obj.email,
      role: obj.role,
      schoolId: obj.schoolId,
      assignedClassroomIds: obj.assignedClassroomIds || [],
      isActive: obj.isActive,
    };
  }

  _sanitizeStudent(student) {
    const studentObj = student.toObject ? student.toObject() : student;
    return {
      id: studentObj._id,
      firstName: studentObj.firstName,
      lastName: studentObj.lastName,
      dateOfBirth: studentObj.dateOfBirth,
      email: studentObj.email,
      phone: studentObj.phone,
      address: studentObj.address,
      schoolId: studentObj.schoolId,
      classroomId: studentObj.classroomId,
      cardId: studentObj.cardId,
      enrollmentDate: studentObj.enrollmentDate,
      guardianName: studentObj.guardianName,
      guardianPhone: studentObj.guardianPhone,
      guardianEmail: studentObj.guardianEmail,
      isActive: studentObj.isActive,
      createdAt: studentObj.createdAt,
      updatedAt: studentObj.updatedAt,
    };
  }
};
