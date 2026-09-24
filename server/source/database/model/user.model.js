import { SystemRole, Gender, Provider } from '#/common/enum/enum.js';
import mongoose from 'mongoose';
import { number } from 'zod';

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

    password: {
      type: String,
      required: function () {
        return this.provider == Provider.SYSTEM;
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
      type: Number,
      enum: Object.values(Gender),
      required: true,
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
      type: number,
      enum: Object.values(Provider),
      default: Provider.SYSTEM,
    },
    role: {
      type: Number,
      enum: Object.values(SystemRole),
      default: 0,
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
