// server/models/User.js
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        enum: ['image', 'pdf'],
        required: true
    },
    fileData: {
        type: String, // Base64 encoded string
        required: true
    }
});

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    dob: {
        type: Date,
        required: true,
        validate: {
            validator: function (dob) {
                const today = new Date();
                const birthDate = new Date(dob);
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                return age >= 18;
            },
            message: 'User must be at least 18 years old'
        }
    },
    mobile: {
        type: String,
        required: true
    },
    residentialAddress: {
        street1: {
            type: String,
            required: true
        },
        street2: {
            type: String
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        }
    },
    sameAsResidential: {
        type: Boolean,
        default: false
    },
    permanentAddress: {
        street1: {
            type: String,
            required: function () {
                return !this.sameAsResidential;
            }
        },
        street2: {
            type: String
        },
        city: {
            type: String,
            required: function () {
                return !this.sameAsResidential;
            }
        },
        state: {
            type: String,
            required: function () {
                return !this.sameAsResidential;
            }
        },
        pincode: {
            type: String,
            required: function () {
                return !this.sameAsResidential;
            }
        }
    },
    documents: {
        type: [DocumentSchema],
        validate: {
            validator: function (docs) {
                return docs.length >= 2;
            },
            message: 'At least two documents are required'
        }
    }
});

module.exports = mongoose.model('User', UserSchema);

