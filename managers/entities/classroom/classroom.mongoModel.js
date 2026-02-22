const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    gradeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grade',
        required: false,
        default: null
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    currentEnrollment: {
        type: Number,
        default: 0,
        min: 0
    },
    grade: {
        type: String,
        trim: true,
        maxlength: 50
    },
    section: {
        type: String,
        trim: true,
        maxlength: 10
    },
    roomNumber: {
        type: String,
        trim: true,
        maxlength: 20
    },
    resources: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

classroomSchema.index({ schoolId: 1, name: 1 }, { unique: true });
classroomSchema.index({ schoolId: 1 });
classroomSchema.index({ gradeId: 1 });
classroomSchema.index({ schoolId: 1, gradeId: 1 });
classroomSchema.index({ schoolId: 1, isActive: 1 });
classroomSchema.index({ schoolId: 1, createdAt: -1 });
classroomSchema.index({ isActive: 1 });
classroomSchema.index({ createdBy: 1 });

classroomSchema.pre('save', function(next) {
    if (this.currentEnrollment > this.capacity) {
        return next(new Error('Current enrollment cannot exceed capacity'));
    }
    next();
});

module.exports = mongoose.model('Classroom', classroomSchema);
