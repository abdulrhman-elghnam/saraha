import { ProviderEnum, SystemRoleEnum, GenderEnum } from '#/common/_EXPORT.js';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },

    lastName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    password: {
      type: String,
      required: function () {
        return this.provider == ProviderEnum.SYSTEM;
      },
    },

    DOB: {
      type: Date,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      required: true,
    },

    credentialTime: {
      type: Date,
      default: null
    },
    
    profileImage: {
      type: String,
      default: null,
    },

    coverImage: {
      type: String,
      default: null,
    },

    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
    role: {
      type: String,
      enum: Object.values(SystemRoleEnum),
      default: SystemRoleEnum.USER,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    lean: false,
  }
);

const virtual = userSchema.virtual('fullName');
const id = userSchema.virtual('id');

id.get(function () {
  return this._id.toString();
});

virtual.get(function () {
  return `${this.firstName} ${this.lastName}`;
});

virtual.set(function (value) {
  const [firstName, ...lastName] = value.trim().split(/\s+/);
  this.firstName = firstName;
  this.lastName = lastName.join(' ');
});
export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
