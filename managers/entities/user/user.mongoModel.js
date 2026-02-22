const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: [
        "superadmin",
        "school_admin",
        "teacher",
        "cafeteria_staff",
        "security",
        "hr",
      ],
      required: true,
      default: "school_admin",
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: function () {
        return [
          "school_admin",
          "teacher",
          "cafeteria_staff",
          "security",
          "hr",
        ].includes(this.role);
      },
    },
    assignedClassroomIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Classroom" }],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    key: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ role: 1 });
userSchema.index({ schoolId: 1 }, { sparse: true });
userSchema.index({ isActive: 1, role: 1 });
userSchema.index({ role: 1, schoolId: 1 });
userSchema.index({ assignedClassroomIds: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    if (!this.key) {
      const { nanoid } = require("nanoid");
      this.key = nanoid();
    }
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
