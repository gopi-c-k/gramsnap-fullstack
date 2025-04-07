import jwt from 'jsonwebtoken';
import User from "../models/user.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const generateTokens = (res, userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  // Set the cookies with the generated tokens
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',  // Change from 'Strict' to 'Lax' for cross-origin requests
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none', // Change from 'Strict' to 'Lax'
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return { accessToken, refreshToken };
};

export const signIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.findOne({ userId: email });
  }


  if (user && (await bcrypt.compare(password, user.password))) {
    const { accessToken, refreshToken } = generateTokens(res, user._id);

    user.refreshToken = refreshToken;
    await user.save();
    

    res.status(200).json({
      name: user.name,
      email: user.email,
      userId: user.userId,
      profilePicture: user.profilePicture && user.profilePicture.data
        ? `data:${user.profilePicture.contentType};base64,${user.profilePicture.data.toString("base64")}`
        : null,
      message: "Login successful",
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});
export const refreshToken = asyncHandler(async (req, res) => {
  // Retrieve the refresh token from cookies
  const refreshToken = req.cookies.refreshToken;

  console.log(refreshToken); // For debugging

  if (!refreshToken) {
    res.status(401);
    throw new Error("No refresh token provided");
  }

  // Check if the refresh token exists in the database for the current user
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.status(403);
    throw new Error("Invalid refresh token");
  }

  try {
    // Verify the refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Generate new access and refresh tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(res, user._id);

    // Optionally, you can save the new refreshToken to the user's document
    // (But this step is optional as the refresh token is already stored in the cookie)
    user.refreshToken = newRefreshToken;  // If you want to keep the refresh token updated in the DB
    await user.save();

    // Send the new tokens to the client
    res.status(200).json({
      name: user.name,
      email: user.email,
      userId: user.userId,
      profilePicture: user.profilePicture && user.profilePicture.data
        ? `data:${user.profilePicture.contentType};base64,${user.profilePicture.data.toString("base64")}`
        : null,
      message: "Access token refreshed",
      accessToken, // Include the new access token in the response
    });
  } catch (error) {
    res.status(403);
    throw new Error("Error occured when check refresh token");
  }
});
export const logout = asyncHandler(async (req, res) => {
  // Get the refresh token from the cookies
  const refreshToken = req.cookies.refreshToken;

  // If there's a refresh token, remove it from the user's document
  if (refreshToken) {
    const user = await User.findOne({ refreshToken });
    if (user) {
      await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() });
      user.refreshToken = null; // Remove refresh token
      await user.save();
    }
  }

  // Clear cookies
  res.cookie('accessToken', '', { httpOnly: true, expires: new Date(0) });
  res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });

  res.status(200).json({ message: "Logged out successfully" });
});
