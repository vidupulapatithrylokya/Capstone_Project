// server/controllers/oauthController.js
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/**
 * Handle Google OAuth authentication / account linking
 */
const googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ success: false, message: "Google ID and Email are required." });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user account linked via Google
      user = await User.create({
        name: name || "Google User",
        email,
        password: `OAuthGoogle_${Math.random().toString(36).slice(-10)}`,
        googleId,
        role: "student",
        avatar,
      });
    } else if (!user.googleId) {
      // Link existing account with Google ID
      user.googleId = googleId;
      await user.save();
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  googleAuth,
};
