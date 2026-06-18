const User = require('../models/User');

// GET /api/admin/users (Admin)
exports.adminGetAllUsers = async (req, res, next) => {
  try {
    // Return all users, sorted by registration date
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id (Admin)
// Update role or isBanned status
exports.adminUpdateUser = async (req, res, next) => {
  try {
    const { role, isBanned } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    // Do not allow an admin to change their own role or ban themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role or ban status',
        data: null
      });
    }

    if (role !== undefined) {
      if (role !== 'user' && role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Invalid role value. Must be "user" or "admin".',
          data: null
        });
      }
      user.role = role;
    }

    if (isBanned !== undefined) {
      user.isBanned = isBanned;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/users/:id (Admin)
exports.adminDeleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    // Do not allow an admin to delete themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete yourself',
        data: null
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
