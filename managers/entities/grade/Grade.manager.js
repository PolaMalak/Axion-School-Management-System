module.exports = class Grade {
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
    this.gradeModel = mongomodels.grade;
    this.schoolModel = mongomodels.school;
    this.classroomModel = mongomodels.classroom;
    this.httpExposed = [
      "post=createGrade",
      "put=updateGrade",
      "get=getGrade",
      "get=getGradeClassrooms",
      "delete=deleteGrade",
      "get=listGrades",
    ];
  }

  async createGrade({ __shortToken, name, schoolId, sortOrder, isActive }) {
    const data = { name, schoolId, sortOrder, isActive };
    let result = await this.validators.grade.createGrade(data);
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
        errors: "Unauthorized: Cannot create grades for other schools",
      };
    }

    try {
      const school = await this.schoolModel.findById(schoolId);
      if (!school) return { errors: "School not found" };
      if (!school.isActive) {
        return { errors: "Cannot create grade for inactive school" };
      }

      const existing = await this.gradeModel.findOne({ schoolId, name });
      if (existing) {
        return {
          errors: "Grade with this name already exists in this school",
        };
      }

      const grade = new this.gradeModel({
        name,
        schoolId,
        sortOrder: sortOrder ?? 0,
        isActive: isActive !== false,
        createdBy: __shortToken.userId,
      });
      const saved = await grade.save();
      return { grade: this._sanitizeGrade(saved) };
    } catch (error) {
      console.error("Error creating grade:", error);
      return { error: "Failed to create grade", details: error.message };
    }
  }

  async updateGrade({
    __shortToken,
    gradeId,
    name,
    sortOrder,
    isActive,
  }) {
    const data = { gradeId, name, sortOrder, isActive };
    let result = await this.validators.grade.updateGrade(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const grade = await this.gradeModel.findById(gradeId);
      if (!grade) return { errors: "Grade not found" };

      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== grade.schoolId.toString()
      ) {
        return {
          errors: "Unauthorized: Cannot update grades from other schools",
        };
      }

      const updateData = {};
      if (name !== undefined) {
        const existing = await this.gradeModel.findOne({
          schoolId: grade.schoolId,
          name,
          _id: { $ne: gradeId },
        });
        if (existing) {
          return {
            errors: "Grade with this name already exists in this school",
          };
        }
        updateData.name = name;
      }
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updated = await this.gradeModel.findByIdAndUpdate(
        gradeId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      return { grade: this._sanitizeGrade(updated) };
    } catch (error) {
      console.error("Error updating grade:", error);
      return { error: "Failed to update grade", details: error.message };
    }
  }

  async getGrade({ __shortToken, gradeId }) {
    const data = { gradeId };
    let result = await this.validators.grade.getGrade(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const grade = await this.gradeModel.findById(gradeId);
      if (!grade) return { errors: "Grade not found" };

      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== grade.schoolId.toString()
      ) {
        return {
          errors: "Unauthorized: Cannot access grades from other schools",
        };
      }

      return { grade: this._sanitizeGrade(grade) };
    } catch (error) {
      console.error("Error fetching grade:", error);
      return { error: "Failed to fetch grade", details: error.message };
    }
  }

  async deleteGrade({ __shortToken, gradeId }) {
    const data = { gradeId };
    let result = await this.validators.grade.deleteGrade(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const grade = await this.gradeModel.findById(gradeId);
      if (!grade) return { errors: "Grade not found" };

      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== grade.schoolId.toString()
      ) {
        return {
          errors: "Unauthorized: Cannot delete grades from other schools",
        };
      }

      // Unassign classrooms (set gradeId to null) so they can be reassigned
      await this.classroomModel.updateMany(
        { gradeId },
        { $set: { gradeId: null } }
      );
      await this.gradeModel.findByIdAndDelete(gradeId);
      return { message: "Grade deleted successfully" };
    } catch (error) {
      console.error("Error deleting grade:", error);
      return { error: "Failed to delete grade", details: error.message };
    }
  }

  async listGrades({ __shortToken, schoolId, page = 1, limit = 10, isActive }) {
    const data = { schoolId, page, limit, isActive };
    let result = await this.validators.grade.listGrades(data);
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
        errors: "Unauthorized: Cannot access grades from other schools",
      };
    }

    try {
      const query = { schoolId };
      if (isActive !== undefined) query.isActive = isActive;

      const skip = (page - 1) * limit;
      const grades = await this.gradeModel
        .find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ sortOrder: 1, createdAt: 1 });

      const total = await this.gradeModel.countDocuments(query);
      return {
        grades: grades.map((g) => this._sanitizeGrade(g)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error listing grades:", error);
      return { error: "Failed to list grades", details: error.message };
    }
  }

  async getGradeClassrooms({ __shortToken, gradeId }) {
    const data = { gradeId };
    let result = await this.validators.grade.getGrade(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const grade = await this.gradeModel.findById(gradeId);
      if (!grade) return { errors: "Grade not found" };

      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== grade.schoolId.toString()
      ) {
        return {
          errors: "Unauthorized: Cannot access grades from other schools",
        };
      }

      const classrooms = await this.classroomModel
        .find({ gradeId })
        .sort({ createdAt: 1 });
      return {
        grade: this._sanitizeGrade(grade),
        classrooms: classrooms.map((c) => this._sanitizeClassroom(c)),
      };
    } catch (error) {
      console.error("Error fetching grade classrooms:", error);
      return {
        error: "Failed to fetch grade classrooms",
        details: error.message,
      };
    }
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

  _sanitizeClassroom(classroom) {
    const obj = classroom.toObject ? classroom.toObject() : classroom;
    return {
      id: obj._id,
      name: obj.name,
      schoolId: obj.schoolId,
      gradeId: obj.gradeId,
      capacity: obj.capacity,
      currentEnrollment: obj.currentEnrollment,
      grade: obj.grade,
      section: obj.section,
      roomNumber: obj.roomNumber,
      resources: obj.resources,
      isActive: obj.isActive,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    };
  }
};
