const User = require('../models/User');

const seedAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        email: 'admin@bookstore.com',
        password: 'Admin@123',
        userType: 'Admin',
        firstName: 'Admin',
        lastName: 'User',
        status: 'Active'
      });
      
      await admin.save();
      console.log('✓ Admin user created successfully');
      console.log('  Username: admin');
      console.log('  Password: Admin@123');
      console.log('  Email: admin@bookstore.com');
    } else {
      console.log('✓ Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  }
};

module.exports = seedAdminUser;
