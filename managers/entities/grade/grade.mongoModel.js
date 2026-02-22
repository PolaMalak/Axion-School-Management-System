const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
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
  { timestamps: true }
);

gradeSchema.index({ schoolId: 1, name: 1 }, { unique: true });
gradeSchema.index({ schoolId: 1 });
gradeSchema.index({ schoolId: 1, isActive: 1 });
gradeSchema.index({ schoolId: 1, sortOrder: 1 });
gradeSchema.index({ schoolId: 1, createdAt: -1 });
gradeSchema.index({ createdBy: 1 });

module.exports = mongoose.model("Grade", gradeSchema);
