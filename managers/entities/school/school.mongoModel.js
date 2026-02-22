const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 200
    },
    address: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email']
    },
    principalName: {
        type: String,
        trim: true,
        maxlength: 100
    },
    establishedYear: {
        type: Number,
        min: 1800,
        max: new Date().getFullYear()
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

schoolSchema.index({ name: 1 });
schoolSchema.index({ email: 1 }, { unique: true });
schoolSchema.index({ isActive: 1 });
schoolSchema.index({ createdAt: -1 });
schoolSchema.index({ isActive: 1, createdAt: -1 });
schoolSchema.index({ createdBy: 1 });

module.exports = mongoose.model('School', schoolSchema);
