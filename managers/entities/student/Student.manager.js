module.exports = class Student {
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
    this.studentModel = mongomodels.student;
    this.classroomModel = mongomodels.classroom;
    this.schoolModel = mongomodels.school;
    this._cardIdChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.httpExposed = [
      "post=createStudent",
      "put=updateStudent",
      "get=getStudent",
      "delete=deleteStudent",
      "post=transferStudent",
      "get=listStudents",
    ];
  }

  async createStudent({
    __shortToken,
    firstName,
    lastName,
    schoolId,
    classroomId,
    dateOfBirth,
    email,
    phone,
    address,
    guardianName,
    guardianPhone,
    guardianEmail,
  }) {
    const data = {
      firstName,
      lastName,
      schoolId,
      classroomId,
      dateOfBirth,
      email,
      phone,
      address,
      guardianName,
      guardianPhone,
      guardianEmail,
    };

    let result = await this.validators.student.createStudent(data);
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
        errors: "Unauthorized: Cannot create students for other schools",
      };
    }

    try {
      const school = await this.schoolModel.findById(schoolId);
      if (!school) {
        return { errors: "School not found" };
      }

      if (!school.isActive) {
        return { errors: "Cannot enroll student in inactive school" };
      }

      const classroom = await this.classroomModel.findById(classroomId);
      if (!classroom) {
        return { errors: "Classroom not found" };
      }

      if (classroom.schoolId.toString() !== schoolId) {
        return { errors: "Classroom does not belong to the specified school" };
      }

      if (!classroom.isActive) {
        return { errors: "Cannot enroll student in inactive classroom" };
      }

      if (classroom.currentEnrollment >= classroom.capacity) {
        return { errors: "Classroom is at full capacity" };
      }

      if (email) {
        const existingEmail = await this.studentModel.findOne({ email });
        if (existingEmail) {
          return { errors: "Student with this email already exists" };
        }
      }

      let cardId;
      for (let attempt = 0; attempt < 10; attempt++) {
        cardId = this._generateCardId(dateOfBirth);
        const existing = await this.studentModel.findOne({ schoolId, cardId });
        if (!existing) break;
      }
      if (!cardId) {
        return { errors: "Failed to generate unique cardId" };
      }

      const student = new this.studentModel({
        firstName,
        lastName,
        cardId,
        dateOfBirth: new Date(dateOfBirth),
        schoolId,
        classroomId,
        email,
        phone,
        address,
        guardianName,
        guardianPhone,
        guardianEmail,
        createdBy: __shortToken.userId,
      });

      const savedStudent = await student.save();

      await this.classroomModel.findByIdAndUpdate(classroomId, {
        $inc: { currentEnrollment: 1 },
      });

      return { student: this._sanitizeStudent(savedStudent) };
    } catch (error) {
      console.error("Error creating student:", error);
      return { error: "Failed to create student", details: error.message };
    }
  }

  async updateStudent({
    __shortToken,
    studentId,
    firstName,
    lastName,
    email,
    phone,
    address,
    guardianName,
    guardianPhone,
    guardianEmail,
    isActive,
  }) {
    const data = {
      studentId,
      firstName,
      lastName,
      email,
      phone,
      address,
      guardianName,
      guardianPhone,
      guardianEmail,
      isActive,
    };

    let result = await this.validators.student.updateStudent(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const student = await this.studentModel.findById(studentId);
      if (!student) {
        return { errors: "Student not found" };
      }

      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== student.schoolId.toString()
      ) {
        return {
          errors: "Unauthorized: Cannot update students from other schools",
        };
      }

      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) {
        const existingEmail = await this.studentModel.findOne({
          email,
          _id: { $ne: studentId },
        });
        if (existingEmail) {
          return { errors: "Student with this email already exists" };
        }
        updateData.email = email;
      }
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (guardianName !== undefined) updateData.guardianName = guardianName;
      if (guardianPhone !== undefined) updateData.guardianPhone = guardianPhone;
      if (guardianEmail !== undefined) updateData.guardianEmail = guardianEmail;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedStudent = await this.studentModel.findByIdAndUpdate(
        studentId,
        { $set: updateData },
        { new: true, runValidators: true },
      );

      return { student: this._sanitizeStudent(updatedStudent) };
    } catch (error) {
      console.error("Error updating student:", error);
      return { error: "Failed to update student", details: error.message };
    }
  }

  async getStudent({ __shortToken, studentId }) {
    const data = { studentId };

    let result = await this.validators.student.getStudent(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const student = await this.studentModel.findById(studentId);
      if (!student) {
        return { errors: "Student not found" };
      }

      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== student.schoolId.toString()
      ) {
        return {
          errors: "Unauthorized: Cannot access students from other schools",
        };
      }

      return { student: this._sanitizeStudent(student) };
    } catch (error) {
      console.error("Error fetching student:", error);
      return { error: "Failed to fetch student", details: error.message };
    }
  }

  async deleteStudent({ __shortToken, studentId }) {
    const data = { studentId };

    let result = await this.validators.student.deleteStudent(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const student = await this.studentModel.findById(studentId);
      if (!student) {
        return { errors: "Student not found" };
      }

      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== student.schoolId.toString()
      ) {
        return {
          errors: "Unauthorized: Cannot delete students from other schools",
        };
      }

      await this.studentModel.findByIdAndDelete(studentId);

      await this.classroomModel.findByIdAndUpdate(student.classroomId, {
        $inc: { currentEnrollment: -1 },
      });

      return { message: "Student deleted successfully" };
    } catch (error) {
      console.error("Error deleting student:", error);
      return { error: "Failed to delete student", details: error.message };
    }
  }

  async transferStudent({
    __shortToken,
    studentId,
    newClassroomId,
    newSchoolId,
  }) {
    const data = { studentId, newClassroomId, newSchoolId };

    let result = await this.validators.student.transferStudent(data);
    if (result) return { errors: result };

    if (
      __shortToken.role !== "superadmin" &&
      __shortToken.role !== "school_admin"
    ) {
      return { errors: "Unauthorized" };
    }

    try {
      const student = await this.studentModel.findById(studentId);
      if (!student) {
        return { errors: "Student not found" };
      }

      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== student.schoolId.toString()
      ) {
        return {
          errors: "Unauthorized: Cannot transfer students from other schools",
        };
      }

      const newClassroom = await this.classroomModel.findById(newClassroomId);
      if (!newClassroom) {
        return { errors: "New classroom not found" };
      }

      const targetSchoolId = newSchoolId || student.schoolId;

      if (newClassroom.schoolId.toString() !== targetSchoolId) {
        return { errors: "New classroom does not belong to the target school" };
      }

      if (
        __shortToken.role === "school_admin" &&
        __shortToken.schoolId !== targetSchoolId
      ) {
        return {
          errors: "Unauthorized: Cannot transfer students to other schools",
        };
      }

      if (!newClassroom.isActive) {
        return { errors: "Cannot transfer student to inactive classroom" };
      }

      if (newClassroom.currentEnrollment >= newClassroom.capacity) {
        return { errors: "New classroom is at full capacity" };
      }

      const oldClassroomId = student.classroomId;
      const oldSchoolId = student.schoolId;

      student.classroomId = newClassroomId;
      if (newSchoolId) {
        student.schoolId = newSchoolId;
      }
      await student.save();

      await this.classroomModel.findByIdAndUpdate(oldClassroomId, {
        $inc: { currentEnrollment: -1 },
      });

      await this.classroomModel.findByIdAndUpdate(newClassroomId, {
        $inc: { currentEnrollment: 1 },
      });

      return {
        message: "Student transferred successfully",
        student: this._sanitizeStudent(student),
      };
    } catch (error) {
      console.error("Error transferring student:", error);
      return { error: "Failed to transfer student", details: error.message };
    }
  }

  async listStudents({
    __shortToken,
    schoolId,
    classroomId,
    page = 1,
    limit = 10,
    isActive,
  }) {
    const data = { schoolId, classroomId, page, limit, isActive };

    let result = await this.validators.student.listStudents(data);
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
        errors: "Unauthorized: Cannot access students from other schools",
      };
    }

    try {
      const query = { schoolId };

      if (classroomId) {
        query.classroomId = classroomId;
      }

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      const skip = (page - 1) * limit;
      const students = await this.studentModel
        .find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await this.studentModel.countDocuments(query);

      return {
        students: students.map((student) => this._sanitizeStudent(student)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error listing students:", error);
      return { error: "Failed to list students", details: error.message };
    }
  }

  _generateCardId(dateOfBirth) {
    const d = new Date(dateOfBirth);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const base = `${y}${m}${day}`;
    const r = () =>
      this._cardIdChars[Math.floor(Math.random() * this._cardIdChars.length)];
    return base + r() + r();
  }

  _sanitizeStudent(student) {
    const studentObj = student.toObject ? student.toObject() : student;
    return {
      id: studentObj._id,
      cardId: studentObj.cardId,
      firstName: studentObj.firstName,
      lastName: studentObj.lastName,
      dateOfBirth: studentObj.dateOfBirth,
      email: studentObj.email,
      phone: studentObj.phone,
      address: studentObj.address,
      schoolId: studentObj.schoolId,
      classroomId: studentObj.classroomId,
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
