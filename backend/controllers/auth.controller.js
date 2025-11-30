import User from "../models/User.model.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const emailLower = (email || "").toLowerCase();

    // Check if user exists
    const userExists = await User.findOne({ email: emailLower });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const now = new Date();
    const user = await User.create({
      name,
      email: emailLower,
      password,
      status: "online",
      lastLoginAt: now,
      streakDays: 1,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = (email || "").toLowerCase();

    // Check for user email
    const user = await User.findOne({ email: emailLower }).select("+password");

    if (user && (await user.comparePassword(password))) {
      // Update status to online and streak
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      let last = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
      if (!last) {
        user.streakDays = 1;
      } else {
        last.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
          // same day, keep streak
        } else if (diffDays === 1) {
          user.streakDays = (user.streakDays || 0) + 1;
        } else {
          user.streakDays = 1;
        }
      }
      user.lastLoginAt = now;
      user.status = "online";
      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // Update user status to offline
    await User.findByIdAndUpdate(req.user._id, { status: "offline" });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
