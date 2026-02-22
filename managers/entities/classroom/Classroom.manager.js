module.exports = class Classroom {
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
    this.classroomModel = mongomodels.classroom;
    this.schoolModel = mongomodels.school;
    this.studentModel = mongomodels.student;
    this.userModel = mongomodels.user;
    this.httpExposed = [
      "post=createClassroom",
      "put=updateClassroom",
      "get=getClassroom",
      "get=getClassroomStudents",
      "get=getClassroomTeachers",
      "delete=deleteClassroom",
      "get=listClassrooms",
    ];
  }

  async createClassroom({
    __shortToken,
    name,
    schoolId,
    gradeId,
    capacity,
    grade,
    section,
    roomNumber,
    resources,
  }) {
    const data = {
      name,
      schoolId,
      gradeId,
      capacity,
      grade,
      section,
      roomNumber,
      resources,
    };

    let result = await this.validators.classroom.createClassroom(data);
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
      return {
        errors: "Unauthorized: Cannot create classrooms for other schools",
      };
    }

    try {
      const school = await this.schoolModel.findById(schoolId);
      if (!school) {
        return { errors: "School not found" };
      }

      if (!school.isActive) {
        return { errors: "Cannot create classroom for inactive school" };
      }

      if (gradeId) {
        const gradeDoc = await this.mongomodels.grade.findById(gradeId);
        if (!gradeDoc) return { errors: "Grade not found" };
        if (gradeDoc.schoolId.toString() !== schoolId) {
          return { errors: "Grade does not belong to this school" };
        }
      }

      const existingClassroom = await this.classroomModel.findOne({
        schoolId,
        name,
      });
      if (existingClassroom) {
        return {
          errors: "Classroom with this name already exists in this school",
        };
      }

      const classroom = new this.classroomModel({
        name,
        schoolId,
        gradeId: gradeId || null,
        capacity,
        grade,
        section,
        roomNumber,
        resources: resources || [],
        createdBy: __shortToken.userId,
      });

      const savedClassroom = await classroom.save();
      return { classroom: this._sanitizeClassroom(savedClassroom) };
    } catch (error) {
      console.error("Error creating classroom:", error);
      return { error: "Failed to create classroom", details: error.message };
    }
  }

  async updateClassroom({
    __shortToken,
    classroomId,
    gradeId,
    name,
    capacity,
    grade,
    section,
    roomNumber,
    resources,
    isActive,
  }) {
    const data = {
      classroomId,
      gradeId,
      name,
      capacity,
      grade,
      section,
      roomNumber,
      resources,
      isActive,
    };

    let result = await this.validators.classroom.updateClassroom(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const classroom = await this.classroomModel.findById(classroomId);
      if (!classroom) {
        return { errors: "Classroom not found" };
      }

      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== classroom.schoolId.toString()
      ) {
        return {
          errors: "Unauthorized: Cannot update classrooms from other schools",
        };
      }

      const updateData = {};
      if (name !== undefined) {
        const existingClassroom = await this.classroomModel.findOne({
          schoolId: classroom.schoolId,
          name,
          _id: { $ne: classroomId },
        });
        if (existingClassroom) {
          return {
            errors: "Classroom with this name already exists in this school",
          };
        }
        updateData.name = name;
      }
      if (capacity !== undefined) {
        if (capacity < classroom.currentEnrollment) {
          return { errors: "Capacity cannot be less than current enrollment" };
        }
        updateData.capacity = capacity;
      }
      if (gradeId !== undefined) {
        if (gradeId) {
          const gradeDoc = await this.mongomodels.grade.findById(gradeId);
          if (!gradeDoc) return { errors: "Grade not found" };
          if (gradeDoc.schoolId.toString() !== classroom.schoolId.toString()) {
            return { errors: "Grade does not belong to this school" };
          }
        }
        updateData.gradeId = gradeId || null;
      }
      if (grade !== undefined) updateData.grade = grade;
      if (section !== undefined) updateData.section = section;
      if (roomNumber !== undefined) updateData.roomNumber = roomNumber;
      if (resources !== undefined) updateData.resources = resources;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedClassroom = await this.classroomModel.findByIdAndUpdate(
        classroomId,
        { $set: updateData },
        { new: true, runValidators: true },
      );

      return { classroom: this._sanitizeClassroom(updatedClassroom) };
    } catch (error) {
      console.error("Error updating classroom:", error);
      return { error: "Failed to update classroom", details: error.message };
    }
  }

  async getClassroom({ __shortToken, classroomId }) {
    const data = { classroomId };

    let result = await this.validators.classroom.getClassroom(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const classroom = await this.classroomModel.findById(classroomId);
      if (!classroom) {
        return { errors: "Classroom not found" };
      }

      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== classroom.schoolId.toString()
      ) {
        return {
          errors: "Unauthorized: Cannot access classrooms from other schools",
        };
      }

      return { classroom: this._sanitizeClassroom(classroom) };
    } catch (error) {
      console.error("Error fetching classroom:", error);
      return { error: "Failed to fetch classroom", details: error.message };
    }
  }

  async getClassroomStudents({ __shortToken, classroomId }) {
    const data = { classroomId };
    let result = await this.validators.classroom.getClassroom(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const classroom = await this.classroomModel.findById(classroomId);
      if (!classroom) {
        return { errors: "Classroom not found" };
      }

      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== classroom.schoolId.toString()
      ) {
        return {
          errors: "Unauthorized: Cannot access classrooms from other schools",
        };
      }

      const students = await this.studentModel
        .find({ classroomId })
        .sort({ createdAt: 1 });
      return {
        classroom: this._sanitizeClassroom(classroom),
        students: students.map((s) => this._sanitizeStudent(s)),
      };
    } catch (error) {
      console.error("Error fetching classroom students:", error);
      return {
        error: "Failed to fetch classroom students",
        details: error.message,
      };
    }
  }

  async getClassroomTeachers({ __shortToken, classroomId }) {
    const data = { classroomId };
    let result = await this.validators.classroom.getClassroom(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const classroom = await this.classroomModel.findById(classroomId);
      if (!classroom) {
        return { errors: "Classroom not found" };
      }

      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== classroom.schoolId.toString()
      ) {
        return {
          errors: "Unauthorized: Cannot access classrooms from other schools",
        };
      }

      const teachers = await this.userModel
        .find({
          role: "teacher",
          schoolId: classroom.schoolId,
          assignedClassroomIds: classroomId,
        })
        .sort({ username: 1 });
      return {
        classroom: this._sanitizeClassroom(classroom),
        teachers: teachers.map((u) => this._sanitizeStaffUser(u)),
      };
    } catch (error) {
      console.error("Error fetching classroom teachers:", error);
      return {
        error: "Failed to fetch classroom teachers",
        details: error.message,
      };
    }
  }

  async deleteClassroom({ __shortToken, classroomId }) {
    const data = { classroomId };

    let result = await this.validators.classroom.deleteClassroom(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const classroom = await this.classroomModel.findById(classroomId);
      if (!classroom) {
        return { errors: "Classroom not found" };
      }

      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== classroom.schoolId.toString()
      ) {
        return {
          errors: "Unauthorized: Cannot delete classrooms from other schools",
        };
      }

      // Unassign students (set classroomId to null) so they can be transferred later
      await this.studentModel.updateMany(
        { classroomId },
        { $set: { classroomId: null } }
      );
      // Unassign staff (teachers) from this classroom
      await this.userModel.updateMany(
        { assignedClassroomIds: classroomId },
        { $pull: { assignedClassroomIds: classroomId } }
      );
      await this.classroomModel.findByIdAndDelete(classroomId);
      return { message: "Classroom deleted successfully" };
    } catch (error) {
      console.error("Error deleting classroom:", error);
      return { error: "Failed to delete classroom", details: error.message };
    }
  }

  async listClassrooms({
    __shortToken,
    schoolId,
    gradeId,
    page = 1,
    limit = 10,
    isActive,
  }) {
    const data = { schoolId, gradeId, page, limit, isActive };

    let result = await this.validators.classroom.listClassrooms(data);
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
      return {
        errors: "Unauthorized: Cannot access classrooms from other schools",
      };
    }

    try {
      const query = { schoolId };
      if (gradeId !== undefined && gradeId !== null && gradeId !== "") {
        query.gradeId = gradeId;
      }
      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      const skip = (page - 1) * limit;
      const classrooms = await this.classroomModel
        .find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await this.classroomModel.countDocuments(query);

      return {
        classrooms: classrooms.map((classroom) =>
          this._sanitizeClassroom(classroom),
        ),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error listing classrooms:", error);
      return { error: "Failed to list classrooms", details: error.message };
    }
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
};
