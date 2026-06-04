const auth = require('./auth');

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.userType === 'Admin') {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as admin' });
    }
  });
};

module.exports = adminAuth;
