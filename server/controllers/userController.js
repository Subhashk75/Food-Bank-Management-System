const { User } = require('../models/User');
const { signToken } = require('../utils/auth');
const sendMail = require('../utils/emailConfig');

const getOtpUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'User already exists.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendMail(email, otp);

    const user = new User({ email, Otp: otp });
    await user.save();

    res.status(200).json({ message: 'OTP sent.',success:true });
  } catch (err) {
    next(err);
  }
};

const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, verificationCode, role } = req.body;
    if (!username || !email || !password || !verificationCode)
      return res.status(400).json({ message: 'All fields required.' });
    // check if first user then role assign as " admin"
     const isFirstUser = (await User.countDocuments({ isVerified: true })) === 0;

     // verification of otp 
    const user = await User.findOne({ email, Otp: verificationCode });
    if (!user) return res.status(400).json({ message: 'Invalid OTP.' });


    user.username = username;
    user.password = password;
    user.isVerified = true;
    user.Otp = null;
    e.log(isFirstUser);
    
    // ✅ Fix: assign admin if first user
    user.role = isFirstUser ? 'admin' : (role || 'staff');
       e.log(user?.role)
    await user.save();

    const token = signToken(user);
    res.status(201).json({ token, data: { id: user._id, username, email, role: user.role } ,success:true});
  } catch (err) {
    next(err);
  }
};


const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required.' });

    const user = await User.findOne({ email });
    if (!user || !(await user.isCorrectPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials.' });

    if (!user.isVerified)
      return res.status(403).json({ message: 'Verify your account first.' });

    const token = signToken(user);
    res.status(200).json({ 
      success: true,
      token, 
      data: { id: user._id, username: user.username, email, role: user.role } 
    });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, 'username email role createdAt');
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin', 'staff', 'volunteer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role value.' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOtpUser, registerUser, loginUser, getAllUsers, updateUserRole };