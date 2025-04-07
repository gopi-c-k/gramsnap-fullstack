import User from "../models/user.js"; // ✅ Correct
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const otpStore = {};



export const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore[email] = { otp, expiresAt: Date.now() + 2 * 60 * 1000 };

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code from blogG",
    html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f9; border-radius: 10px; border: 1px solid #ddd;">
  <div style="text-align: center; padding-bottom: 20px;">
    <img src="../assets/Logo.png" alt="GramSnap Logo" style="width: 150px;"/>
  </div>
  <h2 style="color: #333; text-align: center;">Welcome to GramSnap!</h2>
  <p style="font-size: 16px; color: #555;">
    Hello, <strong>${email}</strong>! We're excited to have you on GramSnap.
  </p>
  <p style="font-size: 16px; color: #555;">
    Your One-Time Password (OTP) for registering your account is:
  </p>
  <div style="text-align: center; padding: 20px; background-color: #7b6cc2; border-radius: 8px; color: #fff; font-size: 24px; font-weight: bold;">
    ${otp}
  </div>
  <p style="font-size: 16px; color: #555;">
    This OTP is valid for the next 2 minutes. Please use it to complete your registration process.
  </p>
  <p style="font-size: 16px; color: #555;">
    If you did not request this, please ignore this email.
  </p>
  <footer style="text-align: center; padding-top: 30px; font-size: 14px; color: #888;">
    <p>Thank you for choosing GramSnap!</p>
    <p style="color: #999;">If you have any questions, feel free to reach out to us at <a href="mailto:support@gramsnap.com" style="color: #7b6cc2;">support@gramsnap.com</a></p>
  </footer>
</div>
`,
  };


  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully" });

    setTimeout(() => {
      delete otpStore[email];
    }, 2 * 60 * 1000);
  } catch (error) {
    res.status(500);
    throw new Error("Failed to send OTP");
  }
});

// @desc    Register a new user
// @route   POST /api/users/signup
// @access  Public
export const signUp = asyncHandler(async (req, res) => {
  const { name, email, password, otp, userId } = req.body;

  // Check if OTP exists & is not expired
  if (!otpStore[email]) {
    res.status(400);
    throw new Error("OTP expired or not found");
  }

  // Log OTP for debugging
  // console.log("Stored OTP:", otpStore[email].otp); // Log the OTP stored in memory
  // console.log("User OTP:", otp); // Log the OTP provided by the user

  // Check if OTP matches
  if (otpStore[email].otp.toString().trim() !== otp.toString().trim()) {
    res.status(400);
    throw new Error("Invalid OTP");
  }


  // Check if OTP is expired
  if (Date.now() > otpStore[email].expiresAt) {
    delete otpStore[email]; // Remove expired OTP
    res.status(400);
    throw new Error("OTP has expired");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  let validUserId = await User.findOne({ userId });
  if (validUserId) {
    res.status(400);
    throw new Error("UserId already exists");
  }
  // Create new user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    userId,
  });

  // Remove OTP after successful verification
  delete otpStore[email];

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});


