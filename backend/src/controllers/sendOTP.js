// import User from "../models/user.js";
// import asyncHandler from "express-async-handler";
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";

// dotenv.config();

// const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secure: false, // Set to true for 465, false for 587
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// // Temporary storage for OTPs (You can use Redis or DB instead)
// const otpStore = {};



// export const sendOTP = asyncHandler(async (req, res) => {
//     const { email } = req.body;

//     // Check if user already exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//         res.status(400);
//         throw new Error("User already exists");
//     }

//     // Generate 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000);

//     // Store OTP with expiration time (5 minutes from now)
//     otpStore[email] = { otp, expiresAt: Date.now() + 2 * 60 * 1000 };

//     // Email content
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: "Your OTP Code from blogG",
//         html: `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f9; border-radius: 10px; border: 1px solid #ddd;">
//             <div style="text-align: center; padding-bottom: 20px;">
//               <img src="https://your-logo-url.com/logo.png" alt="blogG Logo" style="width: 150px;"/>
//             </div>
//             <h2 style="color: #333; text-align: center;">Welcome to blogG!</h2>
//             <p style="font-size: 16px; color: #555;">
//               Hello, <strong>${email}</strong>! We're excited to have you on blogG.
//             </p>
//             <p style="font-size: 16px; color: #555;">
//               Your One-Time Password (OTP) for registering your account is:
//             </p>
//             <div style="text-align: center; padding: 20px; background-color: #FF8C00; border-radius: 8px; color: #fff; font-size: 24px; font-weight: bold;">
//               ${otp}
//             </div>
//             <p style="font-size: 16px; color: #555;">
//               This OTP is valid for the next 2 minutes. Please use it to complete your registration process.
//             </p>
//             <p style="font-size: 16px; color: #555;">
//               If you did not request this, please ignore this email.
//             </p>
//             <footer style="text-align: center; padding-top: 30px; font-size: 14px; color: #888;">
//               <p>Thank you for choosing blogG!</p>
//               <p style="color: #999;">If you have any questions, feel free to reach out to us at <a href="mailto:support@blogg.com" style="color: #FF8C00;">support@blogg.com</a></p>
//             </footer>
//           </div>
//         `,
//     };


//     try {
//         await transporter.sendMail(mailOptions);
//         res.status(200).json({ message: "OTP sent successfully" });

//         // Automatically delete OTP after 5 minutes
//         setTimeout(() => {
//             delete otpStore[email];
//         }, 2 * 60 * 1000); // 5 minutes
//     } catch (error) {
//         res.status(500);
//         throw new Error("Failed to send OTP");
//     }
// });
