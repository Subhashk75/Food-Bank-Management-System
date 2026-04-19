const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  username: String,
  email: {
    type: String,
    unique: true,
    match: [/.+@.+\..+/, 'Must use a valid email address']
  },
  password: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  lastOtpSentAt: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'volunteer'],
    default: 'staff'
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.isCorrectPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = model('User', userSchema);
module.exports = { User };
