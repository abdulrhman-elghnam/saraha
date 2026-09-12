import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      // required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },

    lastName: {
      type: String,
      // required: true,
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
      required: true,
    },

    DOB: {
      type: Date,
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

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    lean: true,
  }
);

const virtual = userSchema.virtual('fullName');

virtual.get(function () {
  return `${this.firstName} ${this.lastName}`;
});

virtual.set(function (value) {
  const [firstName, ...lastName] = value.trim().split(/\s+/);
  this.firstName = firstName;
  this.lastName = lastName.join(' ');
});
export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
