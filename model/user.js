import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 100
  },
  companyName: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 100
  },
  logo: {
    type: String,
    required: true
  },
  logoColor: {
    type: String,
    required: true,
    default: '#3B404C'
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\+[1-9]\d{1,14}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  verificationCode: {
    type: String,
    required: false,
    trim: true,
    minlength: 6,
    maxlength: 6
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      delete ret._id;
      delete ret.verificationCode;
      return ret;
    },
  },
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);