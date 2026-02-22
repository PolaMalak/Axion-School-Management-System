const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    cardId: {
      type: String,
      trim: true,
      sparse: true,
      maxlength: 20,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: false,
      default: null,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    guardianName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    guardianPhone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    guardianEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

studentSchema.index({ schoolId: 1 });
studentSchema.index({ schoolId: 1, cardId: 1 }, { unique: true, sparse: true });
studentSchema.index({ schoolId: 1, createdAt: -1 });
studentSchema.index({ schoolId: 1, classroomId: 1 });
studentSchema.index({ schoolId: 1, isActive: 1 });
studentSchema.index({ classroomId: 1 });
studentSchema.index({ email: 1 }, { sparse: true });
studentSchema.index({ isActive: 1 });
studentSchema.index({ createdBy: 1 });
studentSchema.index({ enrollmentDate: -1 });

module.exports = mongoose.model("Student", studentSchema);
