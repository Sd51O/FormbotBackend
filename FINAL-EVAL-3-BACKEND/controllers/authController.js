// controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Workspace from '../models/Workspace.js'; // Import the Workspace model

// Signup
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, email, password });
    await user.save();

    // Create a workspace using the username after signup
    const workspace = new Workspace({ name: user.username, owner: user._id });
    await workspace.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({ token, userId: user._id, workspaceId: workspace._id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    // Create a workspace using the username after login if it doesn't exist
    let workspace = await Workspace.findOne({ owner: user._id });
    if (!workspace) {
      workspace = new Workspace({ name: user.username, owner: user._id });
      await workspace.save();
    }
    res.json({ token, userId: user._id, workspaceId: workspace._id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};
