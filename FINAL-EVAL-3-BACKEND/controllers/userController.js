import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const userController = {
  // Update user settings
  updateUserSettings: async (req, res) => {
    try {
      const { userId } = req.params;
      const { username, email } = req.body;

      // Validate userId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ 
          message: 'Invalid user ID format' 
        });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          message: 'User not found' 
        });
      }

      // If email is being updated, check if it's already in use
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ 
            message: 'Email already in use' 
          });
        }
      }

      // Update user details
      const updates = {};
      if (username) updates.username = username;
      if (email) updates.email = email;

      // Update the user document
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      // If username is updated, update workspace documents
      if (username) {
        try {
          await Workspace.updateMany(
            { 'owner.userId': userId },
            { $set: { 'owner.username': username } }
          );
        } catch (workspaceError) {
          console.error('Error updating workspaces:', workspaceError);
          // Continue with the response even if workspace update fails
        }
      }

      res.status(200).json({
        message: 'User settings updated successfully',
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email
        }
      });

    } catch (error) {
      console.error('Error in updateUserSettings:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({ 
          message: 'Invalid ID format' 
        });
      }
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Invalid input data',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }
      res.status(500).json({ 
        message: 'Error updating user settings' 
      });
    }
  },

  // Update user password
  // Update user password
  updateUserPassword: async (req, res) => {
    try {
      const { userId } = req.params;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          message: 'Both old and new passwords are required'
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isValidPassword = await user.comparePassword(oldPassword);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message: 'New password must be at least 6 characters long'
        });
      }

      user.password = newPassword; // Let the pre-save hook handle hashing
      await user.save();

      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error in updateUserPassword:', error);
      res.status(500).json({ message: 'Error updating password' });
    }
  }
};

export default userController;
